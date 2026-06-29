import { useState, useEffect } from "react";
import { CreditCard, Plus, Loader2, AlertCircle } from "lucide-react";
import paymentService from "../../services/paymentService";
import PaymentMethodCard from "./PaymentMethodCard";
import AddPaymentMethod from "./AddPaymentMethod";
import Modal from "../common/Modal";
import toast from "react-hot-toast";

/**
 * PaymentMethodList - Displays and manages payment methods
 *
 * Can be used in two modes:
 * 1. Self-managed: Component fetches and manages its own state
 * 2. Externally managed: Pass paymentMethods, loading, onDelete props
 *
 * @param {Array} paymentMethods - External payment methods (optional)
 * @param {boolean} loading - External loading state (optional)
 * @param {Function} onDelete - External delete handler (optional)
 * @param {Function} onSelect - Selection handler for checkout flow
 * @param {string} selectedId - Currently selected payment method ID
 * @param {boolean} showAddButton - Whether to show add button
 * @param {boolean} selectable - Whether methods are selectable
 * @param {string} emptyMessage - Custom message when no methods
 */
export default function PaymentMethodList({
  paymentMethods: externalMethods,
  loading: externalLoading,
  onDelete: externalOnDelete,
  onSelect,
  selectedId = null,
  showAddButton = true,
  selectable = false,
  emptyMessage = "No payment methods saved",
}) {
  // Internal state (used when no external props provided)
  const [internalMethods, setInternalMethods] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Use external or internal state
  const isExternallyManaged = externalMethods !== undefined;
  const paymentMethods = isExternallyManaged
    ? externalMethods
    : internalMethods;
  const isLoading = isExternallyManaged ? externalLoading : internalLoading;

  const loadPaymentMethods = async () => {
    if (isExternallyManaged) return;

    setInternalLoading(true);
    setError(null);
    try {
      const methods = await paymentService.listPaymentMethods();
      setInternalMethods(Array.isArray(methods) ? methods : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load payment methods",
      );
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    if (!isExternallyManaged) {
      loadPaymentMethods();
    }
  }, [isExternallyManaged]);

  const handleDelete = async (paymentMethodId) => {
    if (externalOnDelete) {
      externalOnDelete(paymentMethodId);
    } else {
      try {
        await paymentService.deletePaymentMethod(paymentMethodId);
        setInternalMethods((prev) =>
          prev.filter((m) => m.paymentMethodId !== paymentMethodId),
        );
        toast.success("Payment method removed");
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to remove payment method",
        );
      }
    }
  };

  const handleAdd = (newMethod) => {
    if (!isExternallyManaged) {
      setInternalMethods((prev) => [...prev, newMethod]);
    }
    setShowAddModal(false);
    toast.success("Payment method added");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={loadPaymentMethods}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paymentMethods.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {emptyMessage}
          </p>
          {showAddButton && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Payment Method
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id || method.paymentMethodId}
                method={method}
                selected={selectedId === method.paymentMethodId}
                selectable={selectable}
                onSelect={() => onSelect?.(method)}
                onDelete={() => handleDelete(method.paymentMethodId)}
              />
            ))}
          </div>
          {showAddButton && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Card
            </button>
          )}
        </>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Payment Method"
        size="md"
      >
        <AddPaymentMethod
          onSuccess={handleAdd}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
}
