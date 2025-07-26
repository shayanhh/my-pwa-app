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
  const { videoRef, isActive, error, startCamera, stopCamera, capturePhoto } =
    useCamera();
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

  const toggleCamera = () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacingMode);
    if (isActive) {
      stopCamera();
      setTimeout(() => startCamera(newFacingMode), 100);
    }
  };

  if (capturedImage) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        <div className="p-6 bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
            <button
              onClick={() => setCapturedImage(null)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              <Camera className="w-5 h-5" />
              Take Another
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              <X className="w-5 h-5" />
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 bg-black/40 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white font-semibold">Camera</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute top-16 left-4 right-4 z-10">
          <div className="flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Video */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Initializing camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={toggleCamera}
            className="p-4 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <RotateCcw className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={handleCapture}
            disabled={!isActive}
            className="p-6 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 shadow-lg"
          >
            <Square className="w-8 h-8 text-gray-800" />
          </button>

          <div className="w-14" />
        </div>
      </div>
    </div>
  );
};
