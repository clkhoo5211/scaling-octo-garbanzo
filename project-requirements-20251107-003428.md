# 📋 Project Requirements

## Blockchain Web3 Content Aggregator

**Project ID:** project-20251107-003428-web3news-aggregator  
**Created:** 2025-11-07 00:34:28  
**Status:** ✅ Requirements Gathered  
**Next Agent:** Product Agent

---

## 1. PROJECT OVERVIEW

### 1.1 Project Identity

**Name:** Web3News / ChainScoop / CryptoAggr (TBD during Product phase)

**Type:** Progressive Web App (PWA) with Web3 Integration

**Tagline:** "Decentralized news aggregation with crypto-powered rewards"

### 1.2 Core Concept

A decentralized, community-driven news and content aggregation platform that:

- Pulls real-time content from 30+ global sources (tech, crypto, finance, entertainment)
- Enables users to earn cryptocurrency rewards for contributions
- Features transparent blockchain-based advertisement auctions
- Provides social features (follow, like, direct messages)
- Implements DAO governance for community decision-making
- Works as installable PWA (iOS/Android/Desktop)
- Future: Native Flutter apps (App Store + Google Play)

### 1.3 Reference Projects

1. **NewsNow** (https://github.com/ourongxing/newsnow)
   - UI/UX inspiration: Clean, elegant reading experience
   - Content aggregation patterns
   - Category-based navigation

2. **WooFi Analytics** (https://dune.com/woofianalytics/woofi-dashboard)
   - Dune Analytics dashboard reference
   - On-chain metrics visualization

3. **Reown AppKit Examples** (https://github.com/reown-com/appkit/tree/main/examples)
   - Smart account integration patterns
   - Multi-chain support implementation

---

## 2. TECHNICAL REQUIREMENTS

### 2.1 Development Stack

**Language & Framework:**

- **Primary:** TypeScript (strict mode) + Next.js 14 (App Router)
- **Future:** Dart + Flutter SDK (native mobile apps)

**Build Configuration:**

- Static Site Generation (`output: 'export'`)
- GitHub Pages deployment (pure HTML/CSS/JS)
- No server-side rendering
- No serverless functions

**Platform Support:**

- Desktop browsers (Chrome, Edge, Firefox, Safari)
- Mobile browsers (iOS Safari, Chrome Android)
- PWA installable (iOS, Android, Desktop - no App Store)
- Future: Native apps (iOS App Store + Google Play via Flutter)

### 2.2 Authentication Architecture (Reown PRIMARY + Clerk SECONDARY)

**Reown AppKit (PRIMARY):**

- Social login (Google, Twitter, Discord, Email, etc.)
- ERC-4337 smart account creation (automatic)
- Multi-chain wallet support (15+ chains)
- Built-in on-ramp (buy USDT with credit card)
- Gas sponsorship capabilities

**Clerk (SECONDARY):**

- User profile storage (in metadata, NOT database)
- Subscription management (Pro, Premium tiers)
- Admin dashboard (pre-built UI)
- Email verification (magic links)
- Session management (JWT tokens)
- Bulk operations (update 1,000 users in one click)

**Login Flow:**

1. User visits site → Reown AppKit modal (FIRST)
2. User selects social login → Reown authenticates
3. Reown creates ERC-4337 smart account automatically
4. Backend auto-creates Clerk user with metadata
5. Clerk sends email verification magic link
6. User verified → Full access granted

### 2.3 Database & Storage Architecture (OPTIMIZED)

**Supabase PostgreSQL:**

- ❌ NO users table (Clerk metadata stores user data instead)
- ✅ Content tables ONLY:
  - submissions, bookmarks, advertisements
  - auction_participants, auction_bids, slot_subscriptions
  - points_transactions, conversions, withdrawals
  - user_follows, article_likes, conversations, messages
  - proposals, votes, notifications
- **Result:** 70% database reduction, 15x faster user reads

**Client-Side Storage:**

- **PWA:** IndexedDB (via localforage library)
  - 30-min article cache, 2,000 article limit
  - User preferences, bookmarks, read history
  - Offline queue for pending actions
- **Flutter:** Hive (NoSQL database)
  - Same caching logic as IndexedDB
  - Same 30-min TTL, same data structure
  - Zero migration effort (identical JSON schema)

**Storage Removed:**

- ❌ Upstash Redis (not needed, IndexedDB sufficient)
- **Benefits:** Simpler architecture, no exposed tokens, 100% client-side

### 2.4 Smart Contracts (3 Types × 6 Chains = 18 Deployments)

**Contracts to Develop:**

1. **AdPaymentContract.sol** - Advertisement auction system
   - `joinAuction()` - Pay 1 USDT non-refundable participation fee
   - `placeBid()` - Place bid (must be 5%+ higher than previous)
   - `finalizeAuction()` - Winner pays, losers refunded (minus participation fee)
   - `scheduleNextAuction()` - Auto-schedule 24 hours before expiry
   - `subscribeToSlot()` - Subscribe to slot notifications

2. **SubscriptionManager.sol** - Subscription payments
   - `subscribe()` - Pay 30 USDT (Pro) or 100 USDT (Premium)
   - `isActiveSubscriber()` - Check subscription status
   - `getSubscription()` - Get tier + expiry timestamp

3. **Governance.sol** - DAO voting system
   - `createProposal()` - Create proposal (costs 1,000 points)
   - `vote()` - Cast vote with meritocratic power
   - `executeProposal()` - Execute if passed (51% + 10% quorum)

**Deployment Chains:**

- Ethereum, Polygon, BSC, Arbitrum, Optimism, Base

**USDT Contract Addresses:**

- Ethereum: 0xdac17f958d2ee523a2206206994597c13d831ec7
- Polygon: 0xc2132d05d31c914a87c6611c10748aeb04b58e8f
- BSC: 0x55d398326f99059ff775485246999027b3197955
- Arbitrum: 0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9
- Optimism: 0x94b008aa00579c1307b0ef2c499ad98a8ce58e58
- Base: 0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Content Aggregation (20+ Sources)

**Tier 1 - MVP (15 sources):**

- Hacker News (Firebase API)
- Product Hunt (GraphQL API)
- GitHub Trending (REST API)
- Reddit (r/technology, r/cryptocurrency, r/programming)
- Medium (RSS)
- CoinDesk, CoinTelegraph, Decrypt, Bitcoin Magazine, The Block (RSS)
- CoinGecko, CryptoCompare, CoinCap, Messari (price APIs - all FREE)

**Tier 2 - Beta (10 sources):**

- X/Twitter, Discord, Telegram, HackerNoon, MarketWatch

**Tier 3 - Launch (10+ sources):**

- 抖音, 今日头条, 百度, Meta, TikTok, Slack, YouTube

**Implementation:**

- Client-side fetching (no backend)
- IndexedDB caching (30-min TTL)
- CORS proxies for non-CORS APIs
- Parallel fetching (Promise.all)
- Deduplication by URL hash

### 3.2 Advertisement System

**Ad Types:**

1. Banner Ads (images/GIF/video): 970x250, 300x250, 728x90, 320x100
2. Sponsored Posts (native content with "Sponsored" badge)
3. Promoted Links (priority placement, top 3 slots)

**Auction Mechanism:**

- **Participation Fee:** 1 USDT (non-refundable)
- **Bidding:** Minimum 5% increment over previous bid
- **Tenure:** 1 week, 2 weeks, 1 month, 3 months (10% discount), 6 months (20% discount)
- **Auto-Scheduling:** New auction opens 24 hours before lease expires
- **Notifications:** Email + push to subscribers
- **Settlement:** On-chain via smart contract (trustless)

**Pricing (Minimum Bids):**

- Homepage Banner: 100 USDT/week
- Category Pages: 50 USDT/week
- Article Pages: 20 USDT/week
- Sponsored Posts (Hottest): 200 USDT/week
- Sponsored Posts (Other): 100 USDT/week
- Promoted Links: 50 USDT/week

### 3.3 User Rewards System

**Points Earning:**

- Submit quality content (10+ upvotes): 1,000 points
- Receive upvote: 10 points
- Quality comment (5+ upvotes): 50 points
- Daily login streak: 20 points/day (max 100-day streak bonus)
- Share article (UTM tracked): 5 points
- Complete profile: 500 points (one-time)
- Refer new user: 2,000 points (when referral transacts)
- Subscribe to ad slot: 10 points (one-time)

**Points-to-USDT Conversion:**

- **Ratio:** 1,000 points = 1 USDT (adjustable via DAO)
- **Conversion Fee:** 1%
- **Minimum:** 100,000 points (100 USDT gross → 99 USDT net)
- **Daily Limit:** 500,000 points max per user
- **Cooldown:** 7-day waiting period between conversions

**USDT Withdrawal:**

- **Withdrawal Fee:** 1% + gas
- **Minimum:** 10 USDT
- **Implementation:** Reown AppKit withdrawal features
- **Flow:** Platform treasury → User smart account → External wallet

### 3.4 Subscription System

**Free Tier ($0/month):**

- Read unlimited articles
- Bookmark up to 50 articles
- Basic recommendations
- 5 direct messages per day
- Vote on governance (1 vote base power)

**Pro Tier (30 USDT/month):**

- All Free features
- Unlimited bookmarks
- AI-powered personalized feed
- Unlimited direct messages
- Ad-free experience
- ⭐ Pro badge on profile
- Vote on governance (enhanced power)
- Early access to new features
- 1.5x points earning multiplier

**Premium Tier (100 USDT/month):**

- All Pro features
- Priority content moderation review
- Custom content sources (unlimited)
- Advanced analytics dashboard (Dune embeds)
- 💎 Premium badge on profile
- 2x points earning rate
- VIP support (24-hour response)
- Vote on governance (maximum power)
- 10x voting power multiplier

**Payment:**

- USDT only (multi-chain)
- Paid via smart contract (on-chain verification)
- Built-in Reown on-ramp (buy USDT with credit card)
- Subscription status stored in Clerk metadata

### 3.5 Social Features

**Follow System:**

- Follow/unfollow users
- Follower/following counts on profiles
- Following feed (see activity from followed users)
- Follow suggestions based on similar interests

**Like System:**

- Like articles
- Like counts displayed
- "Liked Articles" page
- Most liked in trending section
- Award 10 points to content submitter per like

**Direct Messages:**

- Real-time messaging (Supabase Realtime)
- Message notifications (Web Push API)
- Unread message badges
- Emoji picker, link previews
- Block/report user functionality
- Limit: 5 DMs/day (Free), Unlimited (Pro/Premium)

### 3.6 DAO Governance

**Voting Categories:**

1. Content Moderation (ban users, approve flagged content)
2. Economic Policy (conversion rates, platform fees)
3. Feature Prioritization (next features to build)
4. Treasury Spending (developer bounties, marketing)
5. Ad Slot Policies (blacklist advertisers, content policies)
6. Partnership Decisions (platform integrations)

**Voting Power (Meritocratic):**

```
Base: 1 vote per user
+ 1 vote per 10 approved submissions
+ 1 vote per 1,000 upvotes received
+ 1 vote per 100 days as member
+ 1 vote per 10,000 points balance
= Max 100 votes (prevents whale domination)
```

**Proposal Economics:**

- Create proposal: 1,000 points
- Vote on proposal: 10 points
- Voted with majority (proposal passes): 50 bonus points
- Created proposal that passes: 500 bonus points

### 3.7 Analytics Integration

**Dune Analytics (On-Chain Metrics):**

- Ad revenue by chain, by type, by time period
- Subscription revenue and growth
- Treasury balance (real-time, all chains)
- Top advertisers, top voters
- Governance participation rates
- Smart account creations per day
- Reference dashboard: WooFi Analytics (https://dune.com/woofianalytics/woofi-dashboard)

**Supabase Analytics (Off-Chain Metrics):**

- Content metrics (articles, sources, categories)
- User engagement (views, upvotes, comments)
- Social activity (follows, likes, messages)
- Points economy (issued vs redeemed)

**Clerk Analytics (User Metrics):**

- User growth (signups, DAU, MAU)
- Subscription conversions
- Retention rates
- Churn analysis

**Dashboard Access:**

- Public: Basic stats (total revenue, users, ads)
- Premium: Full Dune dashboard embed
- Admin: Combined view (Dune + Supabase + Clerk)

### 3.8 AI-Powered Recommendations

**MVP (Phase 1):**

- Collaborative filtering (Supabase SQL)
- Cost: $0
- Accuracy: 70%
- Based on similar users' bookmarks

**Beta (Phase 2):**

- TensorFlow.js (client-side ML)
- Cost: $0 (10 MB model download)
- Accuracy: 80%
- Content-based filtering

**Production (Phase 3):**

- OpenAI Embeddings API
- Cost: $0.08/month for 1,000 users
- Accuracy: 95%
- Best quality, personalized feeds

### 3.9 Folo-Inspired Features ⭐ NEW!

**Reference:** https://github.com/RSSNext/Folo (35.7k stars - highly successful RSS reader)

**Feature Set 1: AI Content Enhancement (Beta - Phase 2)**

**AI Translation:**

- **Implementation**: Google Translate API (FREE 500k characters/month)
- **UI**: One-click translate button on every article
- **Supported Languages**: 100+ languages (auto-detect source)
- **User Experience**:
  1. User reading Chinese article → Clicks "Translate" button
  2. Article translated to English (or user's preferred language)
  3. Translation cached in IndexedDB (no repeat API calls)
  4. Toggle between original/translated view
- **Cost**: $0 for MVP (500k chars covers ~5,000 articles/month)

**AI Summaries:**

- **Implementation Options**:
  - **Free (MVP)**: Hugging Face Inference API (facebook/bart-large-cnn - FREE)
  - **Paid (Beta)**: OpenAI GPT-4 Turbo ($0.01 per 1k tokens)
- **UI**: "📝 Summary" button shows 3-sentence TL;DR
- **User Experience**:
  1. Long article (5,000 words) → User clicks "Summary"
  2. AI generates 3-sentence summary
  3. User decides if worth reading full article
  4. Saves time, improves engagement
- **Cost**: $0 (Hugging Face) or $0.05/month for 1,000 summaries (OpenAI)

**Feature Set 2: Curated Lists & Collections (MVP - Phase 1)**

**User-Created Lists:**

- Users create custom lists (e.g., "Best DeFi News", "Top Crypto Analysis")
- Add articles to lists (like playlists)
- Public lists: Anyone can subscribe
- Private lists: Personal organization (Pro feature)
- **Database Schema**:

```sql
CREATE TABLE content_lists (
  id UUID PRIMARY KEY,
  clerk_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  subscriber_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE list_items (
  id UUID PRIMARY KEY,
  list_id UUID REFERENCES content_lists(id),
  article_url TEXT NOT NULL,
  added_by_clerk_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE list_subscriptions (
  id UUID PRIMARY KEY,
  list_id UUID REFERENCES content_lists(id),
  subscriber_clerk_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(list_id, subscriber_clerk_id)
);
```

**Feature Set 3: Dynamic Content Support (Beta - Phase 2)**

**Video Content:**

- **YouTube**: YouTube Data API v3 (FREE 10,000 quota/day)
- **TikTok**: Public API (trending crypto videos)
- **Embedded Players**: In-app video playback
- **Example Sources**:
  - YouTube: Crypto news channels, interviews, tutorials
  - TikTok: Trending crypto content creators

**Audio Content (Podcasts):**

- **Apple Podcasts**: RSS feeds (free)
- **Spotify**: Podcast RSS (via third-party)
- **Example Podcasts**:
  - "Unchained" (crypto podcast)
  - "Bankless" (Ethereum/DeFi)
  - "The Defiant" (DeFi news)
- **Player**: HTML5 audio player (in-app playback)

**Feature Set 4: Reader View Mode (MVP - Phase 1)**

**Distraction-Free Reading:**

- **Implementation**: @mozilla/readability library (open source)
- **Features**:
  - Extract clean article content (remove ads, sidebars)
  - Adjust font size, line height, width
  - Dark mode optimized
  - Save reading position
  - Estimate read time
- **UI**:
  - "📖 Reader View" button on article cards
  - Full-screen immersive reading
  - Progress bar (% read)
- **Cost**: $0 (open source library)

**Feature Set 5: Content Sharing (MVP - Phase 1)**

**Share to Social Media:**

- **Platforms**: Twitter/X, Facebook, LinkedIn, Telegram, WhatsApp
- **Implementation**: Web Share API (built into browsers)

```javascript
const shareArticle = async (article) => {
  await navigator.share({
    title: article.title,
    text: article.description,
    url: article.url + "?ref=web3news",
  });

  // Award 5 points for sharing (tracked via UTM)
};
```

- **Referral Tracking**: UTM parameters (award points when referral clicks)
- **Cost**: $0 (native browser API)

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance Targets

- First Contentful Paint (FCP): < 1.5s
- Time to Interactive (TTI): < 3.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Lighthouse Score: > 95 (all categories)

### 4.2 Scalability

- Handle 10,000 DAU on free tiers
- 100,000+ articles cached per user
- Infinite scroll with virtual scrolling
- IndexedDB auto-cleanup (keep last 30 days)

### 4.3 Security

- Row Level Security (RLS) policies in Supabase
- Content Security Policy (CSP) headers
- Smart contract audits (Slither, Mythril, professional audit)
- Rate limiting (client-side, 10 requests/min per source)
- OWASP compliance

### 4.4 Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- Color contrast ratios > 4.5:1
- Alt text for all images

### 4.5 Browser Compatibility

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari (desktop + iOS): Last 2 versions
- Mobile: iOS 14+, Android 10+

### 4.6 Offline Support

- Service Worker caching (static assets + last 100 articles)
- IndexedDB persistence
- Offline queue for pending actions
- Sync when back online

---

## 5. FEATURE PRIORITIES

### 5.1 MVP (Phase 1 - 8 Weeks)

**Must-Have:**

- ✅ Aggregate 15+ top sources
- ✅ Reown social login + smart accounts
- ✅ Ad auction system (banner ads only)
- ✅ Points earning + conversion
- ✅ PWA installable
- ✅ GitHub Pages deployment

**Success Metrics:**

- 100 beta users
- 10 auction participants (testnet)
- 5,000+ articles cached
- Lighthouse score > 90

### 5.2 Beta (Phase 2 - 12 Weeks)

**Must-Have:**

- ✅ 25+ sources (add Chinese platforms)
- ✅ All ad formats (banner, sponsored, promoted)
- ✅ Social features (follow, like, DM)
- ✅ DAO governance
- ✅ Dune Analytics dashboard
- ✅ Multi-language (EN, 中文)

**Success Metrics:**

- 1,000 active users
- $1,000 ad revenue (testnet simulation)
- 20,000+ articles
- Points economy balanced

### 5.3 Production (Phase 3 - 16 Weeks)

**Must-Have:**

- ✅ Mainnet deployment (all 6 chains)
- ✅ Smart contract audit complete
- ✅ 30+ content sources
- ✅ Subscription system (Pro + Premium)
- ✅ AI recommendations (OpenAI)

**Success Metrics:**

- 10,000 DAU
- $10,000/month ad revenue (real USDT)
- 100,000+ articles
- 5,000+ PWA installs

### 5.4 Future (Phase 4 - 6-12 Months)

**Nice-to-Have:**

- Flutter native apps (iOS + Android)
- Platform governance token (W3N)
- NFT rewards for top contributors
- Video/podcast content aggregation
- AI content summarization
- 10+ language support

---

## 6. CONSTRAINTS & ASSUMPTIONS

### 6.1 Budget Constraints

**Infrastructure:** $0/month for MVP

- GitHub Pages: Free (unlimited bandwidth)
- Clerk: Free (up to 10,000 MAU)
- Reown: Free (unlimited)
- Supabase: Free (500 MB limit)
- IndexedDB: Free (browser-provided)

**One-Time Costs:**

- Smart contract deployment (testnets): $0
- Smart contract deployment (mainnets): $500-2,000 (gas fees)
- Smart contract audit: $10,000-15,000 (optional, Phase 3)
- App Store submission: $99/year (Flutter, Phase 4)
- Google Play submission: $25 one-time (Flutter, Phase 4)

### 6.2 Technical Constraints

- ✅ No backend servers (pure client-side)
- ✅ No serverless functions (GitHub Pages only)
- ✅ Free tier services only for MVP
- ✅ Static site generation (Next.js export)
- ✅ Client-side cache only (IndexedDB)

### 6.3 Timeline Constraints

- MVP: 8 weeks
- Beta: 12 weeks (cumulative)
- Launch: 16 weeks (cumulative)
- Flutter apps: 6-12 months after MVP

---

## 7. USER STORIES & USE CASES

### 7.1 Primary User Personas

**Persona 1: Crypto Enthusiast (Sarah)**

- Reads crypto news daily
- Wants one platform for all sources
- Willing to pay for ad-free experience
- Active in community discussions

**Persona 2: Content Creator (Mike)**

- Submits quality crypto analysis
- Wants to earn rewards for contributions
- Interested in governance participation
- Needs analytics on content performance

**Persona 3: Advertiser (BlockchainCo)**

- Wants to reach crypto-native audience
- Prefers transparent auction system
- Multi-chain USDT payment capability
- Needs performance metrics (impressions, clicks)

**Persona 4: Casual Reader (Alex)**

- Browses tech/crypto news occasionally
- Uses mobile primarily
- Wants offline reading
- Free tier sufficient

**Persona 5: DAO Member (Emma)**

- Long-term platform member
- High voting power (top contributor)
- Participates in governance
- Premium subscriber

### 7.2 Core User Flows

**Flow 1: First-Time User Onboarding**

1. User visits website
2. Browses articles (no login required)
3. Clicks "Sign In" → Reown modal appears
4. Selects Google login → Reown authenticates
5. Reown creates smart account automatically
6. Clerk user created in background
7. Email verification sent → User clicks link
8. User onboarded → Can bookmark, submit, earn points

**Flow 2: Ad Auction Participation**

1. User clicks "Advertise"
2. Browses available ad slots
3. Selects slot → Checks current highest bid
4. Pays 1 USDT participation fee (Reown smart account)
5. Places bid (e.g., 150 USDT for 1 week)
6. Monitors auction (24-hour duration)
7. Wins auction → Ad goes live immediately
8. Receives analytics (impressions, clicks)

**Flow 3: Points → USDT Conversion**

1. User earns 150,000 points (from submissions, upvotes, etc.)
2. Goes to /rewards page
3. Clicks "Convert Points to USDT"
4. Enters 100,000 points → See "99 USDT after 1% fee"
5. Confirms conversion → Points deducted, USDT added to balance (off-chain ledger)
6. Clicks "Withdraw USDT"
7. Reown chain selector → Selects Polygon (low gas)
8. Enters 99 USDT → See "98.01 USDT after 1% fee + gas"
9. Confirms → USDT transferred to smart account
10. Can send to external wallet via Reown

**Flow 4: Subscription Purchase (with On-Ramp)**

1. User clicks "Upgrade to Pro"
2. Check USDT balance → 0 USDT
3. Click "Buy USDT" → Reown on-ramp opens
4. Select MoonPay → Enter $35 (= 30 USDT + 3.5% fee)
5. Pay with credit card → USDT arrives in 2-5 minutes
6. Return to subscription purchase
7. Approve 30 USDT → Call SubscriptionManager.subscribe()
8. Smart contract emits event → Backend updates Clerk metadata
9. ⭐ Pro badge appears on profile
10. AI feed tab unlocked, ads hidden

**Flow 5: DAO Governance Participation**

1. User navigates to /governance
2. Reviews active proposals
3. Clicks proposal → Reads description
4. Checks voting power (calculated from contributions)
5. Votes "For" → Transaction via Reown
6. Earns 10 points for voting
7. Proposal passes → Earns 50 bonus points (voted with majority)
8. Platform implements decision (e.g., reduces withdrawal fee)

---

## 8. SUCCESS CRITERIA

### 8.1 MVP Launch (Week 8)

- [ ] 15+ content sources aggregating
- [ ] 100 beta users signed up
- [ ] 10 auction participants (testnet)
- [ ] 5,000+ articles cached
- [ ] Lighthouse score > 90
- [ ] PWA installable on iOS/Android

### 8.2 Beta Launch (Week 12)

- [ ] 25+ content sources
- [ ] 1,000 active users
- [ ] $1,000 ad revenue simulated (testnet)
- [ ] 20,000+ articles
- [ ] 50+ auction participants
- [ ] Points economy balanced (2:1 issue:redeem ratio)

### 8.3 Production Launch (Week 16)

- [ ] 10,000 DAU
- [ ] $10,000/month ad revenue (real USDT)
- [ ] 100,000+ articles
- [ ] 5,000+ PWA installs
- [ ] Press coverage (5+ crypto news outlets)
- [ ] 85%+ user satisfaction (NPS > 40)

### 8.4 Long-Term (6-12 Months)

- [ ] 50,000 DAU
- [ ] $50,000+/month ad revenue
- [ ] 500,000+ articles
- [ ] Flutter apps launched (App Store + Google Play)
- [ ] Platform governance token (W3N)
- [ ] Top 100 crypto app ranking

---

## 9. RISKS & MITIGATION

### 9.1 Technical Risks

**Risk:** Content sources block scraping / rate limit
**Mitigation:** Use official APIs, respect rate limits, implement exponential backoff

**Risk:** Smart contract vulnerabilities
**Mitigation:** Professional audit ($10k-15k), testnet testing, community review

**Risk:** Reown + Clerk integration complexity
**Mitigation:** Reference documentation provided, both have good support

**Risk:** IndexedDB storage limits on iOS Safari (50 MB)
**Mitigation:** Implement aggressive cleanup, cache only last 30 days, warn users

### 9.2 Business Risks

**Risk:** Low ad demand (no advertisers)
**Mitigation:** Start with own ads, approach crypto projects, referral incentives

**Risk:** Points economy imbalance (too many conversions)
**Mitigation:** Monitor ratio, adjust conversion rate via DAO, implement cooldowns

**Risk:** Low user adoption
**Mitigation:** Marketing campaign, partnerships, influencer promotions, referral program

### 9.3 Regulatory Risks

**Risk:** Securities regulations (points as securities)
**Mitigation:** Legal review, points as utility (not investment), terms of service

**Risk:** GDPR/CCPA compliance
**Mitigation:** Implement data deletion, cookie consent, privacy policy

**Risk:** Ad content regulations
**Mitigation:** Manual review, content policies, community moderation

---

## 10. DEPENDENCIES & INTEGRATIONS

### 10.1 External Services

**Required (Free Tier):**

- Clerk (10,000 MAU free)
- Reown (unlimited free)
- Supabase (500 MB free)
- GitHub Pages (unlimited free)
- CoinGecko API (43,200 calls/day free)
- CryptoCompare API (100,000 calls/month free)

**Optional (Paid - Phase 2+):**

- OpenAI API ($0.08/month for AI recommendations)
- Professional smart contract audit ($10k-15k)
- Custom domain ($12/year)

### 10.2 Third-Party SDKs

**Frontend:**

- @reown/appkit, @reown/appkit-adapter-wagmi
- @clerk/nextjs
- @supabase/supabase-js
- wagmi, viem
- localforage (IndexedDB wrapper)
- @tensorflow/tfjs (optional, for AI)
- tailwindcss, @shadcn/ui

**Smart Contracts:**

- @openzeppelin/contracts
- hardhat, @nomicfoundation/hardhat-toolbox
- @nomiclabs/hardhat-etherscan

**Flutter (Future):**

- supabase_flutter
- reown_appkit_flutter (when available)
- web3dart
- hive_flutter

---

## 11. COMPLIANCE & LEGAL

### 11.1 Required Documents

- Terms of Service
- Privacy Policy (GDPR/CCPA compliant)
- Cookie Policy
- Ad Content Guidelines
- Community Guidelines
- Data Deletion Policy

### 11.2 Jurisdictions

- Global platform (US, EU, Asia)
- GDPR compliance (EU users)
- CCPA compliance (California users)
- Securities law review (points/token economics)

---

## 12. DELIVERABLES

### 12.1 MVP Deliverables (Week 8)

**Code:**

- Next.js 14 application (TypeScript)
- 3 Solidity smart contracts (AdPayment, Subscription, Governance)
- Hardhat deployment scripts
- E2E tests (Playwright)
- Contract tests (Hardhat)

**Documentation:**

- README.md (setup guide)
- Architecture diagrams
- API documentation
- Smart contract documentation
- User guides

**Deployment:**

- GitHub Pages live site
- GitHub Actions CI/CD pipeline
- Smart contracts on testnets (6 chains)
- Dune Analytics dashboard (public)

### 12.2 Production Deliverables (Week 16)

**Code:**

- Production-ready Next.js app
- Audited smart contracts
- Comprehensive test suite (E2E, unit, integration)
- Performance optimizations

**Documentation:**

- Complete technical documentation
- User onboarding guides
- Admin manuals
- Security audit reports
- Compliance certifications

**Deployment:**

- Smart contracts on mainnets (6 chains × 3 contracts)
- Custom domain with SSL
- Monitoring and alerts
- Analytics dashboards

---

## 13. NEXT STEPS

**Immediate (Init Agent):**

- ✅ Project directory created
- ✅ CLAUDE.md initialized
- ✅ Directory structure created
- ✅ Documentation files moved
- ⏳ Git repository initialization
- ⏳ Create resource-links.md
- ⏳ Update registries

**Next Agent:** Product Agent

- Conduct market research (competitors: NewsNow, Artifact, Flipboard)
- Competitive analysis
- Product positioning
- Feature prioritization (RICE scoring)
- User personas validation
- Go-to-market strategy

**Agent Sequence:**
Init → Product → Plan → UX → Design → Data → Develop → DevOps → Security → Compliance → Test → Audit → Deploy

---

**REFERENCE DOCUMENTS:**

- Complete Specification: `docs/PROJECT_INIT_PROMPT_WEB3_AGGREGATOR.md` (3,693 lines)
- Updates Summary: `docs/PROMPT_UPDATES_SUMMARY.md`
- Clerk Guide: `docs/CLERK_DASHBOARD_GUIDE.md`
- Technical Verification: `docs/TECHNICAL_VERIFICATION.md`
- Launch Guide: `docs/LAUNCH_GUIDE.md`

---

**PROJECT STATUS:** ✅ Requirements Complete, Ready for Product Agent
