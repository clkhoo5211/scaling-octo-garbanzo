import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { PointsDisplay } from "@/components/points/PointsDisplay";
import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { Coins } from "lucide-react";

export default function PointsPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <LoadingState message="Loading..." fullScreen />;
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            title="Sign in required"
            message="Please sign in to view your points"
            icon={<Coins className="w-12 h-12 text-gray-400" />}
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PointsDisplay />
      </div>
    </ErrorBoundary>
  );
}

