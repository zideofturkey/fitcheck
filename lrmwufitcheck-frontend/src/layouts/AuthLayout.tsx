import { Link, Outlet, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    void logout().finally(() => navigate("/login", { replace: true }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ========== DESKTOP TOP NAVIGATION ========== */}
      <header className="hidden md:block bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/welcome"
              className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-foreground no-underline"
            >
              <span className="bg-primary text-primary-foreground w-9 h-9 rounded-md flex items-center justify-center text-sm font-extrabold">
                FC
              </span>
              <span>FitCheck</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm font-medium">
              <Link
                to="/welcome"
                className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {t("authLayout.about")}
              </Link>
              <Link
                to="/login"
                className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {t("system.signIn")}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {isLoading ? null : isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                <Icons.LogOut className="w-4 h-4" />
                {t("authLayout.signOut", {
                  name: user?.fullname ?? t("authLayout.user"),
                })}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Icons.LogIn className="w-4 h-4" />
                  {t("system.signIn")}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  <Icons.MailPlus className="w-4 h-4" />
                  {t("authLayout.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========== MOBILE TOP APP BAR ========== */}
      <header className="md:hidden bg-card border-b border-border sticky top-0 z-40 h-14 flex items-center px-4">
        <button
          type="button"
          aria-label={t("system.goBack")}
          title={t("system.goBack")}
          onClick={() => window.history.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors -ml-1"
        >
          <Icons.ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="flex-1 text-center font-semibold text-base truncate px-2">
          FitCheck
        </h1>
        <Link
          to="/welcome"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label={t("authLayout.home")}
          title={t("authLayout.home")}
        >
          <Icons.Home className="w-5 h-5 text-muted-foreground" />
        </Link>
      </header>

      {/* ========== MAIN CONTENT AREA ========== */}
      <main className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-12">
        <Outlet />
      </main>

      {/* ========== DESKTOP FOOTER ========== */}
      <footer className="hidden md:block bg-card border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 font-bold text-base mb-3">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-md flex items-center justify-center text-xs font-extrabold">
                FC
              </span>
              FitCheck
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {t("authLayout.tagline")}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">
              {t("authLayout.account")}
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  to="/login"
                  className="hover:text-foreground transition-colors"
                >
                  {t("system.signIn")}
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-foreground transition-colors"
                >
                  {t("authLayout.register")}
                </Link>
              </li>
              <li>
                <Link
                  to="/forgot-password"
                  className="hover:text-foreground transition-colors"
                >
                  {t("authLayout.resetPassword")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">
              {t("authLayout.help")}
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  to="/verify-email"
                  className="hover:text-foreground transition-colors"
                >
                  {t("authLayout.verifyEmail")}
                </Link>
              </li>
              <li>
                <Link
                  to="/welcome"
                  className="hover:text-foreground transition-colors"
                >
                  {t("authLayout.aboutFitCheck")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>{t("system.copyright")}</p>
        </div>
      </footer>

      {/* ========== MOBILE BOTTOM TAB BAR ========== */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-50"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 4px)" }}
      >
        <div className="flex items-stretch h-16">
          <Link
            to="/welcome"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-primary transition-colors min-h-[44px]"
          >
            <Icons.Home className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-tight">
              {t("system.home")}
            </span>
          </Link>
          <Link
            to="/login"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
          >
            <Icons.LogIn className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">
              {t("system.signIn")}
            </span>
          </Link>
          <Link
            to="/register"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
          >
            <Icons.MailPlus className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">
              {t("authLayout.register")}
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
