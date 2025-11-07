import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not configured");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Clerk handles authentication
    autoRefreshToken: false,
  },
});

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
  let query = supabase.from("submissions").select("*");

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
  return supabase.from("submissions").insert({
    user_id: data.userId,
    title: data.title,
    url: data.url,
    source: data.source,
    category: data.category,
  });
}

// Bookmarks
export async function getBookmarks(userId: string) {
  return supabase
    .from("bookmarks")
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
  return supabase.from("bookmarks").insert({
    user_id: data.userId,
    article_id: data.articleId,
    article_title: data.articleTitle,
    article_source: data.articleSource,
  });
}

export async function removeBookmark(userId: string, articleId: string) {
  return supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("article_id", articleId);
}

// Article Likes
export async function likeArticle(userId: string, articleId: string) {
  return supabase.from("article_likes").insert({
    user_id: userId,
    article_id: articleId,
  });
}

export async function unlikeArticle(userId: string, articleId: string) {
  return supabase
    .from("article_likes")
    .delete()
    .eq("user_id", userId)
    .eq("article_id", articleId);
}

export async function getArticleLikes(articleId: string) {
  return supabase.from("article_likes").select("*").eq("article_id", articleId);
}

// User Follows
export async function followUser(followerId: string, followingId: string) {
  return supabase.from("user_follows").insert({
    follower_id: followerId,
    following_id: followingId,
  });
}

export async function unfollowUser(followerId: string, followingId: string) {
  return supabase
    .from("user_follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
}

export async function getFollowing(userId: string) {
  return supabase.from("user_follows").select("*").eq("follower_id", userId);
}

export async function getFollowers(userId: string) {
  return supabase.from("user_follows").select("*").eq("following_id", userId);
}

// Messages
export async function getConversations(userId: string) {
  return supabase
    .from("conversations")
    .select("*")
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });
}

export async function createConversation(userId1: string, userId2: string) {
  return supabase.from("conversations").insert({
    participant_1_id: userId1,
    participant_2_id: userId2,
  });
}

export async function sendMessage(data: {
  conversationId: string;
  senderId: string;
  content: string;
}) {
  return supabase.from("messages").insert({
    conversation_id: data.conversationId,
    sender_id: data.senderId,
    content: data.content,
  });
}

export async function getMessages(conversationId: string) {
  return supabase
    .from("messages")
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
  let query = supabase.from("proposals").select("*");

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
  return supabase.from("proposals").insert({
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
  return supabase.from("votes").insert({
    proposal_id: data.proposalId,
    voter_id: data.voterId,
    vote_option: data.voteOption,
    voting_power: data.votingPower,
    transaction_hash: data.transactionHash,
  });
}

export async function getVotes(proposalId: string) {
  return supabase.from("votes").select("*").eq("proposal_id", proposalId);
}

// Notifications
export async function getNotifications(userId: string) {
  return supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("is_read", false)
    .order("created_at", { ascending: false });
}

export async function markNotificationRead(notificationId: string) {
  return supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
}

// Points Transactions
export async function getPointsTransactions(userId: string) {
  return supabase
    .from("points_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

// Auction Bids
export async function getAuctionBids(auctionId: string) {
  return supabase
    .from("auction_bids")
    .select("*")
    .eq("auction_id", auctionId)
    .order("bid_amount", { ascending: false });
}
