import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { isRouteAvailable } from "@/lib/available-routes";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  ArrowLeftCircle,
  BookOpen,
  Circle,
  History,
  LayoutDashboard,
  LogOut,
  MailPlus,
  Menu,
  MessageCircle,
  Salad,
  Shield,
  Sparkles,
  Target,
  User,
  UserCog,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";

const MOBILE_NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/meals/log", icon: UtensilsCrossed, label: "Log" },
  { to: "/food-library", icon: BookOpen, label: "Library" },
  { to: "/meals", icon: History, label: "Meals" },
  { to: "/profile", icon: User, label: "Profile" },
];

const SIDEBAR_MAIN = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/meals/log", icon: UtensilsCrossed, label: "Log Meal" },
  { to: "/meals", icon: History, label: "Meal History" },
  { to: "/food-library", icon: BookOpen, label: "Food Library" },
  { to: "/preset-meals", icon: Circle, label: "Preset Meals" },
];

const SIDEBAR_INSIGHTS = [
  { to: "/profile", icon: Target, label: "Targets" },
  { to: "/analytics/weekly", icon: Circle, label: "Weekly Analytics" },
  { to: "/analytics/monthly", icon: Circle, label: "Monthly Analytics" },
  { to: "/ai-sessions", icon: MessageCircle, label: "AI Chat" },
];

const SIDEBAR_ADMIN = [
  { to: "/admin/invites", icon: MailPlus, label: "Invite Links" },
  { to: "/admin/users", icon: Users, label: "User Management" },
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    void logout().finally(() => navigate("/login", { replace: true }));
  };

  const SidebarLink = ({
    to,
    Icon,
    label,
  }: {
    to: string;
    Icon: React.ComponentType<{ className?: string }>;
    label: string;
  }) => {
    if (!isRouteAvailable(to)) {
      return (
        <span
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground opacity-50 cursor-not-allowed text-sm"
          title="Coming soon"
        >
          <Icon className="w-5 h-5" />
          {label}
        </span>
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
      {/* ========== MOBILE NATIVE APP LAYOUT ========== */}
      <div className="md:hidden flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-card border-b border-border h-14 flex items-center justify-between px-4 safe-top">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="w-11 h-11 flex items-center justify-center -ml-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Salad className="w-5 h-5 text-primary" />
            <h1 className="text-base font-semibold tracking-tight">FitCheck</h1>
          </Link>
          <Link
            to="/profile"
            className="w-11 h-11 flex items-center justify-center -mr-2 rounded-full hover:bg-muted transition-colors relative"
            aria-label="Profile"
          >
            <User className="w-5 h-5 text-foreground" />
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto native-scroll pb-24 safe-bottom">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border safe-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
            {MOBILE_NAV.map(({ to, icon: Icon, label }) =>
              isRouteAvailable(to) ? (
                <Link
                  key={to}
                  to={to}
                  className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium leading-none">
                    {label}
                  </span>
                </Link>
              ) : (
                <span
                  key={to}
                  className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] text-muted-foreground opacity-50 cursor-not-allowed"
                  title="Coming soon"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium leading-none">
                    {label}
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
                  <span>FitCheck</span>
                </Link>
                <nav className="hidden lg:flex items-center gap-1">
                  <Link
                    to="/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium bg-muted text-foreground"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/meals/log"
                    className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    Log Meal
                  </Link>
                  <Link
                    to="/food-library"
                    className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    Food Library
                  </Link>
                  <Link
                    to="/preset-meals"
                    className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    Presets
                  </Link>
                  <Link
                    to="/meals"
                    className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    History
                  </Link>
                  <Link
                    to="/analytics/weekly"
                    className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    Analytics
                  </Link>
                  <Link
                    to="/ai-sessions"
                    className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    AI Chat
                  </Link>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 pl-2 border-l border-border"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold leading-tight">
                      {user?.fullname ?? "User"}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {user?.email ?? ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                      {initials(user?.fullname)}
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label="Logout"
                  title="Sign out"
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
                Main
              </p>
              {SIDEBAR_MAIN.map((item) => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  Icon={item.icon}
                  label={item.label}
                />
              ))}
              <p className="px-3 mt-8 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Insights
              </p>
              {SIDEBAR_INSIGHTS.map((item) => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  Icon={item.icon}
                  label={item.label}
                />
              ))}
              {(user?.roleId === "superAdmin" || user?.roleId === "admin") &&
                SIDEBAR_ADMIN.length > 0 && (
                  <>
                    <p className="px-3 mt-8 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Admin
                    </p>
                    {SIDEBAR_ADMIN.map((item) => (
                      <SidebarLink
                        key={item.to}
                        to={item.to}
                        Icon={item.icon}
                        label={item.label}
                      />
                    ))}
                  </>
                )}
            </nav>
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold text-sm">
                  {initials(user?.fullname)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user?.fullname ?? "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email ?? ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
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
                    FitCheck
                  </span>
                </div>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  Your private, invite‑only nutrition tracker. Log meals, track
                  macros, and get AI‑powered guidance.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3 text-foreground">
                  Product
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      to="/dashboard"
                      className="hover:text-foreground transition-colors"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/meals/log"
                      className="hover:text-foreground transition-colors"
                    >
                      Log Meal
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/food-library"
                      className="hover:text-foreground transition-colors"
                    >
                      Food Library
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/ai-sessions"
                      className="hover:text-foreground transition-colors"
                    >
                      AI Chat
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3 text-foreground">
                  Support
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      to="/profile"
                      className="hover:text-foreground transition-colors"
                    >
                      Profile &amp; Targets
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/analytics/weekly"
                      className="hover:text-foreground transition-colors"
                    >
                      Analytics
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                &copy; 2025 FitCheck. All rights reserved.
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
                <span className="font-semibold">FitCheck</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Main
              </p>
              {SIDEBAR_MAIN.map((item) => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  Icon={item.icon}
                  label={item.label}
                />
              ))}
              <p className="px-3 mt-6 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Insights
              </p>
              {SIDEBAR_INSIGHTS.map((item) => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  Icon={item.icon}
                  label={item.label}
                />
              ))}
              {(user?.roleId === "superAdmin" || user?.roleId === "admin") &&
                SIDEBAR_ADMIN.length > 0 && (
                  <>
                    <p className="px-3 mt-8 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Admin
                    </p>
                    {SIDEBAR_ADMIN.map((item) => (
                      <SidebarLink
                        key={item.to}
                        to={item.to}
                        Icon={item.icon}
                        label={item.label}
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
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
              >
                <ArrowLeftCircle className="w-5 h-5" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
