import React, { lazy, Suspense } from "react";
import { QrCode, Loader2, Pin } from "lucide-react";
import { useChatStore } from "../../stores/chatStore";

const LazyQRCode = lazy(() => import("react-qr-code"));

export default function QrCodeActionCard({ action }) {
  if (!action?.value) return null;
  const { setBrowserView } = useChatStore();

  const title = action.title || "QR Code";
  const subtitle = action.subtitle || null;

  return (
    <div className="my-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-indigo-100 dark:border-indigo-800/50">
        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {subtitle}
            </div>
          )}
        </div>
        <button
          onClick={() => setBrowserView({ type: "qrcode", title, action })}
          className="ml-auto p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Pin to visual browser"
        >
          <Pin className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-4">
        <Suspense
          fallback={
            <div className="flex justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          }
        >
          <div className="flex justify-center p-3 bg-white rounded-lg">
            <LazyQRCode value={String(action.value)} size={200} level="M" />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
