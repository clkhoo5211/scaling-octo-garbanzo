# 🚀 Web3News - Blockchain Content Aggregator

**A decentralized, community-driven news aggregation platform with cryptocurrency-based monetization**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Powered by Reown](https://img.shields.io/badge/Powered%20by-Reown-purple)](https://reown.com/)

---

## 🌟 Features

### Content Aggregation
- 📰 **20+ Sources**: Hacker News, Reddit, Product Hunt, CoinDesk, CoinTelegraph, GitHub, Medium, and more
- 💰 **Crypto Price Data**: CoinGecko, CryptoCompare, CoinCap, Messari (all FREE APIs)
- 🔄 **Client-Side**: No backend servers, pure browser-based aggregation
- 💾 **Smart Caching**: IndexedDB with 30-minute TTL (offline support)

### Web3 Integration
- 🔐 **Reown AppKit**: Social login (Google, Twitter, Email) + ERC-4337 smart accounts
- 💎 **Multi-Chain**: Ethereum, Polygon, BSC, Arbitrum, Optimism, Base
- 💳 **Built-in On-Ramp**: Buy USDT with credit card (MoonPay, Transak, Ramp)
- 🎯 **Smart Contracts**: Ad auctions, subscriptions, DAO governance (18 contracts)

### Monetization
- 🎨 **Ad Auctions**: Transparent blockchain auctions (tenure-based leasing)
  - Participation fee: 1 USDT (non-refundable)
  - Minimum bid: 50-200 USDT depending on slot
  - Auto-scheduling: 24 hours before lease expires
- 🎁 **User Rewards**: Earn points for contributions (1,000 points = 1 USDT)
- 💎 **Subscriptions**: Pro ($30 USDT/mo), Premium ($100 USDT/mo)

### Social Features
- 👥 **Follow Users**: Build your network
- ❤️ **Like Articles**: Show appreciation, award points to submitters
- 💬 **Direct Messages**: Real-time chat (Supabase Realtime)
- 🔔 **Notifications**: Web Push API for messages, auction updates

### DAO Governance
- 🗳️ **Meritocratic Voting**: Earn voting power through contributions
- 📊 **6 Categories**: Content moderation, economic policy, features, treasury, ads, partnerships
- 🏆 **Voting Rewards**: Earn points for participation
- 📈 **On-Chain**: Transparent, auditable governance

### Analytics
- 📊 **Dune Analytics**: On-chain metrics (revenue, treasury, governance)
- 📈 **Supabase**: Off-chain metrics (content, engagement, social)
- 👥 **Clerk Dashboard**: User growth, subscriptions, retention

### Platform Support
- 🌐 **Desktop Browsers**: Chrome, Firefox, Safari, Edge
- 📱 **Mobile Browsers**: iOS Safari, Chrome Android
- 📲 **PWA Installable**: iOS, Android, Desktop (no App Store needed!)
- 🚀 **Future**: Flutter native apps (iOS + Android, Phase 4)

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router, Static Export)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Zustand (state management)

**Authentication:**
- Reown AppKit (PRIMARY - social login + smart accounts)
- Clerk (SECONDARY - user management + subscriptions)

**Database:**
- Supabase (PostgreSQL - content ONLY, no users table)
- IndexedDB (client-side cache - 30-min TTL)

**Smart Contracts:**
- Solidity 0.8.24+
- Hardhat (development & deployment)
- OpenZeppelin (security libraries)
- 3 contract types × 6 chains = 18 deployments

**AI:**
- Collaborative Filtering (Supabase SQL - FREE)
- TensorFlow.js (client-side ML - optional)
- OpenAI Embeddings (production - $0.08/mo)

**Deployment:**
- GitHub Pages (static hosting - FREE)
- GitHub Actions (CI/CD - FREE)

**Analytics:**
- Dune Analytics (on-chain)
- Supabase (off-chain)
- Clerk (user metrics)

---

## 📦 Installation

**Prerequisites:**
- Node.js 20+
- pnpm (package manager)
- Git

**Setup:**

```bash
# Clone repository
git clone https://github.com/yourusername/web3news-aggregator.git
cd web3news-aggregator

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
pnpm dev

# Open http://localhost:3000
```

---

## 🔑 Environment Variables

```bash
# Reown AppKit
NEXT_PUBLIC_REOWN_PROJECT_ID=xxx

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=xxx
CLERK_SECRET_KEY=xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# Smart Contract Addresses (per chain, per type)
NEXT_PUBLIC_CONTRACT_AD_PAYMENT_ETHEREUM=0x...
NEXT_PUBLIC_CONTRACT_SUBSCRIPTION_POLYGON=0x...
# ... (18 total contract addresses)

# Treasury Addresses (multi-sig wallets)
TREASURY_ETHEREUM=0x...
TREASURY_POLYGON=0x...
# ... (6 treasury addresses)

# Optional: AI Recommendations (Phase 2)
OPENAI_API_KEY=xxx

# Optional: Content Source APIs
TWITTER_BEARER_TOKEN=xxx
REDDIT_CLIENT_ID=xxx
```

---

## 🚀 Deployment

**GitHub Pages:**

```bash
# Build static site
pnpm build

# Output: out/ directory (static HTML/CSS/JS)

# Deploy via GitHub Actions (automatic on push to main)
git push origin main
```

**Smart Contracts:**

```bash
# Deploy to testnets
cd contracts
npx hardhat run scripts/deploy.js --network polygon-mumbai

# Deploy to mainnets (after audit)
npx hardhat run scripts/deploy.js --network polygon

# Verify contracts
npx hardhat verify --network polygon <CONTRACT_ADDRESS>
```

---

## 📚 Documentation

**Master Specification:** `docs/PROJECT_INIT_PROMPT_WEB3_AGGREGATOR.md` (3,693 lines)

**Key Guides:**
- `docs/TECHNICAL_VERIFICATION.md` - GitHub Pages compatibility
- `docs/CLERK_DASHBOARD_GUIDE.md` - Feature control from dashboard
- `docs/PROMPT_UPDATES_SUMMARY.md` - Architecture optimizations
- `docs/LAUNCH_GUIDE.md` - Deployment walkthrough

**Generated by Agents:**
- `roadmap.md` - 16-week development timeline (Plan Agent)
- `docs/architecture.md` - System architecture (Design Agent)
- `docs/api-specs/` - API documentation (Data Agent)
- `docs/test-results/` - Test reports (Test Agent)
- `docs/security-report.md` - Security audit (Security Agent)
- `docs/audit-report.md` - Quality certification (Audit Agent)

---

## 🎯 Roadmap

**Phase 1 - MVP (8 Weeks):**
- ✅ Content aggregation (15+ sources)
- ✅ Reown authentication + smart accounts
- ✅ Ad auction system (banner ads)
- ✅ Points earning + conversion
- ✅ PWA installable
- ✅ GitHub Pages deployment

**Phase 2 - Beta (12 Weeks):**
- Chinese platforms (抖音, 百度, 今日头条)
- Social features (follow, like, DM)
- DAO governance
- Dune Analytics dashboard
- Multi-language support (EN, 中文)

**Phase 3 - Production (16 Weeks):**
- Mainnet deployment (6 chains)
- Smart contract audit
- Subscription system (Pro + Premium)
- AI recommendations (OpenAI)
- 10,000 DAU, $10,000/month revenue

**Phase 4 - Expansion (6-12 Months):**
- Flutter native apps (iOS + Android)
- Platform governance token (W3N)
- NFT rewards for top contributors
- Video/podcast aggregation

---

## 💰 Economics

**Revenue Streams:**
- Ad auction participation fees (1 USDT per auction)
- Ad auction winning bids (100-200 USDT per slot)
- Subscription fees (30 USDT Pro, 100 USDT Premium)
- Points conversion fees (1%)
- USDT withdrawal fees (1%)

**User Rewards:**
- Earn points for contributions (submit, upvote, comment, share)
- Convert to USDT (1,000 points = 1 USDT)
- Withdraw to any supported chain

**Platform Economics:**
- Target ratio: Inflow 1.5x Outflow (ad revenue > user withdrawals)
- Minimum treasury: 10,000 USDT per chain
- Fee adjustment via DAO governance

---

## 🤝 Contributing

Contributions welcome! Please see `CONTRIBUTING.md` for guidelines.

**Development:**
1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see `LICENSE` file for details

---

## 🔗 Links

- **Live Site**: https://yourusername.github.io (after deployment)
- **Dune Dashboard**: https://dune.com/yourproject/web3news-dashboard (after mainnet)
- **GitHub**: https://github.com/yourusername/web3news-aggregator
- **Documentation**: https://yourusername.github.io/docs
- **Support**: https://discord.gg/yourserver (TBD)

---

## 👥 Team

- **Owner**: [Your Name]
- **Framework**: Multi-Agent SDLC (14 AI agents)
- **Created**: 2025-11-07

---

## 📊 Status

**Current Phase:** Init Complete ✅  
**Next Phase:** Product Research  
**Progress:** 7% (1/14 agents complete)  
**Timeline:** Week 1 of 16  

---

**Built with ❤️ using the Multi-Agent SDLC Framework**

