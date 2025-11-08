import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// CRITICAL: Use Vite environment variables (VITE_* prefix)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file");
}

// CRITICAL: Only create Supabase client if credentials are available
// This prevents crashes during development when env vars aren't set
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Clerk handles authentication
        autoRefreshToken: false,
      },
    })
  : null as any; // Type assertion - will be null if credentials missing

// Helper function to check if Supabase is initialized
export function isSupabaseInitialized(): boolean {
  return supabase !== null;
}

// Helper function to get authenticated user ID from Clerk
export async function getUserId(): Promise<string | null> {
  // This will be integrated with Clerk
  // For now, return null
  return null;
}

// Submissions
export async function getSubmissions(filters?: {
  userId?: string;
  category?: string;
  limit?: number;
}) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: [], error: null };
  }
  let query = (supabase.from("submissions") as any).select("*");

  if (filters?.userId) {
    query = query.eq("user_id", filters.userId);
  }

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  query = query.order("created_at", { ascending: false });

  return query;
}

export async function createSubmission(data: {
  userId: string;
  title: string;
  url: string;
  source: string;
  category: "tech" | "crypto" | "social" | "general";
}) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: null, error: new Error("Supabase client not initialized") };
  }
  return (supabase.from("submissions") as any).insert({
    user_id: data.userId,
    title: data.title,
    url: data.url,
    source: data.source,
    category: data.category,
  });
}

// Bookmarks
export async function getBookmarks(userId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: [], error: null };
  }
  return (supabase
    .from("bookmarks") as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function createBookmark(data: {
  userId: string;
  articleId: string;
  articleTitle: string;
  articleSource: string;
}) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: null, error: new Error("Supabase client not initialized") };
  }
  return (supabase.from("bookmarks") as any).insert({
    user_id: data.userId,
    article_id: data.articleId,
    article_title: data.articleTitle,
    article_source: data.articleSource,
  });
}

export async function removeBookmark(userId: string, articleId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: null, error: new Error("Supabase client not initialized") };
  }
  return (supabase
    .from("bookmarks") as any)
    .delete()
    .eq("user_id", userId)
    .eq("article_id", articleId);
}

// Article Likes
export async function likeArticle(userId: string, articleId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: null, error: new Error("Supabase client not initialized") };
  }
  return (supabase.from("article_likes") as any).insert({
    user_id: userId,
    article_id: articleId,
  });
}

export async function unlikeArticle(userId: string, articleId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: null, error: new Error("Supabase client not initialized") };
  }
  return (supabase
    .from("article_likes") as any)
    .delete()
    .eq("user_id", userId)
    .eq("article_id", articleId);
}

export async function getArticleLikes(articleId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: [], error: null };
  }
  return (supabase.from("article_likes") as any).select("*").eq("article_id", articleId);
}

// User Follows
export async function followUser(followerId: string, followingId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: null, error: new Error("Supabase client not initialized") };
  }
  return (supabase.from("user_follows") as any).insert({
    follower_id: followerId,
    following_id: followingId,
  });
}

export async function unfollowUser(followerId: string, followingId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: null, error: new Error("Supabase client not initialized") };
  }
  return (supabase
    .from("user_follows") as any)
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
}

export async function getFollowing(userId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: [], error: null };
  }
  return (supabase.from("user_follows") as any).select("*").eq("follower_id", userId);
}

export async function getFollowers(userId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: [], error: null };
  }
  return (supabase.from("user_follows") as any).select("*").eq("following_id", userId);
}

// Messages
export async function getConversations(userId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: [], error: null };
  }
  return (supabase
    .from("conversations") as any)
    .select("*")
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });
}

export async function createConversation(userId1: string, userId2: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: null, error: new Error("Supabase client not initialized") };
  }
  return (supabase.from("conversations") as any).insert({
    participant_1_id: userId1,
    participant_2_id: userId2,
  });
}

export async function sendMessage(data: {
  conversationId: string;
  senderId: string;
  content: string;
}) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: null, error: new Error("Supabase client not initialized") };
  }
  return (supabase.from("messages") as any).insert({
    conversation_id: data.conversationId,
    sender_id: data.senderId,
    content: data.content,
  });
}

export async function getMessages(conversationId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: [], error: null };
  }
  return (supabase
    .from("messages") as any)
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
}

// Proposals
export async function getProposals(filters?: {
  status?: string;
  category?: string;
  limit?: number;
}) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: [], error: null };
  }
  let query = (supabase.from("proposals") as any).select("*");

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  query = query.order("created_at", { ascending: false });

  return query;
}

export async function createProposal(data: {
  proposalId: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
}) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: null, error: new Error("Supabase client not initialized") };
  }
  return (supabase.from("proposals") as any).insert({
    proposal_id: data.proposalId,
    creator_id: data.creatorId,
    title: data.title,
    description: data.description,
    category: data.category,
    status: "active",
  });
}

// Votes
export async function vote(data: {
  proposalId: string;
  voterId: string;
  voteOption: "yes" | "no" | "abstain";
  votingPower: number;
  transactionHash: string;
}) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: null, error: new Error("Supabase client not initialized") };
  }
  return (supabase.from("votes") as any).insert({
    proposal_id: data.proposalId,
    voter_id: data.voterId,
    vote_option: data.voteOption,
    voting_power: data.votingPower,
    transaction_hash: data.transactionHash,
  });
}

export async function getVotes(proposalId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: [], error: null };
  }
  return (supabase.from("votes") as any).select("*").eq("proposal_id", proposalId);
}

// Notifications
export async function getNotifications(userId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: [], error: null };
  }
  return (supabase
    .from("notifications") as any)
    .select("*")
    .eq("user_id", userId)
    .eq("is_read", false)
    .order("created_at", { ascending: false });
}

export async function markNotificationRead(notificationId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: null, error: new Error("Supabase client not initialized") };
  }
  return (supabase
    .from("notifications") as any)
    .update({ is_read: true })
    .eq("id", notificationId);
}

// Points Transactions
export async function getPointsTransactions(userId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: [], error: null };
  }
  return (supabase
    .from("points_transactions") as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

// Auction Bids
export async function getAuctionBids(auctionId: string) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return { data: [], error: null };
  }
  return (supabase
    .from("auction_bids") as any)
    .select("*")
    .eq("auction_id", auctionId)
    .order("bid_amount", { ascending: false });
}
