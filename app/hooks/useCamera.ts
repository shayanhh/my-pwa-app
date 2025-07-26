import { useRef, useCallback, useState, useEffect } from "react";

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  error: string | null;
  startCamera: (facingMode?: "user" | "environment") => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => string | null;
  debugInfo: {
    isSecureContext: boolean;
    hasNavigator: boolean;
    hasMediaDevices: boolean;
    hasGetUserMedia: boolean;
    userAgent: string;
    protocol: string;
    hostname: string;
  };
}

export const useCamera = (): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState({
    isSecureContext: false,
    hasNavigator: false,
    hasMediaDevices: false,
    hasGetUserMedia: false,
    userAgent: "",
    protocol: "",
    hostname: "",
  });

  // Create canvas element if it doesn't exist
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }

    // Collect debug info
    if (typeof window !== "undefined") {
      setDebugInfo({
        isSecureContext: window.isSecureContext || false,
        hasNavigator: typeof navigator !== "undefined",
        hasMediaDevices:
          typeof navigator !== "undefined" && !!navigator.mediaDevices,
        hasGetUserMedia:
          typeof navigator !== "undefined" &&
          !!navigator.mediaDevices &&
          typeof navigator.mediaDevices.getUserMedia === "function",
        userAgent: navigator?.userAgent || "Unknown",
        protocol: window.location?.protocol || "Unknown",
        hostname: window.location?.hostname || "Unknown",
      });
    }
  }, []);

  const startCamera = useCallback(
    async (facingMode: "user" | "environment" = "environment") => {
      try {
        setError(null);

        // Enhanced environment checks with detailed error messages
        if (typeof window === "undefined") {
          throw new Error(
            "Camera access is only available in browser environment"
          );
        }

        if (typeof navigator === "undefined") {
          throw new Error("Navigator API is not available");
        }

        if (!navigator.mediaDevices) {
          throw new Error(
            "MediaDevices API is not available. This might be due to an insecure context (HTTP instead of HTTPS)"
          );
        }

        if (typeof navigator.mediaDevices.getUserMedia !== "function") {
          throw new Error("getUserMedia is not supported by this browser");
        }

        // Check secure context (HTTPS requirement)
        if (!window.isSecureContext) {
          throw new Error(
            "Camera access requires a secure context (HTTPS). Current protocol: " +
              window.location.protocol
          );
        }

        if (!videoRef.current) {
          throw new Error("Video element not available");
        }

        // Stop existing stream if any
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        console.log("Requesting camera with constraints:", {
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log("Video metadata loaded successfully");
              resolve();
            };
            videoRef.current.onerror = (err) => {
              console.error("Video error:", err);
              reject(new Error("Failed to load video stream"));
            };
            // Timeout after 10 seconds
            setTimeout(() => reject(new Error("Video loading timeout")), 10000);
          } else {
            reject(new Error("Video element not available"));
          }
        });

        setIsActive(true);
        console.log("Camera started successfully");
      } catch (err) {
        let errorMessage = "Failed to start camera";

        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (err && typeof err === "object" && "name" in err) {
          const domError = err as DOMException;
          switch (domError.name) {
            case "NotAllowedError":
              errorMessage =
                "Camera access denied. Please allow camera permissions and try again.";
              break;
            case "NotFoundError":
              errorMessage = "No camera found on this device.";
              break;
            case "NotReadableError":
              errorMessage = "Camera is already in use by another application.";
              break;
            case "OverconstrainedError":
              errorMessage =
                "Camera constraints not supported. Trying basic settings...";
              // Try again with basic constraints
              try {
                const basicStream = await navigator.mediaDevices.getUserMedia({
                  video: true,
                });
                streamRef.current = basicStream;
                if (videoRef.current) {
                  videoRef.current.srcObject = basicStream;
                  setIsActive(true);
                  return;
                }
              } catch (basicErr) {
                errorMessage =
                  "Camera constraints not supported and basic camera access failed.";
              }
              break;
            case "SecurityError":
              errorMessage =
                "Camera access blocked due to security restrictions. Ensure you're on HTTPS.";
              break;
            default:
              errorMessage = `Camera error: ${domError.name} - ${domError.message}`;
          }
        }

        setError(errorMessage);
        setIsActive(false);
        console.error("Camera error:", err);
      }
    },
    []
  );

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setError(null);
  }, []);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current || !isActive) {
      setError("Camera is not active");
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      setError("Canvas context not available");
      return null;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 image
    try {
      return canvas.toDataURL("image/jpeg", 0.8);
    } catch (err) {
      setError("Failed to capture photo");
      console.error("Capture error:", err);
      return null;
    }
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    isActive,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    debugInfo,
  };
};
