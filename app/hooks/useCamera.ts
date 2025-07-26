import { useRef, useCallback, useState, useEffect } from "react";

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
  }, []);

  const startCamera = useCallback(
    async (facingMode: "user" | "environment" = "environment") => {
      try {
        setError(null);
        setIsInitializing(true);

        if (typeof window === "undefined") {
          throw new Error(
            "Camera access is only available in browser environment"
          );
        }

        if (!navigator?.mediaDevices?.getUserMedia) {
          throw new Error("Camera access is not supported by this browser");
        }

        if (!videoRef.current) {
          throw new Error("Video element not available");
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode,
            width: { ideal: 1920, max: 3840 },
            height: { ideal: 1080, max: 2160 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        videoRef.current.srcObject = stream;

        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve();
          }
        });

        setIsActive(true);
        setIsInitializing(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to start camera";
        setError(errorMessage);
        setIsActive(false);
        setIsInitializing(false);
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
    setIsInitializing(false);
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

    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      return canvas.toDataURL("image/jpeg", 0.8);
    } catch (err) {
      setError("Failed to capture photo");
      console.error("Capture error:", err);
      return null;
    }
  }, [isActive]);

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
    isInitializing,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
  };
};
