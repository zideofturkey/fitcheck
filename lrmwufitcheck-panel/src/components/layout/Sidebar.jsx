import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  MessageSquare,
  Search,
  FileText,
  Wifi,
  HardDrive,
  Database,
  AlertCircle,
} from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import { useAuthStore } from "../../stores/authStore";
import { getServiceUrl } from "../../services/apiClient";
import { cn } from "../../utils/cn";

// Main navigation items
const navItems = [
  { path: "/chat", icon: MessageSquare, label: "Chat" },
  { path: "/elastic-search", icon: Search, label: "Elastic Search" },
  { path: "/logs", icon: FileText, label: "Logs" },
  { path: "/mcp-logs", icon: Wifi, label: "MCP Logs" },
  {
    path: "/admin/database",
    icon: HardDrive,
    label: "DB Admin",
    adminOnly: true,
  },
];

// Service navigation items
const serviceItems = [
  {
    path: "/service/invitationcenter",
    icon: Database,
    label: "invitationCenter",
    serviceName: "invitationcenter",
  },
  {
    path: "/service/nutritionlibrary",
    icon: Database,
    label: "nutritionLibrary",
    serviceName: "nutritionlibrary",
  },
  {
    path: "/service/mealtracker",
    icon: Database,
    label: "mealTracker",
    serviceName: "mealtracker",
  },
  {
    path: "/service/nutritionai",
    icon: Database,
    label: "nutritionAi",
    serviceName: "nutritionai",
  },
  {
    path: "/service/agenthub",
    icon: Database,
    label: "agentHub",
    serviceName: "agenthub",
  },
];

export default function Sidebar() {
  const { sidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const roleId = Array.isArray(user?.roleId) ? user.roleId[0] : user?.roleId;
  const canAccessObservability = ["superAdmin", "saasAdmin", "admin"].includes(
    roleId,
  );
  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly) return canAccessObservability;
    if (["/logs", "/elastic-search", "/mcp-logs"].includes(item.path))
      return canAccessObservability;
    return true;
  });
  const buildPath = (path) => path;
  const [serviceHealth, setServiceHealth] = useState({});
  const [healthChecked, setHealthChecked] = useState(false);

  // Check health of all services on mount
  useEffect(() => {
    const checkServiceHealth = async () => {
      const healthStatus = {};

      await Promise.all(
        serviceItems.map(async (item) => {
          try {
            const serviceUrl = getServiceUrl(item.serviceName);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

            const response = await fetch(`${serviceUrl}/health`, {
              method: "GET",
              signal: controller.signal,
            });

            clearTimeout(timeoutId);
            healthStatus[item.serviceName] = response.ok;
          } catch (err) {
            healthStatus[item.serviceName] = false;
          }
        }),
      );

      setServiceHealth(healthStatus);
      setHealthChecked(true);
    };

    checkServiceHealth();

    // Re-check health every 30 seconds
    const interval = setInterval(checkServiceHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!sidebarOpen) return null;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-40">
      <nav className="p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
          Main
        </p>
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={buildPath(item.path)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}

        {/* Services */}
        <div className="pt-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
            Services
          </p>
          {serviceItems.map((item) => {
            const isHealthy = healthChecked
              ? serviceHealth[item.serviceName] !== false
              : true;

            if (!isHealthy) {
              // Render disabled button for unhealthy services
              return (
                <div
                  key={item.path}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
                  title={`${item.label} service is not responding`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium flex-1">{item.label}</span>
                  <AlertCircle className="w-4 h-4 text-red-400" />
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={buildPath(item.path)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
