/**
 * Get the base path for the application
 * Works with GitHub Pages deployment where basePath is the repository name
 */
export function getBasePath(): string {
  if (typeof window === "undefined") {
    // Server-side: use environment variable
    return process.env.NEXT_PUBLIC_BASE_PATH || "";
  }

  // Client-side: detect from current pathname
  const pathname = window.location.pathname;
  
  // Check if we're on GitHub Pages (pathname starts with /scaling-octo-garbanzo)
  if (pathname.startsWith("/scaling-octo-garbanzo")) {
    return "/scaling-octo-garbanzo";
  }
  
  // Fallback to environment variable
  return process.env.NEXT_PUBLIC_BASE_PATH || "";
}

