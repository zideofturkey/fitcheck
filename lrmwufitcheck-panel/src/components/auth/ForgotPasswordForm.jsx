import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Smartphone,
  Lock,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import PhoneInput from "../phone-input/PhoneInput";

// Step type: 'method' | 'code' | 'success'
export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const {
    startPasswordResetByEmail,
    completePasswordResetByEmail,
    startPasswordResetByMobile,
    completePasswordResetByMobile,
    verificationLoading,
  } = useAuthStore();

  const [step, setStep] = useState("method");
  const [method, setMethod] = useState("email");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [startResponse, setStartResponse] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod);
    setStep("code");
  };

  const handleStartReset = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your email address");
      return;
    }

    setError(null);
    const result =
      method === "email"
        ? await startPasswordResetByEmail(identifier)
        : await startPasswordResetByMobile(identifier);

    if (result.success) {
      setStartResponse(result);
    } else {
      setError(result.error || "Failed to start password reset");
    }
  };

  const handleCompleteReset = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      setError("Please enter the verification code");
      return;
    }
    if (!password) {
      setError("Please enter a new password");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError(null);
    const result =
      method === "email"
        ? await completePasswordResetByEmail(identifier, code.trim(), password)
        : await completePasswordResetByMobile(
            identifier,
            code.trim(),
            password,
          );

    if (result.success) {
      setStep("success");
    } else {
      setError(result.error || "Failed to reset password");
    }
  };

  const handleCopyCode = () => {
    if (startResponse?.secretCode) {
      navigator.clipboard.writeText(startResponse.secretCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Step 1: Method Selection
  if (step === "method") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Choose how you want to reset your password
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleMethodSelect("email")}
            className="w-full flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Reset via Email
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive a verification code in your email
              </p>
            </div>
          </button>

          <button
            onClick={() => handleMethodSelect("mobile")}
            className="w-full flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Reset via Mobile
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive a verification code via SMS
              </p>
            </div>
          </button>
        </div>

        <div className="text-center">
          <Link
            to={"/login"}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // Success step
  if (step === "success") {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Password Reset!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your password has been successfully reset. You can now login with
            your new password.
          </p>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="btn-primary w-full"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Code entry and password reset step
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          {method === "email" ? (
            <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          ) : (
            <Smartphone className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reset Password
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {startResponse
            ? `Enter the code sent to your ${method === "email" ? "email" : "mobile"}`
            : `Enter your email to receive a reset code`}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!startResponse ? (
        // Identifier input form
        <form onSubmit={handleStartReset} className="space-y-4">
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="identifier"
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input-field pl-10"
                placeholder="you@example.com"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={verificationLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {verificationLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Code"
            )}
          </button>
        </form>
      ) : (
        // Code and new password form
        <>
          {/* Test mode: Show secret code */}
          {startResponse?.secretCode && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                <strong>Test Mode:</strong> Use this code
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
            </div>
          )}

          <form onSubmit={handleCompleteReset} className="space-y-4">
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
                className="input-field text-center text-xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={verificationLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {verificationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </>
      )}

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setStep("method");
            setStartResponse(null);
            setCode("");
            setPassword("");
            setConfirmPassword("");
            setError(null);
          }}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm flex items-center justify-center gap-1 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Choose different method
        </button>
      </div>
    </div>
  );
}
