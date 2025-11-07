// Type definitions for Supabase database schema
// This should match the database-schema-20251107-003428.sql

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      submissions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          url: string;
          source: string;
          category: 'tech' | 'crypto' | 'social' | 'general';
          upvotes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          url: string;
          source: string;
          category: 'tech' | 'crypto' | 'social' | 'general';
          upvotes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          url?: string;
          source?: string;
          category?: 'tech' | 'crypto' | 'social' | 'general';
          upvotes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          article_id: string;
          article_title: string | null;
          article_source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id: string;
          article_title?: string | null;
          article_source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_id?: string;
          article_title?: string | null;
          article_source?: string | null;
          created_at?: string;
        };
      };
      article_likes: {
        Row: {
          id: string;
          article_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      user_follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          participant_1_id: string;
          participant_2_id: string;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_1_id: string;
          participant_2_id: string;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          participant_1_id?: string;
          participant_2_id?: string;
          last_message_at?: string | null;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      proposals: {
        Row: {
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
        };
        Insert: {
          id?: string;
          proposal_id: string;
          creator_id: string;
          title: string;
          description: string;
          category: string;
          status?: string;
          yes_votes?: number;
          no_votes?: number;
          abstain_votes?: number;
          quorum_met?: boolean;
          start_date: string;
          end_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          creator_id?: string;
          title?: string;
          description?: string;
          category?: string;
          status?: string;
          yes_votes?: number;
          no_votes?: number;
          abstain_votes?: number;
          quorum_met?: boolean;
          start_date?: string;
          end_date?: string;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          proposal_id: string;
          voter_id: string;
          vote_option: 'yes' | 'no' | 'abstain';
          voting_power: number;
          transaction_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          voter_id: string;
          vote_option: 'yes' | 'no' | 'abstain';
          voting_power: number;
          transaction_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          voter_id?: string;
          vote_option?: 'yes' | 'no' | 'abstain';
          voting_power?: number;
          transaction_hash?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link_url: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          link_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      points_transactions: {
        Row: {
          id: string;
          user_id: string;
          transaction_type: string;
          points_amount: number;
          usdt_amount: number | null;
          source: string | null;
          transaction_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_type: string;
          points_amount: number;
          usdt_amount?: number | null;
          source?: string | null;
          transaction_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          transaction_type?: string;
          points_amount?: number;
          usdt_amount?: number | null;
          source?: string | null;
          transaction_hash?: string | null;
          created_at?: string;
        };
      };
      auction_bids: {
        Row: {
          id: string;
          auction_id: string;
          bidder_address: string;
          bid_amount: number;
          transaction_hash: string;
          block_number: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          auction_id: string;
          bidder_address: string;
          bid_amount: number;
          transaction_hash: string;
          block_number?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          auction_id?: string;
          bidder_address?: string;
          bid_amount?: number;
          transaction_hash?: string;
          block_number?: number | null;
          created_at?: string;
        };
      };
    };
  };
}

