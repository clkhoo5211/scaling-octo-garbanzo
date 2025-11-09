# Reown → Clerk Email Integration

**Date:** 2025-11-09  
**Question:** After authentication via Reown, does it register in Clerk for this Reown smart account user email?

## 📊 Current Implementation Status

### ✅ What Works

1. **Clerk User Creation**: ✅ YES
   - After Reown authentication, a Clerk user is automatically created
   - Uses Clerk's client-side SDK (`auth.signUp.create()`)
   - Silent creation (no UI shown to user)

2. **Smart Account Storage**: ✅ YES
   - Reown address stored in Clerk `publicMetadata.reown_address`
   - Smart account address stored in `publicMetadata.smart_account_address`
   - Points, subscriptions, referrals stored in Clerk metadata

### ❌ What Doesn't Work

**Email Registration**: ❌ **PARTIALLY**

Currently, the email registered in Clerk is:

```typescript
// From ReownClerkIntegration.tsx (line 86-87)
const storedEmail = localStorage.getItem(`reown_email_${address}`);
const email = storedEmail || `${address.slice(0, 8)}@reown.app`;
```

**Result:**
- **Wallet Connection**: Fake email `0x8dB11c6@reown.app` (generated from address)
- **Email Login**: Checks localStorage but **no code stores it there** → Falls back to fake email
- **Social Login (Google/Twitter/Discord)**: Email **not captured** → Falls back to fake email

## 🔍 Root Cause

**Reown AppKit Client SDK Limitation:**
- Reown's `useAppKitAccount()` hook only provides `address` and `isConnected`
- **Email is NOT exposed** in the client SDK
- Comment in code: `"Reown doesn't expose email in client SDK"`

## 💡 Potential Solutions

### Option 1: Store Email in localStorage (Current Attempt - Incomplete)

**Current Code:**
```typescript
const storedEmail = localStorage.getItem(`reown_email_${address}`);
```

**Problem:** No code stores the email in localStorage when user authenticates.

**Solution:** Add email storage when Reown authentication completes:

```typescript
// After Reown authentication completes
// Need to capture email from Reown modal/auth flow
// Store it: localStorage.setItem(`reown_email_${address}`, userEmail);
```

**Challenge:** Reown AppKit doesn't expose email in client SDK, so we'd need to:
- Intercept Reown's authentication callback
- Extract email from Reown's internal state (if available)
- Or use Reown's server-side API (requires backend)

### Option 2: Use Reown Server-Side API (Requires Backend)

**If Reown provides email via server API:**
- Create a backend endpoint (e.g., Vercel serverless function)
- Call Reown API with authentication token
- Get user email from Reown server response
- Pass email to Clerk user creation

**Limitation:** Requires backend infrastructure (not pure client-side).

### Option 3: Prompt User for Email (User-Friendly)

**After Reown authentication:**
- Show a modal asking user to provide their email
- Store email in localStorage: `localStorage.setItem(`reown_email_${address}`, userEmail)`
- Use this email for Clerk user creation

**Pros:**
- Works for all authentication methods (wallet, social, email)
- User controls their email
- No backend required

**Cons:**
- Extra step for user
- User might skip or provide fake email

### Option 4: Use Wallet Address as Email (Current Fallback)

**Current Implementation:**
```typescript
const email = `${address.slice(0, 8)}@reown.app`;
```

**Pros:**
- Works immediately
- No user interaction needed
- Unique per wallet address

**Cons:**
- Not a real email address
- Can't send emails to user
- Clerk billing/subscriptions might require real email

## 🎯 Recommended Approach

**For Now (Current State):**
- ✅ Clerk user is created with fake email (`0x8dB11c6@reown.app`)
- ✅ User can still use the app (points, subscriptions work)
- ⚠️ Email-based features (password reset, email notifications) won't work

**Future Improvement (Option 3):**
- Add optional email prompt after Reown authentication
- Store email in localStorage
- Update Clerk user email if provided

## 📝 Code Changes Needed

To implement **Option 3** (Prompt User for Email):

1. **Create Email Prompt Component:**
```typescript
// src/components/auth/EmailPrompt.tsx
export function EmailPrompt({ address, onEmailProvided }: Props) {
  const [email, setEmail] = useState('');
  
  const handleSubmit = () => {
    localStorage.setItem(`reown_email_${address}`, email);
    onEmailProvided(email);
  };
  
  return (
    <Modal>
      <h2>Please provide your email</h2>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={handleSubmit}>Continue</button>
    </Modal>
  );
}
```

2. **Update ReownClerkIntegration:**
```typescript
// After Reown connection, check if email exists
const storedEmail = localStorage.getItem(`reown_email_${address}`);
if (!storedEmail) {
  // Show email prompt modal
  // After user provides email, create Clerk user
}
```

## ✅ Current Status Summary

| Feature | Status | Notes |
|---------|--------|-------|
| **Clerk User Creation** | ✅ Working | Automatically creates user after Reown auth |
| **Real Email Registration** | ❌ Not Working | Uses fake email from wallet address |
| **Email from Wallet** | ❌ Not Available | Reown SDK doesn't expose email |
| **Email from Social Login** | ❌ Not Captured | No code to extract email |
| **Email from Email Login** | ❌ Not Stored | Checks localStorage but nothing stores it |
| **Fallback Email** | ✅ Working | Uses `${address.slice(0, 8)}@reown.app` |

## 🚀 Next Steps

1. **Immediate:** Current implementation works for basic functionality (points, subscriptions)
2. **Short-term:** Implement Option 3 (Email Prompt) for users who want email-based features
3. **Long-term:** Investigate Reown server API for email retrieval (if available)

