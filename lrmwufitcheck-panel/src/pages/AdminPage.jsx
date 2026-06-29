import { useState } from "react";
import {
  Users,
  Building,
  Shield,
  Settings,
  UsersRound,
  FolderOpen,
} from "lucide-react";
import { cn } from "../utils/cn";
import UserManagement from "../components/admin/UserManagement";
import BucketManagement from "../components/admin/BucketManagement";
import { useAuthStore } from "../stores/authStore";

export default function AdminPage() {
  const { user } = useAuthStore();
  const canManageTenants = ["superAdmin", "saasAdmin"].includes(user?.roleId);
  const [activeTab, setActiveTab] = useState("users");
  const tabs = [
    { id: "users", label: "Users", icon: Users },
    { id: "files", label: "Files", icon: FolderOpen },
    { id: "roles", label: "Roles", icon: Shield },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Panel
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage users, roles, and system settings.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === "users" && <UserManagement />}
        {activeTab === "files" && <BucketManagement />}
        {activeTab === "roles" && <RolesPanel />}
        {activeTab === "settings" && <SettingsPanel />}
      </div>
    </div>
  );
}

function RolesPanel() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Roles & Permissions
      </h2>
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Role management interface will be implemented here.</p>
        <p className="text-sm mt-1">
          Roles are defined in the project configuration.
        </p>
      </div>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        System Settings
      </h2>
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>System settings interface will be implemented here.</p>
      </div>
    </div>
  );
}
