"use client";

import { useEffect, useState } from "react";

export function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Get basePath dynamically from window.location
      // Extract basePath from current pathname (e.g., /scaling-octo-garbanzo/...)
      const pathname = window.location.pathname;
      let basePath = "";
      
      // Check if we're on GitHub Pages (pathname starts with /scaling-octo-garbanzo)
      if (pathname.startsWith('/scaling-octo-garbanzo')) {
        basePath = '/scaling-octo-garbanzo';
      } else if (process.env.NEXT_PUBLIC_BASE_PATH) {
        basePath = process.env.NEXT_PUBLIC_BASE_PATH;
      }
      
      const swPath = `${basePath}/sw.js`;
      
      navigator.serviceWorker
        .register(swPath)
        .then((reg) => {
          console.log("Service Worker registered:", reg);
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
        })
        .catch((error) => {
          // Silently fail in development or if service worker file doesn't exist
          // This is expected on GitHub Pages if sw.js isn't deployed yet
          if (process.env.NODE_ENV === 'development') {
            console.warn("Service Worker registration skipped in development:", error.message);
          } else {
            console.error("Service Worker registration failed:", error);
          }
        });

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
