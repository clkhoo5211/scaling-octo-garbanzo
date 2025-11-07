# Article Preview Modal Feature

## Overview

The Article Preview Modal feature allows users to read articles directly within the application without opening new tabs. Articles are displayed in a beautiful modal overlay with full content extraction, sanitization, and reader controls.

## Key Features

### 1. **Modal Preview Mode**

- Click any article card to open it in a modal overlay
- Read full article content without leaving the feed
- Quick access to "Full Page" view if needed
- Smooth animations and responsive design

### 2. **HTML Sanitization (Security)**

- All article content is sanitized using DOMPurify before rendering
- Prevents XSS (Cross-Site Scripting) attacks
- Allows safe rendering of images, links, and tables
- Configurable sanitization rules for different content types

### 3. **Content Extraction**

- Uses @mozilla/readability for clean content extraction
- Removes ads, navigation, and other distractions
- Preserves article structure and formatting
- Falls back to excerpt if content extraction fails

### 4. **Reader Controls**

- Font size adjustment (12px - 24px)
- Dark mode support
- Reading time estimation
- Link to original source

## Implementation Details

### Components

#### `ArticlePreviewModal`

Located at: `src/components/article/ArticlePreviewModal.tsx`

- Displays article content in a modal overlay
- Handles content fetching and sanitization
- Provides reader controls (font size, etc.)
- Option to open in full-page view

#### `sanitizeHtml` Utility

Located at: `src/lib/utils/sanitizeHtml.ts`

- Sanitizes HTML content using DOMPurify
- Configurable allowlists for tags and attributes
- Specialized function for article content (`sanitizeArticleHtml`)

### Usage

#### Basic Usage (Modal Preview)

```tsx
import { ArticleCard } from "@/components/feed/ArticleCard";

<ArticleCard
  article={article}
  previewMode="modal" // Opens in modal only
/>;
```

#### Both Modal and Full Page

```tsx
<ArticleCard
  article={article}
  previewMode="both" // Default: modal on click, full page via button
/>
```

#### Full Page Only (Original Behavior)

```tsx
<ArticleCard
  article={article}
  previewMode="fullpage" // Opens in new page only
/>
```

### Security Considerations

1. **HTML Sanitization**: All content is sanitized before rendering
2. **Content Security Policy**: Consider adding CSP headers
3. **CORS Proxy**: Uses `api.allorigins.win` for cross-origin requests
4. **Safe Rendering**: Uses `dangerouslySetInnerHTML` only after sanitization

### Best Practices

1. **Always Sanitize**: Never render unsanitized HTML from external sources
2. **Fallback Handling**: Always provide fallback for failed content extraction
3. **User Choice**: Give users option to view original source
4. **Performance**: Content is cached after first fetch
5. **Accessibility**: Modal is keyboard accessible (ESC to close)

## Comparison: Modal vs Full Page vs Iframe

### Modal Preview (Current Implementation) ✅

**Pros:**

- Fast and seamless UX
- No new tab needed
- Full control over styling
- Safe HTML sanitization
- Works with content extraction

**Cons:**

- Requires content extraction
- May not work for all sites (CORS restrictions)

### Full Page View ✅

**Pros:**

- Dedicated reading experience
- More screen space
- Better for long articles
- Full reader controls

**Cons:**

- Navigates away from feed
- Requires page reload

### Iframe (Not Recommended) ❌

**Pros:**

- Simple implementation
- No content extraction needed

**Cons:**

- Security risks (XSS, clickjacking)
- Many sites block iframe embedding (X-Frame-Options)
- Poor mobile experience
- No control over styling
- Performance issues
- SEO problems

## Research Findings

Based on industry best practices:

1. **DOMPurify** is the gold standard for HTML sanitization
2. **@mozilla/readability** is widely used for content extraction
3. **Modal overlays** provide better UX than iframes
4. **Sanitization is critical** when rendering external HTML
5. **Content Security Policy** adds an extra security layer

## Future Enhancements

- [ ] Add user preference for default preview mode
- [ ] Implement offline caching for article content
- [ ] Add "Read Later" functionality
- [ ] Support for article annotations
- [ ] Social sharing directly from modal
- [ ] Print-friendly view
- [ ] Text-to-speech integration
