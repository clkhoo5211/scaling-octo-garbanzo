/**
 * Supabase API Service Functions
 * Client-side API wrappers for Supabase operations
 */

import { supabase, isSupabaseDisabled } from "../services/supabase";
import type { Database } from "@/types/supabase";
import { safeAsync } from "./errorHandler";

// ============================================================================
// BOOKMARKS API
// ============================================================================

export interface Bookmark {
  id: string;
  user_id: string;
  article_id: string;
  article_title: string | null;
  article_source: string | null;
  created_at: string;
}

export async function getBookmarks(userId: string): Promise<{
  data: Bookmark[] | null;
  error: Error | null;
}> {
  return safeAsync(async () => {
    if (isSupabaseDisabled() || !supabase) {
      throw new Error("Supabase disabled or not initialized");
    }
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Bookmark[];
  }).then((result) => ({
    data: result.data,
    error: result.error,
  }));
}

export async function createBookmark({
  userId,
  articleId,
  articleTitle,
  articleSource,
}: {
  userId: string;
  articleId: string;
  articleTitle?: string;
  articleSource?: string;
}): Promise<{ data: Bookmark | null; error: Error | null }> {
  return safeAsync(async () => {
    const { data, error } = await (supabase
      .from("bookmarks") as any)
      .insert({
        user_id: userId,
        article_id: articleId,
        article_title: articleTitle || null,
        article_source: articleSource || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Bookmark;
  }).then((result) => ({
    data: result.data,
    error: result.error,
  }));
}

export async function removeBookmark(
  userId: string,
  articleId: string
): Promise<{ error: Error | null }> {
  return safeAsync(async () => {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("article_id", articleId);

    if (error) throw error;
    return null;
  }).then((result) => ({
    error: result.error,
  }));
}

// ============================================================================
// ARTICLE LIKES API
// ============================================================================

export interface ArticleLike {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

export async function likeArticle(
  userId: string,
  articleId: string
): Promise<{ error: Error | null }> {
  return safeAsync(async () => {
    const { error } = await (supabase.from("article_likes") as any).insert({
      user_id: userId,
      article_id: articleId,
    });

    if (error) throw error;
    return null;
  }).then((result) => ({
    error: result.error,
  }));
}

export async function unlikeArticle(
  userId: string,
  articleId: string
): Promise<{ error: Error | null }> {
  return safeAsync(async () => {
    const { error } = await supabase
      .from("article_likes")
      .delete()
      .eq("user_id", userId)
      .eq("article_id", articleId);

    if (error) throw error;
    return null;
  }).then((result) => ({
    error: result.error,
  }));
}

export async function getArticleLikes(articleId: string): Promise<{
  data: ArticleLike[] | null;
  error: Error | null;
}> {
  return safeAsync(async () => {
    const { data, error } = await supabase
      .from("article_likes")
      .select("*")
      .eq("article_id", articleId);

    if (error) throw error;
    return data as ArticleLike[];
  }).then((result) => ({
    data: result.data,
    error: result.error,
  }));
}

// ============================================================================
// USER FOLLOWS API
// ============================================================================

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export async function followUser(
  userId: string,
  followingId: string
): Promise<{ error: Error | null }> {
  return safeAsync(async () => {
    const { error } = await (supabase.from("user_follows") as any).insert({
      follower_id: userId,
      following_id: followingId,
    });

    if (error) throw error;
    return null;
  }).then((result) => ({
    error: result.error,
  }));
}

export async function unfollowUser(
  userId: string,
  followingId: string
): Promise<{ error: Error | null }> {
  return safeAsync(async () => {
    const { error } = await supabase
      .from("user_follows")
      .delete()
      .eq("follower_id", userId)
      .eq("following_id", followingId);

    if (error) throw error;
    return null;
  }).then((result) => ({
    error: result.error,
  }));
}

export async function getFollowing(userId: string): Promise<{
  data: UserFollow[] | null;
  error: Error | null;
}> {
  return safeAsync(async () => {
    const { data, error } = await supabase
      .from("user_follows")
      .select("*")
      .eq("follower_id", userId);

    if (error) throw error;
    return data as UserFollow[];
  }).then((result) => ({
    data: result.data,
    error: result.error,
  }));
}

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(userId: string): Promise<{
  data: Notification[];
  error: Error | null;
}> {
  return safeAsync(async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []) as Notification[];
  }).then((result) => ({
    data: result.data || [],
    error: result.error,
  }));
}

export async function markNotificationRead(
  notificationId: string
): Promise<{ error: Error | null }> {
  return safeAsync(async () => {
    const { error } = await (supabase
      .from("notifications") as any)
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) throw error;
    return null;
  }).then((result) => ({
    error: result.error,
  }));
}

// ============================================================================
// POINTS TRANSACTIONS API
// ============================================================================

export interface PointsTransaction {
  id: string;
  user_id: string;
  transaction_type: string;
  points_amount: number;
  usdt_amount: number | null;
  source: string | null;
  transaction_hash: string | null;
  created_at: string;
}

export async function getPointsTransactions(userId: string): Promise<{
  data: PointsTransaction[];
  error: Error | null;
}> {
  return safeAsync(async () => {
    const { data, error } = await supabase
      .from("points_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return (data || []) as PointsTransaction[];
  }).then((result) => ({
    data: result.data || [],
    error: result.error,
  }));
}

export async function createPointsTransaction({
  userId,
  transactionType,
  pointsAmount,
  usdtAmount,
  source,
  transactionHash,
}: {
  userId: string;
  transactionType: "earn" | "spend" | "convert";
  pointsAmount: number;
  usdtAmount?: number | null;
  source?: string | null;
  transactionHash?: string | null;
}): Promise<{ data: PointsTransaction | null; error: Error | null }> {
  return safeAsync(async () => {
    const { data, error } = await (supabase
      .from("points_transactions") as any)
      .insert({
        user_id: userId,
        transaction_type: transactionType,
        points_amount: pointsAmount,
        usdt_amount: usdtAmount || null,
        source: source || null,
        transaction_hash: transactionHash || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as PointsTransaction;
  }).then((result) => ({
    data: result.data,
    error: result.error,
  }));
}

// ============================================================================
// SUBMISSIONS API
// ============================================================================

export interface Submission {
  id: string;
  user_id: string;
  title: string;
  url: string;
  source: string;
  category: "tech" | "crypto" | "social" | "general";
  upvotes: number;
  created_at: string;
  updated_at: string;
}

export async function createSubmission({
  userId,
  title,
  url,
  source,
  category,
}: {
  userId: string;
  title: string;
  url: string;
  source: string;
  category: "tech" | "crypto" | "social" | "general";
}): Promise<{ data: Submission | null; error: Error | null }> {
  return safeAsync(async () => {
    const { data, error } = await (supabase
      .from("submissions") as any)
      .insert({
        user_id: userId,
        title,
        url,
        source,
        category,
        upvotes: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Submission;
  }).then((result) => ({
    data: result.data,
    error: result.error,
  }));
}

export async function getSubmissions(filters?: {
  userId?: string;
  category?: "tech" | "crypto" | "social" | "general";
  status?: "pending" | "approved" | "rejected";
  limit?: number;
}): Promise<{ data: Submission[]; error: Error | null }> {
  return safeAsync(async () => {
    let query = supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query.limit(filters?.limit || 50);

    if (error) throw error;
    return (data || []) as Submission[];
  }).then((result) => ({
    data: result.data || [],
    error: result.error,
  }));
}

// ============================================================================
// PROPOSALS API
// ============================================================================

export interface Proposal {
  id: string;
  proposal_id: string;
  creator_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  yes_votes: number;
  no_votes: number;
  abstain_votes: number;
  quorum_met: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
}

export async function getProposals(filters?: {
  status?: "active" | "passed" | "rejected" | "pending" | "executed";
  category?: string;
  limit?: number;
}): Promise<{
  data: Proposal[];
  error: Error | null;
}> {
  return safeAsync(async () => {
    let query = supabase
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    const { data, error } = await query.limit(filters?.limit || 50);

    if (error) throw error;
    return (data || []) as Proposal[];
  }).then((result) => ({
    data: result.data || [],
    error: result.error,
  }));
}

export async function createProposal({
  proposalId,
  creatorId,
  title,
  description,
  category,
  startDate,
  endDate,
}: {
  proposalId: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
}): Promise<{ data: Proposal | null; error: Error | null }> {
  return safeAsync(async () => {
    const { data, error } = await (supabase
      .from("proposals") as any)
      .insert({
        proposal_id: proposalId,
        creator_id: creatorId,
        title,
        description,
        category,
        status: "active",
        yes_votes: 0,
        no_votes: 0,
        abstain_votes: 0,
        quorum_met: false,
        start_date: startDate,
        end_date: endDate,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Proposal;
  }).then((result) => ({
    data: result.data,
    error: result.error,
  }));
}

// ============================================================================
// VOTES API
// ============================================================================

export interface Vote {
  id: string;
  proposal_id: string;
  voter_id: string;
  vote_option: number; // 0 = yes, 1 = no, 2 = abstain
  voting_power: number;
  transaction_hash: string;
  created_at: string;
}

export async function getVotes(proposalId: string): Promise<{
  data: Vote[];
  error: Error | null;
}> {
  return safeAsync(async () => {
    const { data, error } = await supabase
      .from("votes")
      .select("*")
      .eq("proposal_id", proposalId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as Vote[];
  }).then((result) => ({
    data: result.data || [],
    error: result.error,
  }));
}

export async function createVote({
  proposalId,
  voterId,
  voteOption,
  votingPower,
  transactionHash,
}: {
  proposalId: string;
  voterId: string;
  voteOption: "yes" | "no" | "abstain";
  votingPower: number;
  transactionHash?: string;
}): Promise<{ data: Vote | null; error: Error | null }> {
  return safeAsync(async () => {
    const { data, error } = await (supabase
      .from("votes") as any)
      .insert({
        proposal_id: proposalId,
        voter_id: voterId,
        vote_option: voteOption === "yes" ? 0 : voteOption === "no" ? 1 : 2,
        voting_power: votingPower,
        transaction_hash: transactionHash || `pending-${Date.now()}`,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Vote;
  }).then((result) => ({
    data: result.data,
    error: result.error,
  }));
}

// ============================================================================
// AUCTIONS API
// ============================================================================

export interface Auction {
  id: string;
  ad_slot_id: string;
  title: string;
  description: string;
  current_bid: number;
  min_bid_increment: number;
  end_time: string;
  total_bids: number;
  highest_bidder_address: string | null;
  status: "active" | "ended" | "settled" | "pending";
  created_at: string;
}

export async function getAuctions(filters?: {
  status?: "active" | "ended" | "settled";
  limit?: number;
}): Promise<{ data: Auction[]; error: Error | null }> {
  return safeAsync(async () => {
    let query = supabase
      .from("auctions")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query.limit(filters?.limit || 50);

    if (error) throw error;
    return (data || []) as Auction[];
  }).then((result) => ({
    data: result.data || [],
    error: result.error,
  }));
}

export async function updateAuction(
  auctionId: string,
  updates: Partial<Auction>
): Promise<{ data: Auction | null; error: Error | null }> {
  return safeAsync(async () => {
    const { data, error } = await (supabase
      .from("auctions") as any)
      .update(updates)
      .eq("id", auctionId)
      .select()
      .single();

    if (error) throw error;
    return data as Auction;
  }).then((result) => ({
    data: result.data,
    error: result.error,
  }));
}

// ============================================================================
// AUCTION BIDS API
// ============================================================================

export interface AuctionBid {
  id: string;
  auction_id: string;
  bidder_address: string;
  bid_amount: number;
  transaction_hash: string;
  block_number: number | null;
  created_at: string;
}

export async function getAuctionBids(auctionId: string): Promise<{
  data: AuctionBid[];
  error: Error | null;
}> {
  return safeAsync(async () => {
    const { data, error } = await supabase
      .from("auction_bids")
      .select("*")
      .eq("auction_id", auctionId)
      .order("bid_amount", { ascending: false });

    if (error) throw error;
    return (data || []) as AuctionBid[];
  }).then((result) => ({
    data: result.data || [],
    error: result.error,
  }));
}

export async function createAuctionBid({
  auctionId,
  bidderAddress,
  bidAmount,
  transactionHash,
  blockNumber,
}: {
  auctionId: string;
  bidderAddress: string;
  bidAmount: number;
  transactionHash?: string;
  blockNumber?: number | null;
}): Promise<{ data: AuctionBid | null; error: Error | null }> {
  return safeAsync(async () => {
    const { data, error } = await (supabase
      .from("auction_bids") as any)
      .insert({
        auction_id: auctionId,
        bidder_address: bidderAddress,
        bid_amount: bidAmount,
        transaction_hash: transactionHash || `pending-${Date.now()}`,
        block_number: blockNumber || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AuctionBid;
  }).then((result) => ({
    data: result.data,
    error: result.error,
  }));
}

// ============================================================================
// LISTS API
// ============================================================================

export interface List {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  subscriber_count: number;
  created_at: string;
  updated_at: string;
}

export interface ListArticle {
  id: string;
  list_id: string;
  article_id: string;
  article_title: string | null;
  article_url: string | null;
  article_source: string | null;
  added_at: string;
  added_by: string;
}

export interface ListSubscription {
  id: string;
  list_id: string;
  user_id: string;
  created_at: string;
}

export async function getLists(filters?: {
  userId?: string;
  isPublic?: boolean;
  limit?: number;
}): Promise<{ data: List[] | null; error: Error | null }> {
  return safeAsync(async () => {
    let query = supabase.from("lists").select("*");

    if (filters?.userId) {
      query = query.eq("user_id", filters.userId);
    }

    if (filters?.isPublic !== undefined) {
      query = query.eq("is_public", filters.isPublic);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as List[];
  }).then((result) => ({
    data: result.data || [],
    error: result.error,
  }));
}

export async function getList(listId: string): Promise<{
  data: List | null;
  error: Error | null;
}> {
  return safeAsync(async () => {
    const { data, error } = await supabase
      .from("lists")
      .select("*")
      .eq("id", listId)
      .single();

    if (error) throw error;
    return data as List;
  }).then((result) => ({
    data: result.data,
    error: result.error,
  }));
}

export async function createList({
  userId,
  name,
  description,
  isPublic = false,
}: {
  userId: string;
  name: string;
  description?: string;
  isPublic?: boolean;
}): Promise<{ data: List | null; error: Error | null }> {
  return safeAsync(async () => {
    const { data, error } = await (supabase
      .from("lists") as any)
      .insert({
        user_id: userId,
        name,
        description: description || null,
        is_public: isPublic,
        subscriber_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as List;
  }).then((result) => ({
    data: result.data,
    error: result.error,
  }));
}

export async function updateList({
  listId,
  name,
  description,
  isPublic,
}: {
  listId: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
}): Promise<{ data: List | null; error: Error | null }> {
  return safeAsync(async () => {
    const updates: Partial<List> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (isPublic !== undefined) updates.is_public = isPublic;

    const { data, error } = await (supabase
      .from("lists") as any)
      .update(updates)
      .eq("id", listId)
      .select()
      .single();

    if (error) throw error;
    return data as List;
  }).then((result) => ({
    data: result.data,
    error: result.error,
  }));
}

export async function deleteList(listId: string): Promise<{
  error: Error | null;
}> {
  return safeAsync(async () => {
    const { error } = await supabase.from("lists").delete().eq("id", listId);

    if (error) throw error;
    return null;
  }).then((result) => ({
    error: result.error,
  }));
}

export async function getListArticles(listId: string): Promise<{
  data: ListArticle[] | null;
  error: Error | null;
}> {
  return safeAsync(async () => {
    const { data, error } = await supabase
      .from("list_articles")
      .select("*")
      .eq("list_id", listId)
      .order("added_at", { ascending: false });

    if (error) throw error;
    return (data || []) as ListArticle[];
  }).then((result) => ({
    data: result.data || [],
    error: result.error,
  }));
}

export async function addArticleToList({
  listId,
  articleId,
  articleTitle,
  articleUrl,
  articleSource,
  addedBy,
}: {
  listId: string;
  articleId: string;
  articleTitle?: string;
  articleUrl?: string;
  articleSource?: string;
  addedBy: string;
}): Promise<{ data: ListArticle | null; error: Error | null }> {
  return safeAsync(async () => {
    const { data, error } = await (supabase
      .from("list_articles") as any)
      .insert({
        list_id: listId,
        article_id: articleId,
        article_title: articleTitle || null,
        article_url: articleUrl || null,
        article_source: articleSource || null,
        added_by: addedBy,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ListArticle;
  }).then((result) => ({
    data: result.data,
    error: result.error,
  }));
}

export async function removeArticleFromList(
  listId: string,
  articleId: string
): Promise<{ error: Error | null }> {
  return safeAsync(async () => {
    const { error } = await supabase
      .from("list_articles")
      .delete()
      .eq("list_id", listId)
      .eq("article_id", articleId);

    if (error) throw error;
    return null;
  }).then((result) => ({
    error: result.error,
  }));
}

export async function subscribeToList({
  listId,
  userId,
}: {
  listId: string;
  userId: string;
}): Promise<{ data: ListSubscription | null; error: Error | null }> {
  return safeAsync(async () => {
    // First, increment subscriber count
    const { data: list } = await supabase
      .from("lists")
      .select("subscriber_count")
      .eq("id", listId)
      .single();

    if (list) {
      await (supabase
        .from("lists") as any)
        .update({ subscriber_count: ((list as { subscriber_count: number }).subscriber_count || 0) + 1 })
        .eq("id", listId);
    }

    const { data, error } = await (supabase
      .from("list_subscriptions") as any)
      .insert({
        list_id: listId,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ListSubscription;
  }).then((result) => ({
    data: result.data,
    error: result.error,
  }));
}

export async function unsubscribeFromList({
  listId,
  userId,
}: {
  listId: string;
  userId: string;
}): Promise<{ error: Error | null }> {
  return safeAsync(async () => {
    // First, decrement subscriber count
    const { data: list } = await supabase
      .from("lists")
      .select("subscriber_count")
      .eq("id", listId)
      .single();

    if (list && ((list as { subscriber_count: number }).subscriber_count || 0) > 0) {
      await (supabase
        .from("lists") as any)
        .update({ subscriber_count: ((list as { subscriber_count: number }).subscriber_count || 0) - 1 })
        .eq("id", listId);
    }

    const { error } = await supabase
      .from("list_subscriptions")
      .delete()
      .eq("list_id", listId)
      .eq("user_id", userId);

    if (error) throw error;
    return null;
  }).then((result) => ({
    error: result.error,
  }));
}

export async function getListSubscriptions(userId: string): Promise<{
  data: ListSubscription[] | null;
  error: Error | null;
}> {
  return safeAsync(async () => {
    const { data, error } = await supabase
      .from("list_subscriptions")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    return (data || []) as ListSubscription[];
  }).then((result) => ({
    data: result.data || [],
    error: result.error,
  }));
}
