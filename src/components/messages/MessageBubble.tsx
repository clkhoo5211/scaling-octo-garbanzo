"use client";

import { Clock, Check, CheckCheck, Loader2, AlertCircle } from "lucide-react";
import type { Message } from "@/lib/hooks/useMessages";
import { formatDistanceToNow } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showStatus?: boolean;
}

/**
 * MessageBubble Component
 * Displays individual message with status indicators
 * Pattern adapted from Tilly's message status indicators
 */
export function MessageBubble({
  message,
  isOwn,
  showStatus = true,
}: MessageBubbleProps) {
  const getStatusIcon = () => {
    if (!isOwn || !showStatus) return null;

    const status = message.status;

    if (status === "pending") {
      return (
        <Clock className="h-3 w-3 text-text-tertiary" aria-label="Pending" />
      );
    }
    if (status === "sending") {
      return (
        <Loader2
          className="h-3 w-3 animate-spin text-text-tertiary"
          aria-label="Sending"
        />
      );
    }
    if (status === "failed") {
      return (
        <AlertCircle className="h-3 w-3 text-danger" aria-label="Failed" />
      );
    }
    if (status === "sent" || !status) {
      if (message.is_read) {
        return (
          <CheckCheck className="h-3 w-3 text-primary-light" aria-label="Read" />
        );
      }
      return <Check className="h-3 w-3 text-text-tertiary" aria-label="Sent" />;
    }

    return null;
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <div
      className={`group mb-3 flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[72%] rounded-2xl px-4 py-3 shadow-card transition-smooth sm:max-w-[60%] ${
          isOwn
            ? "bg-primary text-white"
            : "bg-surface-subtle text-text-primary"
        }`}
      >
        <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </p>
        <div className="mt-2 flex items-center justify-end gap-1 text-xs">
          <span
            className={`text-xs ${
              isOwn ? "text-white/80" : "text-text-tertiary"
            }`}
          >
            {formatTime(message.created_at)}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
}
