"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-button font-semibold transition-smooth duration-fast ease-emphasized focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60 focus-visible:ring-offset-background-base disabled:opacity-60 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-primary text-white shadow-card hover:bg-primary-dark hover:shadow-card-hover focus-visible:ring-primary/70",
      secondary:
        "bg-surface-subtle text-text-primary border border-border-subtle hover:bg-surface-strong/60 focus-visible:ring-primary/40",
      outline:
        "border border-border-strong bg-transparent text-text-primary hover:bg-surface-subtle focus-visible:ring-primary/30",
      ghost:
        "bg-transparent text-text-secondary hover:bg-surface-subtle hover:text-text-primary focus-visible:ring-primary/20",
      danger:
        "bg-danger text-white shadow-card hover:bg-danger/90 focus-visible:ring-danger/50",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
