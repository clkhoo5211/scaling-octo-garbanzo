import localforage from "localforage";
import { supabase, isSupabaseDisabled } from "./supabase";

/**
 * Message Queue - Offline-first message queue with retry logic
 * Pattern adapted from Tilly's offline-first messaging approach
 */
export interface QueuedMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: "pending" | "sending" | "sent" | "failed";
  createdAt: number;
  retries: number;
  error?: string;
}

class MessageQueue {
  private queue: ReturnType<typeof localforage.createInstance>;
  private maxRetries = 3;
  private processing = false;

  constructor() {
    this.queue = localforage.createInstance({
      name: "web3news",
      storeName: "messageQueue",
      description: "Offline message queue for pending messages",
    });

    // Listen for online/offline events
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.processQueue();
      });
    }
  }

  /**
   * Add message to queue (offline or online)
   */
  async queueMessage(
    message: Omit<QueuedMessage, "id" | "status" | "createdAt" | "retries">
  ): Promise<string> {
    const queuedMessage: QueuedMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: "pending",
      createdAt: Date.now(),
      retries: 0,
    };

    const queue = (await this.queue.getItem<QueuedMessage[]>("queue")) || [];
    queue.push(queuedMessage);
    await this.queue.setItem("queue", queue);

    // Try to send immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return queuedMessage.id;
  }

  /**
   * Process queued messages (called when online)
   */
  async processQueue(): Promise<void> {
    if (!navigator.onLine || this.processing) return;

    this.processing = true;

    try {
      const queue = (await this.queue.getItem<QueuedMessage[]>("queue")) || [];
      const pending = queue.filter(
        (msg: QueuedMessage) => msg.status === "pending" || msg.status === "failed"
      );

      for (const message of pending) {
        try {
          message.status = "sending";
          await this.updateQueue(queue);

          // Send to Supabase
          if (isSupabaseDisabled() || !supabase) {
            console.debug("Supabase disabled - skipping message send");
            message.status = "failed";
            message.error = "Supabase disabled";
            await this.updateQueue(queue);
            continue;
          }
          
          const { error } = await (supabase.from("messages") as any).insert({
            conversation_id: message.conversationId,
            sender_id: message.senderId,
            content: message.content,
          });

          if (error) {
            throw error;
          }

          message.status = "sent";
          await this.updateQueue(queue);

          // Remove from queue after successful send
          const updatedQueue = queue.filter((msg: QueuedMessage) => msg.id !== message.id);
          await this.queue.setItem("queue", updatedQueue);
        } catch (error: any) {
          message.retries++;
          message.error = error.message || "Unknown error";

          if (message.retries >= this.maxRetries) {
            message.status = "failed";
          } else {
            message.status = "pending";
            // Exponential backoff: wait 2^retries seconds
            const delay = Math.pow(2, message.retries) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          await this.updateQueue(queue);
        }
      }
    } finally {
      this.processing = false;
    }
  }

  private async updateQueue(queue: QueuedMessage[]): Promise<void> {
    await this.queue.setItem("queue", queue);
  }

  /**
   * Get queued messages for a conversation
   */
  async getQueuedMessages(conversationId: string): Promise<QueuedMessage[]> {
    const queue = (await this.queue.getItem<QueuedMessage[]>("queue")) || [];
    return queue.filter(
      (msg: QueuedMessage) =>
        msg.conversationId === conversationId &&
        (msg.status === "pending" || msg.status === "sending")
    );
  }

  /**
   * Get all queued messages
   */
  async getAllQueuedMessages(): Promise<QueuedMessage[]> {
    return (await this.queue.getItem<QueuedMessage[]>("queue")) || [];
  }

  /**
   * Remove message from queue
   */
  async removeMessage(messageId: string): Promise<void> {
    const queue = (await this.queue.getItem<QueuedMessage[]>("queue")) || [];
    const updatedQueue = queue.filter((msg: QueuedMessage) => msg.id !== messageId);
    await this.queue.setItem("queue", updatedQueue);
  }

  /**
   * Clear all queued messages
   */
  async clearQueue(): Promise<void> {
    await this.queue.setItem("queue", []);
  }

  /**
   * Retry failed messages
   */
  async retryFailedMessages(): Promise<void> {
    const queue = (await this.queue.getItem<QueuedMessage[]>("queue")) || [];
    const failed = queue.filter((msg: QueuedMessage) => msg.status === "failed");

    for (const message of failed) {
      message.status = "pending";
      message.retries = 0;
      message.error = undefined;
    }

    await this.queue.setItem("queue", queue);
    await this.processQueue();
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    sending: number;
    sent: number;
    failed: number;
  }> {
    const queue = (await this.queue.getItem<QueuedMessage[]>("queue")) || [];
    return {
      total: queue.length,
      pending: queue.filter((m: QueuedMessage) => m.status === "pending").length,
      sending: queue.filter((m: QueuedMessage) => m.status === "sending").length,
      sent: queue.filter((m: QueuedMessage) => m.status === "sent").length,
      failed: queue.filter((m: QueuedMessage) => m.status === "failed").length,
    };
  }
}

// Export singleton instance
export const messageQueue = new MessageQueue();
