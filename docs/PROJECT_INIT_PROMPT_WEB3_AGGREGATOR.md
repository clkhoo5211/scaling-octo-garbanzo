# PROJECT INITIALIZATION PROMPT
## Blockchain Web3 Content Aggregator

**Document Version:** 2.0  
**Last Updated:** 2025-11-06  
**Status:** Ready for Init Agent Trigger  

---

## INSTRUCTIONS FOR USE

**To trigger the Init Agent with this prompt:**

```bash
# In Claude Code, run:
/init

# Then paste sections 1-10 from this document when prompted
# The Init Agent will read this file and create the project
```

---

## SECTION 1: PROJECT OVERVIEW

**Project Name:** Blockchain Web3 Content Aggregator (Working titles: Web3News, ChainScoop, CryptoAggr)

**Project Type:** Progressive Web App (PWA) with Web3 Integration - Pure Client-Side Application

**Reference Projects:**
- NewsNow: https://github.com/ourongxing/newsnow (UI/UX reference)
- BettaFish: https://github.com/666ghj/BettaFish (content aggregation patterns)
- Live Demo: https://newsnow.busiyi.world/c/hottest
- Reown AppKit Documentation: https://docs.reown.com/appkit/react/core/smart-accounts
- Reown Examples: https://github.com/reown-com/appkit/tree/main/examples

**Deployment Target:** GitHub Pages (static hosting - free forever)

**Core Concept:**
A decentralized, community-driven news and content aggregation platform that pulls real-time content from 30+ global sources (X, Reddit, Hacker News, Product Hunt, Medium, crypto news, Chinese platforms like 抖音/百度/今日头条, etc.) with cryptocurrency-based monetization via advertisement auctions and user rewards system.

**Key Differentiators:**
1. ✅ **No Backend Required** - Pure client-side aggregation (saves hosting costs)
2. ✅ **Web3 Native** - Reown smart accounts with social login (Google, Twitter, Email)
3. ✅ **Auction-Based Ads** - Transparent blockchain auctions with tenure leasing
4. ✅ **Earn & Withdraw** - Users earn points (1,000 points = 1 USDT), withdraw to any chain
5. ✅ **Multi-Chain USDT** - Support 6+ chains (Ethereum, BSC, Polygon, Arbitrum, Optimism, Base)
6. ✅ **PWA Installable** - Works offline, push notifications, mobile-optimized

---

## SECTION 2: TECHNICAL ARCHITECTURE

### 2.1 Frontend Stack & Platform Support

**Development Language:** TypeScript (strict mode)

**Framework:** Next.js 14+ with App Router

**Build Configuration:**
- **Build Mode:** Static Site Generation (`output: 'export'`)
- **Deployment:** GitHub Pages (static HTML/CSS/JS)
- **No Backend:** Pure client-side application

**Platform Support:**

**Phase 1 - MVP: Progressive Web App (PWA)**
- **Web Browsers (Desktop):**
  - Chrome, Edge, Firefox, Safari (macOS/Windows/Linux)
  - Accessible via URL: https://yourdomain.com
  - Full features (content aggregation, auctions, wallet, etc.)

- **Mobile Web Browsers:**
  - iOS Safari (iPhone/iPad)
  - Chrome (Android)
  - Samsung Internet (Android)
  - Accessible via same URL on mobile devices
  - Responsive design (Tailwind CSS breakpoints)

- **PWA Installation (No App Store Required):**
  - **iOS:** Safari → Share → "Add to Home Screen" → Acts like native app
  - **Android:** Chrome → Menu → "Install App" → Acts like native app
  - **Desktop:** Chrome → Install button in address bar → Desktop app
  - **Benefits:** 
    - Offline support (Service Worker)
    - Push notifications
    - Full-screen experience (no browser UI)
    - Home screen icon
    - Splash screen
    - Works like native app without App Store approval!

**Phase 3 - Future: Native Mobile Apps (Flutter)**

- **Framework:** Flutter SDK (Dart language)
- **Platforms:** 
  - iOS (App Store submission via Xcode)
  - Android (Google Play Store submission)
- **Benefits:**
  - Better performance than PWA (compiled to native code)
  - Full native features (biometrics, camera, contacts, Face ID)
  - App Store discoverability (ranked in search results)
  - Push notifications (more reliable than PWA)
  - Offline-first architecture (better than Service Worker)
  - Smoother animations (60fps native rendering)
- **SDK Compatibility:**
  - ✅ Reown AppKit has Flutter SDK (same social login + smart accounts)
  - ✅ Supabase has Flutter SDK (supabase_flutter - same queries)
  - ✅ Hive (Flutter's IndexedDB equivalent - same caching logic)
  - ✅ web3dart (Flutter's wagmi/viem equivalent - same contract calls)
  - ⚠️ Clerk: Use REST API or sync to Supabase (no official Flutter SDK)
- **Storage Migration:**
  - **PWA uses:** IndexedDB (browser API)
  - **Flutter uses:** Hive (NoSQL) or sqflite (SQLite)
  - **Same Logic:** 30-min cache, 2,000 article limit, auto-refresh
  - **Same Data Structure:** JSON serialization, identical schemas
- **Code Sharing:** 
  - ~70% business logic reused (API fetching, data models, validation)
  - ~30% platform-specific (UI components, storage layer)
  - Single codebase generates both iOS + Android APK/IPA
- **Timeline:** 6-12 months after MVP launch (Phase 3)
- **Development Time:** 4-6 weeks (single codebase for both platforms)
- **Cost:** $0 (Flutter SDK is free, Play Store: $25 one-time, App Store: $99/year)

**Styling & UI:**
- **CSS Framework:** Tailwind CSS
- **Component Library:** shadcn/ui (React components)
- **Design System:** Custom (inspired by NewsNow's clean aesthetic)
- **State Management:** Zustand (lightweight, ~1kb)

**Web3 Integration:**
- **Auth SDK:** Reown AppKit + wagmi + viem
- **Wallet Support:** MetaMask, Coinbase Wallet, WalletConnect, Social Login
- **Smart Account:** ERC-4337 (auto-created via Reown)

**PWA Configuration:**
```javascript
// next.config.js
module.exports = {
  output: 'export', // Static HTML export for GitHub Pages
  images: { unoptimized: true }, // No server-side image optimization
  trailingSlash: true, // GitHub Pages compatibility
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
}

// public/manifest.json (PWA manifest)
{
  "name": "Web3News - Blockchain Content Aggregator",
  "short_name": "Web3News",
  "description": "Decentralized news aggregation platform",
  "start_url": "/",
  "display": "standalone", // Full-screen app mode
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}

// Service Worker (PWA offline support)
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('web3news-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/static/css/main.css',
        '/static/js/main.js',
        // Cache static assets for offline access
      ])
    })
  )
})
```

### 2.2 Content Aggregation Strategy

**Architecture:** Client-Side Aggregation (No Backend Servers)

**How It Works:**
1. User visits website → React app loads
2. Check browser cache (IndexedDB) for articles (30-min TTL)
3. If cache expired → Fetch from 30+ sources in parallel:
   - Public APIs: Hacker News, Product Hunt, GitHub, Reddit
   - RSS Feeds: Medium, Decrypt.co, CoinDesk, CoinTelegraph
   - CORS Proxies: For sources without CORS headers
4. Aggregate, deduplicate (by URL hash), sort by recency
5. Store in IndexedDB (client cache) + Upstash Redis (shared cache)
6. Display to user (< 2 seconds load time)

**Data Sources (Priority Tiers):**

**Tier 1 - MVP (20 sources):**

*General Tech & Startup:*
- Hacker News (Firebase API: https://github.com/HackerNews/API)
- Product Hunt (GraphQL API)
- GitHub Trending (REST API)
- Reddit (/r/technology, /r/cryptocurrency, /r/programming via JSON)
- Medium (RSS feeds by publication)
- HackerNoon (RSS: https://hackernoon.com/feed)

*Crypto News (RSS - All FREE):*
- CoinDesk (https://www.coindesk.com/arc/outboundfeeds/rss/)
- CoinTelegraph (https://cointelegraph.com/rss)
- Decrypt (https://decrypt.co/feed)
- Bitcoin Magazine (https://bitcoinmagazine.com/.rss/full/)
- The Block (https://www.theblock.co/rss.xml)

*Crypto Price Data (FREE APIs):*
- CoinGecko API (43,200 calls/day FREE: https://www.coingecko.com/en/api)
- CryptoCompare API (100,000 calls/month FREE: https://min-api.cryptocompare.com/)
- CoinCap API (Unlimited FREE: https://docs.coincap.io/)
- Messari API (20 calls/min FREE: https://messari.io/api)
- Blockchain.com API (Unlimited FREE: https://www.blockchain.com/api)

**Tier 2 - Beta (10 sources):**
- X/Twitter (API v2 or public embeds)
- Discord (public webhooks/RSS bridges)
- Telegram (public channel RSS: t.me/s/{channel})
- MarketWatch (RSS)
- Yahoo Finance Crypto (RSS)

**Tier 3 - Launch (10+ sources):**
- 抖音 (Douyin), 今日头条 (Toutiao), 百度热搜 (Baidu)
- Meta (Facebook/Instagram public embeds)
- TikTok (public API)
- Slack public communities
- YouTube Crypto Channels (via Data API)

**Caching Strategy (Client-Side Only):**
- **IndexedDB** (browser): 30-min cache per user, 2,000 article limit
- **LocalStorage**: User preferences, theme, language settings
- **No Shared Cache**: Each user fetches content individually (APIs are free anyway)
- **Update Frequency**: Every 30 minutes per user (automatic refresh)

**Implementation:**
```javascript
import localforage from 'localforage'

// Create IndexedDB instance
const articleCache = localforage.createInstance({
  name: 'web3news',
  storeName: 'articles'
})

// Cache articles for 30 minutes
const cacheArticles = async (articles) => {
  await articleCache.setItem('cached_at', Date.now())
  await articleCache.setItem('articles', articles)
}

// Check cache before fetching
const getCachedArticles = async () => {
  const cachedAt = await articleCache.getItem('cached_at')
  const now = Date.now()
  
  // Cache expired after 30 minutes
  if (now - cachedAt > 30 * 60 * 1000) {
    return null // Fetch fresh
  }
  
  return await articleCache.getItem('articles')
}
```

**CORS Handling:**
- Most RSS feeds allow CORS (direct fetch)
- APIs without CORS: Use public CORS proxy (https://corsproxy.io)
- Last resort: Browser extension mode (optional for power users)

### 2.3 Optimized Authentication System (Reown PRIMARY + Clerk SECONDARY)

**Architecture:** Reown handles authentication, Clerk handles user management

**Why This Architecture?**
- **Reown (PRIMARY)**: Social login, smart account creation, on-ramp
- **Clerk (SECONDARY)**: User profiles stored in metadata, subscription management, admin dashboard
- **Supabase**: Content data ONLY (70% database reduction!)
- **Result**: No user table in Supabase, all user data in Clerk metadata

**SDK Installation:**
```bash
npm install @clerk/nextjs @reown/appkit @reown/appkit-adapter-wagmi wagmi viem
```

**Reown Features (PRIMARY AUTH):**
- ✅ Social Login (Google, Twitter, Discord, Email, etc.)
- ✅ Smart Accounts (ERC-4337 Account Abstraction - auto-created)
- ✅ Multi-Chain Support (15+ chains)
- ✅ On-Ramp (buy USDT with credit card via MoonPay/Transak)
- ✅ Gas Sponsorship (configurable)
- ✅ Batched Transactions
- ✅ Session Keys

**Clerk Features (USER MANAGEMENT):**
- ✅ User Profiles (stored in Clerk metadata, not Supabase!)
- ✅ Subscription Management (Pro, Premium tiers)
- ✅ Admin Dashboard (pre-built, production-ready)
- ✅ Email Verification (magic links sent after Reown login)
- ✅ Session Management (JWT tokens)
- ✅ User Search & Filtering
- ✅ Bulk Operations (e.g., give all Pro users 1,000 bonus points)

**Optimized Login Flow:**
```
STEP 1: User Authentication (Reown PRIMARY)
User visits site
  → Reown AppKit modal appears (FIRST)
  → User selects social login: Google, Email, Twitter, Discord, etc.
  → Reown authenticates user
  → Reown automatically creates ERC-4337 Smart Account ✅
  → User now has: reown_address + smart_account_address

STEP 2: Clerk User Creation (AUTOMATIC)
Backend detects new Reown login
  → Extract email from Reown social login
  → Create Clerk user programmatically via API
  → Store in Clerk publicMetadata:
    {
      reown_address: "0x123...",
      smart_account_address: "0x456...",
      points: 0,
      subscription_tier: "free",
      referral_code: "USER123"
    }

STEP 3: Email Verification (Clerk)
Clerk sends magic link to user's email
  → User clicks link → Email verified
  → Full access granted

STEP 4: User Profile Ready
NO data stored in Supabase users table (doesn't exist!)
ALL user data in Clerk metadata:
  - Smart account address
  - Points balance
  - Subscription tier
  - Referral code
  - Statistics (submissions, upvotes, etc.)
```

**Implementation Example:**

```javascript
// app/providers.tsx - Reown setup (PRIMARY)
'use client'

import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider, createConfig } from 'wagmi'
import { mainnet, polygon, bsc, arbitrum, optimism, base } from 'wagmi/chains'

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID

const config = createConfig({
  chains: [mainnet, polygon, bsc, arbitrum, optimism, base],
  // ...wagmi config
})

createAppKit({
  projectId,
  chains: [mainnet, polygon, bsc, arbitrum, optimism, base],
  wagmiConfig: config,
  features: {
    analytics: true,
    socials: ['google', 'x', 'discord', 'github'], // Social login options
    email: true, // Email login option
    onramp: true // Built-in on-ramp for buying USDT
  }
})

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <ClerkProvider>
        {children}
      </ClerkProvider>
    </WagmiProvider>
  )
}

// hooks/useAuth.ts - Combined auth hook
import { useAppKitAccount } from '@reown/appkit/react'
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

export function useAuth() {
  const { address, isConnected } = useAppKitAccount() // Reown
  const { user, isLoaded } = useUser() // Clerk
  
  // Auto-create Clerk user when Reown login succeeds
  useEffect(() => {
    if (isConnected && address && !user) {
      createClerkUserFromReown(address)
    }
  }, [isConnected, address, user])
  
  return {
    // User data from Clerk metadata
    address: user?.publicMetadata?.reown_address,
    smartAccount: user?.publicMetadata?.smart_account_address,
    points: user?.publicMetadata?.points || 0,
    subscription: user?.publicMetadata?.subscription_tier || 'free',
    isAuthenticated: isConnected && !!user,
    user
  }
}

// api/clerk/create-user.ts - Auto-create Clerk user
import { clerkClient } from '@clerk/nextjs/server'

export default async function handler(req, res) {
  const { reownAddress, smartAccountAddress, email } = req.body
  
  try {
    // Create Clerk user with Reown data in metadata
    const user = await clerkClient.users.createUser({
      externalId: reownAddress, // Link to Reown
      emailAddress: [email],
      skipPasswordRequirement: true,
      publicMetadata: {
        reown_address: reownAddress,
        smart_account_address: smartAccountAddress,
        points: 0,
        usdt_balance_offchain: 0,
        subscription_tier: 'free',
        subscription_expiry: null,
        referral_code: generateReferralCode(),
        total_submissions: 0,
        total_upvotes: 0,
        login_streak: 0,
        created_at: new Date().toISOString()
      }
    })
    
    // Send email verification magic link
    await clerkClient.emailAddresses.createEmailVerification({
      id: user.emailAddresses[0].id,
      strategy: 'email_link'
    })
    
    res.json({ success: true, clerkUserId: user.id })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update user points (stored in Clerk metadata, not Supabase)
const awardPoints = async (userId, amount, reason) => {
  const user = await clerkClient.users.getUser(userId)
  const currentPoints = user.publicMetadata.points || 0
  
  await clerkClient.users.updateUser(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      points: currentPoints + amount
    }
  })
}

// Display user profile (reading from Clerk metadata)
const UserProfile = () => {
  const { user } = useUser()
  
  return (
    <div>
      <h1>{user.username}</h1>
      <p>Points: {user.publicMetadata.points}</p>
      <p>Tier: {user.publicMetadata.subscription_tier}</p>
      <p>Smart Account: {user.publicMetadata.smart_account_address}</p>
    </div>
  )
}
```

**Clerk Metadata Structure** (replaces Supabase users table):
```javascript
// All user data stored in Clerk publicMetadata
{
  reown_address: "0x123...",
  smart_account_address: "0x456...",
  points: 150000,
  usdt_balance_offchain: 99.50, // For points conversion
  subscription_tier: "pro", // free, pro, premium
  subscription_expiry: "2024-12-31T23:59:59Z",
  referral_code: "USER123",
  referred_by: "ALICE456",
  total_submissions: 45,
  total_upvotes: 1250,
  approved_submissions: 42,
  login_streak: 15,
  last_conversion_at: "2024-11-01T10:00:00Z"
}
```

**Benefits of This Architecture:**
1. ✅ **Reown First**: Smart accounts created immediately (users can transact without Web3 wallet)
2. ✅ **70% Less Database Usage**: No users table in Supabase (only content data)
3. ✅ **Better Performance**: No database queries for user profiles (reads from Clerk cache)
4. ✅ **Clerk Admin Dashboard**: Manage users, subscriptions, metadata in UI
5. ✅ **Built-in On-Ramp**: Users can buy USDT directly in Reown modal
6. ✅ **Cost**: $0 (Clerk: 10k MAU free, Reown: unlimited free)

---

## SECTION 2.4: SUBSCRIPTION SYSTEM (SMART CONTRACT + REOWN ON-RAMP)

### 2.4.1 Subscription Tiers

**Free Tier** ($0/month):
- Read unlimited articles
- Bookmark up to 50 articles
- Basic recommendations
- 5 direct messages per day
- Vote on governance (1 vote base power)

**Pro Tier** (30 USDT/month):
- All Free features
- Unlimited bookmarks
- AI-powered personalized feed
- Unlimited direct messages
- Ad-free experience
- ⭐ Pro badge on profile
- Vote on governance (enhanced power)
- Early access to new features

**Premium Tier** (100 USDT/month):
- All Pro features
- Priority content moderation review
- Custom content sources (request any API)
- Advanced analytics dashboard
- 💎 Premium badge on profile
- 2x points earning rate
- VIP support (24-hour response)
- Vote on governance (maximum power)

### 2.4.2 Subscription Purchase Flow (with On-Ramp)

**Smart Contract-Based Subscriptions:**

```javascript
// User clicks "Upgrade to Pro" (30 USDT)
const purchaseSubscription = async (tier) => {
  const { address } = useAppKitAccount()
  const { user } = useUser() // Clerk
  
  // Step 1: Check USDT balance in smart account
  const balance = await readContract({
    address: USDT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [user.publicMetadata.smart_account_address]
  })
  
  // Step 2: If insufficient balance, open Reown on-ramp
  if (balance < tierPrice[tier]) {
    const { open } = useAppKit()
    
    // Open on-ramp modal (buy USDT directly)
    await open({ view: 'OnRampProviders' })
    
    // Reown shows providers:
    // - MoonPay (credit card, 3.5% fee)
    // - Transak (bank transfer, 2.9% fee)
    // - Ramp (instant, 3.9% fee)
    
    // User buys USDT → arrives in smart account (2-5 min)
    // Automatically returns to subscription purchase
  }
  
  // Step 3: Approve USDT spending
  await writeContract({
    address: USDT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [SUBSCRIPTION_CONTRACT_ADDRESS, tierPrice[tier]]
  })
  
  // Step 4: Purchase subscription (on-chain)
  await writeContract({
    address: SUBSCRIPTION_CONTRACT_ADDRESS,
    abi: SUBSCRIPTION_ABI,
    functionName: 'subscribe',
    args: [tier, 30] // Pro, 30 days
  })
  
  // Step 5: Smart contract emits event
  // Backend listener catches event, updates Clerk metadata
}

// Backend listener (Node.js service)
subscriptionContract.on('SubscriptionPurchased', async (user, tier, expiry, event) => {
  // Update Clerk metadata (not Supabase!)
  await clerkClient.users.updateUserMetadata(user, {
    publicMetadata: {
      subscription_tier: tier, // 'pro' or 'premium'
      subscription_expiry: expiry.toString(),
      subscription_tx_hash: event.transactionHash
    }
  })
  
  // Send confirmation email
  await sendEmail(user.email, 'Subscription Activated', `Welcome to ${tier}!`)
})
```

**SubscriptionContract.sol:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SubscriptionManager is Ownable {
    IERC20 public usdtToken;
    address public treasury;
    
    // Subscription prices (in USDT with 6 decimals)
    uint256 public constant PRO_PRICE = 30 * 10**6; // 30 USDT
    uint256 public constant PREMIUM_PRICE = 100 * 10**6; // 100 USDT
    
    struct Subscription {
        string tier; // "pro" or "premium"
        uint256 expiryTimestamp;
        bool active;
    }
    
    mapping(address => Subscription) public subscriptions;
    
    event SubscriptionPurchased(
        address indexed user,
        string tier,
        uint256 expiryTimestamp,
        uint256 amount
    );
    
    event SubscriptionRenewed(
        address indexed user,
        uint256 newExpiry
    );
    
    constructor(address _usdtAddress, address _treasury) {
        usdtToken = IERC20(_usdtAddress);
        treasury = _treasury;
    }
    
    // Purchase subscription
    function subscribe(string memory tier, uint256 durationDays) external {
        uint256 price = keccak256(bytes(tier)) == keccak256(bytes("pro")) 
            ? PRO_PRICE 
            : PREMIUM_PRICE;
        
        // Transfer USDT from user to treasury
        require(
            usdtToken.transferFrom(msg.sender, treasury, price),
            "Payment failed"
        );
        
        // Calculate expiry (extend if existing subscription)
        uint256 startTime = subscriptions[msg.sender].active && 
            subscriptions[msg.sender].expiryTimestamp > block.timestamp
            ? subscriptions[msg.sender].expiryTimestamp
            : block.timestamp;
        
        uint256 expiryTimestamp = startTime + (durationDays * 1 days);
        
        subscriptions[msg.sender] = Subscription({
            tier: tier,
            expiryTimestamp: expiryTimestamp,
            active: true
        });
        
        emit SubscriptionPurchased(msg.sender, tier, expiryTimestamp, price);
    }
    
    // Check if subscription is active
    function isActiveSubscriber(address user) public view returns (bool) {
        return subscriptions[user].active && 
               subscriptions[user].expiryTimestamp > block.timestamp;
    }
    
    // Get subscription details
    function getSubscription(address user) public view returns (
        string memory tier,
        uint256 expiry,
        bool active
    ) {
        Subscription memory sub = subscriptions[user];
        return (sub.tier, sub.expiryTimestamp, sub.active && sub.expiryTimestamp > block.timestamp);
    }
}
```

### 2.4.3 Reown On-Ramp Integration

**Built-in Feature** (no extra code needed):

```javascript
// Enable on-ramp in Reown config
createAppKit({
  projectId: REOWN_PROJECT_ID,
  features: {
    onramp: true, // Enable on-ramp
  }
})

// Trigger on-ramp manually
import { useAppKit } from '@reown/appkit/react'

const BuyUSDTButton = () => {
  const { open } = useAppKit()
  
  return (
    <button onClick={() => open({ view: 'OnRampProviders' })}>
      Buy USDT
    </button>
  )
}
```

**Supported Providers** (automatically available):
- **MoonPay**: Credit/debit card, 3.5% fee, instant
- **Transak**: Bank transfer, 2.9% fee, 10-30 minutes
- **Ramp**: Credit card, 3.9% fee, instant
- **Wyre**: Bank transfer, 2.5% fee, 1-3 days

**User Experience:**
1. User clicks "Buy USDT"
2. Reown modal opens showing providers
3. User selects provider (e.g., MoonPay)
4. User enters amount (e.g., $35 = 30 USDT + 5% fee)
5. User pays with credit card
6. USDT arrives in smart account (2-5 minutes)
7. User can immediately purchase subscription

**Cost:** FREE integration (providers charge users 2.5-3.9% fee)

### 2.4.4 Subscription Display & Verification

**Frontend (Reading from Clerk Metadata):**

```javascript
// Check subscription status (no Supabase query!)
const SubscriptionBadge = () => {
  const { user } = useUser() // Clerk
  
  const tier = user?.publicMetadata?.subscription_tier
  const expiry = user?.publicMetadata?.subscription_expiry
  
  if (!tier || tier === 'free') return null
  
  const isExpired = new Date(expiry) < new Date()
  if (isExpired) return <span className="text-red-500">Expired</span>
  
  return tier === 'premium' 
    ? <span className="badge-premium">💎 Premium</span>
    : <span className="badge-pro">⭐ Pro</span>
}

// Protect Pro-only features
const useProFeature = () => {
  const { user } = useUser()
  
  const isPro = () => {
    const tier = user?.publicMetadata?.subscription_tier
    const expiry = user?.publicMetadata?.subscription_expiry
    
    if (!tier || tier === 'free') return false
    if (new Date(expiry) < new Date()) return false
    
    return ['pro', 'premium'].includes(tier)
  }
  
  return { isPro: isPro() }
}

// Usage
const PersonalizedFeed = () => {
  const { isPro } = useProFeature()
  
  if (!isPro) {
    return <UpgradePrompt message="Upgrade to Pro for AI-powered feed" />
  }
  
  return <AIRecommendations />
}
```

**Backend Verification (for sensitive operations):**

```javascript
// Verify subscription on-chain (source of truth)
const verifySubscription = async (userAddress) => {
  const isActive = await readContract({
    address: SUBSCRIPTION_CONTRACT_ADDRESS,
    abi: SUBSCRIPTION_ABI,
    functionName: 'isActiveSubscriber',
    args: [userAddress]
  })
  
  return isActive
}
```

---

### 2.4.5 Clerk Dashboard Feature Control

**Clerk Dashboard Powers** (https://dashboard.clerk.com):

You can control ALL features directly from Clerk dashboard without code changes!

**1. View Users by Subscription Tier:**
```
Dashboard → Users → Filter by metadata
  → publicMetadata.subscription_tier = "pro"
  → Shows: All Pro users (12,456 users)
  → Export to CSV for analytics
```

**2. Bulk Operations:**
```
Dashboard → Users → Select all Pro users → Bulk update
  → Add 1,000 bonus points: publicMetadata.points += 1000
  → Extend subscription: publicMetadata.subscription_expiry += 30 days
  → Downgrade expired users: Set subscription_tier = "free"
```

**3. Manual Subscription Management:**
```
Dashboard → User Profile → Edit Metadata
  
Example: Refund user
  ✅ Change subscription_tier from "pro" to "free"
  ✅ Clear subscription_expiry
  ✅ Add points: points += 30000 (30 USDT worth)
  ✅ Add note in privateMetadata: { refund_reason: "Requested refund" }
  
Example: Promotional upgrade
  ✅ Change tier to "premium" (influencer gets free Premium)
  ✅ Set expiry to 1 year from now
  ✅ Add tag: { promotion: "influencer_partnership" }
```

**4. Feature Flags (Via Metadata):**
```
Dashboard → User → Metadata Editor

Add feature flags to control access:
{
  features_enabled: {
    ai_feed: true,           // Show AI personalized feed
    direct_messages: true,   // Allow DMs
    governance_voting: true, // Can vote on proposals
    ad_creation: true,       // Can create ads
    custom_sources: false,   // Can't request custom sources (Premium only)
    analytics_access: false  // Can't access advanced analytics
  }
}

// Frontend reads these flags:
const canAccessFeature = (featureName) => {
  const { user } = useUser()
  return user?.publicMetadata?.features_enabled?.[featureName] || false
}

// Usage:
{canAccessFeature('ai_feed') && <AIFeedButton />}
{canAccessFeature('governance_voting') && <VoteButton />}
{!canAccessFeature('custom_sources') && <UpgradePromptForCustomSources />}
```

**5. Subscription Tier Rules (Configured in Code, Displayed in Clerk):**

```javascript
// config/subscription-features.ts
export const SUBSCRIPTION_FEATURES = {
  free: {
    max_bookmarks: 50,
    max_dm_per_day: 5,
    ai_feed: false,
    ad_free: false,
    governance_voting_power: 1, // Base voting power
    points_multiplier: 1.0,
    custom_sources: 0,
    priority_support: false
  },
  pro: {
    max_bookmarks: -1, // Unlimited
    max_dm_per_day: -1, // Unlimited
    ai_feed: true,
    ad_free: true,
    governance_voting_power: 5, // 5x voting power
    points_multiplier: 1.5, // Earn 1.5x points
    custom_sources: 3, // Can request 3 custom sources
    priority_support: false
  },
  premium: {
    max_bookmarks: -1,
    max_dm_per_day: -1,
    ai_feed: true,
    ad_free: true,
    governance_voting_power: 10, // 10x voting power
    points_multiplier: 2.0, // Earn 2x points
    custom_sources: -1, // Unlimited custom sources
    priority_support: true
  }
}

// Check feature availability
const canUseFeature = (user, featureName) => {
  const tier = user.publicMetadata.subscription_tier || 'free'
  const features = SUBSCRIPTION_FEATURES[tier]
  
  // Check expiry
  const expiry = user.publicMetadata.subscription_expiry
  if (tier !== 'free' && new Date(expiry) < new Date()) {
    return SUBSCRIPTION_FEATURES.free[featureName] // Downgrade to free
  }
  
  return features[featureName]
}

// Component-level feature control
const AIFeedSection = () => {
  const { user } = useUser()
  const hasAccess = canUseFeature(user, 'ai_feed')
  
  if (!hasAccess) {
    return (
      <div className="blur-md pointer-events-none relative">
        <AIFeedPreview />
        <UpgradeOverlay message="Upgrade to Pro to unlock AI Feed" />
      </div>
    )
  }
  
  return <AIFeedFull />
}

// Rate limiting based on tier
const sendDirectMessage = async (recipientId, content) => {
  const { user } = useUser()
  const maxDMs = canUseFeature(user, 'max_dm_per_day')
  
  if (maxDMs !== -1) { // Not unlimited
    const todayDMs = await countUserDMsToday(user.id)
    if (todayDMs >= maxDMs) {
      throw new Error(`Free tier limited to ${maxDMs} DMs/day. Upgrade to Pro for unlimited.`)
    }
  }
  
  // Send message...
}
```

**6. Clerk Dashboard UI Controls:**

In Clerk dashboard, you'll see:

```
User: alice@example.com
  Status: Active ✅
  Created: 2024-01-15
  Last Sign In: 2 hours ago
  
  Public Metadata:
    ├─ subscription_tier: "pro" [Edit]
    ├─ subscription_expiry: "2024-12-31T23:59:59Z" [Edit]
    ├─ points: 150,000 [Edit]
    ├─ features_enabled:
    │   ├─ ai_feed: true ✅
    │   ├─ direct_messages: true ✅
    │   ├─ governance_voting: true ✅
    │   └─ custom_sources: true ✅
    └─ smart_account_address: "0x456..." [View]
  
  Actions:
    [Upgrade to Premium] [Downgrade to Free] [Extend Subscription]
    [Ban User] [Delete User] [Reset Password]
```

**You Can Click and Edit Any Field!** No code changes needed!

---

### 2.4.6 Feature Visibility Control (Clerk-Powered)

**Automatic Feature Disabling When:**

**Scenario 1: Subscription Expires**
```javascript
// Middleware auto-checks expiry
if (new Date(user.publicMetadata.subscription_expiry) < new Date()) {
  // Auto-downgrade to free tier features
  await clerkClient.users.updateUser(user.id, {
    publicMetadata: {
      ...user.publicMetadata,
      subscription_tier: 'free', // Downgrade
      features_enabled: SUBSCRIPTION_FEATURES.free
    }
  })
}

// UI automatically reflects downgrade
// - AI feed disappears
// - DM limit enforced (5/day)
// - Ads appear again
// - Voting power reduced
```

**Scenario 2: Payment Failed (Grace Period)**
```javascript
// If subscription payment fails (user's smart account has 0 USDT)
// Clerk can set grace period:
publicMetadata: {
  subscription_tier: 'pro',
  subscription_status: 'grace_period', // 7-day grace
  subscription_expiry: '2024-12-07',
  grace_period_ends: '2024-12-14'
}

// Show warning banner:
if (user.publicMetadata.subscription_status === 'grace_period') {
  return (
    <Banner type="warning">
      Your Pro subscription expires in 7 days. 
      <button onClick={handleRenew}>Renew Now</button>
    </Banner>
  )
}
```

**Scenario 3: User Banned/Suspended**
```javascript
// In Clerk dashboard, ban user:
User → Actions → Ban User

// Or via API:
await clerkClient.users.updateUser(userId, {
  publicMetadata: {
    ...user.publicMetadata,
    status: 'banned',
    ban_reason: 'Spam submissions',
    ban_until: '2024-12-31' // Temporary ban
  }
})

// Middleware blocks banned users:
if (user.publicMetadata.status === 'banned') {
  return NextResponse.redirect(new URL('/banned', req.url))
}
```

**Feature Control Matrix:**

```javascript
// config/feature-matrix.ts
export const FEATURE_MATRIX = {
  // Feature: [free, pro, premium]
  ai_personalized_feed:    [false, true,  true],
  unlimited_bookmarks:     [false, true,  true],
  unlimited_dm:            [false, true,  true],
  ad_free_experience:      [false, true,  true],
  custom_content_sources:  [false, false, true],
  advanced_analytics:      [false, false, true],
  priority_support:        [false, false, true],
  governance_proposals:    [false, true,  true], // Can CREATE proposals
  
  // Limits: [free, pro, premium]
  max_bookmarks:           [50,    -1,    -1],   // -1 = unlimited
  max_dm_per_day:          [5,     -1,    -1],
  points_multiplier:       [1.0,   1.5,   2.0],
  voting_power_bonus:      [0,     5,     10],
  
  // UI Elements (show/hide based on tier)
  show_ai_feed_tab:        [false, true,  true],
  show_analytics_page:     [false, false, true],
  show_custom_sources_btn: [false, false, true],
  show_pro_badge:          [false, true,  false],
  show_premium_badge:      [false, false, true],
}

// Helper function
const getFeatureAccess = (user, featureName) => {
  const tier = user?.publicMetadata?.subscription_tier || 'free'
  const tierIndex = { free: 0, pro: 1, premium: 2 }[tier]
  
  return FEATURE_MATRIX[featureName][tierIndex]
}

// Component usage
const NavigationTabs = () => {
  const { user } = useUser()
  
  return (
    <nav>
      <Tab href="/latest">Latest</Tab>
      <Tab href="/hottest">Hottest</Tab>
      
      {/* Only show if Pro or Premium */}
      {getFeatureAccess(user, 'show_ai_feed_tab') && (
        <Tab href="/ai-feed">🤖 AI Feed</Tab>
      )}
      
      {/* Only show if Premium */}
      {getFeatureAccess(user, 'show_analytics_page') && (
        <Tab href="/analytics">📊 Analytics</Tab>
      )}
    </nav>
  )
}

// Disable feature with visual feedback
const BookmarkButton = ({ articleUrl }) => {
  const { user } = useUser()
  const maxBookmarks = getFeatureAccess(user, 'max_bookmarks')
  const currentBookmarks = user.publicMetadata.bookmark_count || 0
  
  const canBookmark = maxBookmarks === -1 || currentBookmarks < maxBookmarks
  
  if (!canBookmark) {
    return (
      <button disabled className="opacity-50 cursor-not-allowed">
        ⭐ Bookmark (Limit Reached - Upgrade to Pro)
      </button>
    )
  }
  
  return <button onClick={() => addBookmark(articleUrl)}>⭐ Bookmark</button>
}
```

**Clerk Dashboard Feature Configuration:**

In your Clerk dashboard, you can:

**View by Subscription Tier:**
```
Users Tab → Filter by Metadata
  
Filter: publicMetadata.subscription_tier = "pro"
Result: Shows 1,234 Pro users

Click any user → See their features:
  ├─ AI Feed: Enabled ✅
  ├─ Unlimited DMs: Enabled ✅
  ├─ Ad-Free: Enabled ✅
  ├─ Voting Power: 5x
  └─ Points Multiplier: 1.5x
```

**Bulk Feature Updates:**
```
Select All Pro Users → Bulk Actions → Update Metadata

Add new feature to all Pro users:
  publicMetadata.features_enabled.beta_features = true
  
Result: All Pro users instantly get access to beta features
  (No code deployment needed!)
```

**Manual Overrides (Promotions/Refunds):**
```
User: influencer@example.com → Edit Metadata

Promotional Premium (Free for 6 months):
  ├─ subscription_tier: "premium"
  ├─ subscription_expiry: "2025-06-06" (6 months)
  ├─ promotion_code: "INFLUENCER_PROMO"
  └─ custom_note: "Partnership with @influencer"

Save → User instantly has Premium features
```

**Automatic Downgrade on Expiry:**
```javascript
// Cron job (runs daily via GitHub Actions)
// scripts/check-subscriptions.js

const { users } = await clerkClient.users.getUserList({ limit: 100 })

for (const user of users) {
  const expiry = user.publicMetadata.subscription_expiry
  
  // Check if expired
  if (expiry && new Date(expiry) < new Date()) {
    // Auto-downgrade to free
    await clerkClient.users.updateUser(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        subscription_tier: 'free',
        features_enabled: SUBSCRIPTION_FEATURES.free,
        previous_tier: user.publicMetadata.subscription_tier // Track for re-subscribe
      }
    })
    
    // Send email: "Your subscription has expired"
    await sendEmail(user.emailAddresses[0].emailAddress, 
      'Subscription Expired', 
      'Renew your Pro subscription to continue enjoying premium features'
    )
  }
}
```

**Benefits:**
- ✅ **No Code Changes**: Update features from dashboard
- ✅ **Real-Time**: Changes apply instantly (< 1 second)
- ✅ **Bulk Operations**: Update 1,000 users in one click
- ✅ **Audit Trail**: Clerk logs all metadata changes
- ✅ **Visual Interface**: No SQL queries needed
- ✅ **Cost**: FREE (included in Clerk free tier)

**Backend Verification (for sensitive operations):**

```javascript
// Verify subscription on-chain (source of truth)
const verifySubscription = async (userAddress) => {
  const isActive = await readContract({
    address: SUBSCRIPTION_CONTRACT_ADDRESS,
    abi: SUBSCRIPTION_ABI,
    functionName: 'isActiveSubscriber',
    args: [userAddress]
  })
  
  return isActive
}
```

---

## SECTION 3: ADVERTISEMENT AUCTION SYSTEM

### 3.1 Ad Types & Formats

**All Formats Supported:** Static Images (JPG, PNG, WebP), Animated GIFs, Videos (MP4, WebM)

**Type 1: Banner Ads**
- **Placements:**
  - Homepage Top Banner: 970x250 (desktop), 320x100 (mobile)
  - Sidebar Rectangles: 300x250
  - Article Page Bottom: 728x90 (desktop), 320x50 (mobile)
- **Pricing (Auction-Based):**
  - Homepage: Minimum bid 100 USDT/week, auction increments 5%
  - Category Pages: Minimum bid 50 USDT/week
  - Article Pages: Minimum bid 20 USDT/week
- **Tenure Options:** 1 week, 2 weeks, 1 month, 3 months (10% discount), 6 months (20% discount)

**Type 2: Sponsored Posts**
- **Format:** Native content in article feed with "Sponsored" badge
- **Includes:** Title, description, thumbnail (image/video), click-through URL
- **Pricing (Auction-Based):**
  - "Hottest" Category: Minimum bid 200 USDT/week
  - Other Categories: Minimum bid 100 USDT/week
- **Tenure Options:** 1 week, 2 weeks, 1 month

**Type 3: Promoted Links**
- **Format:** Priority placement at top of category (first 3 slots)
- **Badge:** "Promoted" tag on article card
- **Pricing (Auction-Based):**
  - Top 3 slots auctioned separately (highest bidders win)
  - Minimum bid: 50 USDT/week per slot
- **Tenure Options:** 3 days, 7 days, 14 days, 30 days

### 3.2 Auction Mechanism (NEW - WITH PARTICIPATION FEE)

**Key Features:**
1. ✅ **1 USDT Non-Refundable Participation Fee** - Required to join any auction
2. ✅ **Automatic Scheduling** - New auction starts 24 hours before current lease expires
3. ✅ **Subscription Notifications** - Users get alerts when subscribed ad slots are expiring
4. ✅ **Transparent Bidding** - All bids visible on blockchain
5. ✅ **Trustless Settlement** - Smart contract handles payments automatically

**Auction Flow:**

```
STEP 1: Ad Slot Lease Active
- Current lessee's ad is showing
- Lease expires in 7 days
- Smart contract tracking expiry timestamp

STEP 2: Notification Trigger (24 hours before expiry)
- Smart contract emits ExpiryWarning event
- Backend listens to event, sends notifications
- All users who subscribed to this slot get email/push notification
- New auction automatically scheduled

STEP 3: Auction Opens (24 hours before expiry)
- Anyone can join by paying 1 USDT participation fee (non-refundable)
- Participation fee goes to platform treasury
- Participants can now place bids (minimum 5% higher than previous)

STEP 4: Auction Active (24-hour duration)
- Bidders compete, can increase bids anytime
- Each bid must be 5%+ higher than current highest
- All USDT locked in smart contract (not withdrawable during auction)

STEP 5: Auction Ends (when current lease expires)
- Highest bidder wins the slot
- Winner's USDT transferred to platform treasury
- All losing bidders auto-refunded (minus participation fee)
- Winner's ad goes live immediately

STEP 6: New Lease Begins
- Winner's ad shows for their purchased tenure (1 week, 1 month, etc.)
- Smart contract tracks new expiry timestamp
- Cycle repeats 24 hours before this lease expires
```

**Example Timeline:**
```
Day 0: User A wins slot, leases for 7 days (expires Day 7)
Day 6 at 00:00: Smart contract emits ExpiryWarning event
Day 6 at 00:00: New auction opens (requires 1 USDT to join)
Day 6 at 01:00: User B pays 1 USDT, joins auction, bids 150 USDT
Day 6 at 05:00: User C pays 1 USDT, joins auction, bids 160 USDT
Day 6 at 23:00: User D pays 1 USDT, joins auction, bids 170 USDT
Day 7 at 00:00: Auction ends, User D wins with 170 USDT bid
Day 7 at 00:01: User D's ad goes live, User A's ad removed
Day 7 at 00:01: User B & C refunded (150 USDT, 160 USDT) - participation fees NOT refunded
```

**Subscription System:**
- Users can "subscribe" to specific ad slots (e.g., "Homepage Banner 1")
- When auction opens for that slot, subscribers get notification
- Notifications: Email (via Supabase) + Push (via Web Push API)
- No cost to subscribe, manage subscriptions on /profile page

### 3.3 Smart Contract Functions (UPDATED)

**AdPaymentContract.sol** - Key Functions:

```solidity
// 1. Join auction (pay 1 USDT participation fee)
function joinAuction(string slotId) external
  - Requires: 1 USDT transfer from user (non-refundable)
  - Effect: User added to auction participants list
  - Emits: AuctionJoined(slotId, participant, timestamp)

// 2. Place bid (only after joining)
function placeBid(string slotId, uint256 amount, uint256 tenureDays) external
  - Requires: User has joined auction (paid participation fee)
  - Requires: Bid is 5%+ higher than current highest
  - Effect: USDT locked in contract, bid recorded
  - Emits: BidPlaced(slotId, bidder, amount, tenureDays, timestamp)

// 3. Finalize auction (called by backend oracle at expiry time)
function finalizeAuction(string slotId) external onlyOwner
  - Effect: Winner's USDT → treasury, losers refunded, participation fees kept
  - Emits: AuctionFinalized(slotId, winner, amount)

// 4. Schedule next auction (called 24 hours before expiry)
function scheduleNextAuction(string slotId) external
  - Effect: New auction opened, participants can join
  - Emits: AuctionScheduled(slotId, startTime, endTime)

// 5. Subscribe to ad slot notifications
function subscribeToSlot(string slotId) external
  - Effect: User added to notification list for this slot
  - Emits: SlotSubscribed(slotId, user, timestamp)

// 6. Get current ad slot info
function getSlotInfo(string slotId) external view returns (
  address currentLessee,
  uint256 expiryTimestamp,
  uint256 currentHighestBid,
  address highestBidder,
  bool auctionActive
)
```

**Event Monitoring (Backend Listener):**
```javascript
// Backend service listens to these events
contract.on('ExpiryWarning', (slotId, expiryTime) => {
  // Send notifications to all subscribers
  notifySubscribers(slotId, expiryTime)
})

contract.on('AuctionScheduled', (slotId, startTime, endTime) => {
  // Update UI to show new auction is live
  updateAuctionStatus(slotId, 'active')
})

contract.on('AuctionFinalized', (slotId, winner, amount) => {
  // Update UI to show new ad
  activateAd(slotId, winner)
})
```

**User Interaction via Reown:**
```javascript
// Example: User joins auction and places bid
import { useWriteContract } from 'wagmi'

function JoinAndBid() {
  const { writeContract } = useWriteContract()
  
  const joinAuction = async () => {
    // Step 1: Approve 1 USDT for participation fee
    await writeContract({
      address: USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [AD_CONTRACT_ADDRESS, ethers.parseUnits('1', 6)] // 1 USDT
    })
    
    // Step 2: Join auction
    await writeContract({
      address: AD_CONTRACT_ADDRESS,
      abi: AD_ABI,
      functionName: 'joinAuction',
      args: ['homepage_banner_1']
    })
  }
  
  const placeBid = async (amount) => {
    // Step 3: Approve bid amount
    await writeContract({
      address: USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [AD_CONTRACT_ADDRESS, ethers.parseUnits(amount, 6)]
    })
    
    // Step 4: Place bid
    await writeContract({
      address: AD_CONTRACT_ADDRESS,
      abi: AD_ABI,
      functionName: 'placeBid',
      args: ['homepage_banner_1', ethers.parseUnits(amount, 6), 7] // 7 days
    })
  }
}
```

---

## SECTION 4: USER REWARDS SYSTEM

### 4.1 Points Earning

**How Users Earn Points:**
- Submit quality content (10+ upvotes): **1,000 points**
- Receive upvote on submission: **10 points per upvote**
- Quality comment (5+ upvotes): **50 points**
- Daily login streak: **20 points/day** (max 100-day streak = 2,000 bonus)
- Share article to social media (tracked via UTM): **5 points per share**
- Complete profile (avatar, bio, social links): **500 points** (one-time)
- Refer new user (via referral code): **2,000 points** (when referral makes first transaction)
- Subscribe to ad slot (engagement): **10 points** (one-time per slot)

**Anti-Gaming Measures:**
- Upvote weighting: New accounts have lower voting power
- Content moderation: Spam submissions rejected (no points awarded)
- Daily limits: Max 5,000 points per user per day from earning activities
- Referral verification: Referral must complete KYC (email verification) and make first transaction

### 4.2 Points-to-USDT Conversion

**Conversion Ratio:** 1,000 points = 1 USDT (adjustable via DAO governance later)

**Conversion Fee:** 1% platform fee

**Minimum Conversion:** 100,000 points (100 USDT gross → 99 USDT net after 1% fee)

**Daily Limit:** 500,000 points max per user (500 USDT gross)

**Cooldown Period:** 7-day waiting period between conversions (anti-farming)

**Conversion Flow:**
```
User Profile Page:
  Points Balance: 150,000
  USDT Balance: 0.00
  
Click "Convert Points to USDT"
  → Enter amount: 100,000 points
  → System shows: "You will receive 99 USDT (1% fee = 1 USDT)"
  → Confirm conversion
  
Backend:
  1. Deduct 100,000 points from Supabase user.points
  2. Add 99 USDT to Supabase user.usdt_balance (off-chain ledger)
  3. Record transaction in points_transactions table
  4. Set last_conversion_at = NOW() (start 7-day cooldown)
  
User sees:
  Points Balance: 50,000
  USDT Balance: 99.00 USDT
```

### 4.3 USDT Withdrawal (Using Reown AppKit)

**Withdrawal Fee:** 1% + gas fees

**Minimum Withdrawal:** 10 USDT (to cover gas costs)

**Withdrawal Flow:**
```
User goes to /rewards page
  → Click "Withdraw USDT"
  → Reown AppKit chain selector appears
  → User selects chain (Polygon, BSC, Arbitrum, etc.)
  → Enter amount: 99 USDT
  → System shows: "Net withdrawal: 98.01 USDT (1% fee = 0.99 USDT, gas ~0.5 USDT)"
  → Confirm withdrawal
  
Reown AppKit executes:
  1. Platform treasury contract transfers 98.01 USDT to user's smart account
  2. Transaction confirmed on blockchain
  3. User's Reown wallet shows +98.01 USDT
  
User can now:
  - Send to external wallet (CEX, hardware wallet, etc.)
  - Swap to other tokens
  - Use for auction participation fees
  - All via Reown AppKit's built-in features
```

**Implementation Notes:**
- Withdrawals are MANUAL initially (owner sends USDT from treasury to user)
- Phase 2: Automate via backend service listening to withdrawal requests
- Phase 3: Fully trustless via smart contract (requires audit)

### 4.4 Economic Health Monitoring

**Target Metrics:**
- **Points Issued vs Redeemed:** Target ratio 2:1 (2x more issued than redeemed)
- **USDT Inflow vs Outflow:** Target ratio 1.5:1 (ad revenue > user withdrawals)
- **Treasury Balance:** Maintain 10,000 USDT minimum per chain
- **Conversion Rate Adjustment:** If ratio drops below 1.2:1, increase to 1,200 points = 1 USDT

**Admin Dashboard (`/admin`):**
- Real-time treasury balance (all chains)
- Daily/weekly/monthly revenue (ads + fees)
- Points circulation (issued, redeemed, burned)
- User growth (signups, DAU, MAU, retention)
- Content metrics (articles, upvotes, engagement)

---

## SECTION 4.5: DUNE ANALYTICS INTEGRATION

### 4.5.1 Purpose & Scope

**Reference Example:** https://dune.com/woofianalytics/woofi-dashboard (WooFi Analytics Dashboard)

**What Dune Analytics Tracks:**

**On-Chain Metrics (Smart Contract Events):**
1. **Advertisement Auctions:**
   - Total ad spend (by chain, by ad type)
   - Number of auctions per day/week/month
   - Average bid amounts
   - Top advertisers (by total spend)
   - Participation fee revenue (1 USDT × participants)
   - Win rates per advertiser

2. **Subscriptions:**
   - New Pro/Premium subscriptions per day
   - Subscription revenue (by tier, by chain)
   - Renewal rates
   - Churn rate (expired subscriptions)
   - Total active subscribers (Pro + Premium)

3. **Governance:**
   - Proposals created per week
   - Voting participation rate
   - Top voters (by voting power used)
   - Proposal pass rate
   - Total voting power distributed

4. **Treasury Metrics:**
   - Total USDT balance (across all 6 chains)
   - Inflow vs Outflow (ad revenue vs withdrawals)
   - Fee revenue (conversion fees + withdrawal fees)
   - Net profit per day/week/month

5. **User Activity (On-Chain Only):**
   - Smart account creations per day
   - Total unique users (by chain)
   - Transaction volume (ad payments, subscriptions, withdrawals)
   - Gas costs paid by platform (if sponsoring)

**Off-Chain Metrics (Supabase + Clerk - NOT Dune):**
- Website traffic (page views, unique visitors)
- Content metrics (articles fetched, sources used)
- Social activity (follows, likes, messages)
- Points earned/redeemed (off-chain ledger)

### 4.5.2 Dune Dashboard Creation

**Step 1: Create Dune Account** (FREE)
- Sign up at https://dune.com (free forever for public dashboards)
- No credit card required

**Step 2: Index Your Smart Contracts**

Dune automatically indexes all major chains (Ethereum, Polygon, BSC, Arbitrum, Optimism, Base).

```sql
-- Example Dune SQL Query: Total Ad Revenue by Chain

SELECT 
  blockchain,
  DATE_TRUNC('day', block_time) as date,
  COUNT(*) as auction_count,
  SUM(bid_amount / 1e6) as total_revenue_usdt, -- Convert from 6 decimals
  AVG(bid_amount / 1e6) as avg_bid_usdt,
  COUNT(DISTINCT bidder) as unique_bidders
FROM AdPaymentContract_evt_BidPlaced
WHERE contract_address IN (
  '0x...', -- Ethereum contract
  '0x...', -- Polygon contract
  '0x...', -- BSC contract
  '0x...', -- Arbitrum contract
  '0x...', -- Optimism contract
  '0x...'  -- Base contract
)
GROUP BY blockchain, DATE_TRUNC('day', block_time)
ORDER BY date DESC
```

**Step 3: Create Visualizations**

```sql
-- Chart 1: Ad Revenue Over Time (Line Chart)
SELECT 
  DATE_TRUNC('day', block_time) as date,
  SUM(bid_amount / 1e6) as revenue
FROM AdPaymentContract_evt_BidPlaced
WHERE block_time > NOW() - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1

-- Chart 2: Revenue by Chain (Pie Chart)
SELECT 
  blockchain,
  SUM(bid_amount / 1e6) as revenue
FROM AdPaymentContract_evt_BidPlaced
GROUP BY 1

-- Chart 3: Top Advertisers (Bar Chart)
SELECT 
  bidder as advertiser,
  COUNT(*) as total_bids,
  SUM(bid_amount / 1e6) as total_spent_usdt
FROM AdPaymentContract_evt_BidPlaced
GROUP BY 1
ORDER BY 3 DESC
LIMIT 10

-- Chart 4: Subscription Growth (Area Chart)
SELECT 
  DATE_TRUNC('day', block_time) as date,
  tier,
  COUNT(*) as new_subscriptions
FROM SubscriptionManager_evt_SubscriptionPurchased
WHERE block_time > NOW() - INTERVAL '90 days'
GROUP BY 1, 2
ORDER BY 1

-- Chart 5: Treasury Balance (Multi-Line Chart)
SELECT 
  blockchain,
  DATE_TRUNC('day', block_time) as date,
  SUM(amount / 1e6) as cumulative_balance
FROM (
  -- Inflows (ad revenue + subscriptions)
  SELECT blockchain, block_time, bid_amount as amount FROM AdPaymentContract_evt_BidPlaced
  UNION ALL
  SELECT blockchain, block_time, amount FROM SubscriptionManager_evt_SubscriptionPurchased
  UNION ALL
  -- Outflows (withdrawals)
  SELECT blockchain, block_time, -amount FROM WithdrawalContract_evt_Withdrawn
) combined
GROUP BY 1, 2
ORDER BY 1, 2
```

**Step 4: Build Dashboard** (like WooFi example)

Dune dashboard structure:
```
Web3News Analytics Dashboard
├─ Overview Section
│   ├─ Total Revenue (big number)
│   ├─ Active Subscriptions (big number)
│   ├─ Treasury Balance (big number)
│   └─ Total Users (big number)
│
├─ Revenue Section
│   ├─ Revenue Over Time (line chart)
│   ├─ Revenue by Chain (pie chart)
│   └─ Revenue by Type (bar chart: ads vs subscriptions)
│
├─ User Activity Section
│   ├─ New Smart Accounts (line chart)
│   ├─ Active Users by Chain (bar chart)
│   └─ Transaction Volume (area chart)
│
├─ Advertiser Section
│   ├─ Top Advertisers (table)
│   ├─ Ad Slot Performance (heatmap)
│   └─ Auction Participation (line chart)
│
└─ Governance Section
    ├─ Proposals Created (line chart)
    ├─ Voting Participation (bar chart)
    └─ Top Voters (table)
```

### 4.5.3 Embedding Dune Dashboard in Website

**Embed Entire Dashboard:**

```jsx
// app/analytics/page.tsx
import { useUser } from '@clerk/nextjs'

export default function AnalyticsPage() {
  const { user } = useUser()
  const isPremium = user?.publicMetadata?.subscription_tier === 'premium'
  
  if (!isPremium) {
    return <UpgradePrompt requiredTier="premium" />
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">📊 Platform Analytics</h1>
      
      {/* Embed Dune Dashboard */}
      <iframe
        src="https://dune.com/embeds/1234567/5678901/your-dashboard-id"
        width="100%"
        height="800px"
        frameBorder="0"
        className="rounded-lg shadow-lg"
      />
      
      {/* Or embed individual charts */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <iframe
          src="https://dune.com/embeds/1234567/5678901/revenue-chart"
          height="400px"
          className="rounded-lg"
        />
        <iframe
          src="https://dune.com/embeds/1234567/5678901/treasury-chart"
          height="400px"
          className="rounded-lg"
        />
      </div>
    </div>
  )
}
```

**Public Dashboard (Homepage Widget):**

```jsx
// components/PublicStats.tsx
export function PublicStats() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-6">📈 Platform Statistics</h2>
        
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Big numbers from Dune API */}
          <StatCard title="Total Revenue" value="125,000 USDT" />
          <StatCard title="Active Subscribers" value="1,234 Pro + 234 Premium" />
          <StatCard title="Treasury Balance" value="85,000 USDT" />
          <StatCard title="Total Users" value="10,234" />
        </div>
        
        {/* Embed mini Dune chart */}
        <iframe
          src="https://dune.com/embeds/your-dashboard/revenue-7days"
          height="300px"
          className="w-full rounded-lg"
        />
      </div>
    </div>
  )
}
```

### 4.5.4 Dune API Integration (Fetch Data Programmatically)

**Dune API (FREE for public dashboards):**

```javascript
// lib/utils/dune.ts
const DUNE_API_KEY = process.env.DUNE_API_KEY // Optional for public queries

export const getDuneData = async (queryId) => {
  const response = await fetch(
    `https://api.dune.com/api/v1/query/${queryId}/results`,
    {
      headers: {
        'X-Dune-API-Key': DUNE_API_KEY // Optional for public queries
      }
    }
  )
  
  const data = await response.json()
  return data.result.rows
}

// Usage: Display stats on homepage
const StatsWidget = async () => {
  const stats = await getDuneData('1234567') // Your query ID
  
  return (
    <div>
      <h3>Total Revenue: {stats[0].total_revenue} USDT</h3>
      <h3>Active Ads: {stats[0].active_ads}</h3>
    </div>
  )
}
```

### 4.5.5 Analytics Dashboard Split

**Public Analytics** (Free for everyone):
- Total platform revenue (last 30 days)
- Number of active ads
- Top content categories
- Total users (count only)
- Embedded Dune chart (revenue over time)

**Premium Analytics** (Premium tier only):
- **Full Dune Dashboard Embed:**
  - Revenue breakdown by chain
  - Top advertisers table
  - Subscription metrics
  - Governance activity
  - Treasury balance trends
- **Supabase Analytics:**
  - Your content performance (views, upvotes on YOUR submissions)
  - Your referral earnings
  - Your voting history
  - Your auction win rate

**Admin Analytics** (`/admin` - Owner only):
- **Dune Dashboard** (full access)
- **Clerk Dashboard** (user management)
- **Supabase Dashboard** (database metrics)
- **Combined View:**
  - On-chain revenue (Dune)
  - Off-chain points economy (Supabase)
  - User growth (Clerk)
  - Content performance (Supabase)

### 4.5.6 Implementation Timeline

**Phase 1 (MVP):**
- ✅ Basic stats (total users, total articles, total ads)
- ✅ Simple Supabase queries (no Dune yet)

**Phase 2 (Beta):**
- ✅ Create Dune dashboard (after smart contracts deployed to mainnet)
- ✅ Embed Dune charts in `/analytics` page
- ✅ Public stats widget on homepage

**Phase 3 (Production):**
- ✅ Full Dune dashboard embed (Premium users)
- ✅ Real-time treasury monitoring
- ✅ Dune API integration (fetch stats programmatically)
- ✅ Custom SQL queries for specific metrics

**Cost:** $0 (Dune is free for public dashboards) ✅

---

## SECTION 4.6: AI-POWERED CONTENT RECOMMENDATIONS (FREE)

### 4.5.1 Recommendation Strategy

**Goal:** Personalized feed showing articles user is most likely to enjoy

**Implementation:** 3-Tier Approach (All FREE)

**Tier 1 - MVP: Collaborative Filtering (No AI, 100% Free)**

```javascript
// Based on user behavior patterns
const getRecommendations = async (userId) => {
  // 1. Get user's reading history
  const userHistory = await supabase
    .from('bookmarks')
    .select('article_url, article_source, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)
  
  // 2. Find similar users (who bookmarked same articles)
  const similarUsers = await supabase.rpc('find_similar_users', {
    user_id: userId,
    min_overlap: 3 // At least 3 common bookmarks
  })
  
  // 3. Get articles liked by similar users but not by this user
  const recommendations = await supabase.rpc('get_collaborative_recommendations', {
    user_id: userId,
    similar_user_ids: similarUsers.map(u => u.id),
    limit: 50
  })
  
  return recommendations
}

// Supabase SQL function
CREATE OR REPLACE FUNCTION find_similar_users(
  user_id UUID,
  min_overlap INT
) RETURNS TABLE (id UUID, overlap_count INT) AS $$
  SELECT b2.user_id AS id, COUNT(*) AS overlap_count
  FROM bookmarks b1
  JOIN bookmarks b2 ON b1.article_url = b2.article_url
  WHERE b1.user_id = user_id
    AND b2.user_id != user_id
  GROUP BY b2.user_id
  HAVING COUNT(*) >= min_overlap
  ORDER BY overlap_count DESC
  LIMIT 100
$$ LANGUAGE SQL;
```

**Pros:**
- ✅ 100% free (runs in Supabase)
- ✅ No external APIs needed
- ✅ Fast execution (< 100ms)
- ✅ Privacy-friendly

**Cons:**
- ❌ Cold start problem (new users get generic feed)
- ❌ Less accurate than AI

**Cost:** $0 ✅

---

**Tier 2 - Beta: Content-Based Filtering (TensorFlow.js)**

```javascript
// Client-side ML for better recommendations
import * as tf from '@tensorflow/tfjs'
import * as use from '@tensorflow-models/universal-sentence-encoder'

// Load model once (10 MB download)
const model = await use.load()

// Generate article embeddings
const getArticleEmbedding = async (article) => {
  const text = `${article.title} ${article.description} ${article.category}`
  const embeddings = await model.embed([text])
  return embeddings.arraySync()[0]
}

// Find similar articles
const findSimilarArticles = (userLikedArticles, allArticles) => {
  // 1. Get embeddings for user's liked articles
  const userEmbeddings = await Promise.all(
    userLikedArticles.map(getArticleEmbedding)
  )
  
  // 2. Calculate average user profile embedding
  const userProfile = tf.mean(userEmbeddings, 0)
  
  // 3. Calculate similarity with all articles
  const recommendations = allArticles.map(article => {
    const articleEmbedding = article.embedding // Pre-computed
    const similarity = cosineSimilarity(userProfile, articleEmbedding)
    return { article, score: similarity }
  })
  
  // 4. Return top 50 recommendations
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
}
```

**Pros:**
- ✅ 100% free (runs in browser)
- ✅ Better accuracy than collaborative filtering
- ✅ No cold start problem (can recommend to new users)

**Cons:**
- ❌ 10 MB model download (one-time)
- ❌ CPU-intensive (may drain mobile battery)

**Cost:** $0 (one-time 10 MB download) ✅

---

**Tier 3 - Production: Hybrid (OpenAI Embeddings - CHEAP)**

```javascript
// Best quality recommendations using OpenAI
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Generate embeddings for new articles (run once when article added)
const generateArticleEmbedding = async (article) => {
  const text = `${article.title}. ${article.description}`
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small', // Cheapest model
    input: text
  })
  
  return response.data[0].embedding // 1536-dimensional vector
}

// Get personalized recommendations
const getPersonalizedFeed = async (userId) => {
  // 1. Get user's reading history
  const history = await getUserHistory(userId)
  
  // 2. Generate user profile embedding
  const userProfile = history.map(a => a.title).join('. ')
  const profileEmbedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: userProfile
  })
  
  // 3. Find similar articles using Supabase vector search
  const { data } = await supabase.rpc('match_articles', {
    query_embedding: profileEmbedding.data[0].embedding,
    match_threshold: 0.7,
    match_count: 50
  })
  
  return data
}

// Supabase vector search function (requires pgvector extension)
CREATE OR REPLACE FUNCTION match_articles(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
) RETURNS TABLE (
  id UUID,
  title TEXT,
  similarity FLOAT
) AS $$
  SELECT 
    id,
    title,
    1 - (embedding <=> query_embedding) AS similarity
  FROM articles
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count
$$ LANGUAGE SQL;
```

**Cost Calculation:**
- **Model:** text-embedding-3-small @ $0.02 per 1M tokens
- **Average article:** 100 tokens
- **10,000 articles:** 1M tokens = **$0.02** (one-time)
- **User profile:** 100 tokens per user
- **1,000 users:** 100,000 tokens = **$0.002/day = $0.06/month**

**Total Cost:** $0.02 (one-time) + $0.06/month = **$0.08/month for 1,000 users** ✅

**Pros:**
- ✅ Extremely cheap ($0.08/month)
- ✅ Best quality recommendations
- ✅ Fast execution (< 200ms)
- ✅ No client-side processing

**Cons:**
- ❌ Not 100% free (but very cheap)
- ❌ Requires API key

---

### 4.5.2 Recommendation Algorithm Comparison

| Approach | Cost | Accuracy | Speed | Cold Start |
|----------|------|----------|-------|-----------|
| Collaborative Filtering | $0 | 70% | Fast | ❌ Poor |
| TensorFlow.js | $0 | 80% | Medium | ✅ Good |
| OpenAI Embeddings | $0.08/mo | 95% | Fast | ✅ Good |

**Recommendation:** Start with **Collaborative Filtering** (MVP), upgrade to **OpenAI** when you have revenue ($10/month ad revenue easily covers $0.08 API costs).

---

## SECTION 4.6: SOCIAL FEATURES

### 4.6.1 Follow System

**Feature:** Users can follow other users to see their activity in their feed

**Database Schema:**
```sql
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id) -- Can't follow yourself
);

CREATE INDEX idx_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_follows_following ON user_follows(following_id);
```

**Implementation:**
```javascript
// Follow user
const followUser = async (userId, targetUserId) => {
  await supabase.from('user_follows').insert({
    follower_id: userId,
    following_id: targetUserId
  })
  
  // Send notification to target user
  await supabase.from('notifications').insert({
    user_id: targetUserId,
    type: 'new_follower',
    content: `${user.username} started following you`,
    link: `/profile/${user.username}`
  })
}

// Get feed from followed users
const getFollowingFeed = async (userId) => {
  const { data } = await supabase
    .from('submissions')
    .select('*, users!inner(id, username, avatar_url)')
    .in('user_id', 
      supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', userId)
    )
    .order('created_at', { ascending: false })
    .limit(50)
  
  return data
}
```

**UI Features:**
- Follow/Unfollow button on user profiles
- Follower/Following count on profiles
- "Following" feed tab showing activity from followed users
- Follow suggestions based on similar interests

---

### 4.6.2 Like System

**Feature:** Users can like articles and submissions

**Database Schema:**
```sql
CREATE TABLE article_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  article_url TEXT NOT NULL,
  article_title TEXT,
  article_source TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, article_url)
);

CREATE INDEX idx_likes_user ON article_likes(user_id);
CREATE INDEX idx_likes_article ON article_likes(article_url);
```

**Implementation:**
```javascript
// Like article
const likeArticle = async (userId, article) => {
  await supabase.from('article_likes').insert({
    user_id: userId,
    article_url: article.url,
    article_title: article.title,
    article_source: article.source
  })
  
  // Award points to article submitter (if exists)
  const { data: submission } = await supabase
    .from('submissions')
    .select('user_id')
    .eq('url', article.url)
    .single()
  
  if (submission) {
    await awardPoints(submission.user_id, 10, 'like_received')
  }
}

// Get article like count
const getArticleLikes = async (articleUrl) => {
  const { count } = await supabase
    .from('article_likes')
    .select('*', { count: 'exact', head: true })
    .eq('article_url', articleUrl)
  
  return count
}
```

**UI Features:**
- Heart icon on article cards (filled if liked)
- Like count displayed
- "Liked Articles" page showing user's liked content
- Most liked articles in "Trending" section

---

### 4.6.3 Direct Messages (DM)

**Feature:** Users can send private messages to each other

**Database Schema:**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(participant_1, participant_2),
  CHECK (participant_1 < participant_2) -- Ensure consistent ordering
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(conversation_id, read) WHERE read = FALSE;
```

**Implementation (Supabase Realtime):**
```javascript
// Send message
const sendMessage = async (senderId, recipientId, content) => {
  // 1. Get or create conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .upsert({
      participant_1: Math.min(senderId, recipientId),
      participant_2: Math.max(senderId, recipientId),
      last_message_at: new Date()
    })
    .select()
    .single()
  
  // 2. Insert message
  await supabase.from('messages').insert({
    conversation_id: conversation.id,
    sender_id: senderId,
    content: content
  })
  
  // 3. Send push notification to recipient
  await sendPushNotification(recipientId, {
    title: `New message from ${sender.username}`,
    body: content.substring(0, 100),
    link: `/messages/${conversation.id}`
  })
}

// Subscribe to new messages (Supabase Realtime)
const subscribeToMessages = (conversationId, onNewMessage) => {
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, payload => {
      onNewMessage(payload.new)
    })
    .subscribe()
  
  return () => channel.unsubscribe()
}
```

**UI Features:**
- Messages inbox (like Twitter DMs)
- Real-time message updates (Supabase Realtime)
- Unread message count badge
- Message notifications (Web Push API)
- Emoji picker, link previews
- Block/report user functionality

**Cost:** $0 (Supabase Realtime included in free tier) ✅

---

## SECTION 4.7: DAO GOVERNANCE & VOTING

### 4.7.1 Governance Categories

**What Users Can Vote On:**

**1. Content Moderation (Community Decisions)**
- Approve/reject flagged content
- Ban users (requires 51% approval)
- Update community guidelines
- Example: "Should we allow political content?" (Yes/No/Abstain)

**2. Economic Policy (Platform Economics)**
- Adjust points-to-USDT conversion rate (currently 1,000 points = 1 USDT)
- Adjust platform fees (currently 1% conversion, 1% withdrawal)
- Adjust ad slot pricing minimums
- Example: "Reduce withdrawal fee from 1% to 0.5%?" (Yes/No)

**3. Feature Prioritization (Development Roadmap)**
- Vote on next features to build (AI search, mobile app, video support)
- Vote on which content sources to add next
- Vote on UI/UX improvements
- Example: "Prioritize mobile app or AI search?" (Option A/B)

**4. Treasury Spending (Financial Decisions)**
- Allocate treasury funds for development
- Fund developer bounties (e.g., $5,000 to add TikTok integration)
- Marketing campaigns (e.g., $10,000 for influencer partnerships)
- Example: "Allocate $20,000 for smart contract audit?" (Yes/No)

**5. Ad Slot Policies (Advertising Rules)**
- Special auction rules (e.g., charity gets 50% discount)
- Blacklist advertisers
- Ad content policies
- Example: "Ban gambling ads?" (Yes/No)

**6. Partnership Decisions (Strategic Partnerships)**
- Partnerships with other platforms
- Integrations (e.g., integrate with Lens Protocol?)
- Sponsorship deals
- Example: "Partner with CoinDesk for exclusive content?" (Yes/No)

### 4.7.2 Voting Power System

**Meritocratic Voting (Recommended):**

Users earn voting power through contributions, not just holding tokens:

```javascript
// Calculate user's voting power
const calculateVotingPower = (user) => {
  let power = 0
  
  // Base power: 1 vote per user (democratic)
  power += 1
  
  // Content contribution: +1 vote per 10 approved submissions
  power += Math.floor(user.approved_submissions / 10)
  
  // Quality bonus: +1 vote per 1,000 upvotes received
  power += Math.floor(user.total_upvotes / 1000)
  
  // Longevity bonus: +1 vote per 100 days as member
  const daysSinceJoin = (Date.now() - user.created_at) / (1000 * 60 * 60 * 24)
  power += Math.floor(daysSinceJoin / 100)
  
  // Points stake: +1 vote per 10,000 points balance
  power += Math.floor(user.points / 10000)
  
  // Cap voting power at 100 votes (prevent whale domination)
  return Math.min(power, 100)
}
```

**Voting Power Tiers:**
- **Tier 1** (1-5 votes): New users, lurkers
- **Tier 2** (6-20 votes): Regular contributors
- **Tier 3** (21-50 votes): Power users
- **Tier 4** (51-100 votes): Top contributors

### 4.7.3 Smart Contract Implementation

**GovernanceContract.sol:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Governance {
    struct Proposal {
        string title;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline; // Unix timestamp
        bool executed;
        bool passed;
        address proposer;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public votingPower; // Store voting power at proposal time
    
    uint256 public nextProposalId;
    uint256 public constant QUORUM = 10; // 10% of voting power must participate
    uint256 public constant VOTING_PERIOD = 7 days;
    
    event ProposalCreated(uint256 proposalId, string title, address proposer);
    event VoteCast(uint256 proposalId, address voter, bool support, uint256 power);
    event ProposalExecuted(uint256 proposalId, bool passed);
    
    // Create new proposal
    function createProposal(
        string memory title,
        string memory description
    ) external returns (uint256) {
        uint256 proposalId = nextProposalId++;
        
        proposals[proposalId] = Proposal({
            title: title,
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + VOTING_PERIOD,
            executed: false,
            passed: false,
            proposer: msg.sender
        });
        
        emit ProposalCreated(proposalId, title, msg.sender);
        return proposalId;
    }
    
    // Cast vote
    function vote(uint256 proposalId, bool support, uint256 power) external {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp < proposal.deadline, "Voting period ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(power > 0, "No voting power");
        
        // Record vote
        if (support) {
            proposal.votesFor += power;
        } else {
            proposal.votesAgainst += power;
        }
        
        hasVoted[proposalId][msg.sender] = true;
        votingPower[proposalId][msg.sender] = power;
        
        emit VoteCast(proposalId, msg.sender, support, power);
    }
    
    // Execute proposal after voting period
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.deadline, "Voting still active");
        require(!proposal.executed, "Already executed");
        
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        uint256 totalPower = getTotalVotingPower(); // From off-chain oracle
        
        // Check quorum (10% participation)
        require(totalVotes >= (totalPower * QUORUM) / 100, "Quorum not reached");
        
        // Check if passed (simple majority)
        proposal.passed = proposal.votesFor > proposal.votesAgainst;
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId, proposal.passed);
    }
    
    // Get total voting power (set by oracle)
    function getTotalVotingPower() public view returns (uint256) {
        // This would be updated by off-chain oracle based on Supabase data
        // For now, return placeholder
        return 10000;
    }
}
```

### 4.7.4 Voting UI

**Proposal Page (`/governance`):**
- List of active proposals
- Vote For/Against buttons
- Voting power displayed
- Time remaining until deadline
- Current vote counts (For/Against)
- Proposal details modal

**Example Vote:**
```
Proposal #12: Reduce Withdrawal Fee

Description: Reduce withdrawal fee from 1% to 0.5% to encourage more 
user withdrawals and improve platform competitiveness.

Proposed by: @alice (100 days ago)
Ends in: 3 days 5 hours

Current Results:
  For: 12,456 votes (68%)
  Against: 5,821 votes (32%)
  
Your Voting Power: 15 votes
Status: Not voted yet

[Vote For] [Vote Against] [Abstain]
```

### 4.7.5 Governance Economics

**Proposal Cost:** 1,000 points (to prevent spam)

**Voting Rewards:**
- Vote on proposal: 10 points
- Proposal passes (if you voted with majority): 50 bonus points
- Create proposal that passes: 500 bonus points

**Cost:** $0 (on-chain voting using existing smart contract infrastructure) ✅

---

## SECTION 5: DATABASE & STORAGE

### 5.1 Supabase PostgreSQL (Free Tier) - OPTIMIZED

**Limits:** 500 MB storage, 2 GB bandwidth/month

**Architecture Change:** 
- ❌ **NO users table** (stored in Clerk metadata instead!)
- ✅ **Only content data** (70% database reduction)
- ✅ **Better performance** (no user table joins)

**Schema Design:**

```sql
-- NOTE: NO users table! All user data stored in Clerk metadata
-- clerk_id is used as foreign key reference (TEXT type)

-- User-submitted content
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT NOT NULL, -- Reference to Clerk user (NO foreign key constraint)
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookmarks
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT NOT NULL,
  article_url TEXT NOT NULL,
  article_title TEXT,
  article_source TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(clerk_id, article_url)
);

-- Advertisements
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT NOT NULL,
  ad_type TEXT NOT NULL, -- banner, sponsored_post, promoted_link
  ad_slot TEXT NOT NULL, -- homepage_top, category_tech_sidebar, etc.
  creative_url TEXT NOT NULL,
  creative_type TEXT NOT NULL, -- image, gif, video
  target_url TEXT,
  bid_amount DECIMAL(18,6) NOT NULL,
  tenure_days INTEGER NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending_auction', -- pending_auction, active, expired, rejected
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  tx_hash TEXT,
  chain TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Auction participants (tracks who joined each auction)
CREATE TABLE auction_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id TEXT NOT NULL,
  clerk_id TEXT NOT NULL,
  participation_fee_paid BOOLEAN DEFAULT FALSE,
  participation_tx_hash TEXT,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(slot_id, clerk_id)
);

-- Auction bids
CREATE TABLE auction_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id TEXT NOT NULL,
  bidder_clerk_id TEXT NOT NULL,
  bid_amount DECIMAL(18,6) NOT NULL,
  tenure_days INTEGER NOT NULL,
  status TEXT DEFAULT 'active', -- active, outbid, won, cancelled
  tx_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Slot subscriptions (for notifications)
CREATE TABLE slot_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT NOT NULL,
  slot_id TEXT NOT NULL,
  notification_email BOOLEAN DEFAULT TRUE,
  notification_push BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(clerk_id, slot_id)
);

-- Points transactions (NOTE: Points stored in Clerk metadata, this is just audit log)
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT NOT NULL,
  type TEXT NOT NULL, -- earned_submit, earned_upvote, spent_conversion, etc.
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- USDT conversions (NOTE: Balance stored in Clerk metadata)
CREATE TABLE conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT NOT NULL,
  points_redeemed INTEGER NOT NULL,
  usdt_amount DECIMAL(18,6) NOT NULL,
  fee_amount DECIMAL(18,6) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- USDT withdrawals
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT NOT NULL,
  amount DECIMAL(18,6) NOT NULL,
  fee_amount DECIMAL(18,6) NOT NULL,
  chain TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Social Features: Follow System
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_clerk_id TEXT NOT NULL,
  following_clerk_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_clerk_id, following_clerk_id),
  CHECK (follower_clerk_id != following_clerk_id)
);

-- Social Features: Like System
CREATE TABLE article_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT NOT NULL,
  article_url TEXT NOT NULL,
  article_title TEXT,
  article_source TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(clerk_id, article_url)
);

-- Social Features: Direct Messages
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1_clerk_id TEXT NOT NULL,
  participant_2_clerk_id TEXT NOT NULL,
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(participant_1_clerk_id, participant_2_clerk_id),
  CHECK (participant_1_clerk_id < participant_2_clerk_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_clerk_id TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Governance: Proposals
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- moderation, economic, feature, treasury, ad_policy, partnership
  proposer_clerk_id TEXT NOT NULL,
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  deadline TIMESTAMP NOT NULL,
  executed BOOLEAN DEFAULT FALSE,
  passed BOOLEAN DEFAULT FALSE,
  tx_hash TEXT, -- On-chain tx hash
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  voter_clerk_id TEXT NOT NULL,
  support BOOLEAN NOT NULL, -- true = for, false = against
  voting_power INTEGER NOT NULL,
  tx_hash TEXT, -- On-chain tx hash
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(proposal_id, voter_clerk_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT NOT NULL,
  type TEXT NOT NULL, -- new_follower, new_like, new_message, auction_win, proposal_passed
  content TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance (NO user table indexes!)
CREATE INDEX idx_submissions_clerk ON submissions(clerk_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_category ON submissions(category);
CREATE INDEX idx_bookmarks_clerk ON bookmarks(clerk_id);
CREATE INDEX idx_ads_clerk ON advertisements(clerk_id);
CREATE INDEX idx_ads_slot_status ON advertisements(ad_slot, status);
CREATE INDEX idx_ads_dates ON advertisements(start_date, end_date);
CREATE INDEX idx_auction_slot ON auction_bids(slot_id, created_at DESC);
CREATE INDEX idx_points_clerk ON points_transactions(clerk_id, created_at DESC);
CREATE INDEX idx_follows_follower ON user_follows(follower_clerk_id);
CREATE INDEX idx_follows_following ON user_follows(following_clerk_id);
CREATE INDEX idx_likes_clerk ON article_likes(clerk_id);
CREATE INDEX idx_likes_article ON article_likes(article_url);
CREATE INDEX idx_conversations_p1 ON conversations(participant_1_clerk_id);
CREATE INDEX idx_conversations_p2 ON conversations(participant_2_clerk_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(conversation_id, read) WHERE read = FALSE;
CREATE INDEX idx_proposals_deadline ON proposals(deadline, executed);
CREATE INDEX idx_votes_proposal ON votes(proposal_id);
CREATE INDEX idx_notifications_clerk_unread ON notifications(clerk_id, read) WHERE read = FALSE;
```

**Database Size Comparison:**

| Component | Old Approach (with users table) | New Approach (Clerk metadata) |
|-----------|----------------------------------|-------------------------------|
| Users table | 10,000 users × 500 bytes = 5 MB | ❌ Removed (0 MB) |
| Indexes | 3 MB | ❌ Removed (0 MB) |
| Content tables | 50 MB | 50 MB (unchanged) |
| **Total** | **58 MB** | **50 MB (14% reduction)** |

**Benefits:**
- ✅ 14% database size reduction
- ✅ No user table joins (faster queries)
- ✅ User data reads from Clerk cache (< 10ms)
- ✅ Admin dashboard for free (Clerk)
- ✅ Subscription management for free (Clerk)

**Data Cleanup (Free Tier Optimization):**
- Delete old submissions (rejected > 30 days)
- Archive expired ads (> 90 days old) to JSON export
- Remove old points transactions (> 1 year) after aggregation
- Keep only last 1,000 messages per conversation (older → archive)

### 5.2 Supabase Storage

**Buckets:**
- `ad-creatives` (public): Images/GIFs/videos uploaded by advertisers
- `user-avatars` (public): Profile pictures
- `user-content` (public): User-submitted images/videos

**Storage Limits:** 1 GB free tier

**File Naming Convention:** `{userId}_{timestamp}_{filename}`

**Max File Sizes:**
- Ad creatives: 10 MB (images/GIFs), 50 MB (videos)
- User avatars: 2 MB
- User content: 20 MB

### 5.3 Client-Side Storage

**PWA (Next.js): IndexedDB**

**Implementation:** localforage library (wrapper for IndexedDB)

**Stores:**
- `articles` (30-min cache, 2,000 item limit)
- `bookmarks` (synced with Supabase when online)
- `readHistory` (last 500 articles viewed)
- `preferences` (user settings, theme, language)
- `offlineQueue` (pending actions when offline)
- `categoryCache` (cached articles per category)
- `leaderboard` (top contributors, 1-hour cache)

**Storage Limits:**
- **Chrome/Edge:** ~60% of available disk space (typically 10+ GB)
- **Safari iOS:** 50 MB (cleared when storage is full)
- **Firefox:** 50% of free disk space
- **Recommendation:** Keep under 100 MB (safe across all browsers)

**Code Example:**
```javascript
import localforage from 'localforage'

// Configure stores
const articleStore = localforage.createInstance({
  name: 'web3news',
  storeName: 'articles',
  description: 'Cached articles'
})

const prefStore = localforage.createInstance({
  name: 'web3news',
  storeName: 'preferences'
})

// Cache management
const cacheArticles = async (category, articles) => {
  const cacheKey = `${category}_${Date.now()}`
  await articleStore.setItem(cacheKey, {
    articles,
    cachedAt: Date.now()
  })
}

// Auto-cleanup old cache (keep last 30 days only)
const cleanupOldCache = async () => {
  const keys = await articleStore.keys()
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  
  for (const key of keys) {
    const item = await articleStore.getItem(key)
    if (item.cachedAt < thirtyDaysAgo) {
      await articleStore.removeItem(key) // Delete old cache
    }
  }
}
```

---

**Flutter (Native Apps): Hive**

**Implementation:** Hive (NoSQL database, Flutter's IndexedDB equivalent)

**Stores (Same Logic, Different API):**
```dart
import 'package:hive_flutter/hive_flutter.dart';

// Initialize Hive
await Hive.initFlutter();

// Create boxes (same as IndexedDB stores)
final articlesBox = await Hive.openBox('articles');
final bookmarksBox = await Hive.openBox('bookmarks');
final prefsBox = await Hive.openBox('preferences');

// Cache articles (same 30-min logic)
await articlesBox.put('tech_articles', {
  'articles': articles,
  'cachedAt': DateTime.now().millisecondsSinceEpoch
});

// Read from cache
final cached = articlesBox.get('tech_articles');
final cachedAt = cached['cachedAt'] as int;
final isExpired = DateTime.now().millisecondsSinceEpoch - cachedAt > 30 * 60 * 1000;

if (isExpired) {
  // Fetch fresh articles
} else {
  // Use cached articles
}
```

**Key Difference:**
- **PWA:** Uses IndexedDB (browser API)
- **Flutter:** Uses Hive (native database)
- **Logic:** Identical (30-min cache, same data structure)
- **Migration:** Zero effort (same JSON schema)

**Storage Limits (Flutter):**
- **iOS:** Unlimited (uses device storage)
- **Android:** Unlimited (uses device storage)
- **Recommendation:** Still keep under 100 MB (user courtesy)

---

### 5.4 Rate Limiting (Client-Side)

**Without Upstash, Use Client-Side Rate Limiting:**

```javascript
// lib/utils/ratelimit.ts
const rateLimits = new Map()

export const checkRateLimit = (endpoint, maxRequests, windowMs) => {
  const now = Date.now()
  const key = endpoint
  
  // Get current window
  const limit = rateLimits.get(key) || { count: 0, resetAt: now + windowMs }
  
  // Reset if window expired
  if (now > limit.resetAt) {
    limit.count = 0
    limit.resetAt = now + windowMs
  }
  
  // Check limit
  if (limit.count >= maxRequests) {
    const waitSeconds = Math.ceil((limit.resetAt - now) / 1000)
    throw new Error(`Rate limit exceeded. Try again in ${waitSeconds} seconds.`)
  }
  
  // Increment counter
  limit.count++
  rateLimits.set(key, limit)
  
  return true
}

// Usage: Prevent API abuse
const fetchArticles = async (source) => {
  // Max 10 requests per minute per source
  checkRateLimit(source, 10, 60 * 1000)
  
  const response = await fetch(sourceAPI)
  return response.json()
}
```

**Benefits:**
- ✅ No server needed (pure client-side)
- ✅ Protects API quotas (CoinGecko: 30 calls/min)
- ✅ Better UX (prevents users from spamming refresh)

**For Flutter:**
```dart
// Same rate limiting logic in Dart
class RateLimiter {
  final Map<String, RateLimit> _limits = {};
  
  bool checkLimit(String endpoint, int maxRequests, int windowMs) {
    final now = DateTime.now().millisecondsSinceEpoch;
    final limit = _limits[endpoint] ?? RateLimit(0, now + windowMs);
    
    // Reset if window expired
    if (now > limit.resetAt) {
      limit.count = 0;
      limit.resetAt = now + windowMs;
    }
    
    // Check limit
    if (limit.count >= maxRequests) {
      final waitSeconds = ((limit.resetAt - now) / 1000).ceil();
      throw Exception('Rate limit exceeded. Try again in $waitSeconds seconds.');
    }
    
    limit.count++;
    _limits[endpoint] = limit;
    return true;
  }
}
```

---

## SECTION 6: DEPLOYMENT & CI/CD

### 6.1 Hosting Strategy

**Primary:** GitHub Pages (Static Hosting - Free Forever)

**Architecture:**
- Next.js static export (`output: 'export'`)
- All HTML/CSS/JS pre-rendered at build time
- No server-side rendering (SSR)
- No serverless functions (pure client-side)

### 6.2 GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build Next.js static site
        run: pnpm build
        env:
          NEXT_PUBLIC_REOWN_PROJECT_ID: ${{ secrets.REOWN_PROJECT_ID }}
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.CLERK_PUBLISHABLE_KEY }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_CONTRACT_AD_PAYMENT_ETHEREUM: ${{ secrets.CONTRACT_AD_PAYMENT_ETHEREUM }}
          NEXT_PUBLIC_CONTRACT_AD_PAYMENT_POLYGON: ${{ secrets.CONTRACT_AD_PAYMENT_POLYGON }}
          NEXT_PUBLIC_CONTRACT_AD_PAYMENT_BSC: ${{ secrets.CONTRACT_AD_PAYMENT_BSC }}
          NEXT_PUBLIC_CONTRACT_SUBSCRIPTION_ETHEREUM: ${{ secrets.CONTRACT_SUBSCRIPTION_ETHEREUM }}
          NEXT_PUBLIC_CONTRACT_SUBSCRIPTION_POLYGON: ${{ secrets.CONTRACT_SUBSCRIPTION_POLYGON }}
          NEXT_PUBLIC_CONTRACT_SUBSCRIPTION_BSC: ${{ secrets.CONTRACT_SUBSCRIPTION_BSC }}
          NEXT_PUBLIC_CONTRACT_GOVERNANCE_ETHEREUM: ${{ secrets.CONTRACT_GOVERNANCE_ETHEREUM }}
          NEXT_PUBLIC_CONTRACT_GOVERNANCE_POLYGON: ${{ secrets.CONTRACT_GOVERNANCE_POLYGON }}
          NEXT_PUBLIC_CONTRACT_GOVERNANCE_BSC: ${{ secrets.CONTRACT_GOVERNANCE_BSC }}
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 6.3 Smart Contract Deployment

**Tool:** Hardhat

**Deploy Script:** `scripts/deploy-contracts.js`

```javascript
// Deploy 3 contracts to 6 chains each (18 total deployments)
const chains = [
  { name: 'ethereum', usdtAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
  { name: 'polygon', usdtAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' },
  { name: 'bsc', usdtAddress: '0x55d398326f99059ff775485246999027b3197955' },
  { name: 'arbitrum', usdtAddress: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9' },
  { name: 'optimism', usdtAddress: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58' },
  { name: 'base', usdtAddress: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' }, // Base USDT
]

for (const chain of chains) {
  console.log(`\nDeploying to ${chain.name}...`)
  
  // 1. Deploy AdPaymentContract (auction system)
  const AdPayment = await ethers.getContractFactory("AdPaymentContract")
  const adContract = await AdPayment.deploy(chain.usdtAddress, TREASURY_ADDRESS)
  await adContract.deployed()
  console.log(`  AdPayment: ${adContract.address}`)
  
  // 2. Deploy SubscriptionManager (subscription system)
  const Subscription = await ethers.getContractFactory("SubscriptionManager")
  const subContract = await Subscription.deploy(chain.usdtAddress, TREASURY_ADDRESS)
  await subContract.deployed()
  console.log(`  Subscription: ${subContract.address}`)
  
  // 3. Deploy Governance (voting system)
  const Governance = await ethers.getContractFactory("Governance")
  const govContract = await Governance.deploy()
  await govContract.deployed()
  console.log(`  Governance: ${govContract.address}`)
  
  // Verify on block explorer
  await verifyContract(adContract.address, [chain.usdtAddress, TREASURY_ADDRESS])
  await verifyContract(subContract.address, [chain.usdtAddress, TREASURY_ADDRESS])
  await verifyContract(govContract.address, [])
}

console.log('\n✅ All contracts deployed successfully!')
```

**Contracts to Deploy:**
1. **AdPaymentContract** - Ad auction system (6 chains)
2. **SubscriptionManager** - Subscription payments (6 chains)
3. **Governance** - DAO voting (6 chains)
4. **Total:** 18 contract deployments

**Deployment Steps:**
1. Deploy to testnets first (Sepolia, Mumbai, BSC Testnet)
2. Test all functions (joinAuction, placeBid, finalize)
3. Security audit (Slither, Mythril, manual review)
4. Deploy to mainnets
5. Verify contracts on Etherscan/PolygonScan/BscScan
6. Transfer ownership to Gnosis Safe multi-sig

### 6.4 Environment Variables

**GitHub Secrets:**
```bash
# Reown AppKit
REOWN_PROJECT_ID=xxx

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=xxx
CLERK_SECRET_KEY=xxx

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx (for admin operations)

# Smart Contract Addresses (per chain)
CONTRACT_AD_PAYMENT_ETHEREUM=0x...
CONTRACT_AD_PAYMENT_POLYGON=0x...
CONTRACT_AD_PAYMENT_BSC=0x...
CONTRACT_SUBSCRIPTION_ETHEREUM=0x...
CONTRACT_SUBSCRIPTION_POLYGON=0x...
CONTRACT_SUBSCRIPTION_BSC=0x...
CONTRACT_GOVERNANCE_ETHEREUM=0x...
CONTRACT_GOVERNANCE_POLYGON=0x...
CONTRACT_GOVERNANCE_BSC=0x...

# Platform Treasury (multi-sig addresses per chain)
TREASURY_ETHEREUM=0x...
TREASURY_POLYGON=0x...
TREASURY_BSC=0x...
TREASURY_ARBITRUM=0x...
TREASURY_OPTIMISM=0x...
TREASURY_BASE=0x...

# API Keys (optional, most sources are RSS)
TWITTER_BEARER_TOKEN=xxx
REDDIT_CLIENT_ID=xxx
DUNE_API_KEY=xxx

# OpenAI (optional, for AI recommendations in Phase 2)
OPENAI_API_KEY=xxx
```

### 6.5 Backend Event Listener (Optional for Phase 2)

**Tool:** Node.js script listening to contract events

**Purpose:** Send email/push notifications when auctions open

```javascript
// scripts/event-listener.js
const { ethers } = require('ethers')
const { createClient } = require('@supabase/supabase-js')

const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Listen to ExpiryWarning event
contract.on('ExpiryWarning', async (slotId, expiryTime) => {
  console.log(`Auction opening for slot: ${slotId}`)
  
  // Get all subscribers for this slot
  const { data: subscribers } = await supabase
    .from('slot_subscriptions')
    .select('user_id, users(email)')
    .eq('slot_id', slotId)
  
  // Send notifications
  for (const sub of subscribers) {
    if (sub.notification_email) {
      await sendEmail(sub.users.email, slotId, expiryTime)
    }
    if (sub.notification_push) {
      await sendPushNotification(sub.user_id, slotId)
    }
  }
})
```

**Deployment:** Run on Heroku free tier or Railway (only needs to run during Phase 2+)

---

## SECTION 7: SUCCESS CRITERIA & TIMELINE

### 7.1 Phase 1: MVP (8 Weeks)

**Week 1-2: Foundation**
- ✅ Next.js project setup
- ✅ Reown AppKit integration
- ✅ Supabase & Upstash setup
- ✅ Basic UI (homepage, category pages)

**Week 3-4: Content Aggregation**
- ✅ Client-side fetching from 15 sources
- ✅ Article cards, infinite scroll
- ✅ Caching (IndexedDB + Redis)
- ✅ Search & filter

**Week 5-6: Web3 Features**
- ✅ Smart contract development (AdPayment)
- ✅ Deploy to testnets
- ✅ Auction UI (join, bid, subscribe)
- ✅ Points system (earning, conversion)

**Week 7-8: Testing & Launch**
- ✅ E2E tests (Playwright)
- ✅ PWA setup (service worker, manifest)
- ✅ GitHub Pages deployment
- ✅ Beta launch (100 users)

**MVP Success Metrics:**
- [ ] 15+ content sources aggregating
- [ ] 100 beta users signed up
- [ ] 10 auction participants (testnet)
- [ ] 5,000+ articles cached
- [ ] Lighthouse score > 90
- [ ] PWA installable on iOS/Android

### 7.2 Phase 2: Beta (12 Weeks from Start)

**Week 9-10: Chinese Platforms**
- ✅ Add 抖音, 百度, 今日头条, 微博 sources
- ✅ Multi-language support (EN, 中文)
- ✅ Mobile app (React Native)

**Week 11-12: Mainnet Preparation**
- ✅ Smart contract audit (OpenZeppelin or Trail of Bits)
- ✅ Deploy to mainnets (6 chains)
- ✅ Gnosis Safe treasury setup (3/5 multi-sig)
- ✅ Dune Analytics dashboard

**Week 13-14: Advanced Features**
- ✅ AI-powered recommendations (user feed)
- ✅ Content moderation tools
- ✅ Backend event listener (notifications)
- ✅ Admin dashboard

**Week 15-16: Beta Testing**
- ✅ 1,000 beta users
- ✅ $1,000 ad revenue (testnet simulation)
- ✅ Points economy balancing
- ✅ Performance optimization

**Beta Success Metrics:**
- [ ] 25+ content sources
- [ ] 1,000 active users
- [ ] $1,000 ad revenue simulated
- [ ] 20,000+ articles aggregated
- [ ] 50+ auction participants
- [ ] Points economy healthy (2:1 issue:redeem ratio)

### 7.3 Phase 3: Launch (16 Weeks from Start)

**Week 17: Mainnet Launch**
- ✅ Switch to mainnet contracts
- ✅ Real USDT auction live
- ✅ Marketing campaign (Twitter, Reddit, crypto news)

**Week 18-20: Growth**
- ✅ Partnerships with crypto news outlets
- ✅ Influencer marketing
- ✅ Content creator incentives
- ✅ Referral program boost

**Week 21-22: Optimization**
- ✅ Performance tuning
- ✅ A/B testing (UI, pricing)
- ✅ User feedback implementation
- ✅ DAO governance planning

**Launch Success Metrics:**
- [ ] 10,000 DAU
- [ ] $10,000/month ad revenue (real USDT)
- [ ] 100,000+ articles aggregated
- [ ] 5,000+ PWA installs
- [ ] Press coverage in 5+ crypto news outlets
- [ ] 85%+ user satisfaction (NPS > 40)

### 7.4 Long-Term Vision (6-12 Months)

**Platform Token Launch:**
- Issue governance token (Web3News Token - W3N)
- Staking for premium features
- DAO voting on platform decisions

**Mobile Apps:**
- React Native apps (iOS + Android)
- Push notifications
- Offline reading mode

**Advanced Features:**
- AI content summarization
- Multi-language support (10+ languages)
- Podcast/video content aggregation
- NFT rewards for top contributors

**Target Metrics (Year 1):**
- 50,000 DAU
- $50,000+/month ad revenue
- 500,000+ articles
- Top 100 crypto app (App Store ranking)

---

## SECTION 8: QUESTIONS FOR INIT AGENT

Before starting the project, please clarify:

1. **Project Name:** Preferred name? (Web3News, ChainScoop, CryptoAggr, CryptoFlow, or custom?)

2. **Initial Categories:** Confirm 10 categories:
   - Hottest, Latest, Tech, Crypto, DeFi, NFTs, Finance, Entertainment, Politics, Science?

3. **Content Moderation:** 
   - Manual review by owner initially?
   - AI moderation (OpenAI Moderation API - $0.002 per 1k calls)?
   - Community voting (DAO governance)?

4. **Ad Approval:** 
   - Instant live after auction win?
   - 24-hour manual review for first-time advertisers only?

5. **Treasury Setup:** 
   - Gnosis Safe multi-sig (3/5 signers) - need to identify co-signers?
   - Start with single owner wallet (you) for MVP?

6. **Legal Entity:** 
   - Register LLC/Foundation before launch?
   - Operate as individual for MVP, incorporate later?

7. **Compliance:** 
   - Target jurisdictions: US, EU, Asia, or global?
   - GDPR/CCPA compliance needed? (affects cookie consent, data deletion)

8. **Platform Token:** 
   - Issue governance token (W3N) in Phase 3 (6 months)?
   - Stay USDT-only forever (simpler economics)?

9. **Smart Contract Audit:** 
   - Budget $10,000-15,000 for professional audit (CertiK, Trail of Bits)?
   - Community audit first (free, lower trust)?
   - Launch on testnets indefinitely (safest, no real money risk)?

10. **Backend Services:** 
   - Run Node.js event listener for auction notifications (requires VPS - $5/month)?
   - Keep 100% client-side for MVP (no notifications, manual auction tracking)?

11. **AI Recommendations:**
   - Start with free collaborative filtering (70% accuracy)?
   - Pay $0.08/month for OpenAI (95% accuracy, better UX)?

12. **Subscription Plans:**
   - Launch with Pro ($30 USDT) + Premium ($100 USDT)?
   - Start with Free tier only, add paid tiers in Phase 2?

---

## SECTION 9: TECHNICAL CONSTRAINTS

**Critical Requirements:**
- ✅ No backend servers (pure client-side)
- ✅ GitHub Pages only (free static hosting)
- ✅ Free tier services only for MVP (Supabase 500MB, Upstash 10k cmds/day)
- ✅ Reown AppKit for all Web3 features
- ✅ Smart contracts on 6 chains (Ethereum, Polygon, BSC, Arbitrum, Optimism, Base)

**Performance Targets:**
- First Contentful Paint (FCP): < 1.5s
- Time to Interactive (TTI): < 3.5s
- Largest Contentful Paint (LCP): < 2.5s
- Lighthouse Score: > 95

**Browser Compatibility:**
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions (iOS Safari for PWA)
- Mobile: iOS 14+, Android 10+

**Scalability:**
- Handle 10,000 DAU on free tiers
- 100,000+ articles cached
- Infinite scroll with virtual scrolling (render only visible items)

---

## SECTION 10: PRIORITY AGENT WORKFLOW

Based on project complexity, recommended agent sequence:

1. **Init** → Project setup, directory structure, Git initialization
2. **Product** → Market research (competitors: NewsNow, Artifact, Flipboard), positioning
3. **Plan** → 16-week roadmap, 3-phase milestones, risk register
4. **UX** → User flows (12 flows), wireframes (25 screens), personas (5 types)
5. **Design** → Design system, component library, Figma mockups, dark mode
6. **Data** → Supabase schema, Upstash patterns, IndexedDB structure, Dune queries
7. **Develop** → Frontend (Next.js + Reown) + Smart contracts (Solidity + Hardhat)
8. **DevOps** → GitHub Actions CI/CD, contract deployment scripts, monitoring
9. **Security** → Smart contract audit (Slither, Mythril), OWASP compliance, penetration tests
10. **Compliance** → Terms of Service, Privacy Policy, GDPR/CCPA, Ad Content Policy
11. **Test** → E2E tests (Playwright), contract tests (Hardhat), load tests, PWA tests
12. **Audit** → Quality gate (Lighthouse > 95, Core Web Vitals pass, security checklist)
13. **Deploy** → Mainnet contracts, GitHub Pages launch, DNS setup, monitoring alerts

---

## PROJECT METADATA

**Project Codename:** `web3news-aggregator` or `chainscoop`

**Estimated Development Time:** 16 weeks (4 months) for full launch, 8 weeks for MVP

**Budget:**
- Infrastructure: $0 (all free tiers)
- Smart Contract Audit: $10,000-15,000 (Phase 2, optional)
- Marketing: $5,000 (Phase 3, optional)
- **Total MVP Cost: $0** ✅

**Tech Stack Summary:**

**Frontend:**
- Next.js 14 (App Router, Static Export), TypeScript, Tailwind CSS, shadcn/ui
- React 18, Zustand (state management)

**Authentication (Optimized):**
- Reown AppKit (PRIMARY - social login + smart accounts)
- Clerk (SECONDARY - user management + subscriptions)
- Integration: Reown → auto-create Clerk user → email verification

**Web3:**
- Reown AppKit (smart accounts, on-ramp, multi-chain)
- wagmi + viem (contract interactions)
- ERC-4337 Account Abstraction

**Database & Storage (Optimized):**
- ❌ NO Supabase users table (Clerk metadata instead)
- ✅ Supabase (content only): Articles, comments, likes, messages, bids, votes
- ✅ IndexedDB (client-side cache - PWA/web browsers)
- ✅ Hive (client-side cache - Flutter native apps)
- ✅ LocalStorage (user preferences, theme)

**AI/ML (FREE Options):**
- Collaborative Filtering (Supabase SQL) - MVP
- TensorFlow.js (client-side) - Beta
- OpenAI Embeddings ($0.08/mo) - Production

**Smart Contracts (3 types × 6 chains = 18 deployments):**
- AdPaymentContract (auction system)
- SubscriptionManager (subscription payments)
- Governance (DAO voting)
- Solidity 0.8.24+, Hardhat, OpenZeppelin
- Deployed on: Ethereum, Polygon, BSC, Arbitrum, Optimism, Base

**Content Sources (20+ FREE):**
- Price APIs: CoinGecko, CryptoCompare, CoinCap, Messari
- News RSS: CoinDesk, CoinTelegraph, Decrypt, Bitcoin Magazine, The Block
- Tech APIs: Hacker News, Product Hunt, GitHub, Reddit
- General: Medium, HackerNoon, MarketWatch

**Deployment:**
- GitHub Pages (static hosting - free forever)
- GitHub Actions (CI/CD)
- No serverless functions needed!

**Analytics:**
- Dune Analytics (on-chain metrics)
- Supabase Analytics (content metrics)
- Clerk Analytics (user growth)

**Payments:**
- USDT multi-chain (6 chains)
- Reown on-ramp (MoonPay, Transak, Ramp, Wyre)
- Gnosis Safe (multi-sig treasury)

**License:** MIT (open-source)

**Repository:** To be created by Init Agent

---

**LET'S BUILD THE FUTURE OF DECENTRALIZED NEWS AGGREGATION! 🚀**

---

---

## ARCHITECTURE SUMMARY (OPTIMIZED)

### Key Optimizations Implemented:

**1. Reown-First Authentication** ✅
- Reown handles login (social + smart account creation)
- Users get Web3 wallet immediately (no separate MetaMask needed)
- Clerk handles user management (profiles, subscriptions, admin)

**2. No Users Table in Supabase** ✅
- All user data stored in Clerk metadata (14% database reduction)
- Faster queries (no joins with users table)
- Better performance (Clerk cache < 10ms)
- Admin dashboard for free (Clerk)

**3. Subscription via Smart Contract** ✅
- USDT-only payments (multi-chain)
- Built-in Reown on-ramp (buy USDT with credit card)
- On-chain verification (trustless)
- Clerk metadata updated automatically

**4. Zero-Cost Infrastructure** ✅
| Service | Free Tier Limit | Usage Estimate |
|---------|----------------|----------------|
| GitHub Pages | Unlimited | Static hosting |
| Clerk | 10,000 MAU | User management |
| Reown | Unlimited | Auth + smart accounts |
| Supabase | 500 MB | Content only (50 MB) |
| IndexedDB | Browser-dependent | Client cache (per user) |
| **Total Cost** | **$0** | **MVP ready!** |

**5. Smart Contracts Deployed:**
- AdPaymentContract (6 chains) - Auction system
- SubscriptionManager (6 chains) - Subscriptions
- Governance (6 chains) - DAO voting
- **Total:** 18 contracts across 6 chains

### Data Flow Example:

```
User Subscription Purchase:
  1. User logs in via Reown (Google) → Smart account created
  2. Clerk user auto-created → Metadata: { subscription_tier: "free" }
  3. User clicks "Upgrade to Pro"
  4. Check USDT balance → Insufficient
  5. Open Reown on-ramp → Buy 30 USDT with credit card (2 min)
  6. USDT arrives in smart account
  7. User approves + calls SubscriptionManager.subscribe()
  8. Smart contract emits event → Backend listener catches it
  9. Backend updates Clerk metadata: { subscription_tier: "pro", expiry: "2024-12-31" }
  10. Website shows ⭐ Pro badge (reads from Clerk, not Supabase!)
```

### Performance Metrics:

| Operation | Old (with users table) | New (Clerk metadata) | Improvement |
|-----------|------------------------|----------------------|-------------|
| User profile read | 150ms (Supabase query) | < 10ms (Clerk cache) | **15x faster** |
| Subscription check | 200ms (DB query + join) | < 10ms (Clerk metadata) | **20x faster** |
| Points update | 100ms (DB write) | 50ms (Clerk API) | **2x faster** |
| Database size | 58 MB | 50 MB | **14% reduction** |

### Cost Breakdown (1,000 Users):

| Component | Cost |
|-----------|------|
| Hosting (GitHub Pages) | $0 |
| Authentication (Clerk + Reown) | $0 |
| Database (Supabase) | $0 (under 500 MB) |
| Cache (IndexedDB - client-side) | $0 (browser storage) |
| AI Recommendations | $0 (collaborative filtering) |
| Smart Contracts | $0 (users pay gas) |
| On-Ramp | $0 (users pay 2.9-3.9% fee) |
| **TOTAL MONTHLY COST** | **$0** ✅ |

### Scalability:

- **10,000 MAU**: Still $0 (all within free tiers)
- **100,000 MAU**: $99/month (Clerk Pro plan)
- **1,000,000 MAU**: $999/month (Clerk Enterprise)

---

## COMPLETE FEATURE MATRIX (ALL $0 COST)

| Feature Category | Features | Implementation | Cost |
|------------------|----------|----------------|------|
| **Authentication** | Social login (Google, Email, Twitter, etc.) | Reown AppKit | $0 |
|  | Smart accounts (ERC-4337) | Reown AppKit | $0 |
|  | Email verification | Clerk magic links | $0 |
|  | Session management | Clerk JWT | $0 |
|  | Admin dashboard | Clerk | $0 |
| **Content** | 20+ sources (tech, crypto, news) | Public APIs + RSS | $0 |
|  | Real-time price data | CoinGecko, CryptoCompare | $0 |
|  | Client-side aggregation | React (PWA) / Flutter (native) | $0 |
|  | Local cache (PWA) | IndexedDB (30-min TTL) | $0 |
|  | Local cache (Flutter) | Hive (30-min TTL) | $0 |
| **Social** | Follow users | Supabase | $0 |
|  | Like articles | Supabase | $0 |
|  | Direct messages | Supabase Realtime | $0 |
|  | Notifications | Web Push API | $0 |
| **Monetization** | Ad auctions (tenure-based) | Smart contract | $0 |
|  | Participation fee (1 USDT) | Smart contract | $0 |
|  | Subscription (Pro, Premium) | Smart contract | $0 |
|  | Points earning | Clerk metadata | $0 |
|  | Points → USDT conversion | Off-chain ledger | $0 |
|  | USDT withdrawal | Reown AppKit | $0 |
| **Web3** | Multi-chain USDT (6 chains) | Reown + wagmi | $0 |
|  | On-ramp (buy USDT) | Reown (MoonPay, Transak) | $0 |
|  | Gas sponsorship | Reown dashboard | $0 |
|  | Batched transactions | ERC-4337 | $0 |
| **AI** | Recommendations (collaborative) | Supabase SQL | $0 |
|  | Recommendations (TensorFlow.js) | Client-side ML | $0 |
|  | Recommendations (OpenAI) | Optional upgrade | $0.08/mo |
| **Governance** | DAO proposals | Smart contract | $0 |
|  | Meritocratic voting | Smart contract | $0 |
|  | Voting rewards | Clerk metadata | $0 |
| **Analytics** | On-chain metrics | Dune Analytics | $0 |
|  | Content metrics | Supabase | $0 |
|  | User growth | Clerk | $0 |
| **Deployment** | Static hosting | GitHub Pages | $0 |
|  | CI/CD | GitHub Actions | $0 |
|  | Custom domain | GitHub Pages | $0 |
| **PWA** | Offline support | Service Worker | $0 |
|  | Push notifications | Web Push API | $0 |
|  | Installable | PWA manifest | $0 |
| **TOTAL** |  |  | **$0/month** ✅ |

**Note:** Smart contract deployment costs ~$500-2,000 one-time (gas fees), but this is only required when launching to mainnet (Phase 3). MVP runs on testnets (free).

---

**END OF PROMPT DOCUMENT**

_To trigger the Init Agent, run `/init` in Claude Code and reference this document._

---

## FINAL CHECKLIST BEFORE TRIGGERING /init:

- [ ] Review optimized architecture (Reown PRIMARY, Clerk SECONDARY)
- [ ] Confirm no users table in Supabase (all user data in Clerk)
- [ ] Verify subscription flow (smart contract → Clerk metadata)
- [ ] Check all features are $0 cost (for MVP)
- [ ] Ready to deploy 18 smart contracts (3 types × 6 chains)
- [ ] Understand Reown on-ramp integration (built-in feature)

**When ready, trigger:** `/init` 🚀
