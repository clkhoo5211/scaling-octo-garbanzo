"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useEffect, memo } from "react";
import { Button } from "./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full mx-4",
};

export const Modal = memo(function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-8 bg-overlay-dark/90 backdrop-blur-lg"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full rounded-modal border border-border-subtle bg-surface-primary text-text-primary shadow-modal transition-smooth",
          sizeClasses[size],
          "max-h-[90vh] overflow-y-auto"
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-6 py-5">
            {title && (
              <div className="flex-1 pr-4">
                {typeof title === "string" ? (
                  <h2
                    id="modal-title"
                    className="text-xl font-semibold text-text-primary"
                  >
                    {title}
                  </h2>
                ) : (
                  <div id="modal-title">{title}</div>
                )}
              </div>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-auto"
                aria-label="Close modal"
              >
                <svg
                  className="h-5 w-5"
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
              </Button>
            )}
          </div>
        )}
        <div className="px-6 py-5 text-text-secondary">{children}</div>
      </div>
    </div>
  );
});
