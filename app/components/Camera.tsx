import React, { useState } from "react";
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
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Camera</h2>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div
          className="relative bg-black rounded-lg overflow-hidden"
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
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <p className="text-white text-sm">Camera not active</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {!isActive ? (
            <button
              onClick={() => startCamera(facingMode)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Start Camera
            </button>
          ) : (
            <>
              <button
                onClick={stopCamera}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Stop Camera
              </button>
              <button
                onClick={handleCapture}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Capture
              </button>
              <button
                onClick={toggleCamera}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Flip
              </button>
            </>
          )}
        </div>

        {capturedImage && (
          <div className="space-y-3">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-auto"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Download
              </button>
              <button
                onClick={() => setCapturedImage(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
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
