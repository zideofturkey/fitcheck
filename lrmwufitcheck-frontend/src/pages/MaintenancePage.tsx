import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  Clock,
  RefreshCw,
  Circle,
  Salad,
  Mail,
  LogIn,
  ArrowLeft,
  Bell,
  House,
  Utensils,
  Sparkles,
  User,
} from "lucide-react";

export default function MaintenancePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      {/* TOP NAVIGATION (single header, responsive) */}
      <header className="fixed md:sticky top-0 inset-x-0 z-30 w-full bg-background/95 md:bg-background/90 backdrop-blur-md md:backdrop-blur-lg border-b border-border">
        <div className="h-14 md:h-16 flex items-center px-4 gap-3 md:max-w-7xl md:mx-auto md:px-6 md:justify-between">
          <div className="flex items-center gap-8">
            <button
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors -ml-2"
              aria-label={t("system.goBack")}
              title={t("system.goBack")}
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <Link
              to="/"
              className="hidden md:flex items-center gap-2.5 font-bold text-xl tracking-tight text-foreground no-underline"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Salad className="w-5 h-5 text-primary-foreground" />
              </div>
              FitCheck
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-2 text-sm rounded-md bg-secondary text-secondary-foreground font-medium transition-colors"
              >
                {t("system.home")}
              </Link>
              <a
                href="/features"
                className="px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="/privacy"
                className="px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
              >
                Privacy
              </a>
            </nav>
          </div>

          <h1 className="md:hidden text-base font-semibold flex-1 text-center truncate">
            FitCheck
          </h1>

          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors -mr-2"
              aria-label={t("system.notifications")}
              title={t("system.notifications")}
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="hidden md:flex items-center gap-3">
              <Button
                asChild
                variant="default"
                size="sm"
                className="gap-2 shadow-sm"
              >
                <Link to="/login">
                  <LogIn className="w-4 h-4" />
                  {t("system.signIn")}
                </Link>
              </Button>
              <Button variant="secondary" asChild size="sm" className="gap-2">
                <Link to="/register">
                  <Mail className="w-4 h-4" />
                  {t("system.requestInvite")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 mt-14 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-24 md:pb-10">
          <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="relative text-center max-w-lg">
              {/* Decorative background element */}
              <div
                className="absolute inset-0 -z-10 flex items-center justify-center"
                aria-hidden="true"
              >
                <div className="w-72 h-72 rounded-full bg-accent/10 blur-3xl"></div>
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary/5 blur-3xl"></div>
              </div>

              {/* Icon */}
              <div className="relative mx-auto mb-6">
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mx-auto">
                  <Wrench
                    className="w-10 h-10 text-secondary-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent border-2 border-background flex items-center justify-center">
                  <Clock
                    className="w-3 h-3 text-accent-foreground"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {t("maintenance.title")}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  {t("maintenance.message")}
                </p>

                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted text-sm text-muted-foreground font-medium">
                  <Clock className="w-4 h-4" />
                  {t("maintenance.estimatedDowntime")}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 h-11 px-6"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t("maintenance.checkStatus")}
                  </Button>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 h-11 px-6 text-sm font-semibold rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Circle className="w-4 h-4" />
                    {t("maintenance.followUpdates")}
                  </a>
                </div>

                <p className="text-xs text-muted-foreground pt-1">
                  {t("maintenance.questionsMessage")}{" "}
                  <a
                    href="mailto:support@fitcheck.app"
                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    support@fitcheck.app
                  </a>
                </p>
              </div>
            </div>
          </div>
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
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>{t("system.copyright")}</p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="Circle"
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
        style={{
          height: "calc(56px + env(safe-area-inset-bottom, 0px))",
        }}
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
          <Link
            to="/ai-sessions"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
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
