import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Home,
  RefreshCw,
} from "lucide-react";
import paymentService from "../../services/paymentService";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

/**
 * PaymentResult - Displays payment result and handles post-payment verification
 *
 * @param {Object} props
 * @param {string} props.orderType - The data object type name
 * @param {string} props.serviceName - The service handling this order
 */
export default function PaymentResult({ orderType, serviceName }) {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | failed | processing | canceled
  const [order, setOrder] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState(null);

  const orderId = searchParams.get("orderId");
  const clientSecret = searchParams.get("payment_intent_client_secret");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setStatus("failed");
        setError("Order ID not found");
        return;
      }

      try {
        // If we have a client secret, verify with Stripe first
        if (clientSecret) {
          const stripe = await stripePromise;

          // Check if next action is required
          const { paymentIntent } =
            await stripe.retrievePaymentIntent(clientSecret);

          if (paymentIntent.status === "requires_action") {
            const { error: actionError } = await stripe.handleNextAction({
              clientSecret,
            });
            if (actionError) {
              throw new Error(actionError.message);
            }
            // Re-fetch payment intent
            const { paymentIntent: updatedIntent } =
              await stripe.retrievePaymentIntent(clientSecret);
            setPaymentInfo(updatedIntent);
          } else {
            setPaymentInfo(paymentIntent);
          }
        }

        // Fetch order from backend to verify paymentConfirmation status
        const orderData = await paymentService.getOrder(
          serviceName,
          orderType,
          orderId,
        );
        setOrder(orderData);

        // Determine final status from order's paymentConfirmation field
        const confirmation = orderData.paymentConfirmation;

        if (confirmation === "paid") {
          setStatus("success");
        } else if (confirmation === "canceled") {
          setStatus("canceled");
        } else if (confirmation === "failed") {
          setStatus("failed");
        } else if (paymentInfo?.status === "succeeded") {
          // Stripe says success but backend not yet updated - show processing
          setStatus("processing");
          // Poll for update
          pollForStatus(orderId);
        } else {
          setStatus("processing");
        }
      } catch (err) {
        setStatus("failed");
        setError(err.message || "Failed to verify payment");
      }
    };

    verifyPayment();
  }, [orderId, clientSecret, serviceName, orderType]);

  const pollForStatus = async (id) => {
    const maxAttempts = 10;
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setStatus("processing");
        return;
      }

      try {
        const orderData = await paymentService.getOrder(
          serviceName,
          orderType,
          id,
        );
        const confirmation = orderData.paymentConfirmation;

        if (confirmation === "paid") {
          setStatus("success");
          setOrder(orderData);
          return;
        } else if (confirmation === "canceled" || confirmation === "failed") {
          setStatus(confirmation);
          setOrder(orderData);
          return;
        }

        attempts++;
        setTimeout(poll, 2000);
      } catch (err) {
        attempts++;
        setTimeout(poll, 2000);
      }
    };

    poll();
  };

  const statusConfig = {
    loading: {
      icon: <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />,
      title: "Verifying Payment",
      description: "Please wait while we verify your payment...",
      color: "gray",
    },
    success: {
      icon: <CheckCircle className="w-12 h-12 text-green-600" />,
      title: "Payment Successful",
      description:
        "Your payment has been processed successfully. Thank you for your purchase!",
      color: "green",
    },
    processing: {
      icon: <Clock className="w-12 h-12 text-blue-600" />,
      title: "Payment Processing",
      description:
        "Your payment is being processed. This may take a few moments.",
      color: "blue",
    },
    failed: {
      icon: <XCircle className="w-12 h-12 text-red-600" />,
      title: "Payment Failed",
      description:
        error ||
        "There was an issue processing your payment. Please try again.",
      color: "red",
    },
    canceled: {
      icon: <AlertCircle className="w-12 h-12 text-amber-600" />,
      title: "Payment Canceled",
      description:
        "Your payment was canceled. You can try again when you're ready.",
      color: "amber",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div
        className={`w-20 h-20 bg-${config.color}-100 dark:bg-${config.color}-900/20 rounded-full flex items-center justify-center mx-auto mb-6`}
      >
        {config.icon}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {config.title}
      </h1>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {config.description}
      </p>

      {/* Order Details */}
      {order && status === "success" && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Order Details
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono text-gray-900 dark:text-white">
                {orderId?.slice(0, 8)}...
              </span>
            </div>
            {paymentInfo?.amount && (
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {(paymentInfo.amount / 100).toFixed(2)}{" "}
                  {paymentInfo.currency?.toUpperCase()}
                </span>
              </div>
            )}
            {order.status && (
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="badge badge-success">{order.status}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Go to Home
        </Link>
        {(status === "failed" || status === "canceled") && (
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
