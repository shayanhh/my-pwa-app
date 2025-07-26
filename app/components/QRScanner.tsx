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
  }, []);

  const copyToClipboard = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
        alert("Copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy:", err);
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
          text.includes(".net"))
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
              className="p-2 bg-black/40 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-white font-semibold">QR Code Result</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-green-800">
                Scanned Successfully!
              </h3>
            </div>

            <div className="bg-gray-100 p-4 rounded-xl">
              <p className="text-sm text-gray-700 break-all font-mono">
                {result}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              {isUrl(result) && (
                <button
                  onClick={openLink}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </button>
              )}
            </div>

            <button
              onClick={() => {
                clearResult();
                startScanning();
              }}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
            >
              <QrCode className="w-5 h-5" />
              Scan Again
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
            className="p-2 bg-black/40 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white font-semibold">QR Scanner</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute top-16 left-4 right-4 z-10">
          <div className="flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <AlertCircle className="w-5 h-5" />
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
            <div className="relative">
              <div className="w-64 h-64 border-2 border-emerald-400 relative rounded-2xl">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          </div>
        )}

        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="text-center">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Initializing scanner...</p>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      {isScanning && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center">
          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Scanning for QR codes...</span>
          </div>
        </div>
      )}
    </div>
  );
};
