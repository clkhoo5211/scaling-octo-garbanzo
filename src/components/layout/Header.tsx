import { Link } from "react-router-dom";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { useClerkEnvironment } from "@/lib/hooks/useClerkEnvironment";

export function Header() {
  const { config, isLoading } = useClerkEnvironment();
  const logoUrl = config?.logo_image_url || config?.logo_url;
  const appName = config?.application_name || "Web3News";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-background-elevated/95 backdrop-blur-sm shadow-card">
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
              className={`flex h-8 w-8 items-center justify-center rounded-card bg-primary/10 text-primary ${logoUrl ? 'hidden' : ''}`}
              style={{ display: logoUrl ? 'none' : 'flex' }}
            >
              <span className="text-lg font-bold">
                W3
              </span>
            </div>
            <span className="text-xl font-bold text-text-primary">
              {appName}
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Link to="/search" className="w-full">
              <input
                type="text"
                placeholder="Search articles..."
                className="h-11 w-full rounded-button border border-border-subtle bg-surface-subtle px-4 text-text-secondary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-smooth"
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
