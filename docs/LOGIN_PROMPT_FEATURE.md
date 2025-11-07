# Login Prompt Feature

## Overview
Users who are not logged in will now see a login prompt when clicking on news articles, instead of being able to view content directly.

## Implementation

### Changes Made

1. **ArticleCard Component** (`src/components/feed/ArticleCard.tsx`)
   - Added `useClerkUser` hook to check authentication status
   - Added `showLoginPrompt` state for login modal
   - Modified `handleCardClick` to check `isSignedIn` before opening preview
   - Added login prompt modal with "Cancel" and "Sign In" buttons
   - Fixed syntax error (missing closing `</div>` tag)

2. **Authentication Check Flow**
   ```
   User clicks article
   ↓
   Check if auth is loaded
   ↓
   If not signed in → Show login prompt modal
   ↓
   If signed in → Open article preview modal
   ```

### User Experience

**Before Login:**
- User clicks article card
- Login prompt modal appears
- Options:
  - Click "Cancel" → Modal closes, stays on feed
  - Click "Sign In" → Redirects to `/auth` page

**After Login:**
- User clicks article card
- Article preview modal opens immediately
- User can read article content inline

### Technical Details

- Uses `useClerkUser` hook for client-side auth check
- Waits for `authLoaded` before checking `isSignedIn`
- Login prompt uses existing `Modal` component
- Navigation uses Next.js `useRouter` for better performance
- Maintains existing preview modal functionality for authenticated users

### Files Modified

- `src/components/feed/ArticleCard.tsx` - Added auth check and login prompt

### Testing

✅ Build successful
✅ Syntax errors fixed
✅ Login prompt appears for unauthenticated users
✅ Authenticated users can view articles normally
✅ Navigation works correctly

