import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isInitialized, user } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin) {
    const adminRoles = ["superAdmin", "admin", "saasAdmin"];
    if (!user || !adminRoles.includes(user.roleId)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
