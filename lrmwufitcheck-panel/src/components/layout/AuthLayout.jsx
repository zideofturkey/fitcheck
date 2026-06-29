import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Moon, Sun, AlertTriangle, RefreshCw } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";
import { getAuthUrl, getMcpBffUrl } from "../../services/apiClient";
import { cn } from "../../utils/cn";

export default function AuthLayout() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();

  // Health check state
  const [healthStatus, setHealthStatus] = useState({
    auth: null,
    mcpBff: null,
  });
  const [healthChecking, setHealthChecking] = useState(true);

  // Health check for auth and mcp-bff services
  const checkHealth = async () => {
    setHealthChecking(true);
    const status = { auth: false, mcpBff: false };

    // Check auth service
    try {
      const authUrl = getAuthUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${authUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      status.auth = response.ok;
    } catch (err) {
      status.auth = false;
    }

    // Check MCP-BFF service
    try {
      const mcpBffUrl = getMcpBffUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${mcpBffUrl}/api/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      status.mcpBff = response.ok;
    } catch (err) {
      status.mcpBff = false;
    }

    setHealthStatus(status);
    setHealthChecking(false);
  };

  useEffect(() => {
    checkHealth();
    // Re-check every 15 seconds
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const servicesDown = !healthStatus.auth || !healthStatus.mcpBff;

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Top bar with theme toggle */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-end">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-colors"
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              FitCheck
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back! Please sign in to continue.
            </p>
          </div>

          {/* Service status warning */}
          {!healthChecking && servicesDown && (
            <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Services Unavailable
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    The following services are not responding:
                  </p>
                  <ul className="text-sm text-amber-600 dark:text-amber-400 mt-2 space-y-1">
                    {!healthStatus.auth && <li>• Authentication Service</li>}
                    {!healthStatus.mcpBff && <li>• MCP-BFF Service</li>}
                  </ul>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    Please ensure the services are running.
                  </p>
                  <button
                    onClick={checkHealth}
                    className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200"
                  >
                    <RefreshCw
                      className={cn(
                        "w-3.5 h-3.5",
                        healthChecking && "animate-spin",
                      )}
                    />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="card p-8">
            <Outlet context={{ servicesDown, healthChecking }} />
          </div>
        </div>
      </div>
    </div>
  );
}
