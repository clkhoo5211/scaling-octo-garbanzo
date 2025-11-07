# 🏗️ Technical Architecture

## Web3News - Blockchain Content Aggregator

**Created:** 2025-11-07  
**Design Agent:** System Architect  
**Status:** ✅ Complete  
**Next Agent:** Data Agent (`/data`)

---

## 📊 ARCHITECTURE OVERVIEW

**Architecture Type:** Client-Side PWA (Static Site Generation)  
**Framework:** Next.js 14 (App Router)  
**Deployment:** GitHub Pages (Static Export)  
**State Management:** Zustand (Global State) + React Query (Server State)  
**Storage:** IndexedDB (Client Cache) + Supabase (Content Database)  
**Authentication:** Reown AppKit (PRIMARY) + Clerk (SECONDARY)

---

## 🎯 SYSTEM ARCHITECTURE COMPONENTS

### Component 1: Frontend Application (Next.js 14)

**Responsibility:** Main application layer, UI rendering, client-side logic  
**Technology:** Next.js 14 (App Router), TypeScript, React 18, Tailwind CSS  
**Dependencies:** None (root component)

**Key Features:**

- Static Site Generation (`output: 'export'`)
- App Router (file-based routing)
- Server Components (for static content)
- Client Components (for interactivity)
- PWA support (Service Worker, manifest)

**Structure:**

```
app/
├── layout.tsx          # Root layout (providers, metadata)
├── page.tsx            # Homepage
├── (auth)/
│   ├── login/
│   └── verify/
├── (feed)/
│   ├── feed/
│   ├── article/[id]/
│   └── search/
├── (web3)/
│   ├── auctions/
│   ├── points/
│   └── governance/
└── (social)/
    ├── profile/
    ├── messages/
    └── lists/
```

---

### Component 2: State Management Layer

**Responsibility:** Global state management, server state caching  
**Technology:** Zustand (global state) + React Query (server state)  
**Dependencies:** Frontend Application

**Zustand Stores:**

- `useAuthStore` - Authentication state (Reown + Clerk)
- `useUserStore` - User preferences, settings
- `useUIStore` - UI state (modals, sidebars, theme)
- `usePointsStore` - Points balance, transactions
- `useAuctionStore` - Auction state, bids

**React Query:**

- Content fetching (articles, sources)
- Supabase queries (bookmarks, submissions)
- External API calls (Hacker News, Reddit, etc.)
- Cache management (30-min TTL)

---

### Component 3: Content Aggregation Service

**Responsibility:** Fetch and aggregate content from 30+ sources  
**Technology:** Client-side fetch API, IndexedDB caching  
**Dependencies:** State Management Layer, IndexedDB

**Features:**

- Parallel fetching (Promise.all)
- Deduplication (URL hash)
- Caching (IndexedDB, 30-min TTL)
- Error handling (retry logic)
- Rate limiting (client-side, 10 req/min per source)

**Sources:**

- Hacker News (Firebase API)
- Product Hunt (GraphQL API)
- GitHub Trending (REST API)
- Reddit (JSON endpoints)
- Medium (RSS feeds)
- Crypto news (RSS feeds)
- Price APIs (CoinGecko, CryptoCompare, etc.)

---

### Component 4: IndexedDB Cache Layer

**Responsibility:** Client-side data caching and offline support  
**Technology:** IndexedDB (via localforage library)  
**Dependencies:** Content Aggregation Service

**Storage Structure:**

- `articles` - Cached articles (30-min TTL, 2,000 limit)
- `bookmarks` - User bookmarks (persistent)
- `preferences` - User preferences (persistent)
- `offlineQueue` - Pending actions (sync when online)

**Operations:**

- Read: Check cache → Return if valid → Fetch if expired
- Write: Store in IndexedDB → Set TTL → Auto-cleanup
- Cleanup: Remove expired entries (keep last 30 days)

---

### Component 5: Authentication Service

**Responsibility:** User authentication and Web3 wallet management  
**Technology:** Reown AppKit + Clerk  
**Dependencies:** Frontend Application

**Reown AppKit:**

- Social login (Google, Twitter, Email, Discord)
- ERC-4337 smart account creation (automatic)
- Multi-chain wallet support (15+ chains)
- Built-in on-ramp (buy USDT)

**Clerk:**

- User metadata storage (profile, preferences)
- Subscription management (Pro, Premium)
- Email verification (magic links)
- Session management (JWT tokens)

**Flow:**

1. User clicks login → Reown modal
2. Social login → Reown creates smart account
3. Clerk user created (background)
4. Email verification sent
5. User verified → Full access

---

### Component 6: Supabase Database Layer

**Responsibility:** Content data storage (no users table)  
**Technology:** Supabase PostgreSQL  
**Dependencies:** Frontend Application (via Supabase client)

**Tables:**

- `submissions` - User-submitted articles
- `bookmarks` - User bookmarks
- `advertisements` - Ad content
- `auction_participants` - Auction participants
- `auction_bids` - Bid history
- `points_transactions` - Points earning/conversion
- `user_follows` - Social follows
- `article_likes` - Article likes
- `conversations` - Direct messages
- `proposals` - DAO proposals
- `votes` - Governance votes
- `notifications` - User notifications

**Note:** NO users table (Clerk metadata stores user data)

---

### Component 7: Smart Contract Integration

**Responsibility:** Blockchain interactions (ad auctions, subscriptions, governance)  
**Technology:** Reown AppKit, wagmi, viem  
**Dependencies:** Authentication Service

**Contracts:**

- `AdPaymentContract.sol` - Ad auctions (6 chains)
- `SubscriptionManager.sol` - Subscriptions (6 chains)
- `Governance.sol` - DAO voting (6 chains)

**Total Deployments:** 18 contracts (3 types × 6 chains)

**Chains:**

- Ethereum, Polygon, BSC, Arbitrum, Optimism, Base

---

### Component 8: External API Integration

**Responsibility:** Integrate with 30+ external content sources  
**Technology:** Fetch API, CORS proxies (if needed)  
**Dependencies:** Content Aggregation Service

**APIs:**

- Hacker News Firebase API
- Product Hunt GraphQL API
- GitHub REST API
- Reddit JSON endpoints
- RSS feeds (Medium, CoinDesk, etc.)
- Price APIs (CoinGecko, CryptoCompare, etc.)

**Pattern:**

- Client-side fetching (no backend)
- CORS proxies for non-CORS APIs
- Rate limiting (10 req/min per source)
- Error handling (retry, fallback)

---

### Component 9: PWA Service Worker

**Responsibility:** Offline support, caching, push notifications  
**Technology:** Service Worker API  
**Dependencies:** Frontend Application

**Features:**

- Static asset caching (CSS, JS, images)
- Article caching (last 100 articles)
- Offline queue (pending actions)
- Background sync (when online)
- Push notifications (Web Push API)

**Strategies:**

- Cache-first: Static assets
- Network-first: Dynamic content
- Stale-while-revalidate: Articles

---

### Component 10: Analytics & Monitoring

**Responsibility:** Track user behavior, performance, errors  
**Technology:** Dune Analytics (on-chain), Supabase Analytics (off-chain), Clerk Analytics (users)  
**Dependencies:** Frontend Application, Smart Contracts

**Metrics:**

- On-chain: Ad auctions, subscriptions, governance (Dune Analytics)
- Off-chain: Content views, engagement (Supabase Analytics)
- Users: Signups, retention (Clerk Analytics)

**TOTAL COMPONENTS:** 10 system components

---

## 🔌 API SPECIFICATIONS (Client-Side)

### API 1: Content Aggregation API

**Purpose:** Fetch and aggregate content from external sources  
**Type:** Client-side wrapper functions

**Functions:**

**`fetchHackerNews()`**

- **Method:** GET
- **Endpoint:** `https://hacker-news.firebaseio.com/v0/topstories.json`
- **Response:** Array of story IDs
- **Auth:** None
- **Rate Limit:** None (be respectful)

**`fetchProductHunt()`**

- **Method:** POST (GraphQL)
- **Endpoint:** `https://api.producthunt.com/v2/api/graphql`
- **Query:** `{ posts { edges { node { id, name, tagline } } } }`
- **Auth:** API key (free tier: 100 req/hour)
- **Rate Limit:** 100 requests/hour

**`fetchGitHubTrending()`**

- **Method:** GET
- **Endpoint:** `https://api.github.com/search/repositories?q=created:>2024-01-01&sort=stars`
- **Response:** Repository list
- **Auth:** Optional (5,000 req/hour vs 60 unauthenticated)
- **Rate Limit:** 60 req/hour (unauthenticated), 5,000 (authenticated)

**`fetchReddit()`**

- **Method:** GET
- **Endpoint:** `https://www.reddit.com/r/technology.json`
- **Response:** Reddit post list
- **Auth:** None
- **Rate Limit:** 60 requests/minute

**`fetchRSSFeed(url)`**

- **Method:** GET
- **Endpoint:** RSS feed URL (e.g., `https://decrypt.co/feed`)
- **Response:** Parsed RSS XML
- **Auth:** None
- **Rate Limit:** None (RSS is unlimited)

**`fetchCoinGecko()`**

- **Method:** GET
- **Endpoint:** `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd`
- **Response:** Price data
- **Auth:** None
- **Rate Limit:** 30 calls/minute (43,200 calls/day)

**TOTAL API FUNCTIONS:** 15+ client-side API wrappers

---

### API 2: Supabase Client API

**Purpose:** Interact with Supabase database (content only)  
**Type:** Supabase client library

**Functions:**

**`getSubmissions(filters)`**

- **Table:** `submissions`
- **Filters:** `source`, `category`, `date_range`
- **Response:** Submission list
- **Auth:** Row Level Security (RLS)

**`createBookmark(articleId)`**

- **Table:** `bookmarks`
- **Payload:** `{ article_id, user_id, created_at }`
- **Response:** Bookmark object
- **Auth:** RLS (user can only create own bookmarks)

**`getBookmarks(userId)`**

- **Table:** `bookmarks`
- **Filters:** `user_id`
- **Response:** Bookmark list
- **Auth:** RLS (user can only read own bookmarks)

**`likeArticle(articleId)`**

- **Table:** `article_likes`
- **Payload:** `{ article_id, user_id, created_at }`
- **Response:** Like object
- **Auth:** RLS

**`followUser(userId, targetUserId)`**

- **Table:** `user_follows`
- **Payload:** `{ user_id, target_user_id, created_at }`
- **Response:** Follow object
- **Auth:** RLS

**`sendMessage(conversationId, content)`**

- **Table:** `messages`
- **Payload:** `{ conversation_id, user_id, content, created_at }`
- **Response:** Message object
- **Auth:** RLS (Realtime)

**TOTAL SUPABASE FUNCTIONS:** 20+ database operations

---

### API 3: Smart Contract API

**Purpose:** Interact with blockchain smart contracts  
**Type:** Reown AppKit + wagmi hooks

**Functions:**

**`joinAuction(auctionId)`**

- **Contract:** `AdPaymentContract`
- **Method:** `joinAuction(uint256 auctionId)`
- **Params:** `auctionId` (uint256)
- **Payment:** 1 USDT (participation fee)
- **Response:** Transaction hash

**`placeBid(auctionId, amount)`**

- **Contract:** `AdPaymentContract`
- **Method:** `placeBid(uint256 auctionId, uint256 amount)`
- **Params:** `auctionId`, `amount` (must be 5%+ higher)
- **Response:** Transaction hash

**`subscribe(tier)`**

- **Contract:** `SubscriptionManager`
- **Method:** `subscribe(uint8 tier)`
- **Params:** `tier` (1 = Pro, 2 = Premium)
- **Payment:** 30 USDT (Pro) or 100 USDT (Premium)
- **Response:** Transaction hash

**`createProposal(title, description, category)`**

- **Contract:** `Governance`
- **Method:** `createProposal(string title, string description, uint8 category)`
- **Cost:** 1,000 points
- **Response:** Proposal ID, transaction hash

**`vote(proposalId, option)`**

- **Contract:** `Governance`
- **Method:** `vote(uint256 proposalId, uint8 option)`
- **Params:** `proposalId`, `option` (0 = Yes, 1 = No, 2 = Abstain)
- **Response:** Transaction hash

**TOTAL SMART CONTRACT FUNCTIONS:** 10+ blockchain operations

---

## 🗄️ DATABASE SCHEMA (Supabase PostgreSQL)

### Table 1: submissions

**Purpose:** User-submitted articles  
**Columns:**

- `id` (UUID, PRIMARY KEY)
- `user_id` (TEXT, NOT NULL) - Clerk user ID
- `title` (TEXT, NOT NULL)
- `url` (TEXT, NOT NULL, UNIQUE)
- `source` (TEXT, NOT NULL) - Source name
- `category` (TEXT) - tech, crypto, social, general
- `upvotes` (INTEGER, DEFAULT 0)
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW())

**Indexes:**

- `idx_submissions_user_id` ON `user_id`
- `idx_submissions_category` ON `category`
- `idx_submissions_created_at` ON `created_at` DESC
- `idx_submissions_upvotes` ON `upvotes` DESC

**RLS Policies:**

- SELECT: Public (anyone can read)
- INSERT: Authenticated users only
- UPDATE: Owner only (user_id match)
- DELETE: Owner only

---

### Table 2: bookmarks

**Purpose:** User bookmarks  
**Columns:**

- `id` (UUID, PRIMARY KEY)
- `user_id` (TEXT, NOT NULL) - Clerk user ID
- `article_id` (TEXT, NOT NULL) - Article URL or ID
- `article_title` (TEXT)
- `article_source` (TEXT)
- `created_at` (TIMESTAMP, DEFAULT NOW())

**Indexes:**

- `idx_bookmarks_user_id` ON `user_id`
- `idx_bookmarks_created_at` ON `created_at` DESC

**RLS Policies:**

- SELECT: Owner only (user_id match)
- INSERT: Authenticated users only
- DELETE: Owner only

---

### Table 3: advertisements

**Purpose:** Ad content  
**Columns:**

- `id` (UUID, PRIMARY KEY)
- `advertiser_id` (TEXT, NOT NULL) - Wallet address
- `slot_type` (TEXT, NOT NULL) - banner, sponsored, promoted
- `slot_location` (TEXT, NOT NULL) - homepage, category, article
- `content_url` (TEXT, NOT NULL) - Image/GIF/video URL
- `link_url` (TEXT) - Click destination
- `start_date` (TIMESTAMP, NOT NULL)
- `end_date` (TIMESTAMP, NOT NULL)
- `is_active` (BOOLEAN, DEFAULT true)
- `created_at` (TIMESTAMP, DEFAULT NOW())

**Indexes:**

- `idx_advertisements_slot_location` ON `slot_location`
- `idx_advertisements_is_active` ON `is_active`
- `idx_advertisements_end_date` ON `end_date`

**RLS Policies:**

- SELECT: Public (anyone can read active ads)
- INSERT: Authenticated users only (advertisers)
- UPDATE: Owner only (advertiser_id match)

---

### Table 4: auction_participants

**Purpose:** Auction participants  
**Columns:**

- `id` (UUID, PRIMARY KEY)
- `auction_id` (TEXT, NOT NULL) - Auction identifier
- `participant_address` (TEXT, NOT NULL) - Wallet address
- `participation_fee_paid` (BOOLEAN, DEFAULT false)
- `transaction_hash` (TEXT) - Blockchain transaction
- `created_at` (TIMESTAMP, DEFAULT NOW())

**Indexes:**

- `idx_auction_participants_auction_id` ON `auction_id`
- `idx_auction_participants_address` ON `participant_address`

**RLS Policies:**

- SELECT: Public (anyone can read)
- INSERT: Authenticated users only

---

### Table 5: auction_bids

**Purpose:** Bid history  
**Columns:**

- `id` (UUID, PRIMARY KEY)
- `auction_id` (TEXT, NOT NULL)
- `bidder_address` (TEXT, NOT NULL) - Wallet address
- `bid_amount` (DECIMAL, NOT NULL) - USDT amount
- `transaction_hash` (TEXT, NOT NULL) - Blockchain transaction
- `block_number` (BIGINT) - Block number
- `created_at` (TIMESTAMP, DEFAULT NOW())

**Indexes:**

- `idx_auction_bids_auction_id` ON `auction_id`
- `idx_auction_bids_bidder` ON `bidder_address`
- `idx_auction_bids_amount` ON `bid_amount` DESC

**RLS Policies:**

- SELECT: Public (anyone can read)
- INSERT: Authenticated users only

---

### Table 6: points_transactions

**Purpose:** Points earning and conversion history  
**Columns:**

- `id` (UUID, PRIMARY KEY)
- `user_id` (TEXT, NOT NULL) - Clerk user ID
- `transaction_type` (TEXT, NOT NULL) - earn, convert, withdraw
- `points_amount` (INTEGER, NOT NULL)
- `usdt_amount` (DECIMAL) - If conversion
- `source` (TEXT) - submission, upvote, comment, login, share
- `transaction_hash` (TEXT) - If blockchain transaction
- `created_at` (TIMESTAMP, DEFAULT NOW())

**Indexes:**

- `idx_points_transactions_user_id` ON `user_id`
- `idx_points_transactions_type` ON `transaction_type`
- `idx_points_transactions_created_at` ON `created_at` DESC

**RLS Policies:**

- SELECT: Owner only (user_id match)
- INSERT: System only (via triggers or API)

---

### Table 7: user_follows

**Purpose:** Social follows  
**Columns:**

- `id` (UUID, PRIMARY KEY)
- `follower_id` (TEXT, NOT NULL) - Clerk user ID
- `following_id` (TEXT, NOT NULL) - Clerk user ID
- `created_at` (TIMESTAMP, DEFAULT NOW())

**Indexes:**

- `idx_user_follows_follower` ON `follower_id`
- `idx_user_follows_following` ON `following_id`
- `idx_user_follows_unique` UNIQUE (`follower_id`, `following_id`)

**RLS Policies:**

- SELECT: Public (anyone can read)
- INSERT: Authenticated users only
- DELETE: Owner only (follower_id match)

---

### Table 8: article_likes

**Purpose:** Article likes  
**Columns:**

- `id` (UUID, PRIMARY KEY)
- `article_id` (TEXT, NOT NULL) - Article URL or ID
- `user_id` (TEXT, NOT NULL) - Clerk user ID
- `created_at` (TIMESTAMP, DEFAULT NOW())

**Indexes:**

- `idx_article_likes_article_id` ON `article_id`
- `idx_article_likes_user_id` ON `user_id`
- `idx_article_likes_unique` UNIQUE (`article_id`, `user_id`)

**RLS Policies:**

- SELECT: Public (anyone can read)
- INSERT: Authenticated users only
- DELETE: Owner only (user_id match)

---

### Table 9: conversations

**Purpose:** Direct message conversations  
**Columns:**

- `id` (UUID, PRIMARY KEY)
- `participant_1_id` (TEXT, NOT NULL) - Clerk user ID
- `participant_2_id` (TEXT, NOT NULL) - Clerk user ID
- `last_message_at` (TIMESTAMP)
- `created_at` (TIMESTAMP, DEFAULT NOW())

**Indexes:**

- `idx_conversations_participant_1` ON `participant_1_id`
- `idx_conversations_participant_2` ON `participant_2_id`
- `idx_conversations_unique` UNIQUE (`participant_1_id`, `participant_2_id`)

**RLS Policies:**

- SELECT: Participants only (user_id in participant_1_id or participant_2_id)
- INSERT: Authenticated users only

---

### Table 10: messages

**Purpose:** Direct messages  
**Columns:**

- `id` (UUID, PRIMARY KEY)
- `conversation_id` (UUID, FOREIGN KEY → conversations.id)
- `sender_id` (TEXT, NOT NULL) - Clerk user ID
- `content` (TEXT, NOT NULL)
- `is_read` (BOOLEAN, DEFAULT false)
- `created_at` (TIMESTAMP, DEFAULT NOW())

**Indexes:**

- `idx_messages_conversation_id` ON `conversation_id`
- `idx_messages_sender_id` ON `sender_id`
- `idx_messages_created_at` ON `created_at` DESC

**RLS Policies:**

- SELECT: Conversation participants only
- INSERT: Authenticated users only (sender_id match)
- UPDATE: Owner only (sender_id match) - For read status

**Realtime:** Enabled for `messages` table (Supabase Realtime)

---

### Table 11: proposals

**Purpose:** DAO governance proposals  
**Columns:**

- `id` (UUID, PRIMARY KEY)
- `proposal_id` (TEXT, NOT NULL, UNIQUE) - Blockchain proposal ID
- `creator_id` (TEXT, NOT NULL) - Clerk user ID
- `title` (TEXT, NOT NULL)
- `description` (TEXT, NOT NULL)
- `category` (TEXT, NOT NULL) - content_moderation, economic_policy, features, treasury, ad_policies, partnerships
- `status` (TEXT, NOT NULL) - active, passed, failed, executed
- `yes_votes` (INTEGER, DEFAULT 0)
- `no_votes` (INTEGER, DEFAULT 0)
- `abstain_votes` (INTEGER, DEFAULT 0)
- `quorum_met` (BOOLEAN, DEFAULT false)
- `start_date` (TIMESTAMP, NOT NULL)
- `end_date` (TIMESTAMP, NOT NULL)
- `created_at` (TIMESTAMP, DEFAULT NOW())

**Indexes:**

- `idx_proposals_status` ON `status`
- `idx_proposals_category` ON `category`
- `idx_proposals_end_date` ON `end_date`

**RLS Policies:**

- SELECT: Public (anyone can read)
- INSERT: Authenticated users only

---

### Table 12: votes

**Purpose:** Governance votes  
**Columns:**

- `id` (UUID, PRIMARY KEY)
- `proposal_id` (TEXT, NOT NULL) - Blockchain proposal ID
- `voter_id` (TEXT, NOT NULL) - Clerk user ID
- `vote_option` (INTEGER, NOT NULL) - 0 = Yes, 1 = No, 2 = Abstain
- `voting_power` (DECIMAL, NOT NULL) - Meritocratic power
- `transaction_hash` (TEXT, NOT NULL) - Blockchain transaction
- `created_at` (TIMESTAMP, DEFAULT NOW())

**Indexes:**

- `idx_votes_proposal_id` ON `proposal_id`
- `idx_votes_voter_id` ON `voter_id`
- `idx_votes_unique` UNIQUE (`proposal_id`, `voter_id`)

**RLS Policies:**

- SELECT: Public (anyone can read)
- INSERT: Authenticated users only

---

### Table 13: notifications

**Purpose:** User notifications  
**Columns:**

- `id` (UUID, PRIMARY KEY)
- `user_id` (TEXT, NOT NULL) - Clerk user ID
- `type` (TEXT, NOT NULL) - like, follow, message, auction, proposal
- `title` (TEXT, NOT NULL)
- `message` (TEXT, NOT NULL)
- `link_url` (TEXT) - Link to related content
- `is_read` (BOOLEAN, DEFAULT false)
- `created_at` (TIMESTAMP, DEFAULT NOW())

**Indexes:**

- `idx_notifications_user_id` ON `user_id`
- `idx_notifications_is_read` ON `is_read`
- `idx_notifications_created_at` ON `created_at` DESC

**RLS Policies:**

- SELECT: Owner only (user_id match)
- INSERT: System only (via triggers or API)
- UPDATE: Owner only (user_id match) - For read status

**TOTAL TABLES:** 13 tables  
**TOTAL RELATIONSHIPS:** 5 foreign keys  
**TOTAL INDEXES:** 35+ indexes (performance optimization)

---

## 💾 INDEXEDDB SCHEMA (Client-Side Cache)

### Object Store 1: articles

**Purpose:** Cached articles (30-min TTL, 2,000 limit)  
**Key:** `url` (string) - Article URL  
**Indexes:**

- `source` - Source name
- `category` - Category (tech, crypto, social, general)
- `cached_at` - Cache timestamp (for TTL)
- `created_at` - Original publish date

**Schema:**

```typescript
interface CachedArticle {
  url: string; // Primary key
  title: string;
  source: string;
  category: string;
  thumbnail?: string;
  content?: string; // Full content (if available)
  excerpt?: string;
  author?: string;
  publishedAt: number; // Timestamp
  cachedAt: number; // Cache timestamp (for TTL)
  upvotes?: number;
  comments?: number;
}
```

**Operations:**

- `getArticle(url)` - Get article by URL
- `getArticlesBySource(source)` - Get articles by source
- `getArticlesByCategory(category)` - Get articles by category
- `cacheArticle(article)` - Cache article (set TTL)
- `cleanupExpired()` - Remove expired articles (30-min TTL)
- `cleanupOld()` - Remove old articles (keep last 2,000)

---

### Object Store 2: bookmarks

**Purpose:** User bookmarks (persistent)  
**Key:** `id` (string) - Bookmark ID  
**Indexes:**

- `articleUrl` - Article URL
- `createdAt` - Creation timestamp

**Schema:**

```typescript
interface Bookmark {
  id: string; // Primary key
  articleUrl: string;
  articleTitle: string;
  articleSource: string;
  createdAt: number; // Timestamp
}
```

**Operations:**

- `getBookmarks()` - Get all bookmarks
- `addBookmark(bookmark)` - Add bookmark
- `removeBookmark(id)` - Remove bookmark
- `isBookmarked(url)` - Check if article is bookmarked

---

### Object Store 3: preferences

**Purpose:** User preferences (persistent)  
**Key:** `key` (string) - Preference key  
**Value:** `value` (any) - Preference value

**Schema:**

```typescript
interface Preference {
  key: string; // Primary key
  value: any; // Preference value
  updatedAt: number; // Timestamp
}
```

**Keys:**

- `theme` - dark, light, system
- `language` - en, zh-CN, zh-TW
- `fontSize` - small, medium, large
- `notifications` - enabled, disabled
- `interests` - Array of categories

**Operations:**

- `getPreference(key)` - Get preference
- `setPreference(key, value)` - Set preference
- `getAllPreferences()` - Get all preferences

---

### Object Store 4: offlineQueue

**Purpose:** Pending actions (sync when online)  
**Key:** `id` (string) - Queue item ID  
**Indexes:**

- `type` - Action type (like, bookmark, follow, etc.)
- `createdAt` - Creation timestamp

**Schema:**

```typescript
interface OfflineQueueItem {
  id: string; // Primary key
  type: string; // like, bookmark, follow, message, etc.
  payload: any; // Action payload
  createdAt: number; // Timestamp
  retries: number; // Retry count
}
```

**Operations:**

- `addToQueue(item)` - Add action to queue
- `getQueue()` - Get all queued actions
- `removeFromQueue(id)` - Remove from queue (after sync)
- `syncQueue()` - Sync all queued actions (when online)

**TOTAL OBJECT STORES:** 4 stores  
**TOTAL INDEXES:** 10+ indexes

---

## 🔗 INTEGRATION SPECIFICATIONS

### Integration 1: Reown AppKit

**Purpose:** Web3 authentication and wallet management  
**API:** Reown AppKit React SDK  
**Auth:** OAuth (social login) + ERC-4337 (smart accounts)  
**Error Handling:** Retry logic, fallback to email login

**Configuration:**

```typescript
import { createAppKit } from "@reown/appkit/react";

const appKit = createAppKit({
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
  metadata: {
    name: "Web3News",
    description: "Decentralized news aggregation",
    url: "https://web3news.xyz",
    icons: ["/icon.png"],
  },
  features: {
    analytics: true,
    email: true,
    socials: ["google", "twitter", "discord"],
  },
  chains: [ethereum, polygon, bsc, arbitrum, optimism, base],
});
```

**Functions:**

- `connect()` - Open connection modal
- `disconnect()` - Disconnect wallet
- `getAccount()` - Get connected account
- `getChain()` - Get current chain
- `switchChain(chainId)` - Switch chain

---

### Integration 2: Clerk

**Purpose:** User management and subscriptions  
**API:** Clerk React SDK  
**Auth:** JWT tokens (session management)  
**Error Handling:** Retry logic, error logging

**Configuration:**

```typescript
import { ClerkProvider } from '@clerk/nextjs'

<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
>
  {children}
</ClerkProvider>
```

**Functions:**

- `useUser()` - Get current user
- `useAuth()` - Get auth state
- `user.metadata` - User metadata (subscription, preferences)
- `user.update()` - Update user metadata

**Metadata Keys:**

- `subscription_tier` - free, pro, premium
- `subscription_expires_at` - Expiry timestamp
- `points_balance` - Current points balance
- `wallet_address` - Reown wallet address

---

### Integration 3: Supabase

**Purpose:** Content database  
**API:** Supabase JavaScript client  
**Auth:** Row Level Security (RLS) policies  
**Error Handling:** Retry logic, error logging

**Configuration:**

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

**Functions:**

- `supabase.from('table').select()` - Query data
- `supabase.from('table').insert()` - Insert data
- `supabase.from('table').update()` - Update data
- `supabase.from('table').delete()` - Delete data
- `supabase.channel('channel').subscribe()` - Realtime subscription

**Realtime Channels:**

- `messages` - Direct messages (real-time)
- `notifications` - User notifications (real-time)
- `auction_bids` - Auction bids (real-time)

---

### Integration 4: External Content APIs

**Purpose:** Aggregate content from 30+ sources  
**APIs:** Various (Firebase, GraphQL, REST, RSS)  
**Auth:** API keys (where required)  
**Error Handling:** Retry with exponential backoff, fallback to cached data

**Rate Limiting:**

- Client-side rate limiting (10 req/min per source)
- Exponential backoff on errors
- Cache fallback on failure

**CORS Handling:**

- Use CORS proxies for non-CORS APIs
- `https://cors-anywhere.herokuapp.com/` (or self-hosted)

**TOTAL INTEGRATIONS:** 4 major integrations

---

## 🔒 SECURITY ARCHITECTURE

### Authentication Mechanism

**Primary:** Reown AppKit (OAuth + ERC-4337)  
**Secondary:** Clerk (JWT tokens)  
**Flow:** Social login → Smart account → Clerk user → Email verification

**Security Features:**

- OAuth 2.0 (Google, Twitter, Discord)
- ERC-4337 smart accounts (non-custodial)
- JWT tokens (Clerk session management)
- Email verification (magic links)

---

### Authorization Model

**Type:** Role-Based Access Control (RBAC) + Row Level Security (RLS)

**Roles:**

- `free` - Free tier users
- `pro` - Pro subscribers ($30/month)
- `premium` - Premium subscribers ($100/month)
- `admin` - Platform administrators

**RLS Policies:**

- Users can only read/write their own data
- Public read access for articles, proposals
- Authenticated write access for submissions, votes

---

### Data Encryption

**At Rest:** Supabase encryption (managed by Supabase)  
**In Transit:** HTTPS/TLS (all connections)  
**Client-Side:** IndexedDB (browser-managed encryption)

**Sensitive Data:**

- Wallet addresses (public, on-chain)
- User metadata (Clerk, encrypted)
- Points balance (Supabase, encrypted)

---

### Security Headers

**Content Security Policy (CSP):**

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.reown.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https://*.supabase.co https://*.reown.com https://api.*;
```

**Other Headers:**

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

---

### Rate Limiting

**Client-Side:** 10 requests/minute per source  
**Supabase:** Row Level Security (RLS) policies  
**Smart Contracts:** Gas limits (blockchain-native)

**Implementation:**

- Client-side rate limiting (IndexedDB tracking)
- Exponential backoff on errors
- Cache fallback on rate limit

**TOTAL SECURITY SPECS:** 5 security mechanisms

---

## ⚡ PERFORMANCE ARCHITECTURE

### Caching Strategy

**Client-Side (IndexedDB):**

- Articles: 30-min TTL, 2,000 article limit
- Preferences: Persistent (no TTL)
- Bookmarks: Persistent (no TTL)
- Offline queue: Persistent (sync when online)

**Service Worker:**

- Static assets: Cache-first (CSS, JS, images)
- Articles: Network-first, cache fallback
- API responses: Stale-while-revalidate

**React Query:**

- Server state caching (30-min TTL)
- Automatic refetching (on window focus)
- Background updates (stale-while-revalidate)

---

### Database Optimization

**Indexing Strategy:**

- Primary keys: All tables
- Foreign keys: All relationships
- Frequently queried columns: `user_id`, `category`, `created_at`
- Composite indexes: `(user_id, created_at)` for user queries

**Query Optimization:**

- Limit results (pagination)
- Select only needed columns
- Use indexes for filtering
- Avoid N+1 queries

---

### Load Balancing

**Type:** Client-Side (no backend servers)  
**Strategy:** Parallel fetching (Promise.all)  
**Fallback:** Cache-first on errors

**Implementation:**

- Fetch from multiple sources in parallel
- Use fastest response
- Cache all responses
- Fallback to cache on failure

---

### Scalability

**Type:** Horizontal (client-side architecture scales automatically)  
**Strategy:** Static site generation (GitHub Pages CDN)  
**Limits:** None (client-side, no server load)

**Performance Targets:**

- First Contentful Paint (FCP): < 1.5s
- Time to Interactive (TTI): < 3.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Lighthouse Score: > 95

**TOTAL PERFORMANCE SPECS:** 4 performance mechanisms

---

## 📄 UI TECHNICAL SPECIFICATIONS

### Page 1: Homepage / Feed

**Components Needed:**

- `Header` - Logo, search, profile, notifications
- `CategoryTabs` - Tech, Crypto, Social, General (swipeable)
- `ArticleCard` - Article preview (thumbnail, title, source, actions)
- `InfiniteScroll` - Virtual scrolling for performance
- `BottomNav` - Home, Search, Bookmarks, Profile

**State Management:**

- `useFeedStore` (Zustand) - Feed state, filters
- `useQuery` (React Query) - Articles fetching, caching

**Data Fetching:**

- `fetchArticles(category)` - Fetch articles by category
- `fetchMoreArticles()` - Load more (pagination)

**Routing:**

- Path: `/`
- Layout: Root layout (header + bottom nav)

---

### Page 2: Article Reader View

**Components Needed:**

- `ReaderView` - Article content (clean, readable)
- `ReadingProgress` - Progress bar (top)
- `ReaderControls` - Font size, line height, theme
- `ActionBar` - Upvote, bookmark, share, translate, summarize

**State Management:**

- `useReaderStore` (Zustand) - Reader preferences
- `useQuery` (React Query) - Article content fetching

**Data Fetching:**

- `fetchArticleContent(url)` - Fetch full article content
- `upvoteArticle(articleId)` - Upvote article
- `bookmarkArticle(articleId)` - Bookmark article

**Routing:**

- Path: `/article/[id]`
- Layout: Reader layout (minimal header)

---

### Page 3: Search & Discovery

**Components Needed:**

- `SearchBar` - Search input (autocomplete)
- `RecentSearches` - Recent searches (chips)
- `TrendingTopics` - Trending topics (chips)
- `FilterChips` - Source, date, category filters
- `SearchResults` - Article cards (filtered)

**State Management:**

- `useSearchStore` (Zustand) - Search state, filters
- `useQuery` (React Query) - Search results fetching

**Data Fetching:**

- `searchArticles(query, filters)` - Search articles
- `getRecentSearches()` - Get recent searches (IndexedDB)
- `getTrendingTopics()` - Get trending topics

**Routing:**

- Path: `/search`
- Layout: Standard layout (header + bottom nav)

---

### Page 4: Authentication / Onboarding

**Components Needed:**

- `WelcomeScreen` - Welcome message, social login buttons
- `ReownModal` - Reown AppKit modal (automatic)
- `EmailVerification` - Email verification prompt
- `OnboardingFlow` - Interests, preferences

**State Management:**

- `useAuthStore` (Zustand) - Auth state (Reown + Clerk)
- `useOnboardingStore` (Zustand) - Onboarding state

**Data Fetching:**

- `createClerkUser()` - Create Clerk user (background)
- `verifyEmail()` - Verify email (magic link)
- `completeOnboarding(preferences)` - Save preferences

**Routing:**

- Path: `/login`, `/verify`, `/onboarding`
- Layout: Auth layout (centered, no nav)

---

### Page 5: Ad Auction Dashboard

**Components Needed:**

- `AuctionList` - Auction cards (active, upcoming, ended)
- `AuctionCard` - Slot preview, current bid, time remaining
- `AuctionDetail` - Full auction details, bid history
- `BidForm` - Bid amount input, tenure selector
- `TransactionConfirmation` - Transaction confirmation modal

**State Management:**

- `useAuctionStore` (Zustand) - Auction state, bids
- `useQuery` (React Query) - Auction data fetching
- `useContract` (wagmi) - Smart contract interactions

**Data Fetching:**

- `fetchAuctions(filters)` - Fetch auctions
- `fetchAuctionDetail(auctionId)` - Fetch auction details
- `placeBid(auctionId, amount)` - Place bid (smart contract)

**Routing:**

- Path: `/auctions`, `/auctions/[id]`
- Layout: Standard layout (header + bottom nav)

---

### Page 6: Points & Rewards

**Components Needed:**

- `PointsBalance` - Points balance display (large, prominent)
- `EarningBreakdown` - Earning breakdown (submissions, upvotes, etc.)
- `ConversionCalculator` - Points → USDT calculator
- `ConversionForm` - Conversion form (amount, confirm)
- `TransactionHistory` - Transaction history list

**State Management:**

- `usePointsStore` (Zustand) - Points balance, transactions
- `useQuery` (React Query) - Points data fetching

**Data Fetching:**

- `getPointsBalance(userId)` - Get points balance
- `getPointsTransactions(userId)` - Get transaction history
- `convertPoints(amount)` - Convert points to USDT

**Routing:**

- Path: `/points`
- Layout: Standard layout (header + bottom nav)

---

### Page 7: Profile & Settings

**Components Needed:**

- `ProfileHeader` - Avatar, name, bio, badges
- `ProfileStats` - Points, submissions, upvotes, followers
- `ProfileTabs` - Submissions, Bookmarks, Lists, Settings
- `SettingsForm` - Notifications, privacy, language, theme

**State Management:**

- `useUserStore` (Zustand) - User profile, settings
- `useQuery` (React Query) - Profile data fetching

**Data Fetching:**

- `getUserProfile(userId)` - Get user profile (Clerk metadata)
- `updateUserProfile(data)` - Update profile
- `getUserSubmissions(userId)` - Get user submissions

**Routing:**

- Path: `/profile`, `/profile/settings`
- Layout: Standard layout (header + bottom nav)

---

### Page 8: Social Features

**Components Needed:**

- `FollowingFeed` - Activity from followed users
- `UserProfile` - User profile (follow/unfollow button)
- `LikeButton` - Like button (on article cards)
- `MessageList` - Chat list (conversations)
- `MessageThread` - Conversation thread (messages)

**State Management:**

- `useSocialStore` (Zustand) - Social state (follows, likes)
- `useQuery` (React Query) - Social data fetching
- `useRealtime` (Supabase) - Real-time messages

**Data Fetching:**

- `followUser(userId)` - Follow user
- `likeArticle(articleId)` - Like article
- `getConversations(userId)` - Get conversations
- `sendMessage(conversationId, content)` - Send message (Realtime)

**Routing:**

- Path: `/following`, `/profile/[userId]`, `/messages`, `/messages/[id]`
- Layout: Standard layout (header + bottom nav)

---

### Page 9: DAO Governance

**Components Needed:**

- `ProposalList` - Proposal cards (active, passed, failed)
- `ProposalCard` - Title, category, votes, status
- `ProposalDetail` - Full proposal text, voting options, results
- `CreateProposalForm` - Proposal creation form (costs 1,000 points)
- `VotingWidget` - Voting power, vote options

**State Management:**

- `useGovernanceStore` (Zustand) - Governance state
- `useQuery` (React Query) - Proposal data fetching
- `useContract` (wagmi) - Governance contract interactions

**Data Fetching:**

- `fetchProposals(filters)` - Fetch proposals
- `fetchProposalDetail(proposalId)` - Fetch proposal details
- `createProposal(data)` - Create proposal (smart contract)
- `vote(proposalId, option)` - Vote (smart contract)

**Routing:**

- Path: `/governance`, `/governance/[id]`
- Layout: Standard layout (header + bottom nav)

---

### Page 10: Curated Lists

**Components Needed:**

- `ListGrid` - List cards (created, subscribed)
- `ListCard` - Title, description, article count, subscribers
- `ListDetail` - Articles, add/remove, share
- `CreateListForm` - Create list form (public/private toggle)

**State Management:**

- `useListsStore` (Zustand) - Lists state
- `useQuery` (React Query) - Lists data fetching

**Data Fetching:**

- `getLists(userId)` - Get user lists
- `createList(data)` - Create list
- `addArticleToList(listId, articleId)` - Add article to list
- `subscribeToList(listId)` - Subscribe to list

**Routing:**

- Path: `/lists`, `/lists/[id]`
- Layout: Standard layout (header + bottom nav)

**TOTAL PAGE SPECS:** 10 pages  
**TOTAL COMPONENTS:** 50+ React components

---

## 🎯 DESIGN GRAND TOTAL

- **Requirements from Init/Product/Plan/UX:** 27 requirements, 15 user stories, 10 wireframes
- **System Components:** 10 components
- **API Endpoints:** 15+ client-side API wrappers, 20+ Supabase functions, 10+ smart contract functions
- **Database Tables:** 13 tables (Supabase), 4 object stores (IndexedDB)
- **Page Specifications:** 10 pages
- **Integrations:** 4 major integrations
- **Security Specs:** 5 security mechanisms
- **Performance Specs:** 4 performance mechanisms

**TOTAL DESIGN DELIVERABLES:** 100+ comprehensive design items

**ESTIMATED DESIGN TIME:** 2-3 weeks (with AI assistance)

**DESIGN PHASES:**

- Phase 1: System architecture and component design ✅
- Phase 2: API and database design ✅
- Phase 3: UI technical specifications ✅
- Phase 4: Integration and security design ✅

---

## ✅ TECHNICAL DESIGN PLAN COMPLETE

**Status:** ✅ Technical Design Plan Complete  
**Next:** Generate detailed architecture documents  
**Next Agent:** Data Agent (`/data`) - After design approval

**Total Deliverables:** 100+ design items  
**Modern Architecture:** Next.js 14 App Router, Zustand, React Query, IndexedDB  
**PWA-Optimized:** Client-side only, offline-first, Service Worker caching
