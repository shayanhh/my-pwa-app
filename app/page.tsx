"use client";

import { CameraIcon, ScanQrCode, Smartphone, Snail } from "lucide-react";
import { useState } from "react";
import Camera from "./components/Camera";
import QRScanner from "./components/QRScanner";

type ActiveTab = "camera" | "qr";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("camera");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Snail className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  CamQR
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Camera & QR Scanner
                </p>
              </div>
            </div>
          </div>

          <div className="flex relative">
            <div
              className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r transition-all duration-300 ease-out ${
                activeTab === "camera"
                  ? "from-blue-500 to-blue-600 w-1/2 translate-x-0"
                  : "from-emerald-500 to-green-600 w-1/2 translate-x-full"
              }`}
            />

            <button
              onClick={() => setActiveTab("camera")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 relative ${
                activeTab === "camera"
                  ? "text-blue-600 bg-gradient-to-b from-blue-50 to-transparent"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gradient-to-b hover:from-blue-25 hover:to-transparent"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  activeTab === "camera"
                    ? "bg-blue-100 shadow-sm"
                    : "bg-gray-100 group-hover:bg-blue-100"
                }`}
              >
                <CameraIcon size={18} />
              </div>
              Camera
            </button>

            <button
              onClick={() => setActiveTab("qr")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 relative ${
                activeTab === "qr"
                  ? "text-emerald-600 bg-gradient-to-b from-emerald-50 to-transparent"
                  : "text-gray-600 hover:text-emerald-600 hover:bg-gradient-to-b hover:from-emerald-25 hover:to-transparent"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  activeTab === "qr"
                    ? "bg-emerald-100 shadow-sm"
                    : "bg-gray-100 group-hover:bg-emerald-100"
                }`}
              >
                <ScanQrCode size={18} />
              </div>
              QR Scanner
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-md mx-auto">
          <div className="transition-all duration-300 ease-in-out">
            {activeTab === "camera" && <Camera />}
            {activeTab === "qr" && <QRScanner />}
          </div>
        </div>
      </main>

      <footer className="mt-12 pb-8 text-center">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700">PWA Ready</span>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-2">
              Professional Camera & QR Scanner
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Install this app on your device for the best experience. Works
              offline and provides native-like performance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
