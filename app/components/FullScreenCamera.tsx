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

  const toggleCamera = async () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacingMode);
    if (isActive || isInitializing) {
      stopCamera();
      // Add a small delay to ensure camera is properly stopped
      setTimeout(() => startCamera(newFacingMode), 200);
    } else {
      startCamera(newFacingMode);
    }
  };

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

        {/* Image container - takes remaining space minus button area */}
        <div className="flex-1 flex items-center justify-center p-4 pb-0">
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Fixed button container at bottom */}
        <div className="flex-shrink-0 p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-full font-medium transition-colors text-base min-h-[56px] touch-manipulation"
            >
              <Download className="w-5 h-5 flex-shrink-0" />
              <span>Download Photo</span>
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setCapturedImage(null)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-full font-medium transition-colors text-sm min-h-[48px] touch-manipulation"
              >
                <Camera className="w-4 h-4 flex-shrink-0" />
                <span>Take Another</span>
              </button>
              <button
                onClick={onBack}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-full font-medium transition-colors text-sm min-h-[48px] touch-manipulation"
              >
                <X className="w-4 h-4 flex-shrink-0" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-gradient-to-b from-black/60 to-transparent relative z-20">
        <div className="flex items-center justify-between">
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

      {/* Video container - takes remaining space minus controls */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Loading overlay - only show when initializing */}
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-400 text-lg">Initializing camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed controls at bottom - Show when camera is ready OR when there's an error */}
      <div className="flex-shrink-0 p-6 bg-gradient-to-t from-black/80 via-black/60 to-transparent relative z-20">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={toggleCamera}
            disabled={isInitializing}
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

          {/* Retry button when there's an error */}
          {error && !isInitializing ? (
            <button
              onClick={() => startCamera(facingMode)}
              className="p-4 bg-blue-500/80 rounded-full backdrop-blur-sm hover:bg-blue-600/80 transition-colors touch-manipulation min-w-[64px] min-h-[64px] flex items-center justify-center"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          ) : (
            /* Spacer to balance the layout */
            <div className="w-[64px]" />
          )}
        </div>
      </div>
    </div>
  );
};
