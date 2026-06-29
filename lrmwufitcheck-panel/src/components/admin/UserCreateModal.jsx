import { useState } from "react";
import { Loader2, Eye, EyeOff, X } from "lucide-react";
import Modal from "../common/Modal";
import AvatarUpload from "./AvatarUpload";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../stores/authStore";

// Available roles (excluding superAdmin which cannot be assigned)
const ASSIGNABLE_ROLES = Object.entries({
  superAdmin: "'superAdmin'",
  admin: "'admin'",
  user: "'user'",
})
  .filter(([key]) => key !== "superAdmin")
  .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

/**
 * UserCreateModal - Modal for creating new users
 * Includes avatar upload with crop functionality
 */
export default function UserCreateModal({ isOpen, onClose, onSuccess }) {
  const { user: currentUser } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullname: "",
    roleId: "user",
    avatar: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (avatarUrl) => {
    setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email) {
      setError("Email is required");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!formData.fullname) {
      setError("Full name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.createUser(formData);
      // Reset form
      setFormData({
        email: "",
        password: "",
        fullname: "",
        roleId: "user",
        avatar: "",
      });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  // Determine which roles the current user can assign
  const canAssignRole = (roleKey) => {
    const myRole = currentUser?.roleId;
    if (myRole === "superAdmin") return true;

    // Non-superAdmin cannot assign admin roles
    const adminRoles = ["saasAdmin", "admin", "tenantOwner", "tenantAdmin"];
    if (adminRoles.includes(roleKey)) return myRole === "superAdmin";

    return true;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New User">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Avatar Upload */}
        <div className="flex justify-center">
          <AvatarUpload
            currentAvatar={formData.avatar}
            onAvatarChange={handleAvatarChange}
            bucketName="userAvatars"
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            className="input-field"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            placeholder="user@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field pr-10"
              placeholder="Minimum 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role
          </label>
          <select
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            className="input-field"
          >
            {Object.entries(ASSIGNABLE_ROLES).map(([key, role]) => (
              <option key={key} value={key} disabled={!canAssignRole(key)}>
                {role.name || key}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create User
          </button>
        </div>
      </form>
    </Modal>
  );
}
