import { useRef, useCallback, useState, useEffect } from "react";
import { BrowserMultiFormatReader, Result } from "@zxing/library";

interface ScannedQR {
  text: string;
  timestamp: number;
  id: string;
}

interface UseQRScannerReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isScanning: boolean;
  result: string | null;
  scannedHistory: ScannedQR[];
  error: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  clearResult: () => void;
  clearHistory: () => void;
  getLatestUniqueResult: () => string | null;
}

export const useQRScanner = (): UseQRScannerReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannedQRsRef = useRef<Set<string>>(new Set());
  const lastScanTimeRef = useRef<number>(0);

  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [scannedHistory, setScannedHistory] = useState<ScannedQR[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Debounce time to prevent rapid re-scanning (in milliseconds)
  const SCAN_DEBOUNCE_TIME = 2000;

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

  const addScannedQR = useCallback((qrText: string) => {
    const now = Date.now();

    // Check if we've scanned this QR recently (within debounce time)
    if (scannedQRsRef.current.has(qrText)) {
      return false; // Already scanned, don't add again
    }

    // Check debounce time to prevent too rapid scanning
    if (now - lastScanTimeRef.current < SCAN_DEBOUNCE_TIME) {
      return false;
    }

    // Add to scanned set and history
    scannedQRsRef.current.add(qrText);
    lastScanTimeRef.current = now;

    const newScannedQR: ScannedQR = {
      text: qrText,
      timestamp: now,
      id: `qr_${now}_${Math.random().toString(36).substr(2, 9)}`,
    };

    setScannedHistory((prev) => [...prev, newScannedQR]);
    setResult(qrText);

    return true; // Successfully added new QR
  }, []);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(false);

      if (typeof window === "undefined") {
        throw new Error("QR Scanner is only available in browser environment");
      }

      if (
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        throw new Error("Camera access is not supported by this browser");
      }

      // Always ensure we have a fresh code reader instance
      if (!codeReader.current) {
        console.log("Initializing new code reader");
        initializeCodeReader();
      }

      if (!codeReader.current || !videoRef.current) {
        throw new Error("Scanner not initialized");
      }

      // Reset any previous scanning state
      try {
        codeReader.current.reset();
      } catch (err) {
        console.warn("Error resetting code reader:", err);
        // If reset fails, create a new instance
        codeReader.current = new BrowserMultiFormatReader();
      }

      // Stop any existing stream
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

      // Wait for video to be ready
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

      // Start decoding from video stream
      codeReader.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result: Result | null, error: unknown | undefined) => {
          if (result) {
            const qrText = result.getText();
            const wasAdded = addScannedQR(qrText);

            if (wasAdded) {
              console.log(`New QR code scanned: ${qrText}`);
            } else {
              console.log(`QR code already scanned or debounced: ${qrText}`);
            }
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
  }, [initializeCodeReader, addScannedQR]);

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

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    scannedQRsRef.current.clear();
    setScannedHistory([]);
    setResult(null);
    setError(null);
    lastScanTimeRef.current = 0;
  }, []);

  const getLatestUniqueResult = useCallback(() => {
    if (scannedHistory.length === 0) return null;
    return scannedHistory[scannedHistory.length - 1].text;
  }, [scannedHistory]);

  return {
    videoRef,
    isScanning,
    result,
    scannedHistory,
    error,
    startScanning,
    stopScanning,
    clearResult,
    clearHistory,
    getLatestUniqueResult,
  };
};
