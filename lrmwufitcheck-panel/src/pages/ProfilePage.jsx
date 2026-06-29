import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Loader2,
  Camera,
  AlertTriangle,
  Trash2,
  X,
  CreditCard,
  ChevronRight,
  Monitor,
  Smartphone,
  Globe,
  MapPin,
  Clock,
  LogOut,
  Shield,
} from "lucide-react";
import Cropper from "react-easy-crop";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";
import PaymentMethodList from "../components/payment/PaymentMethodList";
import toast from "react-hot-toast";

// Profile menu items
const menuItems = [
  { id: "profile", label: "Profile Data", icon: User },
  { id: "password", label: "Change Password", icon: Lock },
  { id: "sessions", label: "Active Sessions", icon: Monitor },
  { id: "payment", label: "Payment Methods", icon: CreditCard },
  { id: "danger", label: "Archive Account", icon: Trash2, danger: true },
];

// Helper to create cropped image from canvas
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
};

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, setUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState(
    searchParams.get("section") || "profile",
  );
  const [profileData, setProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Update URL when section changes
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSearchParams({ section });
  };

  // Fetch latest user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.userId) return;

      setIsLoadingProfile(true);
      try {
        const response = await authService.getUser(user.userId);
        setProfileData(response.user);
      } catch (err) {
        toast.error("Failed to load profile data");
        console.error("Error fetching user:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserData();
  }, [user?.userId]);

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Menu */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                  activeSection === item.id
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                    : item.danger
                      ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${activeSection === item.id ? "rotate-90" : ""}`}
                />
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeSection === "profile" && (
            <ProfileSection
              user={user}
              profileData={profileData}
              setProfileData={setProfileData}
              setUser={setUser}
            />
          )}
          {activeSection === "password" && <PasswordSection user={user} />}
          {activeSection === "sessions" && <SessionsSection user={user} />}
          {activeSection === "payment" && <PaymentMethodsSection />}
          {activeSection === "danger" && (
            <DangerSection user={user} projectCodename="lrmwufitcheck" />
          )}
        </div>
      </div>
    </div>
  );
}

// Profile Data Section
function ProfileSection({ user, profileData, setProfileData, setUser }) {
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullname: profileData?.fullname || "",
      mobile: profileData?.mobile || "",
    },
  });

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleAvatarUpload = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    setIsUploadingAvatar(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      const downloadUrl = await authService.uploadAvatar(
        "userAvatars",
        croppedImage,
      );

      await authService.updateProfile({ avatar: downloadUrl });
      setProfileData((prev) => ({ ...prev, avatar: downloadUrl }));
      setUser({ ...user, avatar: downloadUrl });

      toast.success("Avatar updated successfully!");
      setShowCropper(false);
      setImageSrc(null);
    } catch (err) {
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (data) => {
    setIsUpdatingProfile(true);
    try {
      const response = await authService.updateProfile({
        fullname: data.fullname,
        mobile: data.mobile,
      });

      setProfileData(response.user);
      setUser({ ...user, fullname: data.fullname });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile Picture
        </h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {profileData?.avatar ? (
                <img
                  src={profileData.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click the camera icon to upload a new profile picture.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG or GIF. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Crop Your Photo
              </h3>
              <button
                onClick={() => {
                  setShowCropper(false);
                  setImageSrc(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative h-80">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Zoom
                </label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCropper(false);
                    setImageSrc(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Save Photo"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Information */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile Information
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register("fullname", { required: "Name is required" })}
                className="input pl-10"
                placeholder="Your name"
              />
            </div>
            {errors.fullname && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fullname.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={profileData?.email || ""}
                className="input pl-10 bg-gray-100 dark:bg-gray-700"
                disabled
                readOnly
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed
            </p>
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="btn-primary flex items-center gap-2"
          >
            {isUpdatingProfile ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

// Password Section
function PasswordSection({ user }) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();
  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    setIsChangingPassword(true);
    try {
      await authService.updatePassword(data.currentPassword, data.newPassword);
      toast.success("Password changed successfully!");
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Change Password
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              {...register("currentPassword", {
                required: "Current password is required",
              })}
              className="input pl-10"
              placeholder="Enter current password"
            />
          </div>
          {errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              className="input pl-10"
              placeholder="Enter new password"
            />
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
              className="input pl-10"
              placeholder="Confirm new password"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isChangingPassword}
          className="btn-primary flex items-center gap-2"
        >
          {isChangingPassword ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          Change Password
        </button>
      </form>
    </div>
  );
}

// Sessions Section - Active Sessions Management
function SessionsSection({ user }) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isDeletingSession, setIsDeletingSession] = useState(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await authService.getSessions();
      // Ensure data is an array (API might wrap it or return unexpected format)
      setSessions(
        Array.isArray(data) ? data : data?.sessions || data?.data || [],
      );
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setLoadError(
        err.response?.data?.message || err.message || "Failed to load sessions",
      );
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    setIsDeletingSession(sessionId);
    try {
      await authService.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      toast.success("Session logged out successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to logout session");
    } finally {
      setIsDeletingSession(null);
    }
  };

  const handleDeleteAllSessions = async () => {
    setIsDeletingAll(true);
    try {
      await authService.deleteAllOtherSessions();
      // Keep only the current session
      setSessions((prev) => prev.filter((s) => s.currentOne));
      toast.success("All other sessions logged out");
      setShowDeleteAllModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to logout sessions");
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Get device icon based on user agent
  const getDeviceIcon = (agent) => {
    if (!agent) return Monitor;
    // Handle agent object structure
    if (typeof agent === "object") {
      const deviceType = agent.deviceType?.toLowerCase();
      if (deviceType === "mobile" || deviceType === "tablet") return Smartphone;
      return Monitor;
    }
    // Handle string agent (legacy)
    if (typeof agent === "string") {
      const agentLower = agent.toLowerCase();
      if (
        agentLower.includes("mobile") ||
        agentLower.includes("android") ||
        agentLower.includes("iphone")
      ) {
        return Smartphone;
      }
    }
    return Monitor;
  };

  // Get agent display string
  const getAgentDisplay = (agent) => {
    if (!agent) return "Unknown Device";
    // Handle agent object structure: { browserName, browserVersion, os, osVersion, deviceType, vendor }
    if (typeof agent === "object") {
      const parts = [];
      if (agent.browserName) {
        parts.push(
          agent.browserVersion
            ? `${agent.browserName} ${agent.browserVersion}`
            : agent.browserName,
        );
      }
      if (agent.os) {
        parts.push(
          agent.osVersion ? `${agent.os} ${agent.osVersion}` : agent.os,
        );
      }
      if (parts.length > 0) {
        return parts.join(" on ");
      }
      // Fallback to deviceType or vendor
      return agent.deviceType || agent.vendor || "Unknown Device";
    }
    if (typeof agent === "string") return agent;
    return String(agent);
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  // Safely filter sessions
  const otherSessions = Array.isArray(sessions)
    ? sessions.filter((s) => !s.currentOne)
    : [];
  const currentSession = Array.isArray(sessions)
    ? sessions.find((s) => s.currentOne)
    : null;

  if (isLoading) {
    return (
      <div className="card p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Failed to load sessions</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {loadError}
        </p>
        <button onClick={fetchSessions} className="btn-secondary text-sm">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-600" />
              Active Sessions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Manage your active sessions across all devices. You can logout
              from any session except the current one.
            </p>
          </div>
          {otherSessions.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="btn-danger text-sm flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout All Others
            </button>
          )}
        </div>
      </div>

      {/* Current Session */}
      {currentSession &&
        (() => {
          const DeviceIcon = getDeviceIcon(currentSession.agent);
          return (
            <div
              key={currentSession.sessionId}
              className="card p-6 border-2 border-primary-500 dark:border-primary-600"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <DeviceIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {getAgentDisplay(currentSession.agent)}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                      This Device
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {(currentSession.city || currentSession.country) && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {[currentSession.city, currentSession.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                    {currentSession.lastActiveIp && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        <span>{currentSession.lastActiveIp}</span>
                      </div>
                    )}
                    {currentSession.loginAt && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>
                          Logged in {formatRelativeTime(currentSession.loginAt)}
                        </span>
                      </div>
                    )}
                    {currentSession.expiresAt && (
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4 flex-shrink-0" />
                        <span>Expires in {currentSession.expiresAt}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Other Sessions */}
      {otherSessions.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Other Sessions ({otherSessions.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {otherSessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.agent);
              return (
                <div
                  key={session.sessionId}
                  className="p-6 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <DeviceIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {getAgentDisplay(session.agent)}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {(session.city || session.country) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {[session.city, session.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                      {session.lastActiveIp && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          {session.lastActiveIp}
                        </span>
                      )}
                      {session.lastActiveAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Active {formatRelativeTime(session.lastActiveAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSession(session.sessionId)}
                    disabled={isDeletingSession === session.sessionId}
                    className="btn-secondary text-sm flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    {isDeletingSession === session.sessionId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    Logout
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Other Sessions */}
      {otherSessions.length === 0 && currentSession && (
        <div className="card p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            All Clear!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            You only have one active session (this device).
          </p>
        </div>
      )}

      {/* Delete All Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Logout All Other Sessions?
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              This will log you out from all other devices (
              {otherSessions.length} session
              {otherSessions.length > 1 ? "s" : ""}). You will remain logged in
              on this device.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllSessions}
                disabled={isDeletingAll}
                className="btn-danger flex-1 flex items-center justify-center gap-2"
              >
                {isDeletingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Logout All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Payment Methods Section
function PaymentMethodsSection() {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Payment Methods
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
        Manage your saved payment methods for faster checkout.
      </p>
      <PaymentMethodList
        showAddButton={true}
        emptyMessage="No payment methods saved. Add a card to make payments easier."
      />
    </div>
  );
}

// Danger Zone Section
function DangerSection({ user, projectCodename }) {
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveConfirmText, setArchiveConfirmText] = useState("");
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchiveAccount = async () => {
    if (archiveConfirmText !== "ARCHIVE MY ACCOUNT") {
      toast.error('Please type "ARCHIVE MY ACCOUNT" to confirm');
      return;
    }

    setIsArchiving(true);
    try {
      await authService.archiveProfile();
      toast.success(
        "Account archived. You can restore it by logging in within 1 month.",
      );
      localStorage.removeItem(`${projectCodename}-auth-storage`);
      window.location.href = "/panel/login";
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to archive account");
    } finally {
      setIsArchiving(false);
      setShowArchiveModal(false);
    }
  };

  return (
    <div className="card p-6 border-red-200 dark:border-red-900">
      <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
        Danger Zone
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        Archive your account to temporarily disable it. Your data will be kept
        for 1 month, during which you can restore your account by logging in.
        After 1 month, your account and all associated data will be permanently
        deleted.
      </p>
      <button
        onClick={() => setShowArchiveModal(true)}
        className="btn-danger flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Archive Account
      </button>

      {/* Archive Confirmation Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Archive Your Account?
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This will archive your account. You have 1 month to restore it
                by logging in. After that, your account and all data will be
                permanently deleted.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type <strong>ARCHIVE MY ACCOUNT</strong> to confirm
                </label>
                <input
                  type="text"
                  value={archiveConfirmText}
                  onChange={(e) => setArchiveConfirmText(e.target.value)}
                  className="input"
                  placeholder="ARCHIVE MY ACCOUNT"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowArchiveModal(false);
                    setArchiveConfirmText("");
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchiveAccount}
                  disabled={
                    isArchiving || archiveConfirmText !== "ARCHIVE MY ACCOUNT"
                  }
                  className="btn-danger flex-1 flex items-center justify-center gap-2"
                >
                  {isArchiving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Archiving...
                    </>
                  ) : (
                    "Archive Account"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
