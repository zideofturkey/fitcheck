import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Shield,
  CircleCheck,
  Calendar,
  Clock,
  Pencil,
  Key,
  Info,
  Eye,
  EyeOff,
  Circle,
  Check,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUser } from "@/hooks/api/use-auth";
import { useUpdateUser } from "@/hooks/api/use-auth";
import { useUpdateUserRole } from "@/hooks/api/use-auth";
import { useUpdateUserPasswordByAdmin } from "@/hooks/api/use-auth";
import { useDeleteUser } from "@/hooks/api/use-auth";

const AdminUserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useUser(userId!);
  const updateUser = useUpdateUser();
  const updateRole = useUpdateUserRole();
  const resetPassword = useUpdateUserPasswordByAdmin();
  const deleteUser = useDeleteUser();

  const [fullname, setFullname] = useState("");
  const [profileInitialized, setProfileInitialized] = useState(false);

  const [selectedRole, setSelectedRole] = useState("");
  const [roleInitialized, setRoleInitialized] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  React.useEffect(() => {
    if (user && !profileInitialized) {
      setFullname(user.fullname ?? "");
      setProfileInitialized(true);
    }
  }, [user, profileInitialized]);

  React.useEffect(() => {
    if (user && !roleInitialized) {
      setSelectedRole(user.roleId ?? "");
      setRoleInitialized(true);
    }
  }, [user, roleInitialized]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    updateUser.mutate(
      { userId, data: { fullname } },
      {
        onSuccess: () => {
          /* profile updated */
        },
      },
    );
  };

  const handleUpdateRole = () => {
    if (!userId || !selectedRole) return;
    updateRole.mutate({ userId, data: { roleId: selectedRole } });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newPassword || newPassword !== confirmPassword) return;
    resetPassword.mutate(
      { userId, data: { password: newPassword } },
      {
        onSuccess: () => {
          setNewPassword("");
          setConfirmPassword("");
        },
      },
    );
  };

  const handleDelete = () => {
    if (!userId) return;
    deleteUser.mutate(userId, {
      onSuccess: () => navigate("/admin/users"),
    });
  };

  const initials = user?.fullname
    ? user.fullname
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const getPasswordStrength = (pw: string): number => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Za-z]/.test(pw) && /[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (pw.length >= 12) score++;
    return score;
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </Link>
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-destructive">
              Failed to load user. The user may not exist or you lack
              permissions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const strengthScore = getPasswordStrength(newPassword);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link
            to="/admin/users"
            className="hover:text-foreground transition-colors"
          >
            Users
          </Link>
          <span>/</span>
          <span className="text-foreground">User Details</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {user.fullname}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage user details, roles, and access.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Users
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User Permanently</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {user.fullname} and all
                    associated data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleteUser.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteUser.isPending
                      ? "Deleting..."
                      : "Delete Permanently"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      {/* User Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-3xl font-semibold text-secondary-foreground">
                {initials}
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold">{user.fullname}</h2>
                  <Badge variant="secondary">
                    <Shield className="w-3 h-3 mr-1" />
                    {user.roleId}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${user.isActive ? "bg-chart-2" : "bg-destructive"}`}
                  />
                  <span className="text-sm text-muted-foreground">
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CircleCheck className="w-4 h-4 text-chart-1" />
                  <span className="text-sm text-muted-foreground">
                    {user.emailVerified
                      ? "Email Verified"
                      : "Email Not Verified"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined{" "}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    Updated{" "}
                    {user.updatedAt
                      ? new Date(user.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button size="sm">
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm">
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </Button>
                <Button variant="outline" size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Change Role
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details + Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update the user's name and avatar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input
                  id="fullname"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be User must verify any new email through the
                  verification flow.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={updateUser.isPending}>
                  <Check className="w-4 h-4 mr-2" />
                  {updateUser.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFullname(user.fullname ?? "")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Role Management */}
        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Assign or change the user's role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="role">Current Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    Admin — Full management, cannot delete other admins
                  </SelectItem>
                  <SelectItem value="user">
                    User — Standard user, own data only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 rounded-lg bg-muted border border-border">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Role Rules</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>SuperAdmin role cannot be changed</li>
                    <li>Admin roles can only be assigned by SuperAdmin</li>
                    <li>Admins cannot delete users with Admin role</li>
                  </ul>
                </div>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleUpdateRole}
              disabled={updateRole.isPending}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              {updateRole.isPending ? "Updating..." : "Update Role"}
            </Button>
          </CardContent>
        </Card>

        {/* Password Reset */}
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Set a new password for this user. No old password required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowNewPassword((p) => !p)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1.5 rounded-full ${newPassword ? (i < strengthScore ? "bg-chart-1" : "bg-secondary") : "bg-secondary"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use 8+ characters with a mix of letters, numbers, and
                    symbols.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={
                    resetPassword.isPending ||
                    !newPassword ||
                    newPassword !== confirmPassword
                  }
                >
                  <Key className="w-4 h-4 mr-2" />
                  {resetPassword.isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this user and all their data. This action
              cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="flex items-start gap-3">
                <Circle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-destructive">
                    Delete User Permanently
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                    <li>
                      All meal logs, food library, presets, and targets will be
                      erased
                    </li>
                    <li>
                      AI session history and guidance notes will be removed
                    </li>
                    <li>This action is irreversible</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="confirm-delete"
                checked={deleteConfirmed}
                onCheckedChange={(v) => setDeleteConfirmed(!!v)}
              />
              <Label
                htmlFor="confirm-delete"
                className="text-sm text-muted-foreground"
              >
                I understand that this action is permanent and cannot be undone.
              </Label>
            </div>
            <Button
              variant="destructive"
              className="w-full"
              disabled={!deleteConfirmed || deleteUser.isPending}
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteUser.isPending ? "Deleting..." : "Delete User Permanently"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
