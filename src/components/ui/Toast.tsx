"use client";

import { cn } from "@/lib/utils";
import { ReactNode, createContext, useContext, useState, useRef } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = (toast: Omit<Toast, "id">) => {
    // CRITICAL: Use stable ID generation to prevent hydration mismatches
    // Use crypto.randomUUID if available, otherwise timestamp + counter
    let id: string;
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      id = window.crypto.randomUUID();
    } else {
      const timestamp = Date.now();
      counterRef.current += 1;
      id = `${timestamp}-${counterRef.current}`;
    }
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration || 3000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const typeStyles: Record<
    Toast["type"],
    { container: string; badge: string; icon: string }
  > = {
    success: {
      container: "border-success/40",
      badge: "bg-success/15 text-success",
      icon: "text-success",
    },
    error: {
      container: "border-danger/40",
      badge: "bg-danger/15 text-danger",
      icon: "text-danger",
    },
    info: {
      container: "border-info/40",
      badge: "bg-info/15 text-info",
      icon: "text-info",
    },
    warning: {
      container: "border-warning/40",
      badge: "bg-warning/20 text-warning/90",
      icon: "text-warning",
    },
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  return (
    <div
      className={cn(
        "flex min-w-[300px] max-w-md items-start gap-3 rounded-card border-l-4 bg-surface-primary px-4 py-4 shadow-elevated text-text-primary transition-smooth animate-slide-up",
        typeStyles[toast.type].container
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold shadow-card",
          typeStyles[toast.type].badge
        )}
      >
        {icons[toast.type]}
      </span>
      <p className="flex-1 text-sm leading-relaxed text-text-secondary">
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="text-text-tertiary hover:text-text-primary transition-smooth"
        aria-label="Close toast"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export function Toast({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  return <ToastItem toast={toast} onClose={onClose} />;
}
