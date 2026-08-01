import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { Loader } from "lucide-react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import {
  ProtectedRoute,
  RoleProtectedRoute,
  RootRedirect,
} from "@/components/ProtectedRoute";

import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import MinimalLayout from "@/layouts/MinimalLayout";

// Auth (anonymous)
const RegisterWithInvitePage = lazy(
  () => import("@/pages/RegisterWithInvitePage"),
);
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const EmailVerificationPage = lazy(
  () => import("@/pages/EmailVerificationPage"),
);
const PasswordResetRequestPage = lazy(
  () => import("@/pages/PasswordResetRequestPage"),
);
const PasswordResetCompletePage = lazy(
  () => import("@/pages/PasswordResetCompletePage"),
);
const TwoFactorAuthenticationPage = lazy(
  () => import("@/pages/TwoFactorAuthenticationPage"),
);

// Main (authenticated user)
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const FoodLibraryPage = lazy(() => import("@/pages/FoodLibraryPage"));
const FoodItemDetailPage = lazy(() => import("@/pages/FoodItemDetailPage"));
const PresetMealsPage = lazy(() => import("@/pages/PresetMealsPage"));
const PresetMealDetailPage = lazy(() => import("@/pages/PresetMealDetailPage"));
const DishesPage = lazy(() => import("@/pages/DishesPage"));
const DishDetailPage = lazy(() => import("@/pages/DishDetailPage"));
const MealHistoryPage = lazy(() => import("@/pages/MealHistoryPage"));
const MealDetailPage = lazy(() => import("@/pages/MealDetailPage"));
const LogMealPage = lazy(() => import("@/pages/LogMealPage"));
const EditMealPage = lazy(() => import("@/pages/EditMealPage"));
const WeeklyAnalyticsPage = lazy(() => import("@/pages/WeeklyAnalyticsPage"));
const MonthlyAnalyticsPage = lazy(() => import("@/pages/MonthlyAnalyticsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const TargetsPage = lazy(() => import("@/pages/TargetsPage"));
const AiSessionHistoryPage = lazy(() => import("@/pages/AiSessionHistoryPage"));
const AiChatPage = lazy(() => import("@/pages/AiChatPage"));
const AiSessionDetailPage = lazy(() => import("@/pages/AiSessionDetailPage"));
const AiCandidateMealConfirmationPage = lazy(
  () => import("@/pages/AiCandidateMealConfirmationPage"),
);
const AiGuidanceNoteDetailPage = lazy(
  () => import("@/pages/AiGuidanceNoteDetailPage"),
);

// Admin (role-gated)
const AdminInviteListPage = lazy(() => import("@/pages/AdminInviteListPage"));
const AdminInviteDetailPage = lazy(
  () => import("@/pages/AdminInviteDetailPage"),
);
const AdminCreateInvitePage = lazy(
  () => import("@/pages/AdminCreateInvitePage"),
);
const AdminUserListPage = lazy(() => import("@/pages/AdminUserListPage"));
const AdminUserDetailPage = lazy(() => import("@/pages/AdminUserDetailPage"));
const AdminUserLibraryPage = lazy(
  () => import("@/pages/AdminUserLibraryPage"),
);
const AdminCreateUserPage = lazy(() => import("@/pages/AdminCreateUserPage"));
const AdminSuggestionsPage = lazy(
  () => import("@/pages/AdminSuggestionsPage"),
);
const AdminBulkImportPage = lazy(
  () => import("@/pages/AdminBulkImportPage"),
);
const AdminLibraryPage = lazy(() => import("@/pages/AdminLibraryPage"));

// Public / system
const WelcomePage = lazy(() => import("@/pages/WelcomePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const ServerErrorPage = lazy(() => import("@/pages/ServerErrorPage"));
const MaintenancePage = lazy(() => import("@/pages/MaintenancePage"));
const InviteInvalidPage = lazy(() => import("@/pages/InviteInvalidPage"));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function LogoutBridge() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  // Fire logout then redirect. Render the fallback while we work.
  void logout().finally(() => navigate("/login", { replace: true }));
  return <PageFallback />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Root redirect (auth-aware) */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public marketing — no layout, no protection */}
            <Route path="/welcome" element={<WelcomePage />} />

            {/* Auth flow — AuthLayout, anonymous */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterWithInvitePage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route
                path="/forgot-password"
                element={<PasswordResetRequestPage />}
              />
              <Route
                path="/reset-password"
                element={<PasswordResetCompletePage />}
              />
              <Route path="/2fa" element={<TwoFactorAuthenticationPage />} />
            </Route>

            {/* Minimal layout — protected (invite-invalid is post-login) */}
            <Route
              element={
                <ProtectedRoute>
                  <MinimalLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/invite-invalid" element={<InviteInvalidPage />} />
            </Route>

            {/* Main app — MainLayout + ProtectedRoute */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/food-library" element={<FoodLibraryPage />} />
              <Route
                path="/food-library/:foodItemId"
                element={<FoodItemDetailPage />}
              />
              <Route path="/preset-meals" element={<PresetMealsPage />} />
              <Route
                path="/preset-meals/:presetMealId"
                element={<PresetMealDetailPage />}
              />
              <Route path="/dishes" element={<DishesPage />} />
              <Route path="/dishes/:dishId" element={<DishDetailPage />} />
              <Route path="/meals" element={<MealHistoryPage />} />
              <Route path="/meals/log" element={<LogMealPage />} />
              <Route path="/meals/:id/edit" element={<EditMealPage />} />
              <Route path="/meals/:id" element={<MealDetailPage />} />
              <Route
                path="/analytics/weekly"
                element={<WeeklyAnalyticsPage />}
              />
              <Route
                path="/analytics/monthly"
                element={<MonthlyAnalyticsPage />}
              />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/targets" element={<TargetsPage />} />
              <Route path="/ai-chat" element={<AiChatPage />} />
              <Route path="/ai-sessions" element={<AiSessionHistoryPage />} />
              <Route
                path="/ai-sessions/:id"
                element={<AiSessionDetailPage />}
              />
              <Route
                path="/ai-candidate-meals/:id/confirm"
                element={<AiCandidateMealConfirmationPage />}
              />
              <Route
                path="/ai-guidance-notes/:id"
                element={<AiGuidanceNoteDetailPage />}
              />

              {/* Admin — superAdmin only (invites) */}
              <Route
                path="/admin/invites"
                element={
                  <RoleProtectedRoute roles={["superAdmin"]}>
                    <AdminInviteListPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/invites/create"
                element={
                  <RoleProtectedRoute roles={["superAdmin"]}>
                    <AdminCreateInvitePage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/invites/:inviteLinkId"
                element={
                  <RoleProtectedRoute roles={["superAdmin"]}>
                    <AdminInviteDetailPage />
                  </RoleProtectedRoute>
                }
              />

              {/* Admin — superAdmin + admin (user management) */}
              <Route
                path="/admin/users"
                element={
                  <RoleProtectedRoute roles={["superAdmin", "admin"]}>
                    <AdminUserListPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/users/create"
                element={
                  <RoleProtectedRoute roles={["superAdmin", "admin"]}>
                    <AdminCreateUserPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/users/:userId"
                element={
                  <RoleProtectedRoute roles={["superAdmin", "admin"]}>
                    <AdminUserDetailPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/users/:userId/library"
                element={
                  <RoleProtectedRoute roles={["superAdmin", "admin"]}>
                    <AdminUserLibraryPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/suggestions"
                element={
                  <RoleProtectedRoute roles={["superAdmin", "admin"]}>
                    <AdminSuggestionsPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/bulk-import"
                element={
                  <RoleProtectedRoute roles={["superAdmin", "admin"]}>
                    <AdminBulkImportPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/library"
                element={
                  <RoleProtectedRoute roles={["superAdmin", "admin"]}>
                    <AdminLibraryPage />
                  </RoleProtectedRoute>
                }
              />
              {/* Old name, kept as a redirect so existing bookmarks/links still work */}
              <Route
                path="/admin/brands"
                element={<Navigate to="/admin/library" replace />}
              />
            </Route>

            {/* Logout bridge */}
            <Route path="/logout" element={<LogoutBridge />} />

            {/* System — no layout, no protection */}
            <Route path="/500" element={<ServerErrorPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
