import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Copy,
  ExternalLink,
  Loader2,
  QrCode,
} from "lucide-react";
import { useEffect } from "react";
import { useQRScanner } from "../hooks/useQRScanner";

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
    const initScanner = async () => {
      try {
        await startScanning();
      } catch (err) {
        console.error("Failed to start scanner:", err);
      }
    };

    initScanner();

    return () => {
      stopScanning();
    };
  }, []);

  const copyToClipboard = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
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

  const handleScanAgain = async () => {
    try {
      clearResult(); // This now clears the scanned codes set too
      // Stop current scanning first
      stopScanning();
      // Add a small delay to ensure proper cleanup
      setTimeout(async () => {
        await startScanning();
      }, 300);
    } catch (err) {
      console.error("Failed to restart scanning:", err);
    }
  };

  if (result) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-shrink-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
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

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <h3 className="font-semibold text-green-800">
                Scanned Successfully!
              </h3>
            </div>

            <div className="bg-gray-100 p-4 rounded-xl max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-700 break-all font-mono">
                {result}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-medium transition-colors touch-manipulation min-h-[48px]"
              >
                <Copy className="w-4 h-4 flex-shrink-0" />
                <span>Copy to Clipboard</span>
              </button>

              {isUrl(result) && (
                <button
                  onClick={openLink}
                  className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-xl font-medium transition-colors touch-manipulation min-h-[48px]"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span>Open Link</span>
                </button>
              )}

              <button
                onClick={handleScanAgain}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-medium transition-colors touch-manipulation min-h-[48px]"
              >
                <QrCode className="w-5 h-5 flex-shrink-0" />
                <span>Scan Again</span>
              </button>
            </div>

            {/* Optional: Show that this QR code won't be scanned again until reset */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-600 text-center">
                💡 This QR code won&apos;t be detected again until you tap
                &quot;Scan Again&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-shrink-0 p-4 bg-gradient-to-b from-black/60 to-transparent relative z-20">
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

      {error && (
        <div className="absolute top-20 left-4 right-4 z-30">
          <div className="flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover bg-gray-900"
          playsInline
          muted
          autoPlay
          style={{
            minHeight: "200px",
            backgroundColor: "#1f2937",
          }}
          onLoadedMetadata={() => {
            console.log("Video metadata loaded");
            if (videoRef.current) {
              console.log(
                "Video dimensions:",
                videoRef.current.videoWidth,
                "x",
                videoRef.current.videoHeight
              );
            }
          }}
          onPlay={() => console.log("Video is playing")}
          onError={(e) => console.error("Video error:", e)}
        />

        {!isScanning && !result && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400 text-lg">Starting camera...</p>
            </div>
          </div>
        )}

        {/* Optional: Show scanning indicator overlay */}
        {isScanning && !result && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-64 h-64 border-2 border-white/30 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent relative z-20">
        {isScanning ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-white">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span className="text-sm">Scanning for QR codes...</span>
            </div>
            <p className="text-white/70 text-xs">
              Point your camera at a QR code. Each code will only be scanned
              once.
            </p>
            <button
              onClick={stopScanning}
              className="bg-red-500/80 hover:bg-red-600/80 text-white px-6 py-3 rounded-full backdrop-blur-sm transition-colors touch-manipulation"
            >
              Stop Scanning
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <button
              onClick={startScanning}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-medium transition-colors touch-manipulation text-lg"
            >
              Start Scanning
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
