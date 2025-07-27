import { useEffect, useState } from "react";
import { useCamera } from "../hooks/useCamera";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Download,
  RotateCcw,
  Square,
  X,
} from "lucide-react";

export const FullScreenCamera: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const {
    videoRef,
    isActive,
    isInitializing,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
  } = useCamera();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  useEffect(() => {
    startCamera(facingMode);
    return () => stopCamera();
  }, []);

  const handleCapture = () => {
    const photo = capturePhoto();
    if (photo) {
      setCapturedImage(photo);
    }
  };

  const handleDownload = () => {
    if (capturedImage) {
      const link = document.createElement("a");
      link.href = capturedImage;
      link.download = `photo_${new Date().getTime()}.jpg`;
      link.click();
    }
  };

  const handleRetake = async () => {
    setCapturedImage(null);
    // Properly stop the camera first, then restart it
    stopCamera();
    // Add a delay to ensure camera is properly stopped before starting new one
    await new Promise((resolve) => setTimeout(resolve, 300));
    await startCamera(facingMode);
  };

  const toggleCamera = async () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacingMode);
    stopCamera();
    // Add a delay to ensure camera is properly stopped before starting new one
    await new Promise((resolve) => setTimeout(resolve, 500));
    await startCamera(newFacingMode);
  };

  const retryCamera = () => {
    startCamera(facingMode);
  };

  // Photo preview screen
  if (capturedImage) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="p-2 bg-black/40 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-white font-semibold text-lg">Photo Preview</h1>
            <div className="w-[44px]" />
          </div>
        </div>

        {/* Image container - Constrained to leave space for buttons */}
        <div
          className="flex-1 flex items-center justify-center p-4"
          style={{ maxHeight: "calc(100vh - 160px)" }}
        >
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Action buttons */}
        <div className="flex-shrink-0 h-24 p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent flex items-center justify-center">
          <div className="flex gap-6 items-center justify-center">
            <button
              onClick={handleRetake}
              className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors touch-manipulation min-w-[56px] min-h-[56px] flex items-center justify-center"
              title="Take Another"
            >
              <Camera className="w-6 h-6" />
            </button>
            <button
              onClick={handleDownload}
              className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors touch-manipulation min-w-[56px] min-h-[56px] flex items-center justify-center"
              title="Download Photo"
            >
              <Download className="w-6 h-6" />
            </button>
            <button
              onClick={onBack}
              className="p-4 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors touch-manipulation min-w-[56px] min-h-[56px] flex items-center justify-center"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Camera screen
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col min-h-screen">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 h-16 p-4 bg-gradient-to-b from-black/60 to-transparent relative z-20 flex items-center">
        <div className="flex items-center justify-between w-full">
          <button
            onClick={onBack}
            className="p-2 bg-black/40 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white font-semibold text-lg">Camera</h1>
          <div className="w-[44px]" />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute top-20 left-4 right-4 z-30">
          <div className="flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Video container - Constrained height to leave space for controls */}
      <div
        className="relative flex-1 min-h-0"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Loading overlay */}
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-400 text-lg">Initializing camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Camera controls - Fixed at bottom with guaranteed space */}
      <div className="flex-shrink-0 h-32 p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent relative z-20 flex items-center justify-center">
        {error ? (
          // Error state - show retry button
          <button
            onClick={retryCamera}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full font-medium transition-colors touch-manipulation text-lg"
          >
            Retry Camera
          </button>
        ) : isInitializing ? (
          // Initializing state - show loading message
          <div className="flex items-center justify-center gap-2 text-white">
            <Camera className="w-5 h-5 animate-pulse flex-shrink-0" />
            <span className="text-sm">Setting up camera...</span>
          </div>
        ) : (
          // Active state - show camera controls
          <div className="flex items-center justify-center gap-8 w-full">
            <button
              onClick={toggleCamera}
              disabled={isInitializing || !isActive}
              className="p-4 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-w-[64px] min-h-[64px] flex items-center justify-center"
            >
              <RotateCcw className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={handleCapture}
              disabled={!isActive || isInitializing}
              className="p-6 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg touch-manipulation min-w-[80px] min-h-[80px] flex items-center justify-center"
            >
              <Square className="w-8 h-8 text-gray-800" />
            </button>

            {/* Spacer for symmetry */}
            <div className="w-[64px]" />
          </div>
        )}
      </div>
    </div>
  );
};
