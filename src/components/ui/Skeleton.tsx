"use client";

import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  const baseStyles =
    "relative overflow-hidden bg-gradient-to-r from-surface-subtle via-surface-primary to-surface-subtle bg-[length:1000px_100%] animate-shimmer";

  const variants = {
    text: "rounded-sm",
    circular: "rounded-full",
    rectangular: "rounded-card",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height)
    style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      style={style}
      aria-busy="true"
      aria-label="Loading"
    />
  );
}
