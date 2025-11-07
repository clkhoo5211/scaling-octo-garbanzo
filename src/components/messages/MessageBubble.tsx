'use client';

import { Clock, Check, CheckCheck, Loader2, AlertCircle } from 'lucide-react';
import type { Message } from '@/lib/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';

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
export function MessageBubble({ message, isOwn, showStatus = true }: MessageBubbleProps) {
  const getStatusIcon = () => {
    if (!isOwn || !showStatus) return null;

    const status = message.status;

    if (status === 'pending') {
      return <Clock className="w-3 h-3 text-gray-400" aria-label="Pending" />;
    }
    if (status === 'sending') {
      return <Loader2 className="w-3 h-3 text-gray-400 animate-spin" aria-label="Sending" />;
    }
    if (status === 'failed') {
      return <AlertCircle className="w-3 h-3 text-red-500" aria-label="Failed" />;
    }
    if (status === 'sent' || !status) {
      if (message.is_read) {
        return <CheckCheck className="w-3 h-3 text-blue-500" aria-label="Read" />;
      }
      return <Check className="w-3 h-3 text-gray-400" aria-label="Sent" />;
    }

    return null;
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}>
      <div
        className={`max-w-[70%] sm:max-w-[60%] rounded-lg px-4 py-2 ${
          isOwn
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
        }`}
      >
        <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
        <div className="flex items-center justify-end mt-1 gap-1">
          <span
            className={`text-xs ${
              isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
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

