import {
  ArrowLeft,
  Bell,
  Salad,
  LogIn,
  Mail,
  Link2Off,
  Clock,
  Users,
  Ban,
  Utensils,
  Circle,
  Sparkles,
  User,
  House,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function InviteInvalidPage() {
  const { t } = useTranslation();
  return (
    <>
      {/* MOBILE TOP HEADER */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-background/95 backdrop-blur-md border-b border-border h-14 flex items-center px-4 gap-3">
        <button
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors -ml-2"
          aria-label={t("system.goBack")}
          title={t("system.goBack")}
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-base font-semibold flex-1 text-center truncate">
          FitCheck
        </h1>
        <button
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors -mr-2"
          aria-label={t("system.notifications")}
          title={t("system.notifications")}
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      {/* DESKTOP TOP NAVIGATION */}
      <header className="hidden md:block sticky top-0 z-30 w-full bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-foreground no-underline"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Salad className="w-5 h-5 text-primary-foreground" />
              </div>
              FitCheck
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-2 text-sm rounded-md bg-secondary text-secondary-foreground font-medium transition-colors"
              >
                {t("system.home")}
              </Link>
              <Link
                to="/welcome"
                className="px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
              >
                About
              </Link>
              <Link
                to="/welcome"
                className="px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
              >
                Privacy
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              {t("system.signIn")}
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
            >
              <Mail className="w-4 h-4" />
              {t("system.requestInvite")}
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 mt-14 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-24 md:pb-10">
          <main className="mx-auto w-full max-w-lg px-4 py-16 sm:py-24 lg:py-32">
            <div className="flex flex-col items-center text-center">
              {/* Decorative icon */}
              <div className="mb-8 flex size-20 items-center justify-center rounded-full bg-muted">
                <Link2Off
                  className="size-10 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {t("inviteInvalid.title")}
              </h1>

              <p className="mt-3 text-sm text-muted-foreground max-w-prose">
                {t("inviteInvalid.message")}
              </p>

              {/* Status illustration cards */}
              <div className="mt-10 grid w-full gap-3 sm:grid-cols-3">
                <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4">
                  <Clock className="size-5 text-chart-4" aria-hidden="true" />
                  <span className="text-xs font-medium text-foreground">
                    {t("inviteInvalid.expired")}
                  </span>
                  <span className="text-[11px] text-muted-foreground text-center">
                    {t("inviteInvalid.expiredDesc")}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4">
                  <Users
                    className="size-5 text-destructive"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium text-foreground">
                    {t("inviteInvalid.exhausted")}
                  </span>
                  <span className="text-[11px] text-muted-foreground text-center">
                    {t("inviteInvalid.exhaustedDesc")}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4">
                  <Ban className="size-5 text-destructive" aria-hidden="true" />
                  <span className="text-xs font-medium text-foreground">
                    {t("inviteInvalid.revoked")}
                  </span>
                  <span className="text-[11px] text-muted-foreground text-center">
                    {t("inviteInvalid.revokedDesc")}
                  </span>
                </div>
              </div>

              {/* Action */}
              <p className="mt-8 text-sm text-muted-foreground">
                {t("inviteInvalid.mistakeMessage")}
              </p>
              <a
                href="mailto:hello@fitcheck.app"
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                <Mail className="size-4" aria-hidden="true" />
                {t("inviteInvalid.contactUs")}
              </a>

              <p className="mt-6 text-xs text-muted-foreground">
                <Link
                  to="/login"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  {t("inviteInvalid.returnToSignIn")}
                </Link>
                <span className="mx-2">·</span>
                <Link
                  to="/register"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  {t("inviteInvalid.tryAnotherCode")}
                </Link>
              </p>
            </div>
          </main>
        </div>
      </main>

      {/* DESKTOP FOOTER (hidden on mobile) */}
      <footer className="hidden md:block w-full bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <Salad className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">FitCheck</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Private, invite‑only nutrition tracking. Your data stays yours.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">
              Product
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/welcome"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About FitCheck
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">
              Account
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/register"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Register with Invite
                </Link>
              </li>
              <li>
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reset Password
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">
              Support
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/verify-email"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Verify Email
                </Link>
              </li>
              <li>
                <Link
                  to="/welcome"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>{t("system.copyright")}</p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="GitHub"
              className="hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM TAB BAR (native app style, hidden on desktop) */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border safe-bottom"
        style={{ height: "calc(56px + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex items-stretch h-14">
          <Link
            to="/"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-primary transition-colors"
          >
            <House className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t("system.home")}</span>
          </Link>
          <Link
            to="/meals"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Utensils className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t("system.meals")}</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Circle className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t("system.progress")}</span>
          </Link>
          <Link to="/ai-sessions" className="flex-1 flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors">
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t("system.ai")}</span>
          </Link>
          <Link
            to="/profile"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t("system.profile")}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
