import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  CircleCheck,
  Loader,
  KeyRound,
  Lock,
  Check,
} from "lucide-react";
import {
  useStartPasswordResetByEmail,
  useCompletePasswordResetByEmail,
} from "@/hooks/api/use-auth";

export default function PasswordResetRequestPage() {
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
        setError(
          err?.message || "Failed to send reset code. Please try again.",
        ),
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
          setError(
            err?.message || "Password reset Check your code and try again.",
          ),
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
            {step === "email" ? "Reset your password" : "Create new password"}
          </CardTitle>
          <CardDescription className="text-sm">
            {step === "email"
              ? "Enter your email and we'll send you a reset code."
              : `Enter the code sent to ${email} and choose a new password.`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              <div className="text-left">
                <Label htmlFor="email">Email address</Label>
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
                Send Reset Code
              </Button>
            </form>
          ) : (
            <form
              onSubmit={handleResetPassword}
              className="flex flex-col gap-4"
            >
              <div className="text-left">
                <Label htmlFor="secretCode">Reset code</Label>
                <Input
                  id="secretCode"
                  placeholder="6-digit code"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="text-left">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
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
                Reset Password
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
                Back to email
              </button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-0">
          {step === "email" && (
            <>
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
              <p className="text-xs text-muted-foreground border-t border-border pt-4 w-full">
                FitCheck is invite‑only. You need an invitation link to create
                an account.
              </p>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
