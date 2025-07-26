import React from "react";
import { useQRScanner } from "../hooks/useQRScanner";

const QRScanner: React.FC = () => {
  const {
    videoRef,
    isScanning,
    result,
    error,
    startScanning,
    stopScanning,
    clearResult,
  } = useQRScanner();

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
      // Check if it's a URL
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
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-xl font-semibold text-gray-800">QR Code Scanner</h2>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <h3 className="font-medium mb-2">Scanned Result:</h3>
            <p className="text-sm break-all bg-white p-2 rounded border">
              {result}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Copy
              </button>
              {isUrl(result) && (
                <button
                  onClick={openLink}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Open Link
                </button>
              )}
              <button
                onClick={clearResult}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div
          className="relative bg-black rounded-lg overflow-hidden"
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
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <p className="text-white text-sm text-center">
                Point camera at QR code to scan
              </p>
            </div>
          )}
          {isScanning && (
            <div className="absolute inset-0 border-2 border-green-400">
              <div className="absolute top-4 left-4 right-4 flex justify-center">
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                  Scanning for QR codes...
                </div>
              </div>
              {/* Scanner overlay */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-48 border-2 border-green-400 relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!isScanning && !result ? (
            <button
              onClick={startScanning}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Start Scanning
            </button>
          ) : isScanning ? (
            <button
              onClick={stopScanning}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Stop Scanning
            </button>
          ) : (
            <button
              onClick={() => {
                clearResult();
                startScanning();
              }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Scan Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
