'use client';

import { useState, useEffect } from "react";
import { Download, CheckCircle, Smartphone, X } from "lucide-react";
import { useAdminTheme } from "@/context/AdminThemeContext";

export default function InstallAppBtn({ variant = "sidebar" }) {
  const { isDark } = useAdminTheme();
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running in standalone PWA mode
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      setIsInstalled(isStandalone);
    };

    checkStandalone();

    // Check iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    if (window.deferredPwaPrompt) {
      setCanInstall(true);
    }

    const onPromptAvailable = () => {
      setCanInstall(true);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener("pwa-prompt-available", onPromptAvailable);
    window.addEventListener("pwa-app-installed", onAppInstalled);

    return () => {
      window.removeEventListener("pwa-prompt-available", onPromptAvailable);
      window.removeEventListener("pwa-app-installed", onAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled) return;

    // iOS manual install instructions
    if (isIos && !window.deferredPwaPrompt) {
      setShowIosModal(true);
      return;
    }

    const promptEvent = window.deferredPwaPrompt;
    if (!promptEvent) {
      // If browser doesn't expose prompt, trigger info or show instructions
      alert("To install Kite Admin app, tap your browser's menu (⋮ or Share) and select 'Install app' or 'Add to Home screen'.");
      return;
    }

    try {
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setCanInstall(false);
        window.deferredPwaPrompt = null;
      }
    } catch (err) {
      console.warn("PWA install error:", err);
    }
  };

  // If already installed in standalone mode, show clean badge
  if (isInstalled) {
    if (variant === "header") {
      return (
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle size={13} />
          <span>App Installed</span>
        </span>
      );
    }
    return (
      <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border ${
        isDark ? "bg-[#161D2E] border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
      }`}>
        <span className="flex items-center gap-1.5">
          <CheckCircle size={14} />
          <span>PWA App Installed</span>
        </span>
        <span className="text-[10px] font-mono opacity-80">v1.0</span>
      </div>
    );
  }

  // Header button variant
  if (variant === "header") {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-sky-500 to-[#00AEEF] hover:from-sky-600 hover:to-[#0095CC] text-white shadow-sm shadow-sky-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Install Kite Admin App on your device"
        >
          <Download size={13} className="animate-bounce" />
          <span className="hidden xs:inline">Install App</span>
        </button>

        {showIosModal && (
          <IosInstallModal isDark={isDark} onClose={() => setShowIosModal(false)} />
        )}
      </>
    );
  }

  // Sidebar / Mobile Drawer variant (Sleek Compact Bar)
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer group ${
          isDark
            ? "bg-gradient-to-r from-sky-500/10 to-blue-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500/20 hover:border-sky-500/50"
            : "bg-sky-50 border-sky-200 text-[#0095CC] hover:bg-sky-100 hover:border-sky-300 shadow-xs"
        }`}
        title="Install Kite Admin on your desktop / phone"
      >
        <span className="flex items-center gap-2">
          <Smartphone size={15} className="text-[#00AEEF] flex-shrink-0" />
          <span className="tracking-wide">Install Kite App</span>
        </span>
        <span className="flex items-center gap-1 text-[11px] font-semibold opacity-90 group-hover:translate-x-0.5 transition-transform">
          <Download size={13} className="animate-bounce" />
          <span>Install</span>
        </span>
      </button>

      {showIosModal && (
        <IosInstallModal isDark={isDark} onClose={() => setShowIosModal(false)} />
      )}
    </>
  );
}

function IosInstallModal({ isDark, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl relative ${
        isDark ? "bg-[#111726] border-[#1E293B] text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#00AEEF]/10 text-[#00AEEF] flex items-center justify-center mx-auto mb-4">
          <Smartphone size={24} />
        </div>

        <h3 className="text-base font-bold text-center mb-2">
          Install on iOS (iPhone / iPad)
        </h3>
        <p className={`text-xs text-center mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          To install this app on your home screen:
        </p>

        <ol className={`text-xs space-y-2.5 mb-5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-[#00AEEF] font-bold flex items-center justify-center flex-shrink-0">1</span>
            <span>Tap the <strong>Share</strong> button at bottom of Safari</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-[#00AEEF] font-bold flex items-center justify-center flex-shrink-0">2</span>
            <span>Scroll down and tap <strong>Add to Home Screen</strong></span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-[#00AEEF] font-bold flex items-center justify-center flex-shrink-0">3</span>
            <span>Tap <strong>Add</strong> on the top right</span>
          </li>
        </ol>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#00AEEF] text-white font-bold rounded-xl text-xs hover:bg-[#0095CC] transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
