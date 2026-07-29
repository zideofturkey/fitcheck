import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCreateUser, useUploadUserAvatar } from "@/hooks/api/use-auth";
import { authService } from "@/services/api/auth-service";
import {
  ChevronRight,
  User,
  Camera,
  Eye,
  EyeOff,
  Info,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminCreateUserPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createUser = useCreateUser();
  const uploadAvatar = useUploadUserAvatar();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculatePasswordStrength = (pw: string): number => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(password);

  const strengthColors = [
    "bg-muted",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ];

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (password !== confirmPassword) {
      setPasswordError(t("adminCreateUser.passwordMismatch"));
      return;
    }

    if (password.length < 8) {
      setPasswordError(t("adminCreateUser.passwordTooShort"));
      return;
    }

    const doCreate = (avatarUrl?: string) => {
      createUser.mutate(
        {
          email,
          password,
          fullname,
          ...(avatarUrl ? { avatar: avatarUrl } : {}),
        },
        {
          onSuccess: () => {
            navigate("/admin/users");
          },
        },
      );
    };

    if (avatarFile) {
      uploadAvatar.mutate(avatarFile, {
        onSuccess: (response) => {
          doCreate(
            response?.file?.accessKey
              ? authService.getUserAvatarUrl(response.file.accessKey)
              : undefined,
          );
        },
        onError: () => {
          doCreate();
        },
      });
    } else {
      doCreate();
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <header className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link
            to="/admin/users"
            className="hover:text-foreground transition-colors"
          >
            {t("adminCreateUser.users")}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">
            {t("adminCreateUser.createUser")}
          </span>
        </nav>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("adminCreateUser.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("adminCreateUser.subtitle")}
          </p>
        </div>
      </header>

      {/* Form Card */}
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                aria-label={t("adminCreateUser.uploadAvatarAria")}
                onClick={handleAvatarClick}
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("adminCreateUser.avatarOptional")}
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullname">{t("adminCreateUser.fullName")}</Label>
            <Input
              type="text"
              id="fullname"
              name="fullname"
              placeholder="e.g. Alex Demir"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("adminCreateUser.emailAddress")}</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="e.g. alex@fitcheck.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">{t("adminCreateUser.password")}</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder={t("adminCreateUser.passwordPlaceholder")}
                className="pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted transition-colors"
                aria-label={t("adminCreateUser.toggleVisibility")}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {/* Password strength indicator */}
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full ${
                    passwordStrength >= level
                      ? strengthColors[passwordStrength]
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("adminCreateUser.passwordHint")}
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">
              {t("adminCreateUser.confirmPassword")}
            </Label>
            <Input
              type="password"
              id="confirm-password"
              name="confirm-password"
              placeholder={t("adminCreateUser.confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {passwordError && (
              <p className="text-xs text-destructive">{passwordError}</p>
            )}
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
            <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                {t("adminCreateUser.importantTitle")}
              </p>
              <p>{t("adminCreateUser.importantNote")}</p>
            </div>
          </div>

          {/* Server error */}
          {createUser.error && (
            <p className="text-sm text-destructive">
              {(createUser.error as Error)?.message ||
                t("adminCreateUser.createFailed")}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={createUser.isPending || uploadAvatar.isPending}
            >
              <UserPlus className="w-4 h-4" />
              {createUser.isPending || uploadAvatar.isPending
                ? t("adminCreateUser.creating")
                : t("adminCreateUser.createUserBtn")}
            </Button>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 h-11 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              {t("adminCreateUser.cancel")}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
