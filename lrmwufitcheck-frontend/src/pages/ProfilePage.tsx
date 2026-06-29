import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Check,
  Eye,
  EyeOff,
  Lock,
  Info,
  Archive,
  Loader,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  useCurrentUser,
  useUpdateProfile,
  useUpdateUserPassword,
  useArchiveProfile,
} from "@/hooks/api/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: session, isLoading: sessionLoading, isError, error, refetch } =
    useCurrentUser();
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdateUserPassword();
  const archiveProfile = useArchiveProfile();

  // Profile form state
  const [fullname, setFullname] = useState("");
  const [profileDirty, setProfileDirty] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Archive dialog state
  const [archiveConfirmation, setArchiveConfirmation] = useState("");
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  // Sync fullname from session once loaded
  const initializedRef = useState(false);
  if (session?.fullname && !initializedRef[0]) {
    setFullname(session.fullname);
    initializedRef[0] = true;
  }

  const handleSaveProfile = () => {
    updateProfile.mutate(
      { fullname },
      {
        onSuccess: () => setProfileDirty(false),
      },
    );
  };

  const handleUpdatePassword = () => {
    updatePassword.mutate(
      { oldPassword: currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      },
    );
  };

  const handleArchive = () => {
    archiveProfile.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  const passwordMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canUpdatePassword =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    !passwordMismatch &&
    !updatePassword.isPending;
  const canArchive = archiveConfirmation === "ARCHIVE MY ACCOUNT";

  // Compute password strength (simple heuristic)
  const passwordStrength = (() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  })();

  const userInitials = session?.fullname
    ? session.fullname
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  if (sessionLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="animate-pulse space-y-8">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-4 w-64 bg-muted rounded" />
          </div>
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
            <div className="h-6 w-40 bg-muted rounded" />
            <div className="flex gap-6">
              <div className="w-24 h-24 rounded-full bg-muted" />
              <div className="flex-1 space-y-3">
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-card rounded-xl border border-destructive/30 shadow-sm p-8 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Profil bilgileri yüklenemedi
          </h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm">
            Profil bilgileriniz yüklenirken bir hata oluştu. Lütfen bağlantınızı
            kontrol edip tekrar deneyin.
            {error?.message ? (
              <span className="block mt-1 text-xs text-muted-foreground/80">
                {error.message}
              </span>
            ) : null}
          </p>
          <Button
            variant="default"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tekrar dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* decorative background accent */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      {/* Page Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information, avatar, and security settings.
        </p>
      </header>

      {/* Avatar + Basic Info Section */}
      <section className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6">Avatar & Details</h2>

        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar Upload Widget */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-4 border-border shadow-md">
                {session?.avatar ? (
                  <img
                    src={session.avatar}
                    alt={session.fullname ?? "User avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-secondary-foreground">
                    {userInitials}
                  </span>
                )}
              </div>
              <button
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Change avatar"
                onClick={() => {
                  // TODO: implement avatar upload — useUploadUserAvatar
                }}
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
          </div>

          {/* Profile Form Fields */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <Label className="mb-1.5">Full Name</Label>
              <Input
                type="text"
                value={fullname}
                onChange={(e) => {
                  setFullname(e.target.value);
                  setProfileDirty(true);
                }}
              />
            </div>
            <div>
              <Label className="mb-1.5">Email</Label>
              <Input
                type="email"
                value={session?.email ?? ""}
                disabled
                className="bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed.
              </p>
            </div>
            <div>
              <Label className="mb-1.5">Role</Label>
              <Input
                type="text"
                value={session?.roleId ?? "User"}
                disabled
                className="bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div className="pt-2">
              <Button
                onClick={handleSaveProfile}
                disabled={!profileDirty || updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Password Change Section */}
      <section className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-2">Change Password</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Update your password to keep your account secure.
        </p>

        <div className="space-y-4 max-w-md">
          <div>
            <Label className="mb-1.5">Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle visibility"
                onClick={() => setShowCurrentPassword((v) => !v)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <Label className="mb-1.5">New Password</Label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle visibility"
                onClick={() => setShowNewPassword((v) => !v)}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {/* password strength bar */}
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full ${
                    newPassword.length > 0 && passwordStrength >= level
                      ? level <= 2
                        ? "bg-orange-500"
                        : level === 3
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-1.5">Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pr-10 ${passwordMismatch ? "border-destructive focus:ring-destructive" : ""}`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle visibility"
                onClick={() => setShowConfirmPassword((v) => !v)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwordMismatch && (
              <p className="text-xs text-destructive mt-1">
                Passwords do not match.
              </p>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="secondary" disabled={!canUpdatePassword}>
                {updatePassword.isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                Update Password
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Change password?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will update your account password. You will remain logged
                  in.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleUpdatePassword}>
                  {updatePassword.isPending ? "Updating..." : "Update Password"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      {/* Danger Zone: Archive Account */}
      <section className="bg-card rounded-xl border border-destructive/30 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-destructive">
              Archive Account
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Temporarily deactivate your account. You can restore it within 30
              days by logging in.
            </p>
          </div>
          <AlertDialog
            open={archiveDialogOpen}
            onOpenChange={setArchiveDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="shrink-0">
                <Archive className="w-4 h-4" />
                Archive Profile
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">
                  Archive your account?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <span>
                    This will temporarily deactivate your account. Your data is
                    kept for 1 month, and logging in again within that period
                    will restore your account automatically.
                  </span>
                  <span className="block font-semibold text-foreground">
                    Type <strong>"ARCHIVE MY ACCOUNT"</strong> to confirm:
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-2">
                <Input
                  value={archiveConfirmation}
                  onChange={(e) => setArchiveConfirmation(e.target.value)}
                  placeholder='Type "ARCHIVE MY ACCOUNT"'
                  className={
                    archiveConfirmation.length > 0 && !canArchive
                      ? "border-destructive"
                      : ""
                  }
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setArchiveConfirmation("")}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleArchive}
                  disabled={!canArchive || archiveProfile.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {archiveProfile.isPending ? (
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Archive Profile
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
          <Info className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Archiving requires typing{" "}
            <strong className="text-foreground">"ARCHIVE MY ACCOUNT"</strong> in
            a confirmation dialog. After archiving, your data is kept for 1
            month. Logging in again within that period will restore your account
            automatically.
          </p>
        </div>
      </section>
    </div>
  );
}
