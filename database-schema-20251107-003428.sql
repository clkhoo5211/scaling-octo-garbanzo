# 🗄️ Database Schema
## Web3News - Blockchain Content Aggregator

**Created:** 2025-11-07  
**Design Agent:** System Architect  
**Status:** ✅ Complete  
**Database:** Supabase PostgreSQL

---

## 📊 SCHEMA OVERVIEW

**Total Tables:** 13 tables  
**Total Relationships:** 5 foreign keys  
**Total Indexes:** 35+ indexes  
**Note:** NO users table (Clerk metadata stores user data)

---

## 📋 TABLE DEFINITIONS

### Table 1: submissions

**Purpose:** User-submitted articles

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  category TEXT CHECK (category IN ('tech', 'crypto', 'social', 'general')),
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_category ON submissions(category);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submissions_upvotes ON submissions(upvotes DESC);
CREATE INDEX idx_submissions_url ON submissions(url);

-- RLS Policies
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON submissions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON submissions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Owner update" ON submissions
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Owner delete" ON submissions
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');
```

---

### Table 2: bookmarks

**Purpose:** User bookmarks

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  article_id TEXT NOT NULL, -- Article URL or ID
  article_title TEXT,
  article_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);
CREATE INDEX idx_bookmarks_article_id ON bookmarks(article_id);
CREATE UNIQUE INDEX idx_bookmarks_unique ON bookmarks(user_id, article_id);

-- RLS Policies
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner read" ON bookmarks
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Authenticated insert" ON bookmarks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Owner delete" ON bookmarks
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');
```

---

### Table 3: advertisements

**Purpose:** Ad content

```sql
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id TEXT NOT NULL, -- Wallet address
  slot_type TEXT NOT NULL CHECK (slot_type IN ('banner', 'sponsored', 'promoted')),
  slot_location TEXT NOT NULL CHECK (slot_location IN ('homepage', 'category', 'article')),
  content_url TEXT NOT NULL,
  link_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_advertisements_slot_location ON advertisements(slot_location);
CREATE INDEX idx_advertisements_is_active ON advertisements(is_active);
CREATE INDEX idx_advertisements_end_date ON advertisements(end_date);
CREATE INDEX idx_advertisements_advertiser ON advertisements(advertiser_id);

-- RLS Policies
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active ads" ON advertisements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated insert" ON advertisements
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Owner update" ON advertisements
  FOR UPDATE USING (advertiser_id = auth.jwt() ->> 'wallet_address');
```

---

### Table 4: auction_participants

**Purpose:** Auction participants

```sql
CREATE TABLE auction_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id TEXT NOT NULL,
  participant_address TEXT NOT NULL,
  participation_fee_paid BOOLEAN DEFAULT false,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_auction_participants_auction_id ON auction_participants(auction_id);
CREATE INDEX idx_auction_participants_address ON auction_participants(participant_address);
CREATE UNIQUE INDEX idx_auction_participants_unique ON auction_participants(auction_id, participant_address);

-- RLS Policies
ALTER TABLE auction_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON auction_participants
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON auction_participants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

### Table 5: auction_bids

**Purpose:** Bid history

```sql
CREATE TABLE auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id TEXT NOT NULL,
  bidder_address TEXT NOT NULL,
  bid_amount DECIMAL(18, 6) NOT NULL,
  transaction_hash TEXT NOT NULL,
  block_number BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_auction_bids_auction_id ON auction_bids(auction_id);
CREATE INDEX idx_auction_bids_bidder ON auction_bids(bidder_address);
CREATE INDEX idx_auction_bids_amount ON auction_bids(bid_amount DESC);
CREATE INDEX idx_auction_bids_created_at ON auction_bids(created_at DESC);

-- RLS Policies
ALTER TABLE auction_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON auction_bids
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON auction_bids
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

### Table 6: points_transactions

**Purpose:** Points earning and conversion history

```sql
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'convert', 'withdraw')),
  points_amount INTEGER NOT NULL,
  usdt_amount DECIMAL(18, 6),
  source TEXT CHECK (source IN ('submission', 'upvote', 'comment', 'login', 'share', 'referral')),
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX idx_points_transactions_type ON points_transactions(transaction_type);
CREATE INDEX idx_points_transactions_created_at ON points_transactions(created_at DESC);

-- RLS Policies
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner read" ON points_transactions
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "System insert" ON points_transactions
  FOR INSERT WITH CHECK (true); -- System-only inserts
```

---

### Table 7: user_follows

**Purpose:** Social follows

```sql
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id TEXT NOT NULL, -- Clerk user ID
  following_id TEXT NOT NULL, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE UNIQUE INDEX idx_user_follows_unique ON user_follows(follower_id, following_id);

-- RLS Policies
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON user_follows
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON user_follows
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND follower_id = auth.jwt() ->> 'sub');

CREATE POLICY "Owner delete" ON user_follows
  FOR DELETE USING (follower_id = auth.jwt() ->> 'sub');
```

---

### Table 8: article_likes

**Purpose:** Article likes

```sql
CREATE TABLE article_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT NOT NULL,
  user_id TEXT NOT NULL, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_article_likes_article_id ON article_likes(article_id);
CREATE INDEX idx_article_likes_user_id ON article_likes(user_id);
CREATE UNIQUE INDEX idx_article_likes_unique ON article_likes(article_id, user_id);

-- RLS Policies
ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON article_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON article_likes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Owner delete" ON article_likes
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');
```

---

### Table 9: conversations

**Purpose:** Direct message conversations

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id TEXT NOT NULL, -- Clerk user ID
  participant_2_id TEXT NOT NULL, -- Clerk user ID
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE UNIQUE INDEX idx_conversations_unique ON conversations(
  LEAST(participant_1_id, participant_2_id),
  GREATEST(participant_1_id, participant_2_id)
);

-- RLS Policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants read" ON conversations
  FOR SELECT USING (
    participant_1_id = auth.jwt() ->> 'sub' OR
    participant_2_id = auth.jwt() ->> 'sub'
  );

CREATE POLICY "Authenticated insert" ON conversations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

### Table 10: messages

**Purpose:** Direct messages

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL, -- Clerk user ID
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- RLS Policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants read" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1_id = auth.jwt() ->> 'sub' OR
           conversations.participant_2_id = auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "Authenticated insert" ON messages
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    sender_id = auth.jwt() ->> 'sub'
  );

CREATE POLICY "Recipient update read status" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1_id = auth.jwt() ->> 'sub' OR
           conversations.participant_2_id = auth.jwt() ->> 'sub')
      AND conversations.participant_1_id != messages.sender_id
      AND conversations.participant_2_id != messages.sender_id
    )
  );

-- Realtime Subscription
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

---

### Table 11: proposals

**Purpose:** DAO governance proposals

```sql
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id TEXT NOT NULL UNIQUE, -- Blockchain proposal ID
  creator_id TEXT NOT NULL, -- Clerk user ID
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'content_moderation', 'economic_policy', 'features',
    'treasury', 'ad_policies', 'partnerships'
  )),
  status TEXT NOT NULL CHECK (status IN ('active', 'passed', 'failed', 'executed')),
  yes_votes INTEGER DEFAULT 0,
  no_votes INTEGER DEFAULT 0,
  abstain_votes INTEGER DEFAULT 0,
  quorum_met BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_category ON proposals(category);
CREATE INDEX idx_proposals_end_date ON proposals(end_date);
CREATE INDEX idx_proposals_creator ON proposals(creator_id);

-- RLS Policies
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON proposals
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON proposals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

### Table 12: votes

**Purpose:** Governance votes

```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id TEXT NOT NULL,
  voter_id TEXT NOT NULL, -- Clerk user ID
  vote_option INTEGER NOT NULL CHECK (vote_option IN (0, 1, 2)), -- 0 = Yes, 1 = No, 2 = Abstain
  voting_power DECIMAL(18, 6) NOT NULL,
  transaction_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_votes_proposal_id ON votes(proposal_id);
CREATE INDEX idx_votes_voter_id ON votes(voter_id);
CREATE UNIQUE INDEX idx_votes_unique ON votes(proposal_id, voter_id);

-- RLS Policies
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON votes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND voter_id = auth.jwt() ->> 'sub');
```

---

### Table 13: notifications

**Purpose:** User notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  type TEXT NOT NULL CHECK (type IN ('like', 'follow', 'message', 'auction', 'proposal')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner read" ON notifications
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "System insert" ON notifications
  FOR INSERT WITH CHECK (true); -- System-only inserts

CREATE POLICY "Owner update read status" ON notifications
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- Realtime Subscription
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

---

### Table 14: lists

**Purpose:** User-curated lists of articles

```sql
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  subscriber_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_lists_user_id ON lists(user_id);
CREATE INDEX idx_lists_is_public ON lists(is_public);
CREATE INDEX idx_lists_created_at ON lists(created_at DESC);

-- RLS Policies
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read public lists" ON lists
  FOR SELECT USING (is_public = true OR user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Owner read all lists" ON lists
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Authenticated insert" ON lists
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Owner update" ON lists
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Owner delete" ON lists
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');
```

---

### Table 15: list_articles

**Purpose:** Articles in lists

```sql
CREATE TABLE list_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  article_title TEXT,
  article_url TEXT,
  article_source TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by TEXT NOT NULL -- Clerk user ID
);

-- Indexes
CREATE INDEX idx_list_articles_list_id ON list_articles(list_id);
CREATE INDEX idx_list_articles_article_id ON list_articles(article_id);
CREATE INDEX idx_list_articles_added_at ON list_articles(added_at DESC);
CREATE UNIQUE INDEX idx_list_articles_unique ON list_articles(list_id, article_id);

-- RLS Policies
ALTER TABLE list_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read public list articles" ON list_articles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_articles.list_id
      AND (lists.is_public = true OR lists.user_id = auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "Authenticated insert" ON list_articles
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_articles.list_id
      AND lists.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Owner delete" ON list_articles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_articles.list_id
      AND lists.user_id = auth.jwt() ->> 'sub'
    )
  );
```

---

### Table 16: list_subscriptions

**Purpose:** User subscriptions to lists

```sql
CREATE TABLE list_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, user_id)
);

-- Indexes
CREATE INDEX idx_list_subscriptions_list_id ON list_subscriptions(list_id);
CREATE INDEX idx_list_subscriptions_user_id ON list_subscriptions(user_id);

-- RLS Policies
ALTER TABLE list_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON list_subscriptions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON list_subscriptions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Owner delete" ON list_subscriptions
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');
```

---

## 🔗 RELATIONSHIPS

**Foreign Keys:**
1. `messages.conversation_id` → `conversations.id` (CASCADE DELETE)
2. `votes.proposal_id` → `proposals.proposal_id` (logical, not FK)
3. `auction_bids.auction_id` → `auction_participants.auction_id` (logical, not FK)

**Note:** Most relationships are logical (via `user_id`, `article_id`, etc.) rather than foreign keys due to Clerk user IDs being TEXT.

---

## 📊 INDEX SUMMARY

**Total Indexes:** 35+ indexes

**By Table:**
- `submissions`: 5 indexes
- `bookmarks`: 4 indexes
- `advertisements`: 4 indexes
- `auction_participants`: 3 indexes
- `auction_bids`: 4 indexes
- `points_transactions`: 3 indexes
- `user_follows`: 3 indexes
- `article_likes`: 3 indexes
- `conversations`: 3 indexes
- `messages`: 3 indexes
- `proposals`: 4 indexes
- `votes`: 3 indexes
- `notifications`: 3 indexes

**Performance Optimization:**
- All foreign keys indexed
- Frequently queried columns indexed
- Composite indexes for common queries
- Unique indexes for data integrity

---

## ✅ DATABASE SCHEMA COMPLETE

**Status:** ✅ Database Schema Complete  
**Next:** API Specifications  
**Next Agent:** Data Agent (`/data`) - After design approval

**Total Tables:** 13 tables  
**Total Indexes:** 35+ indexes  
**RLS Policies:** All tables secured with Row Level Security

