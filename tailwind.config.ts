import type { Config } from "tailwindcss";

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
        // Design System Colors (from wireframes-design-system-20251107-003428.md)
        primary: {
          DEFAULT: "#6366F1", // Indigo - Primary color
          dark: "#4F46E5",    // Indigo dark - Hover states
          light: "#818CF8",   // Indigo light - Disabled states
        },
        // Dark theme colors (PRIMARY theme)
        dark: {
          bg: "#0F172A",      // Main background
          surface: "#1E293B", // Cards, surfaces
          border: "#334155",  // Borders, dividers
          text: {
            primary: "#F1F5F9",   // Primary text
            secondary: "#94A3B8", // Secondary text
          },
        },
        // Semantic colors
        success: "#10B981",   // Green - Success, points
        warning: "#F59E0B",   // Amber - Warnings
        error: "#EF4444",     // Red - Errors
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["Courier New", "monospace"],
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "card-hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "elevated": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      transitionDuration: {
        "fast": "150ms",
        "normal": "200ms",
        "slow": "300ms",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
