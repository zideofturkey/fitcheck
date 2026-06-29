import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";

// Layout
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";

// Pages
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyPage from "./pages/VerifyPage";
import TwoFactorPage from "./pages/TwoFactorPage";
import PaymentPage from "./pages/PaymentPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentResultPage from "./pages/PaymentResultPage";
import ElasticSearchPage from "./pages/ElasticSearchPage";
import LogsPage from "./pages/LogsPage";
import McpLogsPage from "./pages/McpLogsPage";
import ServicePage from "./pages/ServicePage";
import AdminPage from "./pages/AdminPage";
import DatabaseAdminPage from "./pages/DatabaseAdminPage";
import NotFoundPage from "./pages/NotFoundPage";

// Protected Route Component
function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Admin Route Component
function AdminRoute({ children }) {
  const location = useLocation();
  const { user } = useAuthStore();
  const roleId = Array.isArray(user?.roleId) ? user.roleId[0] : user?.roleId;

  if (
    !user ||
    ![
      "superAdmin",
      "admin",
      "saasAdmin",
      "tenantOwner",
      "tenantAdmin",
    ].includes(roleId)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function TenantManagerRoute({ children }) {
  const location = useLocation();
  const { user } = useAuthStore();
  const roleId = Array.isArray(user?.roleId) ? user.roleId[0] : user?.roleId;
  if (
    !user ||
    ![
      "tenantOwner",
      "tenantAdmin",
      "superAdmin",
      "saasAdmin",
      "admin",
    ].includes(roleId)
  ) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function LogsRoute({ children }) {
  const location = useLocation();
  const { user } = useAuthStore();
  const roleId = Array.isArray(user?.roleId) ? user.roleId[0] : user?.roleId;
  if (!user || !["superAdmin", "saasAdmin", "admin"].includes(roleId)) {
    return <Navigate to="/chat" replace />;
  }
  return children;
}

function App() {
  const location = useLocation();
  const { isInitialized, isAuthenticated, checkSession, setLoading } =
    useAuthStore();

  // Check session on app mount
  useEffect(() => {
    const initAuth = async () => {
      // If we have stored auth data (from persist), verify it's still valid
      const storedToken = useAuthStore.getState().accessToken;

      if (storedToken) {
        // Try to validate the session with the server
        await checkSession();
      } else {
        // No stored token, mark as not loading and initialized
        useAuthStore.setState({ isLoading: false, isInitialized: true });
      }
    };

    initAuth();
  }, []);

  // Show loading spinner while checking initial auth session
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/verify/:type" element={<VerifyPage />} />
        <Route path="/verify-email" element={<VerifyPage />} />
        <Route path="/verify-mobile" element={<VerifyPage />} />
        <Route path="/2fa" element={<TwoFactorPage />} />
      </Route>

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<ChatPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/elastic-search"
          element={
            <LogsRoute>
              <ElasticSearchPage />
            </LogsRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <LogsRoute>
              <LogsPage />
            </LogsRoute>
          }
        />
        <Route
          path="/mcp-logs"
          element={
            <LogsRoute>
              <McpLogsPage />
            </LogsRoute>
          }
        />
        <Route path="/service/:serviceName" element={<ServicePage />} />
        <Route path="/payment" element={<PaymentPage />} />
        {/* Checkout route: /checkout/:orderType/:orderId?service=serviceName */}
        <Route
          path="/checkout/:orderType/:orderId"
          element={<CheckoutPage />}
        />
        {/* Payment result route */}
        <Route path="/payment/result" element={<PaymentResultPage />} />

        {/* Database Admin */}
        <Route
          path="/admin/database"
          element={
            <AdminRoute>
              <DatabaseAdminPage />
            </AdminRoute>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
