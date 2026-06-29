import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Smartphone,
  Loader2,
  CheckCircle,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

export default function MobileVerificationForm({ onComplete, adminMode }) {
  const navigate = useNavigate();
  const {
    pendingVerification,
    startMobileVerification,
    completeMobileVerification,
    verificationLoading,
    clearPendingVerification,
  } = useAuthStore();

  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [startResponse, setStartResponse] = useState(null);
  const [copied, setCopied] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const identifier = pendingVerification?.email || "";

  // Start verification on mount
  useEffect(() => {
    if (identifier && !startResponse) {
      handleStartVerification();
    }
  }, [identifier]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [resendCountdown]);

  const handleStartVerification = async () => {
    if (!identifier) {
      setError("Email is required");
      return;
    }

    setError(null);
    const result = await startMobileVerification(identifier);

    if (result.success) {
      setStartResponse(result);
      // Set resend cooldown (default 60 seconds)
      setResendDisabled(true);
      setResendCountdown(60);
    } else {
      if (result.errCode === "AlreadyVerified") {
        if (adminMode) {
          setError("This mobile number is already verified.");
        } else {
          setError("Mobile is already verified. You can now login.");
        }
      } else {
        setError(result.error || "Failed to start verification");
      }
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setError(null);
    const result = await completeMobileVerification(identifier, code.trim());

    if (result.success) {
      setSuccess(true);
      if (adminMode) {
        // In admin mode, call onComplete callback after short delay
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 1500);
      } else {
        setTimeout(() => {
          clearPendingVerification();
          navigate("/login");
        }, 2000);
      }
    } else {
      setError(result.error || "Invalid verification code");
    }
  };

  const handleCopyCode = () => {
    if (startResponse?.secretCode) {
      navigator.clipboard.writeText(startResponse.secretCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResend = () => {
    if (!resendDisabled) {
      handleStartVerification();
    }
  };

  // If no pending verification, show message
  if (!pendingVerification || pendingVerification.type !== "mobile") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mobile Verification
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            No pending mobile verification found.
          </p>
        </div>
        {!adminMode && (
          <button
            onClick={() => navigate("/login")}
            className="btn-primary w-full"
          >
            Go to Login
          </button>
        )}
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mobile Verified!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {adminMode
              ? "The mobile number has been successfully verified."
              : "Your mobile number has been successfully verified. Redirecting to login..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Verify Your Mobile
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          We've sent a verification code to your mobile number.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Test mode: Show secret code */}
      {startResponse?.secretCode && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
            <strong>Test Mode:</strong> Use this code to verify
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-yellow-100 dark:bg-yellow-800/50 px-3 py-2 rounded font-mono text-lg">
              {startResponse.secretCode}
            </code>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-2 hover:bg-yellow-200 dark:hover:bg-yellow-700 rounded transition-colors"
              title="Copy code"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-yellow-700 dark:text-yellow-300" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Code index indicator */}
      {startResponse?.codeIndex && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Code Index:{" "}
          <span className="font-medium">{startResponse.codeIndex}</span>
          {startResponse.expireTime && (
            <span className="ml-2">
              (Expires in {Math.round(startResponse.expireTime / 60)} minutes)
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleComplete} className="space-y-4">
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
            onChange={(e) => setCode(e.target.value)}
            className="input-field text-center text-2xl tracking-widest font-mono"
            placeholder="000000"
            maxLength={6}
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={verificationLoading || !code.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {verificationLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Mobile"
          )}
        </button>
      </form>

      {/* Resend code */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Didn't receive the code?
        </p>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendDisabled || verificationLoading}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium flex items-center justify-center gap-1 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-4 h-4" />
          {resendDisabled ? `Resend in ${resendCountdown}s` : "Resend Code"}
        </button>
      </div>

      {/* Back to login (not shown in admin mode) */}
      {!adminMode && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              clearPendingVerification();
              navigate("/login");
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
}
