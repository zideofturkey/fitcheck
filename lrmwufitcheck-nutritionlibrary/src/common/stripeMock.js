/**
 * In-process Stripe SDK mock.
 *
 * Plugs in via stripeGate.js when STRIPE_MOCK=true, replacing the real
 * `stripe` package. Implements every SDK method stripeGate.js touches with
 * deterministic in-memory state and self-fired webhooks. Nothing reaches
 * Stripe's real API, no real keys are needed, and tests can drive every
 * branch of the payment flow (success, 3DS, decline, cancel) by encoding
 * the desired scenario into the synthetic PaymentMethod id.
 *
 * Surface used by stripeGate.js (and that this mock implements):
 *   - paymentIntents.create / retrieve / confirm
 *   - customers.create / list / update
 *   - paymentMethods.attach / detach
 *   - webhookEndpoints.create
 *   - webhooks.constructEvent
 *
 * Webhook fanout: when a PaymentIntent reaches a terminal state the mock
 * schedules a self-POST (setImmediate → http.request) to every webhook URL
 * registered via webhookEndpoints.create, signed with the same fixed
 * secret it returned at registration. The signature shape (`t=...,v1=...`
 * with HMAC-SHA256) matches the real Stripe format exactly, so the
 * service's existing `webhooks.constructEvent` verification path is
 * exercised end-to-end.
 *
 * Scenario encoding via PaymentMethod id prefix (test runner generates
 * these — Stripe.js Elements is bypassed):
 *   pm_mock_success_*   →  succeeded                 (default)
 *   pm_mock_3ds_*       →  requires_action then succeeded after confirm
 *   pm_mock_decline_*   →  payment_failed (CardError on create+confirm)
 *   pm_mock_cancel_*    →  canceled
 *
 * Everything else is inert. The mock has no module-level side effects —
 * importing it without ever calling createMockStripe() does nothing.
 */

"use strict";

const crypto = require("crypto");
const http = require("http");
const https = require("https");
const url = require("url");

const MOCK_WEBHOOK_SECRET = "whsec_mock_mindbricks_test_secret";

function newId(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString("hex")}`;
}

function nowSecs() {
  return Math.floor(Date.now() / 1000);
}

function scenarioFromPmId(pmId) {
  if (!pmId) return "success";
  if (pmId.startsWith("pm_mock_3ds_")) return "3ds";
  if (pmId.startsWith("pm_mock_decline_")) return "decline";
  if (pmId.startsWith("pm_mock_cancel_")) return "cancel";
  return "success";
}

class MockStripeError extends Error {
  constructor(message, opts = {}) {
    super(message);
    this.name = "MockStripeError";
    this.type = opts.type || "invalid_request_error";
    this.code = opts.code;
    this.decline_code = opts.decline_code;
    this.statusCode = opts.statusCode || 400;
    this.raw = { message, code: opts.code, decline_code: opts.decline_code };
  }
}

function buildPaymentIntent({
  id,
  options,
  status,
  customerId,
  paymentMethodId,
  scenario,
}) {
  const created = nowSecs();
  const metadata = options.metadata || {};

  let nextAction = null;
  if (status === "requires_action") {
    nextAction = {
      type: "use_stripe_sdk",
      use_stripe_sdk: { type: "mock_3ds_redirect", stripe_js: "mock" },
    };
  }
  let lastPaymentError = null;
  if (status === "requires_payment_method" && scenario === "decline") {
    lastPaymentError = {
      type: "card_error",
      code: "card_declined",
      decline_code: "generic_decline",
      message: "Mock payment method declined",
    };
  }

  return {
    id,
    object: "payment_intent",
    amount: options.amount,
    amount_capturable: 0,
    amount_received: status === "succeeded" ? options.amount : 0,
    currency: options.currency,
    status,
    customer: customerId,
    payment_method: paymentMethodId,
    description: options.description || null,
    metadata,
    client_secret: `${id}_secret_${crypto.randomBytes(8).toString("hex")}`,
    confirmation_method: "automatic",
    next_action: nextAction,
    last_payment_error: lastPaymentError,
    created,
    livemode: false,
    automatic_payment_methods: options.automatic_payment_methods || null,
    return_url: options.return_url || null,
  };
}

class MockStripe {
  constructor(config) {
    this.config = config || {};
    this._paymentIntents = new Map();
    this._customers = new Map();
    this._paymentMethods = new Map();
    this._webhooks = []; // [{ id, secret, url, enabled_events }]

    this.paymentIntents = {
      create: this._createPaymentIntent.bind(this),
      retrieve: this._retrievePaymentIntent.bind(this),
      confirm: this._confirmPaymentIntent.bind(this),
    };
    this.customers = {
      create: this._createCustomer.bind(this),
      list: this._listCustomers.bind(this),
      update: this._updateCustomer.bind(this),
    };
    this.paymentMethods = {
      attach: this._attachPaymentMethod.bind(this),
      detach: this._detachPaymentMethod.bind(this),
    };
    this.webhookEndpoints = {
      create: this._createWebhookEndpoint.bind(this),
    };
    this.webhooks = {
      constructEvent: this._constructEvent.bind(this),
    };
  }

  // ───── PaymentIntents ─────

  async _createPaymentIntent(options /* , idempotencyOptions */) {
    const paymentMethodId = options.payment_method;
    const scenario = scenarioFromPmId(paymentMethodId);
    const customerId = options.customer || null;
    const id = newId("pi_mock");

    let status;
    if (options.confirm === true) {
      switch (scenario) {
        case "success":
          status = "succeeded";
          break;
        case "3ds":
          status = "requires_action";
          break;
        case "decline":
          status = "requires_payment_method";
          break;
        case "cancel":
          status = "canceled";
          break;
        default:
          status = "succeeded";
      }
    } else {
      status = "requires_confirmation";
    }

    // Decline on create+confirm: real Stripe throws a CardError. We mirror
    // that — but still record the PI in the failed state and fire the
    // webhook so the service's webhook path exercises the failure flow too.
    if (options.confirm === true && scenario === "decline") {
      const pi = buildPaymentIntent({
        id,
        options,
        status,
        customerId,
        paymentMethodId,
        scenario,
      });
      this._paymentIntents.set(id, pi);
      this._scheduleWebhook(pi, scenario);
      throw new MockStripeError("Your card was declined.", {
        type: "card_error",
        code: "card_declined",
        decline_code: "generic_decline",
        statusCode: 402,
      });
    }

    const pi = buildPaymentIntent({
      id,
      options,
      status,
      customerId,
      paymentMethodId,
      scenario,
    });
    this._paymentIntents.set(id, pi);
    if (status === "succeeded" || status === "canceled") {
      this._scheduleWebhook(pi, scenario);
    }
    // requires_action / requires_confirmation: webhook fires after confirm.
    return pi;
  }

  async _retrievePaymentIntent(id) {
    const pi = this._paymentIntents.get(id);
    if (!pi) {
      throw new MockStripeError(`No such payment_intent: ${id}`, {
        code: "resource_missing",
        statusCode: 404,
      });
    }
    return pi;
  }

  async _confirmPaymentIntent(id, { payment_method, return_url } = {}) {
    const pi = this._paymentIntents.get(id);
    if (!pi) {
      throw new MockStripeError(`No such payment_intent: ${id}`, {
        code: "resource_missing",
        statusCode: 404,
      });
    }

    const usedPm = payment_method || pi.payment_method;
    const scenario = scenarioFromPmId(usedPm);
    pi.payment_method = usedPm;
    if (return_url) pi.return_url = return_url;

    switch (scenario) {
      case "success":
      case "3ds":
        pi.status = "succeeded";
        pi.next_action = null;
        pi.amount_received = pi.amount;
        break;
      case "decline":
        pi.status = "requires_payment_method";
        pi.last_payment_error = {
          type: "card_error",
          code: "card_declined",
          decline_code: "generic_decline",
          message: "Mock payment method declined on confirm",
        };
        break;
      case "cancel":
        pi.status = "canceled";
        break;
    }

    this._paymentIntents.set(id, pi);
    this._scheduleWebhook(pi, scenario);
    return pi;
  }

  // ───── Customers ─────

  async _createCustomer({ name, email, metadata } = {}) {
    const id = newId("cus_mock");
    const customer = {
      id,
      object: "customer",
      name: name || null,
      email: email || null,
      metadata: metadata || {},
      created: nowSecs(),
      invoice_settings: { default_payment_method: null },
      livemode: false,
    };
    this._customers.set(id, customer);
    return customer;
  }

  async _listCustomers({ email, limit = 10 } = {}) {
    let data = Array.from(this._customers.values());
    if (email) data = data.filter((c) => c.email === email);
    data = data.slice(0, limit);
    return { object: "list", data, has_more: false, url: "/v1/customers" };
  }

  async _updateCustomer(id, updates = {}) {
    const customer = this._customers.get(id);
    if (!customer) {
      throw new MockStripeError(`No such customer: ${id}`, {
        code: "resource_missing",
        statusCode: 404,
      });
    }
    if (updates.invoice_settings) {
      customer.invoice_settings = {
        ...customer.invoice_settings,
        ...updates.invoice_settings,
      };
    }
    if (updates.metadata)
      customer.metadata = { ...customer.metadata, ...updates.metadata };
    if (updates.name !== undefined) customer.name = updates.name;
    if (updates.email !== undefined) customer.email = updates.email;
    this._customers.set(id, customer);
    return customer;
  }

  // ───── PaymentMethods ─────

  async _attachPaymentMethod(paymentMethodId, { customer } = {}) {
    // Lazy-create. The test runner generates synthetic ids without ever
    // calling create on Stripe (real flow has Stripe.js Elements do that
    // client-side, then the backend only ever sees the resulting id).
    let pm = this._paymentMethods.get(paymentMethodId);
    if (!pm) {
      pm = {
        id: paymentMethodId,
        object: "payment_method",
        type: "card",
        card: { brand: "visa", last4: "4242", exp_month: 12, exp_year: 2030 },
        billing_details: {
          name: null,
          email: null,
          phone: null,
          address: null,
        },
        created: nowSecs(),
        livemode: false,
        customer: null,
        metadata: {},
      };
    }
    pm.customer = customer || null;
    this._paymentMethods.set(paymentMethodId, pm);
    return pm;
  }

  async _detachPaymentMethod(paymentMethodId) {
    let pm = this._paymentMethods.get(paymentMethodId);
    if (!pm) {
      // Stripe returns the detached PM even when our state is unaware of it
      // (e.g. created in a different mock instance). Synthesize a stub.
      pm = {
        id: paymentMethodId,
        object: "payment_method",
        type: "card",
        customer: null,
      };
    } else {
      pm.customer = null;
      this._paymentMethods.set(paymentMethodId, pm);
    }
    return pm;
  }

  // ───── Webhooks ─────

  async _createWebhookEndpoint(
    { enabled_events, url: hookUrl } /* , idempotencyOptions */,
  ) {
    const id = newId("we_mock");
    const endpoint = {
      id,
      object: "webhook_endpoint",
      enabled_events,
      url: hookUrl,
      secret: MOCK_WEBHOOK_SECRET,
      status: "enabled",
      livemode: false,
      created: nowSecs(),
    };
    this._webhooks.push(endpoint);
    return endpoint;
  }

  /**
   * Verify a webhook signature in Stripe's `t=...,v1=...` format. Mirrors
   * stripe.webhooks.constructEvent: returns the parsed event on success,
   * throws on signature mismatch.
   */
  _constructEvent(rawBody, signatureHeader, endpointSecret) {
    const fail = (msg) => {
      const err = new Error(msg);
      err.type = "StripeSignatureVerificationError";
      throw err;
    };
    if (!signatureHeader)
      fail("No signatures found matching the expected signature for payload");
    const parts = String(signatureHeader)
      .split(",")
      .reduce((acc, part) => {
        const idx = part.indexOf("=");
        if (idx > 0) acc[part.slice(0, idx)] = part.slice(idx + 1);
        return acc;
      }, {});
    if (!parts.t || !parts.v1)
      fail("No signatures found matching the expected signature for payload");
    const payload =
      typeof rawBody === "string"
        ? rawBody
        : Buffer.isBuffer(rawBody)
          ? rawBody.toString("utf8")
          : JSON.stringify(rawBody);
    const expected = crypto
      .createHmac("sha256", endpointSecret)
      .update(`${parts.t}.${payload}`)
      .digest("hex");
    if (expected !== parts.v1)
      fail("No signatures found matching the expected signature for payload");
    return JSON.parse(payload);
  }

  // ───── Webhook fanout (internal) ─────

  _scheduleWebhook(paymentIntent, scenario) {
    let eventType = null;
    if (paymentIntent.status === "succeeded")
      eventType = "payment_intent.succeeded";
    else if (paymentIntent.status === "canceled")
      eventType = "payment_intent.canceled";
    else if (
      paymentIntent.status === "requires_payment_method" &&
      scenario === "decline"
    ) {
      eventType = "payment_intent.payment_failed";
    }
    if (!eventType) return;

    const event = {
      id: newId("evt_mock"),
      object: "event",
      type: eventType,
      api_version: "2024-04-10",
      created: nowSecs(),
      livemode: false,
      data: { object: paymentIntent },
      pending_webhooks: 0,
      request: { id: null, idempotency_key: null },
    };

    setImmediate(() => {
      for (const hook of this._webhooks) {
        if (hook.enabled_events && !hook.enabled_events.includes(eventType))
          continue;
        this._postWebhook(hook, event).catch((err) => {
          console.warn(
            "[stripeMock] webhook delivery failed:",
            err && err.message,
          );
        });
      }
    });
  }

  _postWebhook(hook, event) {
    const payload = JSON.stringify(event);
    const ts = nowSecs();
    const sig = crypto
      .createHmac("sha256", hook.secret)
      .update(`${ts}.${payload}`)
      .digest("hex");
    const header = `t=${ts},v1=${sig}`;

    const parsed = url.parse(hook.url);
    const isHttps = parsed.protocol === "https:";
    const lib = isHttps ? https : http;
    const port = parsed.port || (isHttps ? 443 : 80);

    return new Promise((resolve, reject) => {
      const req = lib.request(
        {
          method: "POST",
          hostname: parsed.hostname,
          port,
          path: parsed.path || "/",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
            "stripe-signature": header,
            "User-Agent": "Mindbricks-Stripe-Mock/1.0",
          },
          timeout: 5000,
        },
        (res) => {
          res.on("data", () => {});
          res.on("end", resolve);
        },
      );
      req.on("error", reject);
      req.on("timeout", () =>
        req.destroy(new Error("Webhook delivery timeout")),
      );
      req.write(payload);
      req.end();
    });
  }
}

function createMockStripe(config) {
  return new MockStripe(config);
}

module.exports = {
  createMockStripe,
  MOCK_WEBHOOK_SECRET,
  // Exposed for tests / inspection — not part of the SDK shape.
  MockStripe,
  scenarioFromPmId,
};
