import React from "react";
import {
  ScanQrCode,
  Square,
  Copy,
  ExternalLink,
  X,
  Play,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useQRScannerOld } from "../hooks/useQRScannerOld";

const QRScanner: React.FC = () => {
  const {
    videoRef,
    isScanning,
    result,
    error,
    startScanning,
    stopScanning,
    clearResult,
  } = useQRScannerOld();

  const copyToClipboard = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
        // TODO: add a toast notification here instead of alert
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

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <ScanQrCode className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            QR Code Scanner
          </h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800">
                Scanned Successfully!
              </h3>
            </div>

            <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
              <p className="text-sm text-gray-700 break-all font-mono leading-relaxed">
                {result}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              {isUrl(result) && (
                <button
                  onClick={openLink}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </button>
              )}
              <button
                onClick={clearResult}
                className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="relative">
          <div
            className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-inner"
            style={{ aspectRatio: "16/9" }}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />

            {!isScanning && !result && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-90">
                <div className="p-4 bg-gray-700 rounded-full mb-4">
                  <ScanQrCode className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-300 text-sm font-medium text-center px-4">
                  Point camera at QR code to scan
                </p>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0">
                <div className="absolute top-4 left-4 right-4 flex justify-center z-10">
                  <div className="flex items-center gap-2 bg-black bg-opacity-70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning for QR codes...
                  </div>
                </div>

                {/* Scanner Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-56 h-56 border-2 border-emerald-400 relative rounded-2xl">
                      <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                      <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                      <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

                      {/* Animated scanning line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {!isScanning && !result ? (
            <button
              onClick={startScanning}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Play className="w-5 h-5" />
              Start Scanning
            </button>
          ) : isScanning ? (
            <button
              onClick={stopScanning}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Square className="w-5 h-5" />
              Stop Scanning
            </button>
          ) : (
            <button
              onClick={() => {
                clearResult();
                startScanning();
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ScanQrCode className="w-5 h-5" />
              Scan Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
