# Reown AppKit Features Configuration

## Issue
The AppKit modal was not showing all enabled features (email/social logins, onramp, swaps, activity, etc.) even though they were enabled in the Reown dashboard.

## Solution

### 1. Updated Features Configuration
Added all features to the `features` object in `src/lib/config/reown.ts`:

```typescript
features: {
  // Analytics & Tracking
  analytics: true,
  // Authentication Options - Email & Social Logins
  email: true,
  socials: ["google", "twitter", "discord", "github", "apple"],
  emailShowWallets: true,
  // Payment Features
  onramp: true,
  swaps: true,
  // Activity & History
  activity: true,
  // Event Tracking
  events: true,
  // Reown Authentic (verification)
  authentic: true,
}
```

### 2. Updated WalletConnect Component
Changed the `open()` call to explicitly specify the view:

```typescript
onClick={() => open({ view: "Connect" })}
```

This ensures the Connect view is shown, which should display email and social login options.

## How Email & Social Logins Work

When users click "Connect Wallet":
1. The AppKit modal opens with the Connect view
2. Users see options for:
   - **Email**: Enter email, receive OTP, create wallet
   - **Social Logins**: Google, Twitter/X, Discord, GitHub, Apple
   - **Wallet Connect**: QR code for mobile wallets
   - **Browser Wallets**: MetaMask, Coinbase Wallet, etc.

## Features Available in Modal

Once connected, users can access:
- **Account View**: View wallet address, balance, transactions
- **Onramp**: Buy crypto with fiat (if enabled)
- **Swaps**: Swap tokens (if enabled)
- **Activity**: View transaction history (if enabled)

## Verification

To verify features are working:
1. Open browser console
2. Click "Connect Wallet"
3. Check if email/social options appear in modal
4. If not, verify:
   - `NEXT_PUBLIC_REOWN_PROJECT_ID` is set correctly
   - Features are enabled in Reown dashboard
   - AppKit version is 1.7.7+ (currently 1.8.13 ✅)

## Notes

- Features must be enabled in both:
  1. Reown Dashboard (https://dashboard.reown.com)
  2. Code configuration (`features` object)
- Email and social logins create non-custodial wallets automatically
- All features require a valid Reown Project ID

