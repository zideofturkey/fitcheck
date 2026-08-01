import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isRouteAvailable } from "@/lib/available-routes";
import { useAuth } from "@/context/AuthContext";
import OnboardingMacroTargetDialog from "@/components/OnboardingMacroTargetDialog";
import {
  ArrowLeftCircle,
  BarChart3,
  BookOpen,
  CirclePlus,
  ClipboardList,
  History,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  MailPlus,
  Menu,
  Salad,
  Shield,
  Sparkles,
  Tag,
  Target,
  UploadCloud,
  User,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";

const MOBILE_NAV = [
  { to: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { to: "/meals/log", icon: UtensilsCrossed, labelKey: "nav.log" },
  { to: "/food-library", icon: BookOpen, labelKey: "nav.library" },
  { to: "/meals", icon: History, labelKey: "nav.meals" },
  { to: "/profile", icon: User, labelKey: "nav.profile" },
];

const SIDEBAR_MAIN = [
  { to: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { to: "/meals/log", icon: CirclePlus, labelKey: "nav.logMeal" },
  { to: "/meals", icon: History, labelKey: "nav.mealHistory" },
  { to: "/food-library", icon: BookOpen, labelKey: "nav.foodLibrary" },
  { to: "/dishes", icon: UtensilsCrossed, labelKey: "nav.dishes" },
  { to: "/preset-meals", icon: ClipboardList, labelKey: "nav.presetMeals" },
];

const SIDEBAR_INSIGHTS = [
  { to: "/targets", icon: Target, labelKey: "nav.targets" },
  { to: "/analytics/weekly", icon: BarChart3, labelKey: "nav.analytics" },
  { to: "/ai-chat", icon: Sparkles, labelKey: "nav.aiChat", highlight: true },
];

const SIDEBAR_ADMIN = [
  { to: "/admin/invites", icon: MailPlus, labelKey: "nav.inviteLinks" },
  { to: "/admin/users", icon: Users, labelKey: "nav.userManagement" },
  { to: "/admin/suggestions", icon: Lightbulb, labelKey: "nav.suggestions" },
  { to: "/admin/bulk-import", icon: UploadCloud, labelKey: "nav.bulkImport" },
  { to: "/admin/brands", icon: Tag, labelKey: "nav.brandManagement" },
];

function initials(name?: string) {
  if (!name) return "U";
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    void logout().finally(() => navigate("/login", { replace: true }));
  };

  const SidebarLink = ({
    to,
    Icon,
    label,
    highlight,
  }: {
    to: string;
    Icon: React.ComponentType<{ className?: string }>;
    label: string;
    highlight?: boolean;
  }) => {
    if (!isRouteAvailable(to)) {
      return (
        <span
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground opacity-50 cursor-not-allowed text-sm"
          title={t("common.comingSoon")}
        >
          <Icon className="w-5 h-5" />
          {label}
        </span>
      );
    }
    if (highlight) {
      return (
        <Link
          to={to}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary bg-gradient-to-r from-primary/15 via-primary/10 to-transparent hover:from-primary/25 hover:via-primary/15 transition-colors shadow-[0_0_16px_-4px] shadow-primary/30"
        >
          <Icon className="w-5 h-5" />
          {label}
        </Link>
      );
    }
    return (
      <Link
        to={to}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
      >
        <Icon className="w-5 h-5" />
        {label}
      </Link>
    );
  };

  return (
    <>
      <OnboardingMacroTargetDialog />

      {/* ========== MOBILE NATIVE APP LAYOUT ========== */}
      <div className="md:hidden flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-card border-b border-border h-14 flex items-center justify-between px-4 safe-top">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="w-11 h-11 flex items-center justify-center -ml-2 rounded-full hover:bg-muted transition-colors"
            aria-label={t("nav.openMenu")}
            title={t("nav.openMenu")}
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Salad className="w-5 h-5 text-primary" />
            <h1 className="text-base font-semibold tracking-tight">
              {t("common.appName")}
            </h1>
          </Link>
          <Link
            to="/profile"
            className="w-11 h-11 flex items-center justify-center -mr-2 rounded-full hover:bg-muted transition-colors relative"
            aria-label={t("nav.profile")}
            title={t("nav.profile")}
          >
            <User className="w-5 h-5 text-foreground" />
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto native-scroll pb-24 safe-bottom">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border safe-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
            {MOBILE_NAV.map(({ to, icon: Icon, labelKey }) =>
              isRouteAvailable(to) ? (
                <Link
                  key={to}
                  to={to}
                  className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={t(labelKey)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium leading-none">
                    {t(labelKey)}
                  </span>
                </Link>
              ) : (
                <span
                  key={to}
                  className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] text-muted-foreground opacity-50 cursor-not-allowed"
                  title={t("common.comingSoon")}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium leading-none">
                    {t(labelKey)}
                  </span>
                </span>
              ),
            )}
          </div>
        </nav>
      </div>

      {/* ========== DESKTOP LAYOUT ========== */}
      <div className="hidden md:flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 font-semibold text-lg tracking-tight text-foreground"
                >
                  <Salad className="w-6 h-6 text-primary" />
                  <span>{t("common.appName")}</span>
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 pl-2 border-l border-border"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold leading-tight">
                      {user?.fullname ?? t("nav.profile")}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {user?.email ?? ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold overflow-hidden">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.fullname ?? t("nav.profile")}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials(user?.fullname)
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label={t("nav.signOut")}
                  title={t("nav.signOut")}
                >
                  <LogOut className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="hidden lg:flex lg:flex-col w-64 border-r border-border bg-card overflow-y-auto">
            <nav className="flex-1 px-3 py-6 space-y-1">
              <p className="px-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("nav.sectionMain")}
              </p>
              {SIDEBAR_MAIN.map((item) => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  Icon={item.icon}
                  label={t(item.labelKey)}
                />
              ))}
              <p className="px-3 mt-8 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("nav.sectionInsights")}
              </p>
              {SIDEBAR_INSIGHTS.map((item) => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  Icon={item.icon}
                  label={t(item.labelKey)}
                  highlight={item.highlight}
                />
              ))}
              {(user?.roleId === "superAdmin" || user?.roleId === "admin") &&
                SIDEBAR_ADMIN.length > 0 && (
                  <>
                    <p className="px-3 mt-8 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> {t("nav.sectionAdmin")}
                    </p>
                    {SIDEBAR_ADMIN.map((item) => (
                      <SidebarLink
                        key={item.to}
                        to={item.to}
                        Icon={item.icon}
                        label={t(item.labelKey)}
                      />
                    ))}
                  </>
                )}
            </nav>
          </aside>

          <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-10">
            <div className="max-w-5xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>

        <footer className="hidden md:block bg-card border-t border-border mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <Salad className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">
                    {t("common.appName")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  {t("footer.tagline")}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3 text-foreground">
                  {t("footer.product")}
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      to="/dashboard"
                      className="hover:text-foreground transition-colors"
                    >
                      {t("nav.dashboard")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/meals/log"
                      className="hover:text-foreground transition-colors"
                    >
                      {t("nav.logMeal")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/food-library"
                      className="hover:text-foreground transition-colors"
                    >
                      {t("nav.foodLibrary")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/ai-chat"
                      className="hover:text-foreground transition-colors"
                    >
                      {t("nav.aiChat")}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3 text-foreground">
                  {t("footer.support")}
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      to="/profile"
                      className="hover:text-foreground transition-colors"
                    >
                      {t("footer.profileTargets")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/analytics/weekly"
                      className="hover:text-foreground transition-colors"
                    >
                      {t("nav.analytics")}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                {t("footer.copyright")}
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 bg-card border-r border-border shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Salad className="w-5 h-5 text-primary" />
                <span className="font-semibold">{t("common.appName")}</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                aria-label={t("nav.closeMenu")}
                title={t("nav.closeMenu")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("nav.sectionMain")}
              </p>
              {SIDEBAR_MAIN.map((item) => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  Icon={item.icon}
                  label={t(item.labelKey)}
                />
              ))}
              <p className="px-3 mt-6 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("nav.sectionInsights")}
              </p>
              {SIDEBAR_INSIGHTS.map((item) => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  Icon={item.icon}
                  label={t(item.labelKey)}
                  highlight={item.highlight}
                />
              ))}
              {(user?.roleId === "superAdmin" || user?.roleId === "admin") &&
                SIDEBAR_ADMIN.length > 0 && (
                  <>
                    <p className="px-3 mt-8 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> {t("nav.sectionAdmin")}
                    </p>
                    {SIDEBAR_ADMIN.map((item) => (
                      <SidebarLink
                        key={item.to}
                        to={item.to}
                        Icon={item.icon}
                        label={t(item.labelKey)}
                      />
                    ))}
                  </>
                )}
            </nav>
            <div className="p-4 border-t border-border space-y-2">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <User className="w-5 h-5" />
                {t("nav.profile")}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
              >
                <ArrowLeftCircle className="w-5 h-5" />
                {t("nav.signOut")}
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
