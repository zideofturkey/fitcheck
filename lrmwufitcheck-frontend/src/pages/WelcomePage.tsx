import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Bell,
  Salad,
  LogIn,
  Mail,
  Sparkles,
  Layers,
  Target,
  Circle,
  ShieldCheck,
  House,
  Utensils,
  User,
} from "lucide-react";

// Self-registration via invite isn't live yet — the entry points stay in the
// code (and the invite-validation flow underneath keeps working) so this can
// be flipped back on later without rebuilding anything.
const INVITE_SELF_SERVICE_ENABLED = false;

const DEMO_CALORIE_TARGET = 2200;
const DEMO_CALORIE_CONSUMED = 1847;
const DEMO_MACROS = [
  { key: "protein", label: "Protein", consumed: 118, target: 140, color: "bg-primary", glow: "#059669" },
  { key: "carbs", label: "Karbonhidrat", consumed: 187, target: 260, color: "bg-blue-500", glow: "#3b82f6" },
  { key: "fat", label: "Yağ", consumed: 54, target: 70, color: "bg-amber-500", glow: "#f59e0b" },
];
const DEMO_PARTICLE_COUNT = 10;
const DEMO_PARTICLES = Array.from({ length: DEMO_PARTICLE_COUNT }, (_, i) => {
  const angle = (i / DEMO_PARTICLE_COUNT) * Math.PI * 2;
  return {
    top: `${50 + Math.sin(angle) * 44}%`,
    left: `${50 + Math.cos(angle) * 44}%`,
    dx: Math.cos(angle) * 26,
    dy: Math.sin(angle) * 26,
  };
});

export default function WelcomePage() {
  const { t } = useTranslation();
  const caloriePct = Math.min(100, (DEMO_CALORIE_CONSUMED / DEMO_CALORIE_TARGET) * 100);
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference * (1 - caloriePct / 100);
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
            {INVITE_SELF_SERVICE_ENABLED && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
              >
                <Mail className="w-4 h-4" />
                {t("system.haveInvite")}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="relative flex-1 mt-14 md:mt-0">
        {/* Gradient background blobs — sized to the full-width <main>, not the
            max-w-7xl content column below, so the wash reaches both edges of
            the viewport instead of hard-cutting at the 1280px content edge. */}
        <div
          className="absolute inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_var(--muted)_1px,_transparent_1px)] bg-[size:28px_28px] opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-24 md:pb-10">
          <div className="relative">
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
                  to="/login"
                  className="inline-flex items-center gap-2 h-12 px-8 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  {t("system.signIn")}
                </Link>
              </div>

              {/* Hero visual — sample dashboard preview, same visual language as the real dashboard */}
              <div className="mt-16 md:mt-20 max-w-3xl mx-auto">
                <div className="bg-card border border-border rounded-2xl shadow-lg p-6 md:p-8 text-start">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div
                      className="calorie-ring-group relative w-40 h-40 shrink-0"
                      aria-hidden="true"
                    >
                      {DEMO_PARTICLES.map((p, i) => (
                        <span
                          key={i}
                          className="particle-dot absolute w-1.5 h-1.5 rounded-full bg-primary"
                          style={
                            {
                              top: p.top,
                              left: p.left,
                              "--particle-x": `${p.dx}px`,
                              "--particle-y": `${p.dy}px`,
                            } as CSSProperties
                          }
                        />
                      ))}
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <defs>
                          <linearGradient id="welcomeRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="var(--primary)" />
                          </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="8" />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="url(#welcomeRingGradient)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-foreground tracking-tight">
                          {DEMO_CALORIE_CONSUMED.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                          kcal
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 flex-1 w-full">
                      {DEMO_MACROS.map((m) => (
                        <div
                          key={m.key}
                          className="hover-lift-glow bg-muted/40 border border-border/60 rounded-xl p-3 text-center"
                          style={{ "--glow-color": m.glow } as CSSProperties}
                        >
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {m.label}
                          </p>
                          <p className="text-lg font-bold text-foreground mt-1 tracking-tight">
                            {m.consumed}g
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            / {m.target}g
                          </p>
                          <div className="mt-2 w-full h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${m.color} rounded-full`}
                              style={{ width: `${Math.min(100, (m.consumed / m.target) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 italic text-center">
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
            <section className="pb-20 md:pb-28">
              <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary/10 via-background to-accent/20 border border-border/50 rounded-3xl p-10 md:p-16 shadow-md">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4">
                  {t("welcome.closingTitle")}
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
                  {t("welcome.closingSubtitle")}
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 h-12 px-8 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  {t("system.signIn")}
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* DESKTOP FOOTER (hidden on mobile) */}
      <footer className="hidden md:block w-full bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <Salad className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">FitCheck</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("welcome.tagline")}
            </p>
          </div>
          <div className="md:text-end">
            <h4 className="font-semibold text-sm mb-4 text-foreground">
              {t("minimalLayout.account")}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("system.signIn")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border max-w-7xl mx-auto px-6 py-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <p>{t("system.copyright")}</p>
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
