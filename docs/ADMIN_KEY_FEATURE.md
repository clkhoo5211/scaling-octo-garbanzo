# Admin Key Feature (Development Only)

## Overview

The admin key feature allows developers to bypass the login requirement during development by entering a temporary admin key (`123456`). This feature is **disabled by default in production** and can be easily toggled.

## How to Use

1. Click "Show More Articles" button when not logged in
2. In the login modal, click "Show Admin Key (Dev Only)"
3. Enter the admin key: `123456`
4. Click "Use Admin Key"
5. You will be logged in as a mock admin user and can see all articles

## How to Disable

### Option 1: Environment Variable (Recommended)

Add to your `.env.local` file:

```bash
VITE_ADMIN_KEY_ENABLED=false
```

**Note**: Vite uses `VITE_` prefix (not `VITE_PUBLIC_` or `NEXT_PUBLIC_`)

### Option 2: Code Change

In `src/components/feed/ShowMoreButton.tsx`, change:

```typescript
const ADMIN_KEY_ENABLED = import.meta.env.VITE_ADMIN_KEY_ENABLED !== "false";
```

To:

```typescript
const ADMIN_KEY_ENABLED = false; // Disabled
```

## Security Notes

⚠️ **Important**: 
- This feature is for **development only**
- The admin key (`123456`) is hardcoded and should **never** be used in production
- Always disable this feature before deploying to production
- The mock user created has ID `admin-dev-user` and email `admin@dev.local`
- This is stored in localStorage and will persist until cleared

## Implementation Details

- **Location**: `src/components/feed/ShowMoreButton.tsx`
- **Hook**: `src/lib/hooks/useClerkUser.ts` (provides `setMockUser` function)
- **Storage**: localStorage key `admin_dev_user`
- **Admin Key**: `123456` (hardcoded, change if needed)

## Changing the Admin Key

To change the admin key, edit `src/components/feed/ShowMoreButton.tsx`:

```typescript
const ADMIN_KEY = "your-new-key-here";
```

## Clearing Mock Login

To clear the mock login session:

1. Open browser DevTools (F12)
2. Go to Application/Storage → Local Storage
3. Delete the `admin_dev_user` key
4. Refresh the page

Or programmatically:

```javascript
localStorage.removeItem("admin_dev_user");
location.reload();
```

