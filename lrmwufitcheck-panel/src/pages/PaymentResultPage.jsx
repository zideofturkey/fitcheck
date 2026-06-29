import { useSearchParams } from "react-router-dom";
import PaymentResult from "../components/payment/PaymentResult";

/**
 * PaymentResultPage - Displays payment result after checkout
 *
 * Query params:
 * - orderId: The order ID
 * - orderType: The data object type
 * - service: The service name
 * - payment_intent_client_secret: Stripe client secret for verification
 */
export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();

  const orderType = searchParams.get("orderType") || "order";
  const serviceName = searchParams.get("service");

  return (
    <div className="max-w-2xl mx-auto py-8">
      <PaymentResult orderType={orderType} serviceName={serviceName} />
    </div>
  );
}
