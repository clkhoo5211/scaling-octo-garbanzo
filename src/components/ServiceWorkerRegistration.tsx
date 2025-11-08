"use client";

import { useEffect, useState } from "react";

export function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Get basePath dynamically from window.location or environment
      const basePath = import.meta.env.VITE_BASE_PATH || '';
      
      // Service Worker path (Vite PWA plugin generates sw.js)
      const swPath = `${basePath}/sw.js`;
      
      const tryRegister = async () => {
        try {
          const reg = await navigator.serviceWorker.register(swPath, {
            scope: basePath || '/',
          });
          
          console.log("Service Worker registered:", reg.scope);
          setRegistration(reg);

          // Check for updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker available
                  setUpdateAvailable(true);
                }
              });
            }
          });

          // Check if there's an update available
          reg.update();
        } catch (error: any) {
          // Service Worker registration is optional - fail silently in production
          if (import.meta.env.DEV) {
            console.warn("Service Worker registration skipped:", error.message);
          }
        }
      };
      
      tryRegister();

      // Listen for controller change (new service worker activated)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      setUpdateAvailable(false);
      window.location.reload();
    }
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
      <span>Update available</span>
      <button
        onClick={handleUpdate}
        className="bg-white text-blue-500 px-3 py-1 rounded font-medium hover:bg-gray-100 transition-colors"
      >
        Update Now
      </button>
    </div>
  );
}
