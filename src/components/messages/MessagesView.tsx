"use client";

import { useEffect, useRef } from "react";
import { useMessages, useMarkMessageRead } from "@/lib/hooks/useMessages";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { useAppStore } from "@/lib/stores/appStore";
import { ArrowLeft, User } from "lucide-react";

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-border-subtle bg-background-elevated px-4 py-4">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-card p-2 text-text-tertiary transition-smooth hover:bg-surface-subtle"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-subtle text-text-secondary">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="h-4 w-24 animate-pulse rounded-full bg-surface-subtle" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center bg-background-base">
          <div className="rounded-card border border-border-subtle px-4 py-3 text-text-tertiary shadow-card">
            Loading messages...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background-base">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border-subtle bg-background-elevated px-4 py-4">
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-card p-2 text-text-tertiary transition-smooth hover:bg-surface-subtle"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-subtle text-text-secondary">
          <User className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-medium text-text-primary">
            {otherUserId.slice(0, 8)}...
          </h2>
        </div>
      </div>

      {/* Messages List */}
      <div
        ref={containerRef}
        className="flex-1 space-y-3 overflow-y-auto bg-background-base px-4 py-6"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-text-tertiary">
            <p className="text-sm font-medium">No messages yet</p>
            <p className="mt-2 text-xs opacity-75">
              Start the conversation!
            </p>
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
