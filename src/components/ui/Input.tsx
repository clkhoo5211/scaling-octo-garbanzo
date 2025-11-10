"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-button border border-border-subtle bg-surface-primary px-3 text-base text-text-primary shadow-sm",
            "placeholder:text-text-tertiary/80",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-surface-subtle",
            error && "border-danger/70 focus-visible:ring-danger/50",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-text-tertiary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
