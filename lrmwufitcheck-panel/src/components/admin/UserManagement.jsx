import { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  UserPlus,
  Edit2,
  Trash2,
  Key,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  AlertTriangle,
  Mail,
} from "lucide-react";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../stores/authStore";
import { userDisplayName, userDisplayInitial } from "../../utils/userDisplay";
import Modal from "../common/Modal";
import UserCreateModal from "./UserCreateModal";
import UserEditModal from "./UserEditModal";
import EmailVerificationForm from "../auth/EmailVerificationForm";
import MobileVerificationForm from "../auth/MobileVerificationForm";

// Available roles
const ROLES = { superAdmin: "'superAdmin'", admin: "'admin'", user: "'user'" };

// Admin roles that require special permissions
const ADMIN_ROLES = [
  "superAdmin",
  "saasAdmin",
  "admin",
  "tenantOwner",
  "tenantAdmin",
];

/**
 * UserManagement - Comprehensive admin user management panel
 */
export default function UserManagement() {
  const {
    user: currentUser,
    setPendingVerification,
    clearPendingVerification,
  } = useAuthStore();

  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageRowCount, setPageRowCount] = useState(25);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(null); // 'email' | 'mobile' | null

  // Action menu
  const [actionMenuUser, setActionMenuUser] = useState(null);

  // Form states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [saving, setSaving] = useState(false);

  // Load users on mount and when pagination changes
  useEffect(() => {
    if (searchKeyword.length >= 3) {
      searchUsers();
    } else if (searchKeyword.length === 0) {
      loadUsers();
    }
  }, [pageNumber, pageRowCount]);

  // Debounced search
  useEffect(() => {
    if (searchKeyword.length >= 3) {
      const timer = setTimeout(() => {
        setPageNumber(1);
        searchUsers();
      }, 300);
      return () => clearTimeout(timer);
    } else if (searchKeyword.length === 0 && !loading) {
      loadUsers();
    }
  }, [searchKeyword]);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    setIsSearching(false);
    try {
      const response = await authService.listUsers({
        pageNumber,
        pageRowCount,
      });
      setUsers(response.users || []);
      setTotalRows(response.paging?.totalRowCount || 0);
      setTotalPages(response.paging?.pageCount || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (searchKeyword.length < 3) return;

    setLoading(true);
    setError("");
    setIsSearching(true);
    try {
      const response = await authService.searchUsers(searchKeyword, {
        pageNumber,
        pageRowCount,
      });
      setUsers(response.users || []);
      setTotalRows(response.paging?.totalRowCount || 0);
      setTotalPages(response.paging?.pageCount || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (searchKeyword.length >= 3) {
      searchUsers();
    } else {
      loadUsers();
    }
  };

  const clearSearch = () => {
    setSearchKeyword("");
    setPageNumber(1);
  };

  // Permission checks
  const canEditUser = (targetUser) => {
    if (!currentUser) return false;
    const myRole = currentUser.roleId;
    const targetRole = targetUser.roleId;

    // SuperAdmin can edit anyone except another superAdmin
    if (myRole === "superAdmin")
      return (
        targetRole !== "superAdmin" || targetUser.userId === currentUser.userId
      );

    // Admin can edit non-admin users
    if (ADMIN_ROLES.includes(myRole)) return !ADMIN_ROLES.includes(targetRole);

    return false;
  };

  const canDeleteUser = (targetUser) => {
    if (!currentUser) return false;
    const myRole = currentUser.roleId;
    const targetRole = targetUser.roleId;

    // Cannot delete superAdmin
    if (targetRole === "superAdmin") return false;

    // SuperAdmin can delete anyone except superAdmin
    if (myRole === "superAdmin") return true;

    // Admin can only delete non-admin users
    if (ADMIN_ROLES.includes(myRole)) return !ADMIN_ROLES.includes(targetRole);

    return false;
  };

  const canChangeRole = (targetUser) => {
    if (!currentUser) return false;
    const myRole = currentUser.roleId;
    const targetRole = targetUser.roleId;

    // Cannot change superAdmin role
    if (targetRole === "superAdmin") return false;

    // Only superAdmin can change admin roles
    if (ADMIN_ROLES.includes(targetRole)) return myRole === "superAdmin";

    // Admins can change non-admin roles
    return ADMIN_ROLES.includes(myRole);
  };

  const canChangePassword = (targetUser) => {
    if (!currentUser) return false;
    const myRole = currentUser.roleId;
    const targetRole = targetUser.roleId;

    // SuperAdmin and admin passwords can only be changed by superAdmin
    if (ADMIN_ROLES.includes(targetRole)) return myRole === "superAdmin";

    // Admins can change non-admin passwords
    return ADMIN_ROLES.includes(myRole);
  };

  // Action handlers
  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
    setActionMenuUser(null);
  };

  const handleChangeRole = (user) => {
    setSelectedUser(user);
    setSelectedRole(Array.isArray(user.roleId) ? user.roleId[0] : user.roleId);
    setShowRoleModal(true);
    setActionMenuUser(null);
  };

  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(true);
    setActionMenuUser(null);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
    setActionMenuUser(null);
  };

  // Save handlers
  const handleSaveRole = async () => {
    if (!selectedUser || !selectedRole) return;

    setSaving(true);
    setError("");
    try {
      await authService.updateUserRole(
        selectedUser.id || selectedUser.userId,
        selectedRole,
      );
      setSuccess("User role updated successfully");
      setShowRoleModal(false);
      handleRefresh();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!selectedUser) return;

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await authService.updateUserPasswordByAdmin(
        selectedUser.id || selectedUser.userId,
        newPassword,
      );
      setSuccess("Password updated successfully");
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setSaving(true);
    setError("");
    try {
      await authService.deleteUser(selectedUser.id || selectedUser.userId);
      setSuccess("User deleted successfully");
      setShowDeleteModal(false);
      handleRefresh();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  const handleUserCreated = () => {
    setShowCreateModal(false);
    setSuccess("User created successfully");
    handleRefresh();
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleUserUpdated = () => {
    setShowEditModal(false);
    setSuccess("User updated successfully");
    handleRefresh();
    setTimeout(() => setSuccess(""), 3000);
  };

  // Verification handlers
  const handleStartVerification = (user, type) => {
    setSelectedUser(user);
    setActionMenuUser(null);
    // Set pendingVerification in auth store so the verification forms can use it
    setPendingVerification({
      type,
      email: user.email,
    });
    setShowVerificationModal(type);
  };

  const handleCloseVerification = () => {
    setShowVerificationModal(null);
    clearPendingVerification();
    // Refresh user list to reflect any status changes
    handleRefresh();
  };

  const getRoleBadgeColor = (roleId) => {
    const role = Array.isArray(roleId) ? roleId[0] : roleId;
    switch (role) {
      case "superAdmin":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "saasAdmin":
      case "admin":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300";
      case "tenantOwner":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300";
      case "tenantAdmin":
        return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300";
      default:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
    }
  };

  const getRoleDisplayName = (roleId) => {
    const role = Array.isArray(roleId) ? roleId[0] : roleId;
    return ROLES[role]?.name || role || "User";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          User Management
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          {success}
          <button
            onClick={() => setSuccess("")}
            className="text-green-500 hover:text-green-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          {error}
          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search users (min 3 characters)..."
            className="input-field pl-10 pr-10"
          />
          {searchKeyword && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pageRowCount}
            onChange={(e) => {
              setPageRowCount(Number(e.target.value));
              setPageNumber(1);
            }}
            className="input-field py-2"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {isSearching && searchKeyword && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing results for "{searchKeyword}" ({totalRows} users found)
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id || user.userId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-600 dark:text-primary-400 font-medium">
                            {userDisplayInitial(user)}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {userDisplayName(user, { fallback: "Unknown" })}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {(user.id || user.userId || "").slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-300">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.roleId)}`}
                    >
                      {getRoleDisplayName(user.roleId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1.5">
                      {user.emailVerified ? (
                        <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                          Email Verified
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                            Email Pending
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartVerification(user, "email");
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 border border-primary-200 dark:border-primary-800 transition-colors"
                            title="Start email verification"
                          >
                            <Mail className="w-3 h-3" />
                            Verify
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActionMenuUser(
                            actionMenuUser === user.id
                              ? null
                              : user.id || user.userId,
                          )
                        }
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>

                      {actionMenuUser === (user.id || user.userId) && (
                        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                          {canEditUser(user) && (
                            <button
                              onClick={() => handleEdit(user)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit User
                            </button>
                          )}
                          {canChangeRole(user) && (
                            <button
                              onClick={() => handleChangeRole(user)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Shield className="w-4 h-4" />
                              Change Role
                            </button>
                          )}
                          {canChangePassword(user) && (
                            <button
                              onClick={() => handleChangePassword(user)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Key className="w-4 h-4" />
                              Reset Password
                            </button>
                          )}
                          {canDeleteUser(user) && (
                            <>
                              <hr className="my-1 border-gray-200 dark:border-gray-700" />
                              <button
                                onClick={() => handleDelete(user)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete User
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(pageNumber - 1) * pageRowCount + 1} to{" "}
            {Math.min(pageNumber * pageRowCount, totalRows)} of {totalRows}{" "}
            users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber === 1 || loading}
              className="btn-secondary flex items-center gap-1 text-sm disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() =>
                setPageNumber(Math.min(totalPages, pageNumber + 1))
              }
              disabled={pageNumber === totalPages || loading}
              className="btn-secondary flex items-center gap-1 text-sm disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close action menu */}
      {actionMenuUser && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActionMenuUser(null)}
        />
      )}

      {/* Create User Modal */}
      <UserCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleUserCreated}
      />

      {/* Edit User Modal */}
      <UserEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={selectedUser}
        onSuccess={handleUserUpdated}
      />

      {/* Change Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Change User Role"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Change role for{" "}
            <span className="font-medium">{userDisplayName(selectedUser)}</span>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input-field"
            >
              {Object.entries(ROLES).map(([key, role]) => (
                <option key={key} value={key} disabled={key === "superAdmin"}>
                  {role.name || key}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowRoleModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRole}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Role
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Reset User Password"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Set a new password for{" "}
            <span className="font-medium">{userDisplayName(selectedUser)}</span>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Confirm new password"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePassword}
              disabled={
                saving || !newPassword || newPassword !== confirmPassword
              }
              className="btn-primary flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Reset Password
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete{" "}
                <span className="font-medium">
                  {userDisplayName(selectedUser)}
                </span>
                ?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete User
            </button>
          </div>
        </div>
      </Modal>

      {/* Email Verification Modal */}
      <Modal
        isOpen={showVerificationModal === "email"}
        onClose={handleCloseVerification}
        title={`Verify Email — ${selectedUser?.email || ""}`}
      >
        <div className="py-2">
          <EmailVerificationForm
            onComplete={handleCloseVerification}
            adminMode
          />
        </div>
      </Modal>

      {/* Mobile Verification Modal */}
      <Modal
        isOpen={showVerificationModal === "mobile"}
        onClose={handleCloseVerification}
        title={`Verify Mobile — ${userDisplayName(selectedUser, { fallback: "" })}`}
      >
        <div className="py-2">
          <MobileVerificationForm
            onComplete={handleCloseVerification}
            adminMode
          />
        </div>
      </Modal>
    </div>
  );
}
