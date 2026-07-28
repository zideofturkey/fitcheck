import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  TicketCheck,
  UserCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
  CloudOff,
  Ban,
  Circle,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRegister } from "@/hooks/api/use-auth";
import { invitationcenterService } from "@/services/api/invitationcenter-api";

type InviteStatus = "loading" | "valid" | "expired" | "invalid" | "revoked";

interface InviteMetadata {
  inviteCode: string;
  invitedEmail: string;
  usageMode: "singleUse" | "limitedUse";
  expiresAt: string | null; // null = no expiry
}

const RegisterWithInvitePage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteCodeFromUrl = searchParams.get("code") ?? "";

  const [inviteStatus, setInviteStatus] = useState<InviteStatus>("loading");
  const [inviteMetadata, setInviteMetadata] = useState<InviteMetadata | null>(
    null,
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [copied, setCopied] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const registerMutation = useRegister();

  // Fetch the real invite metadata by code (read-only lookup — actual
  // validation + consumption happens server-side when the form is
  // submitted, via the auth service's /v1/registeruser endpoint).
  useEffect(() => {
    if (!inviteCodeFromUrl) {
      setInviteStatus("invalid");
      return;
    }

    let cancelled = false;
    setInviteStatus("loading");

    invitationcenterService
      .getInviteLinkByCode(inviteCodeFromUrl)
      .then((res) => {
        if (cancelled) return;
        const link = res.inviteLink;
        if (link.inviteState === "expired") {
          setInviteStatus("expired");
          return;
        }
        if (link.inviteState === "revoked") {
          setInviteStatus("revoked");
          return;
        }
        if (
          link.inviteState === "exhausted" ||
          link.inviteState === "consumed"
        ) {
          setInviteStatus("invalid");
          return;
        }
        setInviteStatus("valid");
        setInviteMetadata({
          inviteCode: link.inviteCode,
          invitedEmail: link.invitedEmail ?? "",
          usageMode: link.usageMode,
          expiresAt: link.expiresAt ?? null,
        });
        if (link.invitedEmail) setEmail(link.invitedEmail);
      })
      .catch(() => {
        if (!cancelled) setInviteStatus("invalid");
      });

    return () => {
      cancelled = true;
    };
  }, [inviteCodeFromUrl]);

  const handleCopyCode = useCallback(async () => {
    if (!inviteMetadata?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteMetadata.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }, [inviteMetadata?.inviteCode]);

  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push(t("register.passwordMinLength"));
    }
    if (password !== confirmPassword) {
      errors.push(t("register.passwordMismatch"));
    }
    if (!fullName.trim()) {
      errors.push(t("register.fullNameRequired"));
    }
    if (!email.trim()) {
      errors.push(t("register.emailRequired"));
    }
    if (!agreedToTerms) {
      errors.push(t("register.mustAgreeTerms"));
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    if (!validateForm()) return;

    registerMutation.mutate(
      {
        inviteCode: inviteCodeFromUrl,
        fullname: fullName,
        email,
        password,
      },
      {
        onSuccess: () => {
          navigate("/login?registered=true");
        },
        onError: (err: unknown) => {
          const message =
            err && typeof err === "object" && "message" in err
              ? String((err as { message?: unknown }).message)
              : err instanceof Error
                ? err.message
                : t("register.registrationFailed");
          setValidationErrors([message]);
        },
      },
    );
  };

  const passwordStrength = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) || /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthColors = [
    "bg-muted",
    "bg-destructive",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-600",
  ];

  // --- Loading state ---
  if (inviteStatus === "loading") {
    return (
      <main className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-12">
        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-8 md:mb-10">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="bg-card border border-border rounded-2xl shadow-sm p-5 md:p-6 mb-6">
            <div className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl shadow-sm p-5 md:p-6 space-y-5">
            <Skeleton className="h-5 w-20 mb-1" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  // --- Expired state ---
  if (inviteStatus === "expired") {
    return (
      <main className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-12">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border rounded-2xl shadow-md p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CloudOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">
              {t("register.expiredTitle")}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {t("register.expiredDesc")}
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:opacity-95 transition-opacity"
            >
              <LogIn className="w-4 h-4" />
              {t("register.backToSignIn")}
            </Link>
            <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
              {t("register.expiredContact")}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // --- Invalid / Revoked state ---
  if (inviteStatus === "invalid" || inviteStatus === "revoked") {
    return (
      <main className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-12">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border rounded-2xl shadow-md p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Ban className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">
              {t("register.invalidTitle")}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {t("register.invalidDesc")}
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("register.backToSignIn")}
            </Link>
            <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
              {t("register.invalidContact")}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // --- Main registration form ---
  return (
    <main className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-12">
      <div className="w-full max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 md:mb-10">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("register.backToSignInLink")}
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("register.createAccount")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {t("register.registerSubtitle")}
          </p>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm mb-6">
            <Circle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{t("register.fixErrors")}</p>
              <ul className="mt-1 list-disc list-inside text-sm opacity-90 space-y-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Invite Metadata Card */}
        {inviteMetadata && (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-5 md:p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <TicketCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground">
                  {t("register.invitationDetails")}
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground shrink-0">
                      {t("register.for")}
                    </span>
                    <span className="font-medium text-foreground truncate">
                      {inviteMetadata.invitedEmail}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground shrink-0">
                      {t("register.type")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                      <UserCheck className="w-3 h-3" />
                      {inviteMetadata.usageMode === "singleUse"
                        ? t("register.singleUse")
                        : t("register.multiUse")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground shrink-0">
                      {t("register.expires")}
                    </span>
                    <span className="font-medium text-foreground">
                      {inviteMetadata.expiresAt ?? t("register.noExpiry")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">
                {t("register.inviteCodeLabel")}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted text-foreground px-3 py-2 rounded-lg text-sm font-mono tracking-wide truncate select-all">
                  {inviteMetadata.inviteCode}
                </code>
                <button
                  type="button"
                  aria-label={t("register.copyCodeAria")}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors shrink-0"
                  onClick={handleCopyCode}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form
          className="bg-card border border-border rounded-2xl shadow-sm p-5 md:p-6 space-y-5"
          noValidate
          onSubmit={handleSubmit}
        >
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="fullname"
              className="block text-sm font-medium text-foreground"
            >
              {t("register.fullName")}
            </Label>
            <Input
              type="text"
              id="fullname"
              name="fullname"
              placeholder="e.g. Emma Wilson"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              {t("register.emailAddress")}
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              {t("register.emailPrefilled")}
            </p>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              {t("register.password")}
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder={t("register.passwordPlaceholder")}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 pr-11 rounded-xl"
              />
              <button
                type="button"
                aria-label={
                  showPassword
                    ? t("register.hidePassword")
                    : t("register.showPassword")
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4].map((level) => (
                <span
                  key={level}
                  className={`flex-1 h-1 rounded-full ${
                    passwordStrength >= level
                      ? strengthColors[passwordStrength]
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-foreground"
            >
              {t("register.confirmPassword")}
            </Label>
            <Input
              type="password"
              id="confirm-password"
              name="confirm-password"
              placeholder={t("register.confirmPasswordPlaceholder")}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-xl"
            />
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 pt-1">
            <button
              type="button"
              role="checkbox"
              aria-checked={agreedToTerms}
              className={`w-5 h-5 rounded-md border border-input bg-background mt-0.5 shrink-0 flex items-center justify-center hover:border-ring transition-colors focus:ring-2 focus:ring-ring/20 cursor-pointer ${
                agreedToTerms ? "bg-primary border-primary" : ""
              }`}
              onClick={() => setAgreedToTerms((prev) => !prev)}
            >
              {agreedToTerms && (
                <Check className="w-3.5 h-3.5 text-primary-foreground" />
              )}
            </button>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-foreground font-medium">
                {t("register.agreeTerms1")}
              </span>{" "}
              {t("register.agreeTermsText")}{" "}
              <span className="text-foreground font-medium">
                {t("register.agreeTerms2")}
              </span>
              {t("register.agreeTermsSuffix")}
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full h-12 rounded-xl font-semibold text-sm shadow-sm"
          >
            {registerMutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {t("register.creatingAccount")}
              </span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                {t("register.createAccountBtn")}
              </>
            )}
          </Button>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground pt-1">
            {t("register.alreadyHaveAccount")}{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              {t("register.signIn")}
            </Link>
          </p>
        </form>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted-foreground mt-6 px-4">
          <ShieldCheck className="w-3.5 h-3.5 inline-block align-text-bottom mr-1 text-primary" />
          {t("register.footerNote")}
        </p>
      </div>
    </main>
  );
};

export default RegisterWithInvitePage;
