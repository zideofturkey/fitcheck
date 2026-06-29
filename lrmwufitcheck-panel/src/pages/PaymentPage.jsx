import { CreditCard } from "lucide-react";
import PaymentMethodList from "../components/payment/PaymentMethodList";

/**
 * PaymentPage - Manage saved payment methods
 */
export default function PaymentPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <CreditCard className="w-7 h-7" />
          Payment Methods
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your saved payment methods for quick checkout.
        </p>
      </div>

      <div className="card p-6">
        <PaymentMethodList showAddButton={true} />
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
          Security Information
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your payment information is encrypted and securely processed by
          Stripe. We never store your full card details on our servers.
        </p>
      </div>
    </div>
  );
}
