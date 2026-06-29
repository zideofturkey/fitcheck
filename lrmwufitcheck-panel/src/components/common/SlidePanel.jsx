import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * SlidePanel — reusable right-side slide-out panel with backdrop.
 *
 * Props:
 *   isOpen    — boolean, controls visibility
 *   onClose   — callback when user clicks backdrop or close button
 *   title     — string, panel header text
 *   size      — 'md' | 'lg' | 'xl' | 'full'  (default 'lg')
 *   children  — panel body content
 */
export default function SlidePanel({
  isOpen,
  onClose,
  title,
  size = "lg",
  children,
}) {
  const panelRef = useRef(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const sizes = {
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-2xl",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full flex flex-col bg-white dark:bg-gray-800 shadow-2xl transition-transform duration-300 ease-in-out",
          sizes[size] || sizes.lg,
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </>
  );
}
