import { useRef, useCallback, useState, useEffect } from "react";
import { BrowserMultiFormatReader, Result } from "@zxing/library";

interface UseQRScannerReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isScanning: boolean;
  result: string | null;
  error: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  clearResult: () => void;
}

export const useQRScanner = (): UseQRScannerReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize code reader only in browser environment
    if (
      typeof window !== "undefined" &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function"
    ) {
      codeReader.current = new BrowserMultiFormatReader();
    }

    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setResult(null);

      // Check environment support first
      if (typeof window === "undefined") {
        throw new Error("QR Scanner is only available in browser environment");
      }

      if (
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        throw new Error("Camera access is not supported by this browser");
      }

      if (!codeReader.current || !videoRef.current) {
        throw new Error("Scanner not initialized");
      }

      // Check if we're on HTTPS or localhost
      if (
        typeof location !== "undefined" &&
        location.protocol !== "https:" &&
        location.hostname !== "localhost" &&
        location.hostname !== "127.0.0.1"
      ) {
        throw new Error("Camera access requires HTTPS connection");
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

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => resolve();
          videoRef.current.onerror = () =>
            reject(new Error("Video loading failed"));
        } else {
          reject(new Error("Video element not available"));
        }
      });

      setIsScanning(true);

      // Start decoding from video stream
      codeReader.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result: Result | null, error: unknown | undefined) => {
          if (result) {
            setResult(result.getText());
            // Don't automatically stop scanning in full-screen mode
            // Let the user decide when to stop
          }
          if (
            error &&
            typeof error === "object" &&
            error !== null &&
            "name" in error &&
            (error as { name?: string }).name !== "NotFoundException"
          ) {
            console.error("QR Scanner error:", error);
          }
        }
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start QR scanner";
      setError(errorMessage);
      setIsScanning(false);
      console.error("QR Scanner error:", err);
    }
  }, []);

  const stopScanning = useCallback(() => {
    if (codeReader.current) {
      codeReader.current.reset();
    }

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
