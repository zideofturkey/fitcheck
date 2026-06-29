import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../common/Modal";
import AvatarUpload from "./AvatarUpload";
import { authService } from "../../services/authService";

/**
 * UserEditModal - Modal for editing existing users
 * Allows updating name and avatar (role and password are handled separately)
 */
export default function UserEditModal({ isOpen, onClose, user, onSuccess }) {
  const [formData, setFormData] = useState({
    fullname: "",
    avatar: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load user data when modal opens
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        fullname: user.fullname || "",
        avatar: user.avatar || "",
      });
      setError("");
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (avatarUrl) => {
    setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullname) {
      setError("Full name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userId = user.id || user.userId;
      await authService.updateUser(userId, formData);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit User">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* User Info Header */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm">
          <div className="text-gray-500 dark:text-gray-400">Email</div>
          <div className="font-medium text-gray-900 dark:text-white">
            {user.email}
          </div>
        </div>

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
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
