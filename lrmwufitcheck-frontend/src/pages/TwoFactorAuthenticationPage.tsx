import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CircleCheck, Shield, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useStartEmail2Factor,
  useCompleteEmail2Factor,
} from "@/hooks/api/use-auth";

export default function TwoFactorAuthenticationPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const start2FA = useStartEmail2Factor();
  const complete2FA = useCompleteEmail2Factor();

  // Trigger on mount
  useEffect(() => {
    start2FA.mutate(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || "";
    }
    setCode(newCode);
    const lastFilled = pasted.length - 1;
    if (lastFilled >= 0 && lastFilled < 5) {
      inputRefs.current[lastFilled + 1]?.focus();
    } else if (lastFilled >= 5) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const secretCode = code.join("");
    if (secretCode.length !== 6) return;
    complete2FA.mutate(secretCode, {
      onSuccess: () => navigate("/dashboard"),
    });
  };

  const handleResend = () => {
    start2FA.mutate(undefined);
  };

  const isComplete = code.every((c) => c !== "");
  const isLoading = complete2FA.isPending;

  return (
    <div className="w-full max-w-md mx-auto my-auto px-4">
      <div className="bg-card border border-border rounded-2xl shadow-md p-6 md:p-8 text-center">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Two-Factor Authentication
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Enter the 6-digit verification code sent to your email to continue.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <Input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl"
                disabled={isLoading}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {complete2FA.error && (
            <p className="text-sm text-destructive">
              {(complete2FA.error as { message?: string })?.message ||
                "Verification failed. Please try again."}
            </p>
          )}

          <Button
            type="submit"
            disabled={!isComplete || isLoading}
            className="gap-2 rounded-xl font-semibold"
          >
            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
            {!isLoading && <CircleCheck className="w-4 h-4" />}
            Verify and continue
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-5">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={start2FA.isPending}
            className="underline hover:text-foreground transition-colors font-medium disabled:opacity-50"
          >
            {start2FA.isPending ? "Resending..." : "Resend code"}
          </button>
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
