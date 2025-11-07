import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/services/supabase";
import { messageQueue, type QueuedMessage } from "@/lib/services/messageQueue";
import { useAppStore } from "@/lib/stores/appStore";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  status?: "pending" | "sending" | "sent" | "failed"; // For queued messages
}

/**
 * Hook to fetch messages for a conversation with real-time updates
 * Pattern adapted from Tilly's real-time messaging approach
 */
export function useMessages(conversationId: string) {
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([]);
  const queryClient = useQueryClient();

  // Load messages from Supabase
  const { data: supabaseMessages = [], isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!conversationId,
  });

  // Load queued messages (pending sends)
  useEffect(() => {
    if (!conversationId) return;

    async function loadQueuedMessages() {
      const queued = await messageQueue.getQueuedMessages(conversationId);
      setQueuedMessages(queued);
    }

    loadQueuedMessages();

    // Refresh queued messages periodically
    const interval = setInterval(loadQueuedMessages, 2000);
    return () => clearInterval(interval);
  }, [conversationId]);

  // Subscribe to real-time updates (Supabase Realtime)
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          queryClient.setQueryData<Message[]>(
            ["messages", conversationId],
            (old = []) => {
              // Check if message already exists
              if (old.some((m) => m.id === newMessage.id)) {
                return old;
              }
              return [...old, newMessage];
            }
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          queryClient.setQueryData<Message[]>(
            ["messages", conversationId],
            (old = []) =>
              old.map((msg) =>
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  // Merge Supabase messages with queued messages
  const allMessages: Message[] = [
    ...supabaseMessages,
    ...queuedMessages.map((qm) => ({
      id: qm.id,
      conversation_id: qm.conversationId,
      sender_id: qm.senderId,
      content: qm.content,
      is_read: false,
      created_at: new Date(qm.createdAt).toISOString(),
      status: qm.status,
    })),
  ].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return {
    messages: allMessages,
    isLoading,
  };
}

/**
 * Hook to send message with optimistic update
 * Pattern adapted from Tilly's optimistic UI updates
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { userId } = useAppStore();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => {
      if (!userId) throw new Error("User not authenticated");

      // Optimistic update - add to UI immediately
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: userId,
        content,
        is_read: false,
        created_at: new Date().toISOString(),
        status: "pending",
      };

      // Update cache optimistically
      queryClient.setQueryData<Message[]>(
        ["messages", conversationId],
        (old = []) => [...old, optimisticMessage]
      );

      // Queue message (handles offline/online)
      const messageId = await messageQueue.queueMessage({
        conversationId,
        senderId: userId,
        content,
      });

      // Process queue (will sync when online)
      await messageQueue.processQueue();

      return messageId;
    },
    onError: (error, variables) => {
      // Remove optimistic message on error
      queryClient.setQueryData<Message[]>(
        ["messages", variables.conversationId],
        (old = []) => old.filter((msg) => !msg.id.startsWith("temp-"))
      );
    },
  });
}

/**
 * Hook to mark message as read
 */
export function useMarkMessageRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("id", messageId);

      if (error) throw error;

      // Update cache
      queryClient.setQueryData<Message[]>(
        ["messages", conversationId],
        (old = []) =>
          old.map((msg) =>
            msg.id === messageId ? { ...msg, is_read: true } : msg
          )
      );
    },
  });
}

/**
 * Hook to get conversations list
 */
export function useConversations(userId: string | null) {
  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

/**
 * Hook to create or get conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId1,
      userId2,
    }: {
      userId1: string;
      userId2: string;
    }) => {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .or(
          `and(participant_1_id.eq.${userId1},participant_2_id.eq.${userId2}),and(participant_1_id.eq.${userId2},participant_2_id.eq.${userId1})`
        )
        .single();

      if (existing) {
        return existing;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          participant_1_id: userId1 < userId2 ? userId1 : userId2,
          participant_2_id: userId1 < userId2 ? userId2 : userId1,
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      return data;
    },
  });
}

/**
 * Hook to get message queue statistics
 */
export function useMessageQueueStats() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    sending: 0,
    sent: 0,
    failed: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const queueStats = await messageQueue.getStats();
      setStats(queueStats);
    }

    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return stats;
}
