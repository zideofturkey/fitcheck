import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useUIStore } from "../../stores/uiStore";
import { useAuthStore } from "../../stores/authStore";
import { getAuthUrl, getMcpBffUrl } from "../../services/apiClient";
import { cn } from "../../utils/cn";

export default function MainLayout() {
  const navigate = useNavigate();
  const { sidebarOpen } = useUIStore();
  const { logout, user } = useAuthStore();
  const roleId = Array.isArray(user?.roleId) ? user.roleId[0] : user?.roleId;
  const isStandardUser = roleId === "user" || roleId === "tenantUser";
  const [coreServicesDown, setCoreServicesDown] = useState(false);

  // Check core services health (auth and mcp-bff)
  // Uses a failure counter to avoid logging out on transient network blips.
  // Only logs out after 3 consecutive failures (~90 seconds of downtime).
  useEffect(() => {
    let failCount = 0;
    const FAIL_THRESHOLD = 3;

    const checkCoreServices = async () => {
      let authOk = false;
      let mcpBffOk = false;

      // Check auth service
      try {
        const authUrl = getAuthUrl();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(`${authUrl}/health`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        authOk = response.ok;
      } catch (err) {
        authOk = false;
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
        mcpBffOk = response.ok;
      } catch (err) {
        mcpBffOk = false;
      }

      if (!authOk || !mcpBffOk) {
        failCount++;
        console.warn(
          `[MainLayout] health check failed (${failCount}/${FAIL_THRESHOLD}): auth=${authOk}, mcpBff=${mcpBffOk}`,
        );
        if (failCount >= FAIL_THRESHOLD) {
          setCoreServicesDown(true);
          await logout();
          navigate("/login");
        }
      } else {
        failCount = 0;
        setCoreServicesDown(false);
      }
    };

    // Skip the immediate check — let the user interact first.
    // Only start periodic checks after the initial delay.
    const interval = setInterval(checkCoreServices, 30000);
    return () => clearInterval(interval);
  }, [logout, navigate]);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {!isStandardUser && <Sidebar />}
        <main
          className={cn(
            "flex-1 transition-all duration-300 pt-16 flex flex-col overflow-hidden",
            !isStandardUser && sidebarOpen ? "ml-64" : "ml-0",
          )}
        >
          <div className="p-6 flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
