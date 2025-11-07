-- Migration: Create article_likes table
-- Run this in your Supabase SQL Editor

-- Table 8: article_likes
-- Purpose: Article likes

CREATE TABLE IF NOT EXISTS article_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT NOT NULL,
  user_id TEXT NOT NULL, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_article_likes_article_id ON article_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_article_likes_user_id ON article_likes(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_article_likes_unique ON article_likes(article_id, user_id);

-- RLS Policies
ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read" ON article_likes;
DROP POLICY IF EXISTS "Authenticated insert" ON article_likes;
DROP POLICY IF EXISTS "Owner delete" ON article_likes;

CREATE POLICY "Public read" ON article_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON article_likes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Owner delete" ON article_likes
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

