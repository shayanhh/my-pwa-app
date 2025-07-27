"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallPromptProps {
  onDismiss?: () => void;
}

export function InstallPrompt({ onDismiss }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if app is already installed
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      interface NavigatorStandalone extends Navigator {
        standalone?: boolean;
      }
      const isInWebAppiOS =
        (window.navigator as NavigatorStandalone).standalone === true;

      if (!isStandalone && !isInWebAppiOS) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Clean up the event listener
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }

      // Clear the deferredPrompt so it can only be used once
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error("Error during installation:", error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onDismiss?.();
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top duration-300">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-xl flex-shrink-0">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm mb-1">
                Install CamQR on your phone
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-3">
                Get quick access to camera and QR scanner. Install for the best
                experience!
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {isInstalling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Install
                    </>
                  )}
                </button>

                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
