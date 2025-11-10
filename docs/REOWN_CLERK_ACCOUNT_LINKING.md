# Reown ↔ Clerk Account Linking Strategy

**Date:** 2025-01-11  
**Problem:** When a user logs in with Reown, how do we identify which Clerk user they belong to?

## 🔍 Research Findings

### Clerk SDK Limitations

**Client-Side (`@clerk/clerk-react`):**
- ❌ **NO** method to search/find users by metadata
- ❌ **NO** `findUserByMetadata()` or `searchUsers()` method
- ✅ Can only access current signed-in user via `useUser()`
- ✅ Can update current user's metadata via `user.update()`

**Backend API (Secret Key Required):**
- ✅ Can list users: `GET /v1/users?limit=100`
- ✅ Can filter users (but NOT by metadata in query params)
- ✅ Can search users by email/username: `GET /v1/users?query=email@example.com`
- ❌ **NO** direct metadata filtering in API query params
- ⚠️ Would need to fetch all users and filter client-side (inefficient)

### Reown SDK Capabilities

**`useAppKitAccount()` Hook Returns:**
```typescript
{
  address: string;        // ✅ Smart account address (ERC-4337)
  isConnected: boolean;   // ✅ Connection status
  // ❌ Email NOT exposed in client SDK
  // ❌ User ID NOT exposed
  // ❌ Account details NOT exposed
}
```

**Reown Account Information:**
- Smart Account Address = Primary identifier (ERC-4337)
- Email available only during auth flow (not persisted in SDK)
- Social login providers (Google, Twitter, Discord) don't expose email client-side

## 💡 Solution Architecture

### Option 1: localStorage Mapping (Recommended for Static Sites)

**How It Works:**
1. When Clerk user is created → Store mapping: `clerk_user_id_${reownAddress}` = `clerkUserId`
2. When Reown connects → Check localStorage for existing mapping
3. If found → Try to load Clerk user by ID
4. If not found → Create new Clerk user and store mapping

**Pros:**
- ✅ 100% client-side (no server required)
- ✅ Works with static export (GitHub Pages)
- ✅ Fast lookup (localStorage)
- ✅ Persists across sessions

**Cons:**
- ⚠️ Lost if user clears browser data
- ⚠️ Not synced across devices
- ⚠️ Requires fallback if mapping lost

**Implementation:**
```typescript
// Store mapping when Clerk user created
localStorage.setItem(`clerk_user_id_${reownAddress}`, clerkUserId);

// Retrieve mapping when Reown connects
const clerkUserId = localStorage.getItem(`clerk_user_id_${reownAddress}`);
if (clerkUserId) {
  // Try to load Clerk user
  // If fails, create new user
}
```

### Option 2: Email-Based Linking (If Email Available)

**How It Works:**
1. Capture email during Reown auth flow
2. Store email in Clerk user's `publicMetadata.reown_email`
3. When Reown connects → Search Clerk users by email
4. Match found → Link accounts

**Pros:**
- ✅ More reliable than localStorage
- ✅ Works across devices (if same email)
- ✅ Can use Clerk's email search API

**Cons:**
- ❌ Requires backend API (can't search client-side)
- ❌ Email not always available from Reown SDK
- ❌ Multiple Reown accounts with same email = conflict

### Option 3: Backend API Search (Requires Server)

**How It Works:**
1. Create API route: `/api/find-clerk-user-by-reown`
2. Backend fetches all Clerk users
3. Filters by `publicMetadata.reown_address === reownAddress`
4. Returns matching Clerk user ID

**Pros:**
- ✅ Most reliable
- ✅ Works across devices
- ✅ Can handle edge cases

**Cons:**
- ❌ Requires server/API route
- ❌ Not suitable for static export
- ❌ Slower (API call)

## 🎯 Recommended Implementation: Hybrid Approach

**Strategy:**
1. **Primary:** localStorage mapping (fast, client-side)
2. **Fallback:** Check current Clerk session (if user already signed in)
3. **Last Resort:** Create new Clerk user if no match found

**Flow:**
```
Reown Connects
    ↓
Check localStorage: clerk_user_id_${address}
    ↓
Found? → Try to load Clerk user
    ↓
Success? → Sync metadata, done ✅
    ↓
Failed/Not Found? → Check current Clerk session
    ↓
Signed in? → Check if metadata.reown_address matches
    ↓
Match? → Update metadata, store mapping, done ✅
    ↓
No Match? → Create new Clerk user
    ↓
Store mapping: clerk_user_id_${address} = newUserId
    ↓
Done ✅
```

## 📋 Implementation Plan

### Step 1: Create Account Linking Service

```typescript
// src/lib/services/accountLinkingService.ts

interface AccountLink {
  reownAddress: string;
  clerkUserId: string;
  createdAt: number;
}

const STORAGE_KEY_PREFIX = 'clerk_user_id_';

export function storeAccountLink(reownAddress: string, clerkUserId: string): void {
  if (typeof window === 'undefined') return;
  
  const key = `${STORAGE_KEY_PREFIX}${reownAddress.toLowerCase()}`;
  localStorage.setItem(key, clerkUserId);
  
  // Also store reverse mapping for cleanup
  const linkData: AccountLink = {
    reownAddress: reownAddress.toLowerCase(),
    clerkUserId,
    createdAt: Date.now(),
  };
  localStorage.setItem(`account_link_${clerkUserId}`, JSON.stringify(linkData));
}

export function getClerkUserIdByReownAddress(reownAddress: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const key = `${STORAGE_KEY_PREFIX}${reownAddress.toLowerCase()}`;
  return localStorage.getItem(key);
}

export function clearAccountLink(reownAddress: string): void {
  if (typeof window === 'undefined') return;
  
  const key = `${STORAGE_KEY_PREFIX}${reownAddress.toLowerCase()}`;
  const clerkUserId = localStorage.getItem(key);
  
  localStorage.removeItem(key);
  if (clerkUserId) {
    localStorage.removeItem(`account_link_${clerkUserId}`);
  }
}
```

### Step 2: Update ReownClerkIntegration Component

```typescript
// Enhanced account linking logic

useEffect(() => {
  if (!clerkLoaded || !isConnected || !address) return;

  const normalizedAddress = address.toLowerCase();

  // Case 1: Clerk user already signed in
  if (clerkUser && auth.isSignedIn) {
    const storedReownAddress = clerkUser.publicMetadata?.reown_address as string;
    
    // Check if Reown address matches
    if (storedReownAddress?.toLowerCase() === normalizedAddress) {
      // Already linked ✅
      storeAccountLink(normalizedAddress, clerkUser.id);
      return;
    }
    
    // Address mismatch - update metadata
    clerkUser.update({
      publicMetadata: {
        ...clerkUser.publicMetadata,
        reown_address: normalizedAddress,
        smart_account_address: normalizedAddress,
      },
    }).then(() => {
      storeAccountLink(normalizedAddress, clerkUser.id);
    });
    return;
  }

  // Case 2: Check localStorage for existing link
  const storedClerkUserId = getClerkUserIdByReownAddress(normalizedAddress);
  
  if (storedClerkUserId) {
    // Try to sign in with stored Clerk user ID
    // Note: Clerk SDK doesn't support signing in by ID client-side
    // So we'll need to create new user if stored ID doesn't match current session
    // This is a limitation - we'll handle it in Case 3
  }

  // Case 3: No Clerk user found - create new one
  if (!clerkUser && !auth.isSignedIn && !hasAttemptedCreation) {
    // Existing creation logic...
    // After creation, store the link:
    // storeAccountLink(normalizedAddress, newClerkUserId);
  }
}, [address, isConnected, clerkUser, clerkLoaded, auth.isSignedIn]);
```

### Step 3: Handle Edge Cases

**Edge Case 1: User clears localStorage**
- **Solution:** Check Clerk session first, then create new user if needed
- **Impact:** User gets new Clerk account (data loss, but app still works)

**Edge Case 2: Multiple Reown addresses → Same Clerk user**
- **Solution:** Store array of Reown addresses in Clerk metadata
- **Implementation:**
```typescript
const reownAddresses = clerkUser.publicMetadata?.reown_addresses as string[] || [];
if (!reownAddresses.includes(normalizedAddress)) {
  clerkUser.update({
    publicMetadata: {
      ...clerkUser.publicMetadata,
      reown_addresses: [...reownAddresses, normalizedAddress],
      reown_address: normalizedAddress, // Primary address
    },
  });
}
```

**Edge Case 3: Same Reown address → Multiple Clerk users**
- **Solution:** Latest Clerk user wins, update metadata
- **Prevention:** Check localStorage before creating new user

## 🔐 Security Considerations

1. **localStorage Security:**
   - ✅ Only stores Clerk user ID (not sensitive)
   - ✅ Reown address is public (wallet address)
   - ⚠️ Can be manipulated by user (but harmless)

2. **Metadata Validation:**
   - Always verify `reown_address` matches current Reown connection
   - Update metadata if address changes (user switched wallets)

3. **Account Takeover Prevention:**
   - Require email verification for sensitive operations
   - Use Clerk's session management for authentication
   - Don't trust localStorage alone for critical operations

## 📊 Verification Methods

### Method 1: Check Account Link (Client-Side)
```typescript
const clerkUserId = getClerkUserIdByReownAddress(reownAddress);
if (clerkUserId) {
  console.log(`✅ Account linked: ${reownAddress} → Clerk ${clerkUserId}`);
} else {
  console.log(`❌ No account link found for ${reownAddress}`);
}
```

### Method 2: Verify via Clerk Dashboard
1. Go to Clerk Dashboard → Users
2. Filter by metadata: `publicMetadata.reown_address = "0x..."`
3. Verify user exists and metadata is correct

### Method 3: Backend Script (If Available)
```javascript
// List all users and check Reown address mapping
const users = await clerkAPIRequest('/users?limit=100');
users.data.forEach(user => {
  const reownAddress = user.public_metadata?.reown_address;
  if (reownAddress) {
    console.log(`User ${user.id}: ${reownAddress}`);
  }
});
```

## ✅ Implementation Checklist

- [ ] Create `accountLinkingService.ts` with storage functions
- [ ] Update `ReownClerkIntegration.tsx` to use account linking
- [ ] Store account link when Clerk user is created
- [ ] Check account link when Reown connects
- [ ] Handle edge cases (cleared localStorage, multiple addresses)
- [ ] Add verification logging for debugging
- [ ] Test account linking flow end-to-end
- [ ] Document account linking in user flow

## 🚀 Next Steps

1. **Immediate:** Implement localStorage-based account linking
2. **Future:** Consider backend API if static export becomes limiting
3. **Enhancement:** Add email-based linking if Reown exposes email
4. **Monitoring:** Track account linking success rate

---

**Conclusion:** For a static site, localStorage-based account linking is the most practical solution. It provides reliable account matching while remaining 100% client-side and compatible with static export deployments.

