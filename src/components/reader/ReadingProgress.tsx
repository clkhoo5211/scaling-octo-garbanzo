"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

interface ReadingProgressProps {
  containerRef?: React.RefObject<HTMLElement>;
  targetElement?: HTMLElement | null;
}

/**
 * ReadingProgress Component
 * Shows reading progress bar at top of page
 */
export function ReadingProgress({
  containerRef,
  targetElement,
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const element =
      targetElement || containerRef?.current || document.documentElement;
    if (!element) return;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = element.scrollHeight - window.innerHeight;
      const progressPercent =
        scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, progressPercent)));
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
    };
  }, [containerRef, targetElement]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-50"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      >
        <div
          className="h-full bg-blue-500 transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 sm:right-8 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all z-40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
