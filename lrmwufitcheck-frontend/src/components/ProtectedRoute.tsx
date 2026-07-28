import { Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "lucide-react";

/**
 * Gate that requires an authenticated session. While the auth state is still
 * loading we render a small spinner so we don't flash a redirect to /login.
 * If unauthenticated, redirect to /login preserving the attempted location.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

/**
 * Role-gated wrapper. superAdmin always bypasses (per HARD CONSTRAINTS).
 * Other roles must be listed in `roles`.
 */
export function RoleProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.roleId === "superAdmin") {
    return <>{children}</>;
  }

  if (!user || !roles.includes(user.roleId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("common.forbidden")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("common.forbiddenMessage")}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Auth-aware root redirect. Authenticated users land on /dashboard, anonymous
 * users are sent to the public marketing page.
 */
export function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/welcome"} replace />;
}
