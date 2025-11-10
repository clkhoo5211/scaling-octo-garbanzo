import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class", // Enable class-based dark mode
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: {
          DEFAULT: "#6366F1",
          dark: "#4F46E5",
          light: "#818CF8",
          muted: "#A5B4FC",
        },
        secondary: {
          DEFAULT: "#0EA5E9",
          dark: "#0284C7",
          light: "#38BDF8",
        },
        background: {
          base: "var(--color-background-base)",
          elevated: "var(--color-background-elevated)",
          subtle: "var(--color-background-subtle)",
          inverted: "var(--color-background-inverted)",
        },
        surface: {
          DEFAULT: "var(--color-surface-primary)",
          subtle: "var(--color-surface-subtle)",
          strong: "var(--color-surface-strong)",
        },
        overlay: {
          light: "var(--color-overlay-light)",
          dark: "var(--color-overlay-dark)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverted: "var(--color-text-inverted)",
        },
        border: {
          subtle: "var(--color-border-subtle)",
          strong: "var(--color-border-strong)",
        },
        // Semantic states
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#0EA5E9",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        heading: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.1)",
        "card-hover": "0 4px 6px -1px rgba(15, 23, 42, 0.15)",
        elevated: "0 10px 15px -3px rgba(15, 23, 42, 0.2)",
        modal: "0 20px 25px -5px rgba(15, 23, 42, 0.25)",
      },
      borderRadius: {
        button: "0.5rem",
        card: "0.75rem",
        modal: "1.5rem",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
      },
      transitionTimingFunction: {
        emphasized: "cubic-bezier(0.4, 0, 0.2, 1)",
        "in-out": "ease-in-out",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        fadeIn: "fadeIn 200ms ease-out forwards",
        "slide-up": "slideUp 250ms ease-out forwards",
      },
    },
  },
  plugins: [
    typography,
  ],
};

export default config;
