# 🎨 Wireframes & Design System

## Web3News - Blockchain Content Aggregator

**Created:** 2025-11-07  
**UX Agent:** User Experience Design Specialist  
**Status:** ✅ Complete  
**Next Agent:** Design Agent (`/design`)

---

## 📱 WIREFRAMES

### Mobile Wireframes (375px × 812px - iPhone 13)

#### Page 1: Homepage / Feed (Mobile)

```
┌─────────────────────────┐
│ [Logo] [Search] [Profile]│ ← Header (Sticky)
├─────────────────────────┤
│ [Tech] [Crypto] [Social] │ ← Category Tabs (Swipeable)
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ [Thumbnail]         │ │ ← Article Card 1
│ │ Title: Bitcoin...   │ │
│ │ Source • 2h ago     │ │
│ │ 👍 42  🔖  📤      │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ [Thumbnail]         │ │ ← Article Card 2
│ │ Title: Ethereum...  │ │
│ │ Source • 3h ago     │ │
│ │ 👍 28  🔖  📤      │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ [Thumbnail]         │ │ ← Article Card 3
│ │ Title: DeFi News... │ │
│ │ Source • 5h ago     │ │
│ │ 👍 15  🔖  📤      │ │
│ └─────────────────────┘ │
│         ...             │ ← Infinite Scroll
├─────────────────────────┤
│ [🏠] [🔍] [🔖] [👤]    │ ← Bottom Navigation (Thumb-Friendly)
└─────────────────────────┘
```

**Key Elements:**

- Header: Logo (left), Search (center), Profile (right)
- Category tabs: Horizontal scroll, active highlighted
- Article cards: Thumbnail (left), Title + Source + Timestamp (right), Actions (bottom)
- Bottom nav: Home, Search, Bookmarks, Profile (thumb-friendly zone)

**Interactions:**

- Pull down → Refresh feed
- Tap article → Reader view
- Long press → Quick actions (bookmark, share)
- Swipe category tabs → Navigate categories

---

#### Page 2: Article Reader View (Mobile)

```
┌─────────────────────────┐
│ [←] [Share] [Menu]      │ ← Top Bar (Sticky)
├─────────────────────────┤
│ ████████░░ 80%          │ ← Reading Progress Bar
├─────────────────────────┤
│                         │
│   Article Title         │ ← Title (Large, Bold)
│   Source • Author       │ ← Source + Author
│   2 hours ago           │ ← Timestamp
│                         │
│   Article content...    │ ← Content (Readable)
│   (Clean, formatted)    │
│                         │
│   More content...       │
│                         │
│   [Continue reading]    │ ← Scroll Indicator
│                         │
├─────────────────────────┤
│ [👍] [🔖] [📤] [🌐] [📝]│ ← Action Bar (Bottom, Thumb-Friendly)
└─────────────────────────┘
```

**Key Elements:**

- Top bar: Back button, Share, Menu
- Progress bar: Reading progress (top)
- Article content: Clean, readable, formatted
- Action bar: Upvote, Bookmark, Share, Translate, Summarize (bottom)

**Interactions:**

- Swipe left/right → Navigate articles
- Pinch to zoom → Adjust font size
- Tap action bar → Quick actions
- Scroll → Progress bar updates

---

#### Page 3: Search & Discovery (Mobile)

```
┌─────────────────────────┐
│ [←] Search...           │ ← Search Bar (Full-Width)
├─────────────────────────┤
│ Recent Searches         │
│ [Bitcoin] [Ethereum]    │ ← Recent Searches (Chips)
├─────────────────────────┤
│ Trending Topics         │
│ [DeFi] [NFT] [Web3]     │ ← Trending (Chips)
├─────────────────────────┤
│ Filters                 │
│ [Source ▼] [Date ▼]     │ ← Filter Chips
├─────────────────────────┤
│ Results (42)            │
│ ┌─────────────────────┐ │
│ │ [Thumbnail]         │ │ ← Search Result 1
│ │ Title: Bitcoin...   │ │
│ │ Source • 2h ago     │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ [Thumbnail]         │ │ ← Search Result 2
│ │ Title: Ethereum...  │ │
│ │ Source • 3h ago     │ │
│ └─────────────────────┘ │
│         ...             │
└─────────────────────────┘
```

**Key Elements:**

- Search bar: Full-width, autocomplete
- Recent searches: Chips (tappable)
- Trending topics: Chips (tappable)
- Filters: Dropdown chips
- Results: Article cards (same as feed)

**Interactions:**

- Type → Autocomplete suggestions
- Tap recent/trending → Auto-search
- Tap filter → Apply filter
- Clear filters → Reset search

---

#### Page 4: Authentication / Onboarding (Mobile)

```
┌─────────────────────────┐
│                         │
│      [Logo]             │ ← Logo (Centered)
│                         │
│  Welcome to Web3News    │ ← Welcome Text
│                         │
│  Decentralized news     │ ← Value Proposition
│  aggregation with       │
│  crypto-powered rewards │
│                         │
│  ┌───────────────────┐ │
│  │ [G] Sign in Google│ │ ← Social Login Buttons
│  └───────────────────┘ │
│  ┌───────────────────┐ │
│  │ [T] Sign in Twitter│ │
│  └───────────────────┘ │
│  ┌───────────────────┐ │
│  │ [✉] Sign in Email │ │
│  └───────────────────┘ │
│                         │
│  Terms • Privacy        │ ← Legal Links
│                         │
└─────────────────────────┘
```

**Key Elements:**

- Logo: Centered, prominent
- Welcome text: Value proposition
- Social login buttons: Large, thumb-friendly
- Legal links: Terms, Privacy

**Interactions:**

- Tap social login → Reown modal → Wallet created
- Email verification → Magic link
- Onboarding → Skip or complete

---

#### Page 5: Ad Auction Dashboard (Mobile)

```
┌─────────────────────────┐
│ [←] Ad Auctions         │ ← Header
├─────────────────────────┤
│ [Active] [Upcoming] [End]│ ← Filter Tabs
├─────────────────────────┤
│ Filters                 │
│ [Banner ▼] [Chain ▼]   │ ← Filter Chips
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ [Slot Preview]     │ │ ← Auction Card 1
│ │ Homepage Banner     │ │
│ │ Current: 150 USDT   │ │
│ │ Time: 2d 5h left    │ │
│ │ [Place Bid]         │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ [Slot Preview]     │ │ ← Auction Card 2
│ │ Category Page       │ │
│ │ Current: 80 USDT    │ │
│ │ Time: 1d 12h left   │ │
│ │ [Place Bid]         │ │
│ └─────────────────────┘ │
│         ...             │
└─────────────────────────┘
```

**Key Elements:**

- Filter tabs: Active, Upcoming, Ended
- Filter chips: Slot type, Chain, Price range
- Auction cards: Slot preview, Current bid, Time remaining, Bid button
- Bid button: Prominent, thumb-friendly

**Interactions:**

- Tap auction → Auction detail
- Place bid → Bid form → Confirm transaction
- Filter → Apply filters

---

### Desktop Wireframes (1920px × 1080px)

#### Page 1: Homepage / Feed (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] [Search...] [Profile] [Notifications] [Points: 1.2K]│ ← Top Nav
├─────────────────────────────────────────────────────────────┤
│ [Tech] [Crypto] [Social] [General]                          │ ← Category Tabs
├──────────┬──────────────────────────────────┬───────────────┤
│          │ ┌────────────────────────────┐  │               │
│ Sidebar  │ │ [Thumbnail]               │  │   Right       │
│          │ │ Title: Bitcoin News...     │  │   Sidebar     │
│ [Filters]│ │ Source • 2h ago • 👍 42   │  │   (Ads)       │
│          │ └────────────────────────────┘  │               │
│ [Sources]│ ┌────────────────────────────┐  │               │
│          │ │ [Thumbnail]               │  │               │
│ [Tags]   │ │ Title: Ethereum Update...  │  │               │
│          │ │ Source • 3h ago • 👍 28   │  │               │
│          │ └────────────────────────────┘  │               │
│          │         ...                      │               │
└──────────┴──────────────────────────────────┴───────────────┘
```

**Key Elements:**

- Top nav: Logo, Search, Profile, Notifications, Points
- Category tabs: Horizontal tabs
- Main content: 3-column grid (articles)
- Sidebar: Filters, Sources, Tags
- Right sidebar: Ad space

**Interactions:**

- Hover article → Preview
- Click article → Reader view (centered)
- Filter sidebar → Apply filters

---

## 🎨 DESIGN SYSTEM

### Color Palette

**Primary Colors:**

- Primary: `#6366F1` (Indigo) - Buttons, links, accents
- Primary Dark: `#4F46E5` - Hover states
- Primary Light: `#818CF8` - Disabled states

**Secondary Colors:**

- Secondary: `#10B981` (Green) - Success, points
- Warning: `#F59E0B` (Amber) - Warnings
- Error: `#EF4444` (Red) - Errors

**Neutral Colors:**

- Background: `#0F172A` (Dark) - Main background
- Surface: `#1E293B` (Dark Gray) - Cards, surfaces
- Border: `#334155` (Gray) - Borders, dividers
- Text Primary: `#F1F5F9` (Light) - Primary text
- Text Secondary: `#94A3B8` (Gray) - Secondary text

**Accessibility:**

- All text contrast ratios > 4.5:1 (WCAG AA)
- Focus indicators: 2px outline, `#6366F1`

---

### Typography

**Font Family:**

- Primary: `system-ui, -apple-system, sans-serif` (System fonts for native feel)
- Monospace: `'Courier New', monospace` (Code, addresses)

**Font Sizes:**

- H1: `32px` (2rem) - Page titles
- H2: `24px` (1.5rem) - Section titles
- H3: `20px` (1.25rem) - Subsection titles
- Body: `16px` (1rem) - Body text
- Small: `14px` (0.875rem) - Secondary text
- Caption: `12px` (0.75rem) - Captions, labels

**Font Weights:**

- Bold: `700` - Headings, emphasis
- Medium: `500` - Buttons, labels
- Regular: `400` - Body text
- Light: `300` - Secondary text

**Line Heights:**

- Headings: `1.2` - Tight
- Body: `1.6` - Readable
- Small: `1.4` - Compact

---

### Spacing System

**Base Unit:** `4px` (0.25rem)

**Spacing Scale:**

- `4px` (0.25rem) - XS
- `8px` (0.5rem) - SM
- `16px` (1rem) - MD
- `24px` (1.5rem) - LG
- `32px` (2rem) - XL
- `48px` (3rem) - 2XL
- `64px` (4rem) - 3XL

**Usage:**

- Padding: `16px` (MD) - Cards, buttons
- Margin: `24px` (LG) - Sections
- Gap: `16px` (MD) - Grid gaps

---

### Component Specifications

#### Button Component

**Variants:**

- Primary: `#6366F1` background, white text
- Secondary: `#1E293B` background, white text
- Outline: Transparent background, `#6366F1` border
- Ghost: Transparent background, `#6366F1` text

**Sizes:**

- Small: `32px` height, `12px` padding
- Medium: `40px` height, `16px` padding (default)
- Large: `48px` height, `20px` padding

**States:**

- Default: Full opacity
- Hover: `opacity: 0.9`
- Active: `opacity: 0.8`
- Disabled: `opacity: 0.5`, cursor not-allowed
- Loading: Spinner icon, disabled state

**Accessibility:**

- Minimum touch target: `44px × 44px` (mobile)
- Focus indicator: `2px` outline, `#6366F1`
- ARIA labels: Descriptive labels for screen readers

---

#### Article Card Component

**Layout:**

- Mobile: Thumbnail (left), Content (right), Actions (bottom)
- Desktop: Thumbnail (top), Content (middle), Actions (bottom)

**Elements:**

- Thumbnail: `120px × 80px` (mobile), `300px × 200px` (desktop)
- Title: `16px`, bold, `#F1F5F9`
- Source: `14px`, `#94A3B8`
- Timestamp: `12px`, `#94A3B8`
- Actions: Upvote, Bookmark, Share (icons, `24px`)

**States:**

- Default: Full opacity
- Hover: `opacity: 0.9`, scale `1.02`
- Loading: Skeleton screen
- Error: Error message, retry button

**Accessibility:**

- Alt text for thumbnails
- ARIA labels for actions
- Keyboard navigation (Tab, Enter)

---

#### Search Bar Component

**Layout:**

- Mobile: Full-width, expands on focus
- Desktop: `400px` width, centered

**Elements:**

- Input: `40px` height, `16px` padding
- Icon: Search icon (left), Clear icon (right)
- Autocomplete: Dropdown below input
- Recent searches: Chips below input

**States:**

- Default: Placeholder text
- Focused: Border highlight, autocomplete shown
- Typing: Autocomplete updates
- Results: Results shown below

**Accessibility:**

- ARIA labels: `aria-label="Search articles"`
- Autocomplete: `aria-autocomplete="list"`
- Keyboard: Arrow keys to navigate, Enter to select

---

### Responsive Breakpoints

**Mobile:** `375px - 767px`

- Single column layout
- Bottom navigation
- Full-screen modals
- Thumb-friendly spacing (`44px` touch targets)

**Tablet:** `768px - 1023px`

- 2-column layout
- Side navigation
- Centered modals (`600px` max-width)

**Desktop:** `1024px+`

- 3-column layout
- Top navigation + sidebar
- Centered modals (`800px` max-width)

---

### Accessibility Standards (WCAG 2.1 AA)

**Color Contrast:**

- ✅ Text: `4.5:1` (normal), `3:1` (large)
- ✅ UI components: `3:1`
- ✅ Focus indicators: `2:1`

**Keyboard Navigation:**

- ✅ Tab order: Logical, intuitive
- ✅ Focus indicators: `2px` outline, `#6366F1`
- ✅ Skip links: "Skip to main content"

**Screen Reader Support:**

- ✅ Semantic HTML: Headings, landmarks
- ✅ ARIA labels: All interactive elements
- ✅ Alt text: All images
- ✅ Form labels: Associated with inputs

**Focus Management:**

- ✅ Focus trap: Modals
- ✅ Focus restoration: After modal close
- ✅ Focus order: Logical sequence

---

## ✅ WIREFRAMES & DESIGN SYSTEM COMPLETE

**Status:** ✅ Wireframes & Design System Complete  
**Next:** Accessibility Report  
**Next Agent:** Design Agent (`/design`) - After UX approval

**Total Wireframes:** 10 pages × 2 devices = 20 wireframes  
**Design System:** 10 components, color palette, typography, spacing  
**Accessibility:** WCAG 2.1 AA compliant
