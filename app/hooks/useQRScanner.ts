import { useCallback, useRef, useState } from "react";

export const useQRScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setResult(null);

      if (typeof window === "undefined") {
        throw new Error("QR Scanner is only available in browser environment");
      }

      if (
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        throw new Error("Camera access is not supported by this browser");
      }

      if (!videoRef.current) {
        throw new Error("Video element not available");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      setIsScanning(true);

      // Simulate QR scanning - in real implementation, you'd use a QR library here
      // For demo purposes, we'll just show the scanning interface
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start QR scanner";
      setError(errorMessage);
      setIsScanning(false);
      console.error("QR Scanner error:", err);
    }
  }, []);

  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    videoRef,
    isScanning,
    result,
    error,
    startScanning,
    stopScanning,
    clearResult,
  };
};
