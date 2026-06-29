const Stripe = require("stripe");
const fs = require("fs");
const path = require("path");
const { PaymentGateError } = require("./error");
const { createMockStripe } = require("./stripeMock");

const hash = require("object-hash");

class StripeGate {
  constructor(config) {
    this.platform = "stripe";
    this.gateName = "stripe";
    this.config = config;
    // STRIPE_MOCK=true swaps the Stripe SDK for an in-process mock that
    // fires its own webhooks and recognises scenario-encoded synthetic
    // payment-method ids (pm_mock_success_* / _3ds_* / _decline_* / _cancel_*).
    // Used by the test runner — no real Stripe traffic, no real keys
    // needed. See src/common/stripeMock.js for the full surface.
    this.isMockMode = process.env.STRIPE_MOCK === "true";
    if (this.isMockMode) {
      console.log(
        "[stripeGate] STRIPE_MOCK=true — using in-process Stripe mock",
      );
      this.stripe = createMockStripe(config);
    } else {
      this.stripe = new Stripe(config.secretKey, {
        apiVersion: "2024-04-10",
      });
    }
    this.literalValues = {
      succeeded: "success",
      canceled: "canceled",
      processing: "started",
      requires_action: "started",
      requires_confirmation: "started",
      requires_payment_method: "started",
    };
    this.hasWebhook = true;
    this.hasCallback = false;
    this.webhookId = null;
  }

  getStatusLiteral(paymentStatus) {
    return this.literalValues[paymentStatus] ?? "unknown-" + paymentStatus;
  }

  requiresAction(paymentIntent) {
    if (paymentIntent.status === "requires_action") {
      if (paymentIntent.next_action.type === "use_stripe_sdk") {
        return true;
      }
    }
    return false;
  }

  requiresConfirmation(paymentIntent) {
    return paymentIntent.status === "requires_confirmation";
  }

  requiresRedirect(paymentIntent) {
    return (
      paymentIntent.status === "requires_action" &&
      (paymentIntent.next_action?.redirect_to_url ? true : false)
    );
  }

  async initPaymentGate() {}

  async registerWebHook(webhookUrl) {
    try {
      if (this.webhookId) {
        console.log("Webhhok already registered -->", this.webhookId);
        return;
      }
      const webhookEndpoint = await this.stripe.webhookEndpoints.create(
        {
          enabled_events: [
            "payment_intent.succeeded",
            "payment_intent.canceled",
            "payment_intent.payment_failed",
          ],
          url: webhookUrl,
        },
        {
          idempotencyKey: "mindbricks-registerWebhook->" + webhookUrl,
        },
      );

      if (webhookEndpoint) {
        this.stripeSignKey = webhookEndpoint.secret;
        this.webhookId = webhookEndpoint.id;
        console.log(
          "Stripe web-hook created with id ->",
          webhookEndpoint.id,
          webhookEndpoint.secret,
        );
      }
    } catch (err) {
      //**errorLog
      console.log("Stripe web-hook cant be created ->", err.message);
    }
  }

  async doSimplePayment(checkoutParams) {
    throw new PaymentGateError(
      "stripe",
      "Simple payment is discontinued in stripe",
      400,
    );
  }
  toMinorUnits(amount, currency) {
    const c = currency.toUpperCase();
    if (["JPY", "KRW"].includes(c)) return Math.round(amount);
    if (["BHD", "KWD", "JOD"].includes(c)) return Math.round(amount * 1000);
    return Math.round(amount * 100);
  }

  async startPayment(checkoutParams) {
    try {
      if (!checkoutParams.paymentUserParams?.paymentMethodId) {
        throw new PaymentGateError(
          "stripe",
          "paymentMethodId is required to create a payment intent",
        );
      }

      const amount = this.toMinorUnits(
        checkoutParams.amount,
        checkoutParams.currency,
      );

      checkoutParams.metadata.orderId = checkoutParams.orderId;
      const options = {
        customer: checkoutParams.customerId,
        payment_method: checkoutParams.paymentUserParams.paymentMethodId,
        amount: amount,
        currency: checkoutParams.currency.toLowerCase(),
        description: checkoutParams.description,
        confirm: true,
        return_url: checkoutParams.return_url,
        use_stripe_sdk: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
        metadata: checkoutParams.metadata,
      };

      const paymentIntent = await this.stripe.paymentIntents.create(options, {
        idempotencyKey: hash(options),
      });

      const paymentIntentInfo = {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        publicKey: this.config.publicKey,
        status: paymentIntent.status,
        requires_action: this.requiresAction(paymentIntent),
        requires_confirmation: this.requiresConfirmation(paymentIntent),
        requires_redirect: this.requiresRedirect(paymentIntent),
        redirectToUrl: paymentIntent.next_action?.redirect_to_url?.url,
      };

      return {
        paymentId: paymentIntent.id,
        paymentStatus: paymentIntent.status,
        paymentIntentInfo,
        statusLiteral: this.getStatusLiteral(paymentIntent.status),
      };
    } catch (err) {
      throw new PaymentGateError("stripe", err.message, err.decline_code);
    }
  }

  async completePayment(checkoutParams) {
    try {
      const userParams = checkoutParams.paymentUserParams;

      const paymentIntentId =
        userParams.paymentIntentId ?? checkoutParams.paymentId;
      const paymentSecret = userParams.paymentSecret;
      const paymentMethod = userParams.paymentMethod;
      const returnUrl = userParams.returnUrl;
      const offSession = userParams.offSession ?? true;

      let alreadyPaid = null;
      let paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (!paymentIntent) {
        throw new PaymentGateError(
          "stripe",
          "No payment intent found on stripe with this id",
          404,
        );
      }

      if (paymentIntent.status === "succeeded") {
        alreadyPaid = true;
      } else {
        paymentIntent = await this.stripe.paymentIntents.confirm(
          paymentIntentId,
          {
            payment_method: paymentMethod,
            return_url: returnUrl,
          },
        );
      }
      const paymentCompleteInfo = {
        alreadyPaid: alreadyPaid,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        publicKey: this.config.publicKey,
      };

      return {
        paymentId: paymentIntentId,
        paymentStatus: paymentIntent.status,
        paymentCompleteInfo,
        metadata: paymentIntent.metadata,
        statusLiteral: this.getStatusLiteral(paymentIntent.status),
      };
    } catch (err) {
      throw new PaymentGateError("stripe", err.message, err.decline_code);
    }
  }

  async refreshPayment(checkoutParams) {
    const paymentIntentId = checkoutParams.paymentId;
    let paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent) {
      throw new PaymentGateError(
        "stripe",
        "No payment intent found on stripe with this id",
        404,
      );
    }

    return {
      paymentId: paymentIntentId,
      paymentStatus: paymentIntent.status,
      metadata: paymentIntent.metadata,
      paymentRefreshInfo: {},
      statusLiteral: this.getStatusLiteral(paymentIntent.status),
    };
  }

  async webhookController(request) {
    const isLocal = process.env.NODE_ENV == "development";
    const signature = request.headers["stripe-signature"];
    const endpointSecret = this.stripeSignKey;

    console.log(
      "Verifying stripe webhook -->",
      signature,
      "-->",
      endpointSecret,
    );

    let event = request.body;
    if (!isLocal) {
      if (endpointSecret) {
        // Get the signature sent by Stripe

        try {
          event = this.stripe.webhooks.constructEvent(
            request.rawBody,
            signature,
            endpointSecret,
          );
        } catch (err) {
          console.log(
            `Stripe Webhook signature verification failed.`,
            err.message,
          );
          throw new PaymentGateError(
            "stripe",
            "Stripe Webhook signature verification failed.",
            401,
          );
        }
      } else {
        console.log(`Stripe Webhook signature not found.`);
        throw new PaymentGateError(
          "stripe",
          `Stripe Webhook signature not found.`,
          401,
        );
      }
    }

    // Handle the event
    let paymentIntent = null;
    let paymentId = null;
    let orderId = null;
    let paymentStatus = null;
    let statusLiteral = "unhandled";
    console.log("stripe webhook event received:", event.type);
    switch (event.type) {
      case "payment_intent.succeeded":
        paymentIntent = event.data.object;
        paymentId = paymentIntent.id;
        orderId = paymentIntent.metadata?.orderId;
        paymentStatus = paymentIntent.status;
        statusLiteral = this.getStatusLiteral(paymentIntent.status);
        console.log(
          `PaymentIntent for ${paymentIntent.amount} total was successful!. OrderId:`,
          orderId,
        );

        break;
      case "payment_intent.canceled":
        paymentIntent = event.data.object;
        console.log(`PaymentIntent for ${paymentIntent.amount} was canceled!`);
        paymentId = paymentIntent.id;
        orderId = paymentIntent.metadata?.orderId;
        paymentStatus = paymentIntent.status;
        statusLiteral = this.getStatusLiteral(paymentIntent.status);

        break;
      case "payment_intent.payment_failed":
        paymentIntent = event.data.object;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} payment failed!`,
        );
        paymentId = paymentIntent.id;
        orderId = paymentIntent.metadata?.orderId;
        paymentStatus = paymentIntent.status;
        statusLiteral = this.getStatusLiteral(paymentIntent.status);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    return {
      eventType: event?.type,
      metadata: paymentIntent?.metadata,
      statusLiteral,
      orderId,
      paymentId,
      paymentStatus,
    };
  }

  async getCheckoutDemoHtml(
    demoUrl,
    simpleCheckoutUrl,
    startCheckoutUrl,
    endCheckoutUrl,
    refreshCheckoutUrl,
    getOrderUrl,
    getStoredCardsUrl,
  ) {
    const fPath = path.join(
      __dirname,
      "../",
      "checkout-demo",
      "stripe-demo-checkout.html",
    );
    if (!fs.existsSync(fPath)) return "Demo Not Found For " + this.gateName;
    let html = fs.readFileSync(fPath, "utf8");
    html = html.replaceAll("$stripePublicKey", this.config.publicKey);
    html = html.replaceAll("$startCheckoutUrl", startCheckoutUrl);
    html = html.replaceAll("$simpleCheckoutUrl", simpleCheckoutUrl);
    html = html.replaceAll("$endCheckoutUrl", endCheckoutUrl);
    html = html.replaceAll("$refreshCheckoutUrl", refreshCheckoutUrl);
    html = html.replaceAll("$stripePublicKey", this.config.publicKey);
    html = html.replaceAll("$returnUrl", demoUrl + "&page=Page3");
    html = html.replaceAll("$getOrderUrl", getOrderUrl);
    html = html.replaceAll("$getStoredCardsUrl", getStoredCardsUrl);
    return html;
  }

  async getCustomerIdByEmail(email) {
    try {
      const customer = await this.stripe.customers.list({
        email: email,
        limit: 1,
      });
      return customer.data[0];
    } catch (err) {
      throw new PaymentGateError("stripe", err.message, err.decline_code);
    }
  }

  async addNewCustomer(fullname, email, userId) {
    try {
      const customer = await this.stripe.customers.create({
        name: fullname,
        email: email,
        metadata: {
          userId: userId,
        },
      });
      return customer;
    } catch (err) {
      throw new PaymentGateError("stripe", err.message, err.decline_code);
    }
  }

  async addNewPaymentMethod(customerId, paymentMethodId) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(
        paymentMethodId,
        { customer: customerId },
      );
      return paymentMethod;
    } catch (err) {
      throw new PaymentGateError("stripe", err.message, err.decline_code);
    }
  }

  async deletePaymentMethod(paymentMethodId) {
    try {
      const paymentMethod =
        await this.stripe.paymentMethods.detach(paymentMethodId);
      return paymentMethod;
    } catch (err) {
      throw new PaymentGateError("stripe", err.message, err.decline_code);
    }
  }

  async setDefaultPaymentMethod(customerId, paymentMethodId) {
    try {
      const customer = await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      return customer;
    } catch (err) {
      throw new PaymentGateError("stripe", err.message, err.decline_code);
    }
  }

  createPaymentIntent(
    amount,
    currency,
    description,
    customerId,
    paymentMethodId,
  ) {
    return this.stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      description: description,
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
    });
  }
}

const publicKey = process.env.STRIPE_KEY;
const secretKey = process.env.STRIPE_SECRET;
const mockMode = process.env.STRIPE_MOCK === "true";

// Mock mode doesn't require real Stripe keys — the in-process mock
// ignores them. Synthesize placeholders so the gate still constructs.
module.exports =
  (publicKey && secretKey) || mockMode
    ? new StripeGate({
        publicKey: publicKey || "pk_mock_test",
        secretKey: secretKey || "sk_mock_test",
      })
    : {};
