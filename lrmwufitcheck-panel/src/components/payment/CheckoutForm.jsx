import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Loader2,
  CreditCard,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import PaymentMethodList from "./PaymentMethodList";
import paymentService from "../../services/paymentService";
import toast from "react-hot-toast";
import {
  getTenantCodenameFromPath,
  withTenantPrefix,
} from "../../utils/tenantRouting";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

/**
 * CheckoutForm - Universal checkout component for Stripe order objects
 *
 * @param {Object} props
 * @param {string} props.orderId - The ID of the order to pay
 * @param {string} props.orderType - The data object type name (e.g., 'order', 'booking')
 * @param {string} props.serviceName - The service handling this order
 * @param {Object} props.orderDetails - Display details { amount, currency, description }
 * @param {string} props.returnUrl - URL to redirect after payment completion
 * @param {Function} props.onSuccess - Callback when payment succeeds
 * @param {Function} props.onError - Callback when payment fails
 */
export default function CheckoutForm({
  orderId,
  orderType,
  serviceName,
  orderDetails = {},
  returnUrl,
  onSuccess,
  onError,
}) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'processing' | 'success' | 'error'
  const [error, setError] = useState(null);
  const scopeTenantCodename =
    getTenantCodenameFromPath(window.location.pathname) || "root";
  const fallbackReturnUrl = `${window.location.origin}${withTenantPrefix("/payment/result", scopeTenantCodename)}`;
  const resolvedReturnUrl = returnUrl || fallbackReturnUrl;

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("processing");
    setError(null);

    try {
      // Start payment flow via backend
      const result = await paymentService.startOrderPayment(
        serviceName,
        orderType,
        orderId,
        selectedMethod.paymentMethodId,
        resolvedReturnUrl,
      );

      // Check for system errors
      if (result.result === "ERR") {
        throw new Error(result.message || "Payment failed");
      }

      // Check for payment errors within successful response
      if (result.paymentResult?.result === "ERR") {
        throw new Error(
          result.paymentResult.message || "Payment processing failed",
        );
      }

      const paymentResult = result.paymentResult;

      // Handle requires_action (3D Secure, etc.)
      if (paymentResult?.paymentIntentInfo?.status === "requires_action") {
        const stripe = await stripePromise;

        const { error: actionError } = await stripe.handleNextAction({
          clientSecret: paymentResult.paymentIntentInfo.clientSecret,
        });

        if (actionError) {
          throw new Error(actionError.message);
        }

        // Re-check payment intent status
        const { paymentIntent } = await stripe.retrievePaymentIntent(
          paymentResult.paymentIntentInfo.clientSecret,
        );

        if (paymentIntent.status === "succeeded") {
          setPaymentStatus("success");
          toast.success("Payment successful!");
          onSuccess?.(result);

          // Navigate to result page
          if (resolvedReturnUrl) {
            const url = new URL(resolvedReturnUrl, window.location.origin);
            url.searchParams.set("orderId", orderId);
            url.searchParams.set(
              "payment_intent_client_secret",
              paymentResult.paymentIntentInfo.clientSecret,
            );
            setTimeout(() => {
              window.location.href = url.toString();
            }, 1000);
          }
        } else if (paymentIntent.status === "requires_payment_method") {
          throw new Error("Payment failed. Please try another card.");
        } else {
          // Processing state
          setPaymentStatus("success");
          toast.success("Payment is being processed");
        }
      } else if (paymentResult?.paymentIntentInfo?.status === "succeeded") {
        // Direct success
        setPaymentStatus("success");
        toast.success("Payment successful!");
        onSuccess?.(result);

        if (resolvedReturnUrl) {
          const url = new URL(resolvedReturnUrl, window.location.origin);
          url.searchParams.set("orderId", orderId);
          url.searchParams.set(
            "payment_intent_client_secret",
            paymentResult.paymentIntentInfo.clientSecret,
          );
          setTimeout(() => {
            window.location.href = url.toString();
          }, 1000);
        }
      } else {
        throw new Error("Unexpected payment status");
      }
    } catch (err) {
      // Extract the meaningful error message:
      // - Axios errors from non-2xx responses have err.response.data.message
      // - Thrown errors from our own checks have err.message
      const errorMessage =
        err.response?.data?.message || err.message || "Payment failed";
      setPaymentStatus("error");
      setError(errorMessage);
      onError?.({ message: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === "success") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Payment Successful
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your payment has been processed successfully.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <ShoppingCart className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Order Summary
          </h3>
        </div>
        <div className="space-y-2 text-sm">
          {orderDetails.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {orderDetails.description}
            </p>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-900 dark:text-white">
              Total
            </span>
            <span className="font-bold text-lg text-primary-600">
              {orderDetails.amount != null ? (
                `${orderDetails.currency || ""} ${Number(orderDetails.amount).toFixed(2)}`
              ) : (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 italic">
                  Determined at checkout
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Select Payment Method
        </h3>
        <PaymentMethodList
          selectable={true}
          selectedId={selectedMethod?.paymentMethodId}
          onSelect={setSelectedMethod}
          showAddButton={true}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 dark:text-red-400 font-medium">
              Payment Failed
            </p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={!selectedMethod || isProcessing}
        className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            {orderDetails.amount != null
              ? `Pay ${orderDetails.currency || ""} ${Number(orderDetails.amount).toFixed(2)}`
              : "Proceed to Pay"}
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        By completing this purchase, you agree to our terms and conditions.
        Payment is secured by Stripe.
      </p>
    </div>
  );
}
