import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Hash, CircleCheck, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompletePasswordResetByEmail } from "@/hooks/api/use-auth";
import { useStartPasswordResetByEmail } from "@/hooks/api/use-auth";

const PasswordResetCompletePage = () => {
  const navigate = useNavigate();

  // Form state
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Dev/test secret code (hardcoded for dev mode)
  const devSecretCode = "482931";
  const devCodeIndex = "#A7K2";

  // Resend cooldown
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mutations
  const completeResetMutation = useCompletePasswordResetByEmail();
  const resendCodeMutation = useStartPasswordResetByEmail();

  // Cleanup cooldown on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    let remaining = 60;
    setCooldownSeconds(remaining);
    cooldownRef.current = setInterval(() => {
      remaining--;
      setCooldownSeconds(remaining);
      if (remaining <= 0) {
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        setCooldownSeconds(0);
      }
    }, 1000);
  }, []);

  const handleResend = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cooldownSeconds > 0) return;

    // For resend, the user likely came from forgot-password flow;
    // we use a placeholder email. In production, the email would be
    // passed via route state or query params.
    const email = sessionStorage.getItem("resetEmail") || "";
    if (!email) {
      setError("No email found. Please go back to the forgot password page.");
      return;
    }

    resendCodeMutation.mutate(email, {
      onSuccess: () => {
        startCooldown();
      },
      onError: (err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed to resend code.";
        setError(message);
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (resetCode.length !== 6) {
      setError("Please enter the 6-digit reset code.");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const email = sessionStorage.getItem("resetEmail") || "";
    if (!email) {
      setError("No email found. Please go back to the forgot password page.");
      return;
    }

    completeResetMutation.mutate(
      { email, secretCode: resetCode, password: newPassword },
      {
        onSuccess: () => {
          sessionStorage.removeItem("resetEmail");
          navigate("/login");
        },
        onError: (err: unknown) => {
          const message =
            err instanceof Error ? err.message : "Password reset failed.";
          setError(message);
        },
      },
    );
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(devSecretCode);
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto">
      <div className="bg-card border border-border rounded-2xl shadow-md p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold tracking-tight mb-1">
            Reset your password
          </h2>
          <p className="text-sm text-muted-foreground">
            We sent a 6‑digit code to your email. Enter it below along with your
            new password.
          </p>
        </div>

        {/* Code index badge (dev/test) */}
        <div className="flex items-center justify-between mb-6 bg-muted/60 rounded-xl px-4 py-3">
          <span className="text-xs font-medium text-muted-foreground">
            Code index
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-sm font-mono font-semibold">
            <Hash className="w-3.5 h-3.5" />
            <span>{devCodeIndex}</span>
          </span>
        </div>

        {/* Secret code display (dev/test only) */}
        <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            Development mode — your secret code is
          </p>
          <p className="text-2xl font-mono font-bold tracking-[0.2em] text-primary">
            482 931
          </p>
          <button
            type="button"
            className="mt-2 text-xs text-primary hover:underline font-medium"
            onClick={handleCopyCode}
          >
            Copy code
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* 6-digit code input */}
          <div className="space-y-2">
            <Label htmlFor="reset-code">Reset code</Label>
            <Input
              id="reset-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={resetCode}
              onChange={(e) =>
                setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="h-12 text-center text-lg font-mono tracking-[0.3em]"
            />
            <p className="text-xs text-muted-foreground">
              Enter the 6‑digit code from your email
            </p>
          </div>

          {/* New password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Confirm new password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={completeResetMutation.isPending}
            className="w-full h-12 font-semibold"
          >
            {completeResetMutation.isPending ? (
              <>Resetting...</>
            ) : (
              <>
                <CircleCheck className="w-4 h-4" />
                Reset Password
              </>
            )}
          </Button>
        </form>

        {/* Resend + Cancel */}
        <div className="mt-6 flex flex-col gap-3 items-center">
          {cooldownSeconds > 0 ? (
            <p className="text-xs text-muted-foreground">
              Resend available in{" "}
              <span className="font-mono">{cooldownSeconds}</span>s
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCodeMutation.isPending}
              className="text-sm font-medium text-primary hover:underline transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Resend code
            </button>
          )}
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetCompletePage;
