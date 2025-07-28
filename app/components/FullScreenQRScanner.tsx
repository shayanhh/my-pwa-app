import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Copy,
  ExternalLink,
  Loader2,
  QrCode,
  Clock,
} from "lucide-react";
import { useEffect } from "react";
import { useQRScanner } from "../hooks/useQRScanner";

export const FullScreenQRScanner: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const {
    videoRef,
    isScanning,
    results,
    selectedResult,
    error,
    startScanning,
    stopScanning,
    clearResults,
    selectResult,
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      alert("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy to clipboard");
    }
  };

  const openLink = (text: string) => {
    try {
      const url = text.startsWith("http") ? text : `https://${text}`;
      window.open(url, "_blank");
    } catch (err) {
      console.error("Invalid URL:", err);
      alert("Invalid URL format");
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
      clearResults();
      stopScanning();
      setTimeout(async () => {
        await startScanning();
      }, 300);
    } catch (err) {
      console.error("Failed to restart scanning:", err);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  // Show results panel if we have any results
  if (results.length > 0) {
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
            <h1 className="text-white font-semibold">
              {results.length > 1
                ? `${results.length} QR Codes Found`
                : "QR Code Result"}
            </h1>
            <div className="w-[44px]" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {results.length > 1 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-blue-200 text-sm text-center">
                Multiple QR codes detected. Tap one to select it.
              </p>
            </div>
          )}

          {results.map((result) => (
            <div
              key={result.id}
              onClick={() => selectResult(result)}
              className={`bg-white rounded-2xl p-4 cursor-pointer transition-all ${
                selectedResult?.id === result.id
                  ? "ring-2 ring-blue-500 shadow-lg"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    selectedResult?.id === result.id
                      ? "text-blue-600"
                      : "text-green-600"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3
                      className={`font-semibold ${
                        selectedResult?.id === result.id
                          ? "text-blue-800"
                          : "text-green-800"
                      }`}
                    >
                      QR Code{" "}
                      {selectedResult?.id === result.id ? "(Selected)" : ""}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(result.timestamp)}</span>
                    </div>
                  </div>

                  <div className="bg-gray-100 p-3 rounded-lg max-h-24 overflow-y-auto mb-3">
                    <p className="text-xs text-gray-700 break-all font-mono">
                      {result.text}
                    </p>
                  </div>

                  {selectedResult?.id === result.id && (
                    <div className="space-y-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(result.text);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>

                      {isUrl(result.text) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openLink(result.text);
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open Link
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-shrink-0 p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent space-y-2">
          <button
            onClick={handleScanAgain}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-medium transition-colors touch-manipulation"
          >
            <QrCode className="w-5 h-5" />
            Scan More
          </button>

          {isScanning && (
            <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Continuing to scan...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular scanning view
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
        />

        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400 text-lg">Starting camera...</p>
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
