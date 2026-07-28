import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader,
  KeyRound,
  Lock,
} from "lucide-react";
import {
  useStartPasswordResetByEmail,
  useCompletePasswordResetByEmail,
} from "@/hooks/api/use-auth";

export default function PasswordResetRequestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const startReset = useStartPasswordResetByEmail();
  const completeReset = useCompletePasswordResetByEmail();

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startReset.mutate(email, {
      onSuccess: () => setStep("reset"),
      onError: (err: any) =>
        setError(err?.message || t("passwordReset.sendCodeFailed")),
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    completeReset.mutate(
      { email, secretCode, password },
      {
        onSuccess: () => navigate("/login", { state: { passwordReset: true } }),
        onError: (err: any) =>
          setError(err?.message || t("passwordReset.resetFailed")),
      },
    );
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto px-4">
      <Card className="shadow-md text-center">
        <CardHeader className="pb-4">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            {step === "email" ? (
              <Mail className="w-7 h-7 text-primary" />
            ) : (
              <KeyRound className="w-7 h-7 text-primary" />
            )}
          </div>
          <CardTitle className="text-xl">
            {step === "email"
              ? t("passwordReset.resetTitle")
              : t("passwordReset.newPasswordTitle")}
          </CardTitle>
          <CardDescription className="text-sm">
            {step === "email"
              ? t("passwordReset.resetSubtitle")
              : t("passwordReset.newPasswordSubtitle", { email })}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              <div className="text-left">
                <Label htmlFor="email">{t("passwordReset.emailAddress")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              {error && (
                <Alert variant="destructive" className="text-left">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={startReset.isPending}
              >
                {startReset.isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                {t("passwordReset.sendResetCode")}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={handleResetPassword}
              className="flex flex-col gap-4"
            >
              <div className="text-left">
                <Label htmlFor="secretCode">
                  {t("passwordReset.resetCode")}
                </Label>
                <Input
                  id="secretCode"
                  placeholder={t("passwordReset.resetCodePlaceholder")}
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="text-left">
                <Label htmlFor="password">
                  {t("passwordReset.newPassword")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("passwordReset.newPasswordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              {error && (
                <Alert variant="destructive" className="text-left">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={completeReset.isPending}
              >
                {completeReset.isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {t("passwordReset.resetPassword")}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                {t("passwordReset.backToEmail")}
              </button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-0">
          {step === "email" && (
            <>
              <p className="text-sm text-muted-foreground">
                {t("passwordReset.rememberPassword")}{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  {t("passwordReset.signIn")}
                </Link>
              </p>
              <p className="text-xs text-muted-foreground border-t border-border pt-4 w-full">
                {t("passwordReset.inviteOnlyNote")}
              </p>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
