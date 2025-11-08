import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { ConversationList } from "@/components/messages/ConversationList";
import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { MessageCircle } from "lucide-react";

export default function MessagesPage() {
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
            message="Please sign in to view your messages"
            icon={<MessageCircle className="w-12 h-12 text-gray-400" />}
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Messages
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with other users and discuss articles
          </p>
        </div>
        <ConversationList
          onSelectConversation={(conversationId, otherUserId) => {
            console.log("Selected conversation:", conversationId, otherUserId);
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

