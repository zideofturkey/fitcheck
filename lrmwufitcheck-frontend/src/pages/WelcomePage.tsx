import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Bell,
  Salad,
  LogIn,
  Mail,
  Sparkles,
  Flame,
  Layers,
  Target,
  Circle,
  ShieldCheck,
  House,
  Utensils,
  User,
} from "lucide-react";

export default function WelcomePage() {
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
                to="/features"
                className="px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
              >
                Features
              </Link>
              <Link
                to="/privacy"
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
              {t("system.haveInvite")}
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 mt-14 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-24 md:pb-10">
          <div className="relative overflow-hidden">
            {/* Gradient background blobs */}
            <div
              className="absolute inset-0 -z-10 overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent/20 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_var(--muted)_1px,_transparent_1px)] bg-[size:28px_28px] opacity-40" />
            </div>

            {/* HERO */}
            <section className="relative pt-16 md:pt-24 pb-20 md:pb-32 text-center">
              <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-semibold text-accent-foreground mb-5">
                {t("welcome.tagline")}
              </p>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.05]">
                {t("welcome.heroTitle1")}
                <br className="hidden md:block" /> {t("welcome.heroTitle2")}
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t("welcome.heroSubtitle")}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 h-12 px-8 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  {t("welcome.getStarted")}
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 h-12 px-8 text-sm font-semibold rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  {t("system.signIn")}
                </Link>
              </div>

              {/* Hero visual — asymmetric layout hint */}
              <div className="mt-16 md:mt-20 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="hidden md:block" />
                  <div className="bg-card border border-border rounded-2xl shadow-lg p-5 text-start relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-3xl" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <Flame className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {t("welcome.today")}
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-foreground tracking-tight">
                        1,847
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {t("welcome.consumedOf", { total: "2,200" })}
                      </p>
                      <div className="mt-3 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-[84%] bg-primary rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-2xl shadow-lg p-5 text-start">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {t("welcome.proteinLabel")}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1 tracking-tight">
                      118 g
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t("welcome.proteinOf", { target: 140 })}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 italic">
                  {t("welcome.dashboardPreview")}
                </p>
              </div>
            </section>

            {/* FEATURES GRID */}
            <section className="pb-20 md:pb-28">
              <div className="mx-auto max-w-5xl text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  {t("welcome.featuresTitle1")}
                  <br className="hidden sm:block" /> {t("welcome.featuresTitle2")}
                </h2>
                <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                  {t("welcome.featuresSubtitle")}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {/* Card 1 */}
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-4">
                    <Salad className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {t("welcome.feature1Title")}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("welcome.feature1Desc")}
                  </p>
                </div>
                {/* Card 2 */}
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-4">
                    <Layers className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {t("welcome.feature2Title")}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("welcome.feature2Desc")}
                  </p>
                </div>
                {/* Card 3 */}
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-4">
                    <Sparkles className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {t("welcome.feature3Title")}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("welcome.feature3Desc")}
                  </p>
                </div>
                {/* Card 4 */}
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-4">
                    <Target className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {t("welcome.feature4Title")}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("welcome.feature4Desc")}
                  </p>
                </div>
                {/* Card 5 */}
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-4">
                    <Circle className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {t("welcome.feature5Title")}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("welcome.feature5Desc")}
                  </p>
                </div>
                {/* Card 6 */}
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-4">
                    <ShieldCheck className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {t("welcome.feature6Title")}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("welcome.feature6Desc")}
                  </p>
                </div>
              </div>
            </section>

            {/* CLOSING CTA */}
            <section className="pb-20 md:pb-32">
              <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary/5 via-background to-accent/10 border border-border/50 rounded-3xl p-10 md:p-16 shadow-md">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4">
                  {t("welcome.closingTitle")}
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
                  {t("welcome.closingSubtitle")}
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 h-12 px-8 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  {t("welcome.getStarted")}
                </Link>
              </div>
            </section>

            {/* MINIMAL FOOTER */}
            <div className="border-t border-border pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>{t("system.copyright")}</p>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms
                </a>
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
          <p>&copy; 2025 FitCheck. All rights reserved.</p>
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
