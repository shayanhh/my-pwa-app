"use client";

import React, { useState } from "react";
import Camera from "./Camera";
import QRScanner from "./QRScanner";
type ActiveTab = "camera" | "qr";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("camera");

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab("camera")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "camera"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              📸 Camera
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "qr"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              🔍 QR Scanner
            </button>
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="max-w-md mx-auto">
          {activeTab === "camera" && <Camera />}
          {activeTab === "qr" && <QRScanner />}
        </div>
      </main>

      <footer className="mt-8 pb-8 text-center text-gray-500 text-sm">
        <p>Camera QR Scanner PWA</p>
        <p className="mt-1">
          Install this app on your device for the best experience
        </p>
      </footer>
    </div>
  );
}
