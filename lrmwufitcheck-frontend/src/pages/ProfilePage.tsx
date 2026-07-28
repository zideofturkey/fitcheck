import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  Languages,
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
import { LANGUAGE_STORAGE_KEY } from "@/i18n";
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
  const { t, i18n } = useTranslation();
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

  // Sync fullname from session once loaded — a real useRef guard, run inside
  // an effect (not during render) so it can't clobber an in-progress edit or
  // trigger a render-time setState loop.
  const initializedRef = useRef(false);
  useEffect(() => {
    if (session?.fullname && !initializedRef.current) {
      setFullname(session.fullname);
      initializedRef.current = true;
    }
  }, [session?.fullname]);

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

  const handleLanguageChange = (lng: "tr" | "en") => {
    void i18n.changeLanguage(lng);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  };

  const archiveConfirmPhrase = t("profile.archiveConfirmPhrase");
  const passwordMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canUpdatePassword =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    !passwordMismatch &&
    !updatePassword.isPending;
  const canArchive = archiveConfirmation === archiveConfirmPhrase;

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
            {t("profile.loadError")}
          </h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm">
            {t("profile.loadErrorDesc")}
            {error?.message ? (
              <span className="block mt-1 text-xs text-muted-foreground/80">
                {error.message}
              </span>
            ) : null}
          </p>
          <Button variant="default" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t("common.retry")}
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
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("profile.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("profile.subtitle")}</p>
      </header>

      {/* Avatar + Basic Info Section */}
      <section className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6">
          {t("profile.avatarDetails")}
        </h2>

        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar Upload Widget */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-4 border-border shadow-md">
                {session?.avatar ? (
                  <img
                    src={session.avatar}
                    alt={session.fullname ?? t("profile.userAvatarAlt")}
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
                aria-label={t("profile.changeAvatar")}
                onClick={() => {
                  // TODO: implement avatar upload — useUploadUserAvatar
                }}
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("profile.avatarHint")}
            </p>
          </div>

          {/* Profile Form Fields */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <Label className="mb-1.5">{t("profile.fullName")}</Label>
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
              <Label className="mb-1.5">{t("profile.email")}</Label>
              <Input
                type="email"
                value={session?.email ?? ""}
                disabled
                className="bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("profile.emailCannotChange")}
              </p>
            </div>
            <div>
              <Label className="mb-1.5">{t("profile.role")}</Label>
              <Input
                type="text"
                value={session?.roleId ?? t("profile.defaultRole")}
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
                {t("profile.saveChanges")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Language Section */}
      <section className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Languages className="w-5 h-5 text-muted-foreground" />
          {t("profile.language")}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t("profile.languageDescription")}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={i18n.language === "tr" ? "default" : "secondary"}
            onClick={() => handleLanguageChange("tr")}
          >
            {t("profile.languageTurkish")}
          </Button>
          <Button
            type="button"
            variant={i18n.language === "en" ? "default" : "secondary"}
            onClick={() => handleLanguageChange("en")}
          >
            {t("profile.languageEnglish")}
          </Button>
        </div>
      </section>

      {/* Password Change Section */}
      <section className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-2">
          {t("profile.changePassword")}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t("profile.changePasswordSubtitle")}
        </p>

        <div className="space-y-4 max-w-md">
          <div>
            <Label className="mb-1.5">{t("profile.currentPassword")}</Label>
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
                aria-label={t("profile.toggleVisibility")}
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
            <Label className="mb-1.5">{t("profile.newPassword")}</Label>
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
                aria-label={t("profile.toggleVisibility")}
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
            <Label className="mb-1.5">{t("profile.confirmNewPassword")}</Label>
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
                aria-label={t("profile.toggleVisibility")}
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
                {t("profile.passwordsDoNotMatch")}
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
                {t("profile.updatePassword")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("profile.changePasswordConfirmTitle")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("profile.changePasswordConfirmDesc")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleUpdatePassword}>
                  {updatePassword.isPending
                    ? t("profile.updating")
                    : t("profile.updatePassword")}
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
              {t("profile.archiveAccount")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("profile.archiveAccountDesc")}
            </p>
          </div>
          <AlertDialog
            open={archiveDialogOpen}
            onOpenChange={setArchiveDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="shrink-0">
                <Archive className="w-4 h-4" />
                {t("profile.archiveProfile")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">
                  {t("profile.archiveConfirmTitle")}
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <span>{t("profile.archiveConfirmDesc1")}</span>
                  <span className="block font-semibold text-foreground">
                    {t("profile.archiveConfirmTypeLabel")}{" "}
                    <strong>"{archiveConfirmPhrase}"</strong>{" "}
                    {t("profile.archiveConfirmTypeSuffix")}
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-2">
                <Input
                  value={archiveConfirmation}
                  onChange={(e) => setArchiveConfirmation(e.target.value)}
                  placeholder={`"${archiveConfirmPhrase}"`}
                  className={
                    archiveConfirmation.length > 0 && !canArchive
                      ? "border-destructive"
                      : ""
                  }
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setArchiveConfirmation("")}>
                  {t("common.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleArchive}
                  disabled={!canArchive || archiveProfile.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {archiveProfile.isPending ? (
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {t("profile.archiveProfile")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
          <Info className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            {t("profile.archiveInfo1")}{" "}
            <strong className="text-foreground">
              "{archiveConfirmPhrase}"
            </strong>{" "}
            {t("profile.archiveInfo2")}
          </p>
        </div>
      </section>
    </div>
  );
}
