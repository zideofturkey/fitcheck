import { createServiceClient } from "./apiClient";

/**
 * Payment Service
 *
 * Handles Stripe payment-related API calls.
 *
 * This service supports the StripeOrder pattern where any data object
 * can be configured as an order object for payments.
 *
 * Payment method management is handled by the 'invitationCenter' service.
 *
 * Available order types in this project:
 * - No StripeOrder objects configured yet
 */

// Create client for payment method management (on the service with Stripe pattern)
const paymentClient = createServiceClient("invitationCenter");

/**
 * Helper to build the start payment API endpoint
 * The API follows the pattern: /v1/start{ObjectName}Payment/{orderId}
 * @param {string} objectName - The data object name (e.g., 'order', 'booking', 'subscription')
 * @returns {string} The model name with first letter capitalized
 */
const getModelName = (objectName) => {
  return objectName.charAt(0).toUpperCase() + objectName.slice(1);
};

const paymentService = {
  /**
   * List saved payment methods for current user
   * Uses the system API (unversioned): GET /payment-methods/list
   * @returns {Promise<Array>} Array of payment method objects
   */
  listPaymentMethods: async () => {
    const response = await paymentClient.get("/payment-methods/list");
    return response.data;
  },

  /**
   * Add a new payment method
   * Uses the system API (unversioned): POST /payment-methods/add
   *
   * @param {string} paymentMethodId - Stripe PaymentMethod ID from Stripe.js
   * @param {Object} details - Optional card holder details
   * @param {string} details.cardHolderName - Name on card
   * @param {string} details.cardHolderZip - Billing postal code
   * @returns {Promise<Object>} Saved payment method record
   */
  addPaymentMethod: async (paymentMethodId, details = {}) => {
    const response = await paymentClient.post("/payment-methods/add", {
      paymentMethodId,
      cardHolderName: details.cardHolderName,
      cardHolderZip: details.cardHolderZip,
    });
    return response.data;
  },

  /**
   * Delete a payment method
   * Uses the system API (unversioned): DELETE /payment-methods/delete/:paymentMethodId
   *
   * @param {string} paymentMethodId - Stripe PaymentMethod ID to remove
   * @returns {Promise<Object>} Deletion result
   */
  deletePaymentMethod: async (paymentMethodId) => {
    const response = await paymentClient.delete(
      `/payment-methods/delete/${paymentMethodId}`,
    );
    return response.data;
  },

  /**
   * Start payment flow for an order (StripeOrder pattern)
   *
   * Uses the Business Logic API: PATCH /v1/start{ObjectName}Payment/{orderId}
   *
   * This API creates and confirms a Stripe PaymentIntent in a single step.
   * The order object must exist before calling this API.
   *
   * @param {string} serviceName - Service handling the order (e.g., 'shop', 'booking')
   * @param {string} orderType - Data object type name (e.g., 'order', 'booking', 'ticket')
   * @param {string} orderId - Order ID (the ID of the data object instance)
   * @param {string} paymentMethodId - Stripe PaymentMethod ID
   * @param {string} returnUrl - Frontend URL for 3DS redirect completion
   * @returns {Promise<Object>} Response containing paymentResult and order object
   *
   * @example
   * // For an 'order' object in 'shop' service:
   * const result = await paymentService.startOrderPayment(
   *   'shop',
   *   'order',
   *   'order-uuid-here',
   *   'pm_xxx',
   *   'https://app.example.com/payment/result'
   * );
   */
  startOrderPayment: async (
    serviceName,
    orderType,
    orderId,
    paymentMethodId,
    returnUrl,
  ) => {
    const client = createServiceClient(serviceName);
    const modelName = getModelName(orderType);

    // API: PATCH /v1/start{ModelName}Payment/{orderId}
    const response = await client.patch(
      `/v1/start${modelName}Payment/${orderId}`,
      {
        paymentUserParams: {
          paymentMethodId,
          return_url: returnUrl,
        },
      },
    );
    return response.data;
  },

  /**
   * Get order by ID with payment status
   *
   * Fetches the order data object to check paymentConfirmation field.
   * The paymentConfirmation field indicates the final payment status:
   * - 'paid': Payment successful, fulfillment can proceed
   * - 'canceled': Payment was canceled
   * - 'failed': Payment failed
   * - 'pending': Payment is still processing
   *
   * @param {string} serviceName - Service handling the order
   * @param {string} orderType - Data object type name
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order object with payment status
   */
  getOrder: async (serviceName, orderType, orderId) => {
    const client = createServiceClient(serviceName);
    // Use the system paymentutils/order endpoint which handles any Stripe order type
    const response = await client.get(
      `/paymentutils/order/${orderType}/${orderId}`,
    );
    return response.data?.[orderType] || response.data;
  },

  /**
   * Create a setup intent for adding payment method
   * (Alternative flow for saving cards without immediate payment)
   */
  createSetupIntent: async () => {
    const response = await paymentClient.post("/payment-methods/setup-intent");
    return response.data;
  },
};

/**
 * Helper to get Stripe public key from environment
 */
export const getStripePublicKey = () => {
  return import.meta.env.VITE_STRIPE_PUBLIC_KEY || "";
};

export default paymentService;
