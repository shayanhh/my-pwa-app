import { useRef, useCallback, useState, useEffect } from "react";
import { BrowserMultiFormatReader, Result } from "@zxing/library";

interface QRResult {
  text: string;
  timestamp: number;
  id: string;
}

interface UseQRScannerReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isScanning: boolean;
  results: QRResult[];
  error: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  clearResults: () => void;
  selectResult: (result: QRResult) => void;
  selectedResult: QRResult | null;
}

export const useQRScanner = (): UseQRScannerReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectedCodes = useRef<Set<string>>(new Set());

  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<QRResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<QRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initializeCodeReader = useCallback(() => {
    if (
      !codeReader.current &&
      typeof window !== "undefined" &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function"
    ) {
      codeReader.current = new BrowserMultiFormatReader();
    }
  }, []);

  useEffect(() => {
    initializeCodeReader();

    return () => {
      if (codeReader.current) {
        try {
          codeReader.current.reset();
        } catch (err) {
          console.warn("Error resetting code reader on cleanup:", err);
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [initializeCodeReader]);

  const addResult = useCallback((text: string) => {
    // Avoid duplicates by checking if we've already detected this code recently
    if (!detectedCodes.current.has(text)) {
      detectedCodes.current.add(text);
      const newResult: QRResult = {
        text,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9),
      };

      setResults((prev) => {
        // Keep only the most recent 5 results to avoid memory buildup
        const updated = [newResult, ...prev].slice(0, 5);
        return updated;
      });

      // Auto-select first result if none selected
      setSelectedResult((prev) => prev || newResult);

      // Remove from detected set after 3 seconds to allow re-detection
      setTimeout(() => {
        detectedCodes.current.delete(text);
      }, 3000);
    }
  }, []);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(false);
      detectedCodes.current.clear();

      if (typeof window === "undefined") {
        throw new Error("QR Scanner is only available in browser environment");
      }

      if (
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        throw new Error("Camera access is not supported by this browser");
      }

      if (!codeReader.current) {
        initializeCodeReader();
      }

      if (!codeReader.current || !videoRef.current) {
        throw new Error("Scanner not initialized");
      }

      try {
        codeReader.current.reset();
      } catch (err) {
        console.warn("Error resetting code reader:", err);
        codeReader.current = new BrowserMultiFormatReader();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

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

      await new Promise<void>((resolve, reject) => {
        if (videoRef.current) {
          const handleLoadedMetadata = () => {
            videoRef.current
              ?.play()
              .then(() => {
                resolve();
              })
              .catch(reject);
          };

          videoRef.current.onloadedmetadata = handleLoadedMetadata;
          videoRef.current.onerror = () =>
            reject(new Error("Video loading failed"));
        } else {
          reject(new Error("Video element not available"));
        }
      });

      setIsScanning(true);

      codeReader.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result: Result | null, error: unknown | undefined) => {
          if (result) {
            addResult(result.getText());
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
  }, [initializeCodeReader, addResult]);

  const stopScanning = useCallback(() => {
    if (codeReader.current) {
      try {
        codeReader.current.reset();
      } catch (err) {
        console.warn("Error resetting code reader:", err);
      }
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

  const clearResults = useCallback(() => {
    setResults([]);
    setSelectedResult(null);
    setError(null);
    detectedCodes.current.clear();
  }, []);

  const selectResult = useCallback((result: QRResult) => {
    setSelectedResult(result);
  }, []);

  return {
    videoRef,
    isScanning,
    results,
    selectedResult,
    error,
    startScanning,
    stopScanning,
    clearResults,
    selectResult,
  };
};
