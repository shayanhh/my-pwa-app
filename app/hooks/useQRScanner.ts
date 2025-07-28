import { useRef, useCallback, useState, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

interface QRCodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseQRScannerReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isScanning: boolean;
  result: string | null;
  error: string | null;
  qrPosition: QRCodePosition | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  clearResult: () => void;
}

export const useQRScanner = (): UseQRScannerReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scanningCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrPosition, setQrPosition] = useState<QRCodePosition | null>(null);

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

  // Function to draw QR code overlay
  const drawQROverlay = useCallback((position: QRCodePosition) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match video display size
    const rect = video.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Calculate scale factors
    const scaleX = rect.width / video.videoWidth;
    const scaleY = rect.height / video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale position to display coordinates
    const scaledPosition = {
      x: position.x * scaleX,
      y: position.y * scaleY,
      width: position.width * scaleX,
      height: position.height * scaleY,
    };

    // Draw QR code highlight
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 4;
    ctx.setLineDash([]);

    // Draw rectangle around QR code
    ctx.strokeRect(
      scaledPosition.x,
      scaledPosition.y,
      scaledPosition.width,
      scaledPosition.height
    );

    // Draw corner indicators
    const cornerSize = 20;
    ctx.lineWidth = 6;

    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(scaledPosition.x, scaledPosition.y + cornerSize);
    ctx.lineTo(scaledPosition.x, scaledPosition.y);
    ctx.lineTo(scaledPosition.x + cornerSize, scaledPosition.y);
    ctx.stroke();

    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(
      scaledPosition.x + scaledPosition.width - cornerSize,
      scaledPosition.y
    );
    ctx.lineTo(scaledPosition.x + scaledPosition.width, scaledPosition.y);
    ctx.lineTo(
      scaledPosition.x + scaledPosition.width,
      scaledPosition.y + cornerSize
    );
    ctx.stroke();

    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(
      scaledPosition.x,
      scaledPosition.y + scaledPosition.height - cornerSize
    );
    ctx.lineTo(scaledPosition.x, scaledPosition.y + scaledPosition.height);
    ctx.lineTo(
      scaledPosition.x + cornerSize,
      scaledPosition.y + scaledPosition.height
    );
    ctx.stroke();

    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(
      scaledPosition.x + scaledPosition.width - cornerSize,
      scaledPosition.y + scaledPosition.height
    );
    ctx.lineTo(
      scaledPosition.x + scaledPosition.width,
      scaledPosition.y + scaledPosition.height
    );
    ctx.lineTo(
      scaledPosition.x + scaledPosition.width,
      scaledPosition.y + scaledPosition.height - cornerSize
    );
    ctx.stroke();
  }, []);

  // Continuous scanning function using canvas to image conversion
  const scanFrame = useCallback(async () => {
    if (
      !isScanning ||
      !codeReader.current ||
      !videoRef.current ||
      !canvasRef.current
    ) {
      return;
    }

    const video = videoRef.current;

    // Create a temporary canvas to capture video frame
    if (!scanningCanvasRef.current) {
      scanningCanvasRef.current = document.createElement("canvas");
    }

    const tempCanvas = scanningCanvasRef.current;
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx || video.videoWidth === 0 || video.videoHeight === 0) {
      // Continue scanning if video not ready
      if (isScanning) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
      return;
    }

    // Set canvas size to video dimensions
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;

    // Draw current video frame to canvas
    tempCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    try {
      // Convert canvas to data URL and create image element
      const dataUrl = tempCanvas.toDataURL("image/png");
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = dataUrl;
      });

      // Try to decode QR code from image
      const result = await codeReader.current.decodeFromImage(img);

      if (result) {
        // Extract QR code position from result points
        const resultPoints = result.getResultPoints();
        if (resultPoints && resultPoints.length >= 2) {
          const points = Array.from(resultPoints);
          const minX = Math.min(
            ...points.map((p: { getX(): number }) => p.getX())
          );
          const maxX = Math.max(
            ...points.map((p: { getX(): number }) => p.getX())
          );
          const minY = Math.min(
            ...points.map((p: { getY(): number }) => p.getY())
          );
          const maxY = Math.max(
            ...points.map((p: { getY(): number }) => p.getY())
          );

          const position: QRCodePosition = {
            x: Math.max(0, minX - 20),
            y: Math.max(0, minY - 20),
            width: maxX - minX + 40,
            height: maxY - minY + 40,
          };

          setQrPosition(position);
          drawQROverlay(position);

          // Set result after a brief delay to show the highlight
          setTimeout(() => {
            setResult(result.getText());
            setIsScanning(false);
          }, 500);

          return;
        } else {
          setResult(result.getText());
          setIsScanning(false);
          return;
        }
      }
    } catch (err) {
      // NotFoundException is expected when no QR code is found
      if (err instanceof Error && err.name !== "NotFoundException") {
        console.error("QR Scanner error:", err);
      }
    }

    // Clear any previous overlay if no QR code found
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setQrPosition(null);

    // Continue scanning
    if (isScanning) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
  }, [isScanning, drawQROverlay]);

  useEffect(() => {
    initializeCodeReader();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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
      // Clean up temporary canvas
      if (scanningCanvasRef.current) {
        scanningCanvasRef.current = null;
      }
    };
  }, [initializeCodeReader]);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(false);
      setQrPosition(null);

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
                // Wait a bit more for video to be fully ready
                setTimeout(resolve, 100);
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

      // Start the scanning loop
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start QR scanner";
      setError(errorMessage);
      setIsScanning(false);
      console.error("QR Scanner error:", err);
    }
  }, [initializeCodeReader, scanFrame]);

  const stopScanning = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

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

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    setIsScanning(false);
    setError(null);
    setQrPosition(null);
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
    setQrPosition(null);
  }, []);

  return {
    videoRef,
    canvasRef,
    isScanning,
    result,
    error,
    qrPosition,
    startScanning,
    stopScanning,
    clearResult,
  };
};
