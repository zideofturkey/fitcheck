import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  LogIn,
  LogOut,
  Salad,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function MinimalLayout() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* MOBILE TOP HEADER */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-background/95 backdrop-blur-md border-b border-border h-14 flex items-center px-4 gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors -ml-2"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <Link to="/dashboard" className="flex-1 text-center">
          <h1 className="text-base font-semibold truncate">FitCheck</h1>
        </Link>
        <Link
          to="/profile"
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors -mr-2"
          aria-label="Profile"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
        </Link>
      </header>

      {/* DESKTOP TOP NAVIGATION */}
      <header className="hidden md:block sticky top-0 z-30 w-full bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-foreground no-underline"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Salad className="w-5 h-5 text-primary-foreground" />
              </div>
              FitCheck
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                to="/dashboard"
                className="px-3 py-2 text-sm rounded-md bg-secondary text-secondary-foreground font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/meals"
                className="px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
              >
                Meals
              </Link>
              <Link
                to="/ai-sessions"
                className="px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
              >
                AI Chat
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                {user?.fullname ?? "Account"}
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 mt-14 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-24 md:pb-10">
          <Outlet />
        </div>
      </main>

      {/* DESKTOP FOOTER (hidden on mobile) */}
      <footer className="hidden md:block w-full bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-10">
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
                  to="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/meals"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Meal History
                </Link>
              </li>
              <li>
                <Link
                  to="/ai-sessions"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  AI Assistant
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
                  to="/profile"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Profile
                </Link>
              </li>
              {isAuthenticated ? (
                <li>
                  <Link
                    to="/logout"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </Link>
                </li>
              ) : (
                <li>
                  <Link
                    to="/login"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">
              Insights
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/analytics/weekly"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Weekly Analytics
                </Link>
              </li>
              <li>
                <Link
                  to="/analytics/monthly"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Monthly Analytics
                </Link>
              </li>
              <li>
                <Link
                  to="/food-library"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Food Library
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 FitCheck. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              to="/welcome"
              className="hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              to="/login"
              className="hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM TAB BAR */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border safe-bottom"
        style={{ height: "calc(56px + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex items-stretch h-14">
          <Link
            to="/dashboard"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-primary transition-colors"
          >
            <Salad className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link
            to="/meals"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogIn className="w-5 h-5 rotate-45" />
            <span className="text-[10px] font-medium">Meals</span>
          </Link>
          <Link
            to="/ai-sessions"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="text-[10px] font-medium">AI</span>
          </Link>
          <Link
            to="/profile"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
