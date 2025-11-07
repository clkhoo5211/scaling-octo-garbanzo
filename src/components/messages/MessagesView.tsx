'use client';

import { useEffect, useRef } from 'react';
import { useMessages, useMarkMessageRead } from '@/lib/hooks/useMessages';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { useAppStore } from '@/lib/stores/appStore';
import { ArrowLeft, User } from 'lucide-react';

interface MessagesViewProps {
  conversationId: string;
  otherUserId: string;
  onBack?: () => void;
}

/**
 * MessagesView Component
 * Main component for displaying and sending messages
 * Integrates MessageBubble, MessageInput, and real-time updates
 */
export function MessagesView({
  conversationId,
  otherUserId,
  onBack,
}: MessagesViewProps) {
  const { userId } = useAppStore();
  const { messages, isLoading } = useMessages(conversationId);
  const markRead = useMarkMessageRead();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (!userId || !conversationId) return;

    const unreadMessages = messages.filter(
      (msg) => !msg.is_read && msg.sender_id !== userId
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach((msg) => {
        markRead.mutate({
          conversationId,
          messageId: msg.id,
        });
      });
    }
  }, [messages, userId, conversationId, markRead]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
          <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </div>
        <div className="flex-1">
          <h2 className="font-medium text-sm">
            {otherUserId.slice(0, 8)}...
          </h2>
        </div>
      </div>

      {/* Messages List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-2 opacity-75">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === userId}
              showStatus={true}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
}

