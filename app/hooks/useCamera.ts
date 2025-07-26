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
        setIsActive(false);

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

        // Stop any existing stream first
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Clear video source
        if (videoRef.current.srcObject) {
          videoRef.current.srcObject = null;
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

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Wait for video to be ready
          await new Promise<void>((resolve, reject) => {
            const video = videoRef.current!;

            const handleCanPlay = () => {
              video.removeEventListener("canplay", handleCanPlay);
              video.removeEventListener("error", handleError);
              video.removeEventListener("loadedmetadata", handleLoadedMetadata);

              video
                .play()
                .then(() => {
                  // Double-check that video is actually playing
                  if (video.videoWidth > 0 && video.videoHeight > 0) {
                    resolve();
                  } else {
                    reject(new Error("Video dimensions not available"));
                  }
                })
                .catch(reject);
            };

            const handleLoadedMetadata = () => {
              if (video.readyState >= 2) {
                // HAVE_CURRENT_DATA
                handleCanPlay();
              }
            };

            const handleError = () => {
              video.removeEventListener("canplay", handleCanPlay);
              video.removeEventListener("error", handleError);
              video.removeEventListener("loadedmetadata", handleLoadedMetadata);
              reject(new Error("Video failed to load"));
            };

            video.addEventListener("canplay", handleCanPlay);
            video.addEventListener("loadedmetadata", handleLoadedMetadata);
            video.addEventListener("error", handleError);

            // Trigger play immediately if video is already ready
            if (video.readyState >= 2) {
              handleCanPlay();
            }
          });
        }

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
      videoRef.current.pause();
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
    isInitializing,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
  };
};
