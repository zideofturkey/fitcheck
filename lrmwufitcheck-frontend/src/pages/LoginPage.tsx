import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Salad,
  Mail,
  Lock,
  EyeOff,
  Eye,
  LogIn,
  ShieldCheck,
  Loader,
} from "lucide-react";
import { useLogin } from "@/hooks/api/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const LoginPage = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const { t } = useTranslation();

  const [email, setEmail] = useState("admin@fitcheck.com");
  const [password, setPassword] = useState("superadmin");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate(
      { username: email, password },
      {
        onSuccess: () => {
          navigate("/dashboard");
        },
      },
    );
  };

  const fillSuperAdmin = () => {
    setEmail("admin@fitcheck.com");
    setPassword("superadmin");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full max-w-md mx-auto py-8 md:py-12">
      <div className="bg-card border border-border rounded-2xl shadow-md p-6 md:p-8">
        {/* Logo + header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Salad className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("login.welcomeBack")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {t("login.subtitle")}
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              {t("login.emailAddress")}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="admin@fitcheck.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full h-11 pl-10 pr-4 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                {t("login.password")}
              </Label>
              <Link
                to="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {t("login.forgot")}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder={t("login.enterPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full h-11 pl-10 pr-10 rounded-xl"
              />
              <button
                type="button"
                aria-label={t("login.toggleVisibility")}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <Label
              htmlFor="remember"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              {t("login.keepSignedIn")}
            </Label>
          </div>

          {loginMutation.error && (
            <p className="text-sm text-destructive">
              {loginMutation.error instanceof Error
                ? loginMutation.error.message
                : t("login.loginFailed")}
            </p>
          )}

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm shadow-sm"
          >
            {loginMutation.isPending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {t("login.signIn")}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">
            {t("login.or")}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Quick-fill SuperAdmin */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-3">
            {t("login.demoCredentials")}
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            onClick={fillSuperAdmin}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {t("login.useSuperAdmin")}
          </button>
        </div>
      </div>

      {/* Bottom link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        {t("login.noAccount")}&nbsp;
        <Link
          to="/register"
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          {t("login.registerViaInvite")}
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
