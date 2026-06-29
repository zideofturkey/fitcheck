import { useState, useCallback } from "react";
import { CreditCard, Loader2, X, AlertCircle } from "lucide-react";
import Modal from "../common/Modal";
import CheckoutForm from "../payment/CheckoutForm";
import paymentService from "../../services/paymentService";
import toast from "react-hot-toast";

/**
 * PaymentActionCard - Renders a "Pay Now" card in the chat UI
 *
 * Displayed when the AI's initiatePayment tool returns a __frontendAction
 * with type "payment". Clicking the button opens a payment modal with
 * CheckoutForm (same behavior as the Pay button in the data object grid).
 */
export default function PaymentActionCard({ action }) {
  const {
    orderId,
    orderType,
    serviceName,
    amount,
    currency,
    description,
    amountField,
    currencyField,
    currencyStaticValue,
  } = action;

  const [modalOpen, setModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const handlePayNow = useCallback(async () => {
    setModalOpen(true);
    setOrderDetails(null);
    setLoadingOrder(true);

    try {
      const order = await paymentService.getOrder(
        serviceName,
        orderType,
        orderId,
      );
      const resolvedAmount =
        amountField && order?.[amountField] != null
          ? Number(order[amountField])
          : (order?.amount ??
            order?.totalAmount ??
            order?.price ??
            order?.purchasePrice ??
            amount);
      const resolvedCurrency = currencyStaticValue
        ? currencyStaticValue.toUpperCase()
        : currencyField && order?.[currencyField] != null
          ? String(order[currencyField]).toUpperCase()
          : (order?.currency ?? currency ?? "USD");
      setOrderDetails({
        amount: resolvedAmount,
        currency: resolvedCurrency,
        description:
          order?.description ??
          order?.name ??
          description ??
          `${orderType} #${orderId?.slice(0, 8)}`,
      });
    } catch (err) {
      // Fallback to action data if order fetch fails
      setOrderDetails({
        amount: amount,
        currency: currency ?? "USD",
        description: description ?? `${orderType} #${orderId?.slice(0, 8)}`,
      });
    } finally {
      setLoadingOrder(false);
    }
  }, [
    orderId,
    orderType,
    serviceName,
    amount,
    currency,
    description,
    amountField,
    currencyField,
    currencyStaticValue,
  ]);

  const handlePaymentSuccess = useCallback((result) => {
    setPaymentDone(true);
    setTimeout(() => {
      setModalOpen(false);
      setOrderDetails(null);
    }, 2000);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setOrderDetails(null);
  }, []);

  const formattedAmount =
    amount != null
      ? `${(currency || "USD").toUpperCase()} ${Number(amount).toFixed(2)}`
      : null;

  return (
    <>
      <div className="my-2 rounded-xl border border-primary-200 dark:border-primary-800 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-primary-100 dark:border-primary-800/50">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {paymentDone ? "Payment Completed" : "Payment Ready"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {description || `Order #${orderId?.slice(0, 8)}`}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          {formattedAmount && (
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {formattedAmount}
            </div>
          )}

          <button
            onClick={handlePayNow}
            disabled={paymentDone}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold rounded-lg shadow-sm transition-all duration-150 ${
              paymentDone
                ? "bg-green-600 text-white cursor-default"
                : "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-[0.98]"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            {paymentDone
              ? "Paid"
              : formattedAmount
                ? `Pay ${formattedAmount}`
                : "Pay Now"}
          </button>
        </div>
      </div>

      {/* Payment Modal - same as ServicePage grid pay button */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={null}
        size="lg"
        showCloseButton={false}
      >
        <div className="space-y-5">
          {/* Modal Header */}
          <div className="flex items-start justify-between -mt-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Complete Payment
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {description || orderType} &middot; #{orderId?.slice(0, 8)}...
                </p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Checkout Form */}
          {loadingOrder ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <CheckoutForm
              orderId={orderId}
              orderType={orderType}
              serviceName={serviceName}
              orderDetails={orderDetails || {}}
              onSuccess={handlePaymentSuccess}
              onError={(err) => {
                toast.error(err?.message || "Payment failed");
              }}
            />
          )}
        </div>
      </Modal>
    </>
  );
}
