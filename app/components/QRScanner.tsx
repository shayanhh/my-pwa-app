import { useEffect } from "react";
import { useQRScanner } from "../hooks/useQRScanner";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Copy,
  ExternalLink,
  Loader2,
  QrCode,
  X,
} from "lucide-react";

export const FullScreenQRScanner: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const {
    videoRef,
    isScanning,
    result,
    error,
    startScanning,
    stopScanning,
    clearResult,
  } = useQRScanner();

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, [startScanning, stopScanning]);

  const copyToClipboard = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
        // Better user feedback
        const button = document.activeElement as HTMLButtonElement;
        if (button) {
          const originalText = button.innerHTML;
          button.innerHTML =
            '<span class="flex items-center justify-center gap-2"><svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Copied!</span></span>';
          setTimeout(() => {
            if (button.innerHTML.includes("Copied!")) {
              button.innerHTML = originalText;
            }
          }, 2000);
        }
      } catch (err) {
        console.error("Failed to copy:", err);
        alert("Failed to copy to clipboard");
      }
    }
  };

  const openLink = () => {
    if (result) {
      try {
        const url = result.startsWith("http") ? result : `https://${result}`;
        window.open(url, "_blank");
      } catch (err) {
        console.error("Invalid URL:", err);
        alert("Invalid URL format");
      }
    }
  };

  const isUrl = (text: string): boolean => {
    try {
      return (
        text.includes(".") &&
        (text.startsWith("http") ||
          text.includes("www.") ||
          text.includes(".com") ||
          text.includes(".org") ||
          text.includes(".net") ||
          text.includes(".io") ||
          text.includes(".co"))
      );
    } catch {
      return false;
    }
  };

  if (result) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="p-2 bg-black/40 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-white font-semibold">QR Code Result</h1>
            <div className="w-[44px]" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <h3 className="font-semibold text-green-800">
                Scanned Successfully!
              </h3>
            </div>

            <div className="bg-gray-100 p-3 sm:p-4 rounded-xl max-h-32 overflow-y-auto">
              <p className="text-xs sm:text-sm text-gray-700 break-all font-mono">
                {result}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-medium transition-colors touch-manipulation min-h-[48px]"
              >
                <Copy className="w-4 h-4 flex-shrink-0" />
                <span>Copy</span>
              </button>
              {isUrl(result) && (
                <button
                  onClick={openLink}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-xl font-medium transition-colors touch-manipulation min-h-[48px]"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span>Open</span>
                </button>
              )}
            </div>

            <button
              onClick={() => {
                clearResult();
                startScanning();
              }}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-medium transition-colors touch-manipulation min-h-[48px]"
            >
              <QrCode className="w-5 h-5 flex-shrink-0" />
              <span>Scan Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 bg-black/40 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white font-semibold">QR Scanner</h1>
          <div className="w-[44px]" />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute top-16 left-4 right-4 z-10">
          <div className="flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Video */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Scanner overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Dark overlay with cutout effect */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              {/* Cutout for scanner area */}
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-64 sm:h-64"
                style={{
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                }}
              ></div>
            </div>

            {/* Scanner frame */}
            <div className="relative z-10">
              <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-emerald-400 relative rounded-2xl bg-transparent">
                {/* Corner indicators */}
                <div className="absolute -top-1 -left-1 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

                {/* Scanning line animation */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse"></div>

                {/* Additional scanning effect */}
                <div className="absolute inset-2 border border-emerald-300 rounded-xl opacity-30 animate-pulse"></div>
              </div>

              {/* Instruction text */}
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
                <p className="text-white text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                  Position QR code within the frame
                </p>
              </div>
            </div>
          </div>
        )}

        {!isScanning && !result && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="text-center">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Initializing scanner...</p>
            </div>
          </div>
        )}
      </div>

      {/* Status indicator */}
      {isScanning && (
        <div className="absolute bottom-8 sm:bottom-20 left-0 right-0 flex justify-center px-4">
          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full">
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            <span className="text-sm">Scanning for QR codes...</span>
          </div>
        </div>
      )}

      {/* Manual stop button (optional) */}
      {isScanning && (
        <div className="absolute bottom-20 sm:bottom-32 right-4">
          <button
            onClick={stopScanning}
            className="bg-red-500/80 hover:bg-red-600/80 text-white p-3 rounded-full backdrop-blur-sm transition-colors touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
