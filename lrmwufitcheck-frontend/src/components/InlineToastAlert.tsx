import * as React from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

interface InlineToastAlertProps {
  message: string;
  variant?: "success" | "error" | "warning" | "info";
  alertBorder?: string;
  alertBg?: string;
  icon?: string;
  iconColor?: string;
  textColor?: string;
  onDismiss?: () => void;
}

const variantDefaults: Record<
  NonNullable<InlineToastAlertProps["variant"]>,
  {
    alertBorder: string;
    alertBg: string;
    icon: string;
    iconColor: string;
    textColor: string;
  }
> = {
  success: {
    alertBorder: "border-emerald-200",
    alertBg: "bg-emerald-50",
    icon: "check-circle",
    iconColor: "text-emerald-600",
    textColor: "text-emerald-800",
  },
  error: {
    alertBorder: "border-red-200",
    alertBg: "bg-red-50",
    icon: "x-circle",
    iconColor: "text-red-600",
    textColor: "text-red-800",
  },
  warning: {
    alertBorder: "border-amber-200",
    alertBg: "bg-amber-50",
    icon: "alert-circle",
    iconColor: "text-amber-600",
    textColor: "text-amber-800",
  },
  info: {
    alertBorder: "border-blue-200",
    alertBg: "bg-blue-50",
    icon: "info",
    iconColor: "text-blue-600",
    textColor: "text-blue-800",
  },
};

const InlineToastAlert: React.FC<InlineToastAlertProps> = ({
  message,
  variant = "info",
  alertBorder = variantDefaults[variant].alertBorder,
  alertBg = variantDefaults[variant].alertBg,
  icon: iconProp,
  iconColor = variantDefaults[variant].iconColor,
  textColor = variantDefaults[variant].textColor,
  onDismiss,
}) => {
  const iconName = iconProp ?? variantDefaults[variant].icon;
  const resolvedAlertBorder =
    alertBorder ?? variantDefaults[variant].alertBorder;
  const resolvedAlertBg = alertBg ?? variantDefaults[variant].alertBg;
  const resolvedIconColor = iconColor ?? variantDefaults[variant].iconColor;

  const IconComponent = (() => {
    const icons: Record<
      string,
      React.ComponentType<
        React.SVGProps<SVGSVGElement> & { className?: string }
      >
    > = {
      "check-circle": CheckCircle,
      "x-circle": XCircle,
      "alert-circle": AlertCircle,
      info: Info,
    };
    return icons[iconName] ?? null;
  })();

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-md border ${resolvedAlertBorder} ${resolvedAlertBg} text-sm`}
      role="alert"
    >
      {IconComponent && (
        <IconComponent
          className={`w-4 h-4 flex-shrink-0 ${resolvedIconColor}`}
          aria-hidden="true"
        />
      )}
      <p className={`flex-1 ${textColor}`}>{message}</p>
      {onDismiss && (
        <button
          type="button"
          className={`p-1 rounded-md hover:bg-background/50 transition-colors flex-shrink-0`}
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X className={`w-4 h-4 ${resolvedIconColor}`} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default InlineToastAlert;
