'use client';

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });
      });
    }

    // Capture PWA Install Prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window.deferredPwaPrompt = e;
      window.dispatchEvent(new CustomEvent("pwa-prompt-available"));
    };

    const handleAppInstalled = () => {
      window.deferredPwaPrompt = null;
      window.dispatchEvent(new CustomEvent("pwa-app-installed"));
      console.log("[PWA] App successfully installed!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null;
}
