import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import CheckoutForm from "../components/payment/CheckoutForm";
import paymentService from "../services/paymentService";
import {
  getTenantCodenameFromPath,
  withTenantPrefix,
} from "../utils/tenantRouting";

const ORDER_TYPE_CONFIG = {};

/**
 * CheckoutPage - Universal checkout page for any StripeOrder-enabled data object
 *
 * Route: /checkout/:orderType/:orderId
 * Query params: ?service=serviceName
 */
export default function CheckoutPage() {
  const location = useLocation();
  const { orderType, orderId } = useParams();
  const [searchParams] = useSearchParams();
  const serviceName = searchParams.get("service");
  const checkoutScopeTenant =
    getTenantCodenameFromPath(location.pathname) || "root";
  const backPath = withTenantPrefix("/chat", checkoutScopeTenant);
  const paymentResultPath = withTenantPrefix(
    "/payment/result",
    checkoutScopeTenant,
  );
  const returnUrl = `${paymentResultPath}?orderType=${encodeURIComponent(orderType || "")}&service=${encodeURIComponent(serviceName || "")}`;

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId || !orderType || !serviceName) {
        setError("Missing order information");
        setIsLoading(false);
        return;
      }

      try {
        const orderData = await paymentService.getOrder(
          serviceName,
          orderType,
          orderId,
        );
        setOrder(orderData);
      } catch (err) {
        setError(err.message || "Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId, orderType, serviceName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Unable to Load Order
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Link to={backPath} className="btn-primary">
          Return Home
        </Link>
      </div>
    );
  }

  const cfg = ORDER_TYPE_CONFIG[orderType] || {};
  const amount =
    cfg.amountProperty && order?.[cfg.amountProperty] != null
      ? Number(order[cfg.amountProperty])
      : (order?.amount ?? order?.totalAmount ?? order?.price ?? 0);
  const currency = cfg.currencyStaticValue
    ? cfg.currencyStaticValue.toUpperCase()
    : cfg.currencyProperty && order?.[cfg.currencyProperty] != null
      ? String(order[cfg.currencyProperty]).toUpperCase()
      : (order?.currency ?? "USD");
  const orderDetails = {
    amount,
    currency,
    description:
      order?.description || `Payment for ${orderType} #${orderId?.slice(0, 8)}`,
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Complete Your Payment
        </h1>
      </div>

      <div className="card p-6">
        <CheckoutForm
          orderId={orderId}
          orderType={orderType}
          serviceName={serviceName}
          orderDetails={orderDetails}
          returnUrl={returnUrl}
          onSuccess={(result) => {
            console.log("Payment successful:", result);
          }}
          onError={(error) => {
            console.error("Payment error:", error);
          }}
        />
      </div>
    </div>
  );
}
