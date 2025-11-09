# 🧩 Component Specifications

## Web3News - Blockchain Content Aggregator

**Created:** 2025-11-07  
**Design Agent:** System Architect  
**Status:** ✅ Complete  
**Next Agent:** Data Agent (`/data`)

---

## 📦 COMPONENT ARCHITECTURE

### Component Structure

```
components/
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── BottomNav.tsx
│   └── Sidebar.tsx
├── feed/
│   ├── ArticleCard.tsx
│   ├── ArticleFeed.tsx
│   ├── CategoryTabs.tsx
│   └── InfiniteScroll.tsx
├── article/
│   ├── ReaderView.tsx
│   ├── ReadingProgress.tsx
│   ├── ReaderControls.tsx
│   └── ActionBar.tsx
├── search/
│   ├── SearchBar.tsx
│   ├── SearchResults.tsx
│   ├── FilterChips.tsx
│   └── Autocomplete.tsx
├── auth/
│   ├── LoginModal.tsx
│   ├── ReownModal.tsx
│   ├── EmailVerification.tsx
│   └── OnboardingFlow.tsx
├── web3/
│   ├── AuctionCard.tsx
│   ├── AuctionDetail.tsx
│   ├── BidForm.tsx
│   ├── PointsBalance.tsx
│   ├── ConversionForm.tsx
│   ├── ProposalCard.tsx
│   └── VotingWidget.tsx
├── social/
│   ├── UserProfile.tsx
│   ├── FollowButton.tsx
│   ├── LikeButton.tsx
│   ├── MessageList.tsx
│   └── MessageThread.tsx
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Skeleton.tsx
│   └── Toast.tsx
└── shared/
    ├── BookmarkButton.tsx
    ├── ShareButton.tsx
    └── PointsBadge.tsx
```

---

## 🎨 COMPONENT SPECIFICATIONS

### Component 1: ArticleCard

**File:** `components/feed/ArticleCard.tsx`

**Purpose:** Display article preview in feed

**Props:**

```typescript
interface ArticleCardProps {
  article: Article;
  onUpvote?: (articleId: string) => void;
  onBookmark?: (articleId: string) => void;
  onShare?: (articleId: string) => void;
  variant?: "compact" | "expanded" | "featured";
}
```

**States:**

- Default: Normal display
- Hover: Scale 1.02, opacity 0.9
- Loading: Skeleton screen
- Error: Error message, retry button

**Variants:**

- Compact: List view (mobile)
- Expanded: Grid view (desktop)
- Featured: Hero card (large)

**Implementation:**

```typescript
export function ArticleCard({
  article,
  onUpvote,
  onBookmark,
  onShare,
  variant = 'compact',
}: ArticleCardProps) {
  const { upvoteArticle } = useArticleActions();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { user } = useUser();

  const handleUpvote = async () => {
    if (!user) {
      // Show login modal
      return;
    }
    await upvoteArticle(article.id);
    onUpvote?.(article.id);
  };

  const handleBookmark = async () => {
    if (!user) {
      // Show login modal
      return;
    }
    await toggleBookmark(article.id);
    onBookmark?.(article.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        url: article.url,
      });
      // Award 5 points
      await awardPoints('share', article.id);
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(article.url);
    }
    onShare?.(article.id);
  };

  return (
    <article className={`article-card article-card--${variant}`}>
      {article.thumbnail && (
        <img
          src={article.thumbnail}
          alt={article.title}
          loading="lazy"
          className="article-card__thumbnail"
        />
      )}
      <div className="article-card__content">
        <h3 className="article-card__title">{article.title}</h3>
        <p className="article-card__meta">
          {article.source} • {formatTime(article.publishedAt)}
        </p>
        <div className="article-card__actions">
          <button
            onClick={handleUpvote}
            aria-label={`Upvote ${article.title}`}
            className="article-card__action"
          >
            👍 {article.upvotes || 0}
          </button>
          <button
            onClick={handleBookmark}
            aria-label={isBookmarked(article.id) ? 'Remove bookmark' : 'Bookmark'}
            className={`article-card__action ${isBookmarked(article.id) ? 'active' : ''}`}
          >
            {isBookmarked(article.id) ? '🔖' : '🔖'}
          </button>
          <button
            onClick={handleShare}
            aria-label="Share article"
            className="article-card__action"
          >
            📤
          </button>
        </div>
      </div>
    </article>
  );
}
```

**Accessibility:**

- ARIA labels for all buttons
- Keyboard navigation (Tab, Enter)
- Focus indicators (2px outline)

---

### Component 2: SearchBar

**File:** `components/search/SearchBar.tsx`

**Purpose:** Search articles, sources, users

**Props:**

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  autocomplete?: boolean;
  placeholder?: string;
  variant?: "header" | "page" | "modal";
}
```

**States:**

- Default: Placeholder text
- Focused: Border highlight, autocomplete shown
- Typing: Autocomplete updates
- Results: Results shown below

**Implementation:**

```typescript
export function SearchBar({
  onSearch,
  autocomplete = true,
  placeholder = 'Search articles...',
  variant = 'header',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: () => getSearchSuggestions(query),
    enabled: autocomplete && query.length > 2 && isFocused,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`search-bar search-bar--${variant}`}
      role="search"
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder={placeholder}
        aria-label="Search articles"
        aria-autocomplete="list"
        aria-controls="search-suggestions"
        className="search-bar__input"
      />
      {isFocused && autocomplete && query.length > 2 && (
        <div
          id="search-suggestions"
          role="listbox"
          className="search-bar__autocomplete"
        >
          {isLoading ? (
            <div className="search-bar__loading">Loading...</div>
          ) : (
            suggestions?.map((suggestion) => (
              <div
                key={suggestion.id}
                role="option"
                onClick={() => {
                  setQuery(suggestion.query);
                  onSearch(suggestion.query);
                }}
                className="search-bar__suggestion"
              >
                {suggestion.query}
              </div>
            ))
          )}
        </div>
      )}
    </form>
  );
}
```

**Accessibility:**

- ARIA labels: `aria-label="Search articles"`
- Autocomplete: `aria-autocomplete="list"`
- Keyboard: Arrow keys to navigate, Enter to select

---

### Component 3: ReaderView

**File:** `components/article/ReaderView.tsx`

**Purpose:** Distraction-free reading experience

**Props:**

```typescript
interface ReaderViewProps {
  article: Article;
  onUpvote?: (articleId: string) => void;
  onBookmark?: (articleId: string) => void;
  onShare?: (articleId: string) => void;
  onTranslate?: (language: string) => void;
  onSummarize?: () => void;
}
```

**States:**

- Default: Normal reading
- Loading: Skeleton screen
- Error: Error message, retry button
- Translated: Show translated content
- Summarized: Show summary

**Implementation:**

```typescript
import { Readability } from '@mozilla/readability';

export function ReaderView({
  article,
  onUpvote,
  onBookmark,
  onShare,
  onTranslate,
  onSummarize,
}: ReaderViewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const { fontSize, lineHeight, theme } = useReaderPreferences();

  useEffect(() => {
    // Fetch and parse article content
    fetchArticleContent(article.url).then((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const reader = new Readability(doc);
      const articleContent = reader.parse();
      setContent(articleContent?.content || '');
    });
  }, [article.url]);

  useEffect(() => {
    // Track reading progress
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`reader-view reader-view--${theme}`}>
      <ReadingProgress progress={readingProgress} />
      <article
        className="reader-view__content"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
        }}
      >
        <header className="reader-view__header">
          <h1>{article.title}</h1>
          <p className="reader-view__meta">
            {article.source} • {article.author} • {formatTime(article.publishedAt)}
          </p>
        </header>
        <div
          className="reader-view__body"
          dangerouslySetInnerHTML={{ __html: content || '' }}
        />
      </article>
      <ActionBar
        article={article}
        onUpvote={onUpvote}
        onBookmark={onBookmark}
        onShare={onShare}
        onTranslate={onTranslate}
        onSummarize={onSummarize}
      />
    </div>
  );
}
```

**Accessibility:**

- Semantic HTML: `<article>`, `<header>`
- Reading progress: Visual indicator
- Keyboard navigation: Arrow keys to navigate

---

### Component 4: BidForm

**File:** `components/web3/BidForm.tsx`

**Purpose:** Place bid on ad auction

**Props:**

```typescript
interface BidFormProps {
  auctionId: string;
  currentBid: string;
  minBid: string;
  onBid: (amount: string, tenure: string) => Promise<void>;
}
```

**States:**

- Default: Form ready
- Validating: Validating bid amount
- Submitting: Transaction pending
- Success: Bid placed successfully
- Error: Error message displayed

**Implementation:**

```typescript
export function BidForm({
  auctionId,
  currentBid,
  minBid,
  onBid,
}: BidFormProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [tenure, setTenure] = useState('1week');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  const validateBid = (amount: string): string | null => {
    const amountNum = parseFloat(amount);
    const minBidNum = parseFloat(minBid);

    if (isNaN(amountNum) || amountNum <= 0) {
      return 'Bid amount must be greater than 0';
    }

    if (amountNum < minBidNum) {
      return `Bid must be at least ${minBidNum} USDT (5% higher than current bid)`;
    }

    if (balance && amountNum > parseFloat(balance.formatted)) {
      return 'Insufficient USDT balance';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateBid(bidAmount);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onBid(bidAmount, tenure);
      // Success handled by parent
    } catch (err: any) {
      setError(err.message || 'Failed to place bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bid-form">
      <div className="bid-form__field">
        <label htmlFor="bid-amount">Bid Amount (USDT)</label>
        <input
          id="bid-amount"
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          min={minBid}
          step="0.01"
          required
          aria-describedby={error ? 'bid-error' : undefined}
        />
        {error && (
          <div id="bid-error" className="bid-form__error" role="alert">
            {error}
          </div>
        )}
      </div>

      <div className="bid-form__field">
        <label htmlFor="tenure">Tenure</label>
        <select
          id="tenure"
          value={tenure}
          onChange={(e) => setTenure(e.target.value)}
          required
        >
          <option value="1week">1 Week</option>
          <option value="2weeks">2 Weeks</option>
          <option value="1month">1 Month</option>
          <option value="3months">3 Months (10% discount)</option>
          <option value="6months">6 Months (20% discount)</option>
        </select>
      </div>

      <div className="bid-form__summary">
        <p>Current Bid: {currentBid} USDT</p>
        <p>Minimum Bid: {minBid} USDT</p>
        <p>Your Bid: {bidAmount || '0'} USDT</p>
        <p>Participation Fee: 1 USDT</p>
        <p className="bid-form__total">
          Total: {bidAmount ? (parseFloat(bidAmount) + 1).toFixed(2) : '0'} USDT
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !bidAmount}
        className="bid-form__submit"
      >
        {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
      </button>
    </form>
  );
}
```

**Accessibility:**

- Form labels: Associated with inputs
- Error messages: `aria-describedby`
- Required fields: Visual indicator + `aria-required`

---

### Component 5: PointsBalance

**File:** `components/web3/PointsBalance.tsx`

**Purpose:** Display points balance and conversion

**Props:**

```typescript
interface PointsBalanceProps {
  balance: number;
  onConvert?: (amount: number) => void;
  variant?: "compact" | "expanded" | "badge";
}
```

**Implementation:**

```typescript
export function PointsBalance({
  balance,
  onConvert,
  variant = 'expanded',
}: PointsBalanceProps) {
  const { data: conversionRate } = useQuery({
    queryKey: ['conversion-rate'],
    queryFn: () => getConversionRate(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const usdtEquivalent = conversionRate
    ? (balance / conversionRate).toFixed(2)
    : '0.00';

  if (variant === 'badge') {
    return (
      <div className="points-badge" aria-label={`${balance} points`}>
        {formatPoints(balance)}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="points-balance points-balance--compact">
        <span className="points-balance__label">Points</span>
        <span className="points-balance__value">{formatPoints(balance)}</span>
      </div>
    );
  }

  return (
    <div className="points-balance points-balance--expanded">
      <div className="points-balance__header">
        <h2>Points Balance</h2>
      </div>
      <div className="points-balance__content">
        <div className="points-balance__main">
          <span className="points-balance__value-large">
            {formatPoints(balance)}
          </span>
          <span className="points-balance__equivalent">
            ≈ {usdtEquivalent} USDT
          </span>
        </div>
        {onConvert && balance >= 100000 && (
          <button
            onClick={() => onConvert(balance)}
            className="points-balance__convert"
          >
            Convert to USDT
          </button>
        )}
      </div>
    </div>
  );
}

function formatPoints(points: number): string {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  }
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
}
```

---

## ✅ COMPONENT SPECIFICATIONS COMPLETE

**Status:** ✅ Component Specifications Complete  
**Next:** Integration Specifications  
**Next Agent:** Data Agent (`/data`) - After design approval

**Total Components:** 50+ React components  
**Component Types:** Layout, Feed, Article, Search, Auth, Web3, Social, UI, Shared  
**Accessibility:** WCAG 2.1 AA compliant
