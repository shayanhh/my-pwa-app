import React, { useState } from "react";
import {
  Camera as CameraIcon,
  Square,
  RotateCcw,
  Download,
  X,
  Play,
  AlertCircle,
} from "lucide-react";
import { useCamera } from "../hooks/useCamera";

const Camera: React.FC = () => {
  const { videoRef, isActive, error, startCamera, stopCamera, capturePhoto } =
    useCamera();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

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
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    if (isActive) {
      stopCamera();
      setTimeout(
        () => startCamera(facingMode === "user" ? "environment" : "user"),
        100
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CameraIcon className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Camera</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="relative">
          <div
            className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-inner"
            style={{ aspectRatio: "16/9" }}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
            {!isActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-90">
                <div className="p-4 bg-gray-700 rounded-full mb-3">
                  <CameraIcon className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-300 text-sm font-medium">
                  Camera not active
                </p>
              </div>
            )}

            {isActive && (
              <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                <div className="flex items-center gap-3 bg-black bg-opacity-60 backdrop-blur-sm rounded-full px-4 py-2">
                  <button
                    onClick={handleCapture}
                    className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    <Square className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={toggleCamera}
                    className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                  >
                    <RotateCcw className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {!isActive ? (
            <button
              onClick={() => startCamera(facingMode)}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Play className="w-5 h-5" />
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Square className="w-5 h-5" />
              Stop Camera
            </button>
          )}
        </div>

        {capturedImage && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Photo Captured
              </span>
            </div>

            <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-auto"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => setCapturedImage(null)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Camera;
