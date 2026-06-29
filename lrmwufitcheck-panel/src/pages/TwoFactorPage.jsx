import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Loader2 } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

/**
 * TwoFactorPage - Two-Factor Authentication verification page
 * Handles 2FA code submission after initial login
 */
export default function TwoFactorPage() {
  const navigate = useNavigate();
  const { pending2FA, start2FA, complete2FA, clearPending2FA } = useAuthStore();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const startedRef = useRef(false);

  // Auto-start 2FA on mount (send the code)
  useEffect(() => {
    if (!pending2FA || startedRef.current) return;
    startedRef.current = true;

    const initiate = async () => {
      const result = await start2FA();
      if (!result.success) {
        setError(result.error || "Failed to send verification code.");
      }
    };
    initiate();
  }, [pending2FA, start2FA]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // If no pending 2FA, redirect to login
  if (!pending2FA) {
    navigate("/login");
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await complete2FA(code);

    if (result.success) {
      navigate("/chat");
    } else {
      setError(result.error || "Invalid verification code. Please try again.");
    }
    setLoading(false);
  };

  const handleResendCode = async () => {
    setResending(true);
    setError("");

    const result = await start2FA();
    if (!result.success) {
      setError(result.error || "Failed to resend code.");
    }
    setResending(false);
    setResendCooldown(60);
  };

  const handleCancel = () => {
    clearPending2FA();
    navigate("/login");
  };

  const twoFactorLabel =
    pending2FA.twoFactorType === "email" ? "email" : "mobile device";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Two-Factor Authentication
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Enter the verification code sent to{" "}
          <span className="font-medium">
            {pending2FA.destination || `your ${twoFactorLabel}`}
          </span>
        </p>
      </div>

      {pending2FA.secretCode && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg text-sm text-center">
          <span className="font-medium">Test Mode:</span> Your code is{" "}
          <span className="font-mono font-bold">{pending2FA.secretCode}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Verification Code
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="Enter 6-digit code"
            className="input-field text-center text-2xl tracking-widest"
            maxLength={6}
            autoFocus
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={resending || resendCooldown > 0}
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 disabled:opacity-50"
        >
          {resending
            ? "Sending..."
            : resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Didn't receive a code? Resend"}
        </button>
      </div>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        <button
          type="button"
          onClick={handleCancel}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
        >
          Cancel and return to Login
        </button>
      </p>
    </div>
  );
}
