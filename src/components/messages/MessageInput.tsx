"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { useSendMessage } from "@/lib/hooks/useMessages";
import { useMessageQueueStats } from "@/lib/hooks/useMessages";
import { Button } from "@/components/ui/Button";

interface MessageInputProps {
  conversationId: string;
  disabled?: boolean;
}

/**
 * MessageInput Component
 * Input field for sending messages with optimistic updates
 * Pattern adapted from Tilly's optimistic UI updates
 */
export function MessageInput({
  conversationId,
  disabled = false,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useSendMessage();
  const queueStats = useMessageQueueStats();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSending || disabled) return;

    setIsSending(true);
    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: content.trim(),
      });
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Keep content on error so user can retry
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const hasPendingMessages = queueStats.pending > 0 || queueStats.sending > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border-subtle bg-background-elevated/70 px-4 py-4"
    >
      {hasPendingMessages && (
        <div className="mb-3 flex items-center gap-2 text-xs text-text-tertiary">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>
            {queueStats.sending > 0 && `${queueStats.sending} sending...`}
            {queueStats.pending > 0 && `${queueStats.pending} pending...`}
          </span>
        </div>
      )}
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          disabled={disabled || isSending}
          rows={1}
          className="flex-1 resize-none rounded-card border border-border-subtle bg-surface-primary px-4 py-3 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ minHeight: "40px", maxHeight: "120px" }}
        />
        <Button
          type="submit"
          disabled={!content.trim() || isSending || disabled}
          size="sm"
          className="flex-shrink-0"
          aria-label="Send message"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="mt-2 text-xs text-text-tertiary">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
