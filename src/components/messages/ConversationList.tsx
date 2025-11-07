"use client";

import {
  useConversations,
} from "@/lib/hooks/useMessages";
import { useAppStore } from "@/lib/stores/appStore";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, User } from "lucide-react";

interface ConversationListProps {
  onSelectConversation: (conversationId: string, otherUserId: string) => void;
  selectedConversationId?: string;
}

/**
 * ConversationList Component
 * Displays list of conversations with last message preview
 */
export function ConversationList({
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) {
  const { userId } = useAppStore();
  const { data: conversations = [], isLoading } = useConversations(userId);

  const handleConversationClick = (conversation: {
    id: string;
    participant_1_id: string;
    participant_2_id: string;
  }) => {
    const otherUserId =
      conversation.participant_1_id === userId
        ? conversation.participant_2_id
        : conversation.participant_1_id;
    onSelectConversation(conversation.id, otherUserId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-500">
          Loading conversations...
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs mt-2 opacity-75">
          Start a conversation by messaging a user
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {conversations.map((conversation) => {
        const otherUserId =
          conversation.participant_1_id === userId
            ? conversation.participant_2_id
            : conversation.participant_1_id;
        const isSelected = conversation.id === selectedConversationId;

        return (
          <button
            key={conversation.id}
            onClick={() => handleConversationClick(conversation)}
            className={`flex items-start gap-3 p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              isSelected
                ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                : ""
            }`}
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm truncate">
                  {otherUserId.slice(0, 8)}...
                </span>
                {conversation.last_message_at && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                    {formatDistanceToNow(
                      new Date(conversation.last_message_at),
                      {
                        addSuffix: true,
                      }
                    )}
                  </span>
                )}
              </div>
              {conversation.last_message_at && (
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  Last message
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
