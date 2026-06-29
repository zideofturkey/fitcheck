import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { Camera, Loader2, X, ZoomIn, ZoomOut, Check } from "lucide-react";
import { authService } from "../../services/authService";

/**
 * AvatarUpload - Avatar upload component with crop functionality
 * Uses react-easy-crop for zoom, pan, and crop.
 * Uploads to the auth service's database bucket (no external bucket service needed).
 */
export default function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  bucketName = "userAvatars",
}) {
  const fileInputRef = useRef(null);

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [error, setError] = useState("");

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCropper(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const createCroppedImage = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return null;

    const image = new Image();
    image.src = imageSrc;

    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size to cropped area
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    // Draw cropped image
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
    );

    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.9,
      );
    });
  }, [imageSrc, croppedAreaPixels]);

  const handleUpload = async () => {
    try {
      setUploading(true);
      setError("");

      const croppedBlob = await createCroppedImage();
      if (!croppedBlob) {
        setError("Failed to process image");
        return;
      }

      // Create file from blob
      const file = new File([croppedBlob], "avatar.jpg", {
        type: "image/jpeg",
      });

      // Upload to auth service database bucket (uses access token via interceptor)
      const downloadUrl = await authService.uploadAvatar(bucketName, file);
      onAvatarChange(downloadUrl);
      setShowCropper(false);
      setImageSrc(null);
    } catch (err) {
      console.error("Avatar upload error:", err);
      setError(err.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setShowCropper(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = () => {
    onAvatarChange("");
  };

  return (
    <div className="flex flex-col items-center">
      {/* Current Avatar or Placeholder */}
      {!showCropper && (
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-600">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-8 h-8 text-gray-400" />
            )}
          </div>

          {/* Overlay on hover */}
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-white p-2 hover:bg-white/20 rounded-full"
            >
              <Camera className="w-5 h-5" />
            </button>
            {currentAvatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-white p-2 hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload button when no avatar */}
      {!showCropper && !currentAvatar && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Upload Photo
        </button>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
          {/* Cropper Area */}
          <div className="flex-1 relative">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          {/* Controls */}
          <div className="bg-gray-900 p-4 space-y-4">
            {/* Zoom slider */}
            <div className="flex items-center gap-4 max-w-md mx-auto">
              <ZoomOut className="w-5 h-5 text-gray-400" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-primary-600"
              />
              <ZoomIn className="w-5 h-5 text-gray-400" />
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Apply
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
