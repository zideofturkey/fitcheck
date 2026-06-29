import { useState, useEffect, useRef } from "react";
import { Loader2, CreditCard, User, MapPin } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import paymentService from "../../services/paymentService";

// Initialize Stripe with the public key
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_YOUR_STRIPE_PUBLIC_KEY",
);

export default function AddPaymentMethod({ onSuccess, onCancel }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardholderName, setCardholderName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [cardComplete, setCardComplete] = useState(false);

  const cardNumberRef = useRef(null);
  const cardExpiryRef = useRef(null);
  const cardCvcRef = useRef(null);
  const elementsRef = useRef(null);
  const stripeRef = useRef(null);

  useEffect(() => {
    const initStripe = async () => {
      const stripe = await stripePromise;
      if (!stripe) {
        setError("Failed to load Stripe");
        return;
      }

      stripeRef.current = stripe;
      const elements = stripe.elements();
      elementsRef.current = elements;

      const style = {
        base: {
          color: "#1f2937",
          fontSize: "16px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          "::placeholder": {
            color: "#9ca3af",
          },
        },
        invalid: {
          color: "#ef4444",
        },
      };

      const cardNumber = elements.create("cardNumber", { style });
      cardNumber.mount("#card-number");
      cardNumber.on("change", (e) => {
        setCardComplete((prev) => ({ ...prev, number: e.complete }));
        if (e.error) setError(e.error.message);
        else setError(null);
      });
      cardNumberRef.current = cardNumber;

      const cardExpiry = elements.create("cardExpiry", { style });
      cardExpiry.mount("#card-expiry");
      cardExpiry.on("change", (e) => {
        setCardComplete((prev) => ({ ...prev, expiry: e.complete }));
      });
      cardExpiryRef.current = cardExpiry;

      const cardCvc = elements.create("cardCvc", { style });
      cardCvc.mount("#card-cvc");
      cardCvc.on("change", (e) => {
        setCardComplete((prev) => ({ ...prev, cvc: e.complete }));
      });
      cardCvcRef.current = cardCvc;
    };

    initStripe();

    return () => {
      cardNumberRef.current?.destroy();
      cardExpiryRef.current?.destroy();
      cardCvcRef.current?.destroy();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripeRef.current || !cardNumberRef.current) {
      setError("Stripe not initialized");
      return;
    }

    if (!cardholderName.trim()) {
      setError("Cardholder name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create PaymentMethod using Stripe.js
      const { paymentMethod, error: stripeError } =
        await stripeRef.current.createPaymentMethod({
          type: "card",
          card: cardNumberRef.current,
          billing_details: {
            name: cardholderName,
            address: {
              postal_code: postalCode,
            },
          },
        });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Save payment method to backend
      const savedMethod = await paymentService.addPaymentMethod(
        paymentMethod.id,
        {
          cardHolderName: cardholderName,
          cardHolderZip: postalCode,
        },
      );

      onSuccess(savedMethod);
    } catch (err) {
      setError(err.message || "Failed to add payment method");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cardholder Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="John Doe"
            className="input-field pl-10"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Card Number
        </label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <div id="card-number" className="input-field pl-10 py-3" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expiry Date
          </label>
          <div id="card-expiry" className="input-field py-3" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            CVC
          </label>
          <div id="card-cvc" className="input-field py-3" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Postal Code (Optional)
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="12345"
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Add Card
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Your card information is secured by Stripe and never stored on our
        servers.
      </p>
    </form>
  );
}
