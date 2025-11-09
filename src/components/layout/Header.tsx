import { Link } from "react-router-dom";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { useClerkEnvironment } from "@/lib/hooks/useClerkEnvironment";

export function Header() {
  const { config, isLoading } = useClerkEnvironment();
  const logoUrl = config?.logo_image_url || config?.logo_url;
  const appName = config?.application_name || "Web3News";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-300 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={appName}
                className="h-8 w-8 rounded-lg object-contain"
                onError={(e) => {
                  // Fallback to default if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`h-8 w-8 rounded-lg bg-black dark:bg-white flex items-center justify-center ${logoUrl ? 'hidden' : ''}`}
              style={{ display: logoUrl ? 'none' : 'flex' }}
            >
              <span className="text-white dark:text-black font-bold text-lg">
                W3
              </span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {appName}
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Link to="/search" className="w-full">
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                readOnly
              />
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <AuthStatus />
          </div>
        </div>
      </div>
    </header>
  );
}
