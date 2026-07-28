import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  RefreshCw,
  CircleAlert,
  Hash,
  Salad,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useStartEmailVerification,
  useCompleteEmailVerification,
} from "@/hooks/api/use-auth";

const COOLDOWN_SECONDS = 60;

export default function EmailVerificationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [codeIndex, setCodeIndex] = useState(0);
  const [secretCode, setSecretCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const startVerification = useStartEmailVerification();
  const completeVerification = useCompleteEmailVerification();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendCode = useCallback(() => {
    if (!email.trim()) return;
    setError(null);
    startVerification.mutate(email.trim(), {
      onSuccess: (data: any) => {
        setCodeIndex(data?.codeIndex ?? 1);
        if (data?.secretCode) setSecretCode(data.secretCode);
        setStep("code");
        setCooldown(COOLDOWN_SECONDS);
      },
      onError: (err: any) =>
        setError(err?.message || t("emailVerification.sendCodeFailed")),
    });
  }, [email, startVerification, t]);

  const handleResend = useCallback(() => {
    if (cooldown > 0 || !email.trim()) return;
    setError(null);
    startVerification.mutate(email.trim(), {
      onSuccess: (data: any) => {
        setCodeIndex(data?.codeIndex ?? codeIndex + 1);
        if (data?.secretCode) setSecretCode(data.secretCode);
        setCooldown(COOLDOWN_SECONDS);
      },
      onError: (err: any) =>
        setError(err?.message || t("emailVerification.resendCodeFailed")),
    });
  }, [cooldown, email, startVerification, codeIndex, t]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (index === 5 && value) {
      const fullCode = newCode.join("");
      if (fullCode.length === 6) {
        completeVerification.mutate(
          { email: email.trim(), secretCode: fullCode },
          {
            onSuccess: () => navigate("/login", { state: { verified: true } }),
            onError: (err: any) => {
              setError(
                err?.message || t("emailVerification.codeInvalid"),
              );
              setCode(["", "", "", "", "", ""]);
              inputRefs.current[0]?.focus();
            },
          },
        );
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isResendDisabled = cooldown > 0 || completeVerification.isPending;

  return (
    <div className="relative w-full max-w-md mx-auto my-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <Card className="rounded-2xl shadow-md p-6 md:p-8">
        {step === "email" ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Salad className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              {t("emailVerification.title")}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {t("emailVerification.subtitle")}
            </p>
            <div className="w-full space-y-4">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                className="text-center"
                autoFocus
              />
              {error && (
                <Alert variant="destructive" className="text-sm">
                  <CircleAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                className="w-full"
                onClick={handleSendCode}
                disabled={!email.trim() || startVerification.isPending}
              >
                {startVerification.isPending
                  ? t("emailVerification.sending")
                  : t("emailVerification.sendCode")}
              </Button>
            </div>
            <div className="border-t border-border mt-6 pt-5 text-center w-full">
              <Link
                to="/login"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t("emailVerification.backToSignIn")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="flex flex-col items-center mb-6">
              <img
                src="/logo.svg"
                alt="FitCheck"
                className="h-10 w-auto mb-4"
              />
              <h1 className="text-xl font-semibold">
                {t("emailVerification.checkEmail")}
              </h1>
              <p className="text-sm text-muted-foreground text-center mt-1">
                {t("emailVerification.sentCode")}{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            <div className="space-y-5 w-full mt-6">
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold tracking-wide">
                  <Hash className="w-3.5 h-3.5" />
                  {t("emailVerification.codeIndex")}{" "}
                  <span className="font-mono">{codeIndex}</span>
                </span>
              </div>

              <div className="flex justify-center gap-2">
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
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl"
                    autoFocus={i === 0}
                    disabled={completeVerification.isPending}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={isResendDisabled}
                  onClick={handleResend}
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${startVerification.isPending ? "animate-spin" : ""}`}
                  />
                  {t("emailVerification.resendCode")}
                </button>
                {cooldown > 0 && (
                  <span className="text-muted-foreground">
                    {t("emailVerification.resendAvailable")}{" "}
                    <span className="font-mono font-medium text-foreground">
                      {cooldown}s
                    </span>
                  </span>
                )}
              </div>

              {secretCode && (
                <div className="rounded-xl border border-dashed border-border bg-muted/50 p-3 text-center">
                  <p className="text-[11px] text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">
                    {t("emailVerification.devMode")}
                  </p>
                  <code className="text-lg font-mono font-bold text-foreground tracking-[0.3em] select-all">
                    {secretCode}
                  </code>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {t("emailVerification.devModeHint")}
                  </p>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="text-sm">
                  <CircleAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-muted-foreground">
                {t("emailVerification.notReceived")}{" "}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setStep("email")}
                >
                  {t("emailVerification.tryDifferentEmail")}
                </button>
                .
              </p>
            </div>

            <div className="border-t border-border mt-6 pt-5 text-center w-full">
              <Link
                to="/login"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t("emailVerification.backToSignIn")}
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
