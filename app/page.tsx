"use client";

import { Camera, QrCode } from "lucide-react";
import { useState } from "react";
import { FullScreenCamera } from "./components/Camera";
import { FullScreenQRScanner } from "./components/QRScanner";

export default function Home() {
  const [activeView, setActiveView] = useState<"menu" | "camera" | "qr">(
    "menu"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {activeView === "menu" && (
        <div className="max-w-md mx-auto space-y-4 pt-20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Camera & QR Tools
            </h1>
            <p className="text-gray-600">Choose your tool</p>
          </div>

          <button
            onClick={() => setActiveView("camera")}
            className="w-full flex items-center gap-4 bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100"
          >
            <div className="p-3 bg-blue-100 rounded-xl">
              <Camera className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800 text-lg">Camera</h3>
              <p className="text-gray-600 text-sm">
                Take photos with full screen camera
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveView("qr")}
            className="w-full flex items-center gap-4 bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100"
          >
            <div className="p-3 bg-emerald-100 rounded-xl">
              <QrCode className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800 text-lg">
                QR Scanner
              </h3>
              <p className="text-gray-600 text-sm">
                Scan QR codes with full screen scanner
              </p>
            </div>
          </button>
        </div>
      )}

      {activeView === "camera" && (
        <FullScreenCamera onBack={() => setActiveView("menu")} />
      )}

      {activeView === "qr" && (
        <FullScreenQRScanner onBack={() => setActiveView("menu")} />
      )}
    </div>
  );
}
