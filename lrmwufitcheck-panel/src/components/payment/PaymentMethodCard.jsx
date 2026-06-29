import { Trash2, Check } from "lucide-react";
import { cn } from "../../utils/cn";

const brandIcons = {
  visa: (
    <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <path d="M19.5 21.5L21.5 10.5H24.5L22.5 21.5H19.5Z" fill="white" />
      <path
        d="M32 10.5L29 17.5L28.5 15L27.5 11C27.5 11 27.3 10.5 26.5 10.5H22L21.9 10.7C21.9 10.7 23.2 11 24.5 12L27 21.5H30.5L35 10.5H32Z"
        fill="white"
      />
      <path
        d="M17 10.5L14 21.5H11L8.5 12.5C8.5 12.5 8.3 11.5 7.5 11C6.7 10.5 5.5 10.5 5.5 10.5L5.6 10.5H10.5C11.5 10.5 12 11 12.2 12L13.5 19L17 10.5Z"
        fill="white"
      />
    </svg>
  ),
  mastercard: (
    <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#000" />
      <circle cx="19" cy="16" r="10" fill="#EB001B" />
      <circle cx="29" cy="16" r="10" fill="#F79E1B" />
      <path
        d="M24 8.5C26.5 10.5 28 13 28 16C28 19 26.5 21.5 24 23.5C21.5 21.5 20 19 20 16C20 13 21.5 10.5 24 8.5Z"
        fill="#FF5F00"
      />
    </svg>
  ),
  amex: (
    <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#006FCF" />
      <text
        x="8"
        y="20"
        fill="white"
        fontFamily="Arial"
        fontSize="8"
        fontWeight="bold"
      >
        AMEX
      </text>
    </svg>
  ),
  discover: (
    <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#FF6000" />
      <circle cx="32" cy="16" r="8" fill="white" />
    </svg>
  ),
};

export default function PaymentMethodCard({
  method,
  selected = false,
  selectable = false,
  onSelect,
  onDelete,
}) {
  const brand = method.cardInfo?.brand || "visa";
  const last4 = method.cardInfo?.last4 || "****";
  const expMonth = method.cardInfo?.exp_month;
  const expYear = method.cardInfo?.exp_year;
  const holderName = method.cardHolderName;

  return (
    <div
      onClick={selectable ? onSelect : undefined}
      className={cn(
        "relative flex items-center gap-4 p-4 border rounded-xl transition-all",
        selectable && "cursor-pointer",
        selected
          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
      )}
    >
      {selectable && selected && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
      )}

      <div className="flex-shrink-0">
        {brandIcons[brand.toLowerCase()] || brandIcons.visa}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white capitalize">
            {brand}
          </span>
          <span className="text-gray-600 dark:text-gray-400">•••• {last4}</span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {holderName && <span>{holderName} • </span>}
          Expires {expMonth}/{String(expYear).slice(-2)}
        </div>
      </div>

      {onDelete && !selectable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Remove card"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
