# Clerk Billing Integration Guide

**Date:** 2025-11-09  
**Status:** ✅ **Implementation Complete** - Ready to enable Clerk Billing

## ✅ **What's Been Implemented**

### **1. SubscriptionPage.tsx**
- ✅ Integrated Clerk's `<PricingTable />` component
- ✅ Falls back to custom implementation if billing not enabled
- ✅ Controlled by `VITE_CLERK_BILLING_ENABLED` environment variable

### **2. ProfilePage.tsx**
- ✅ Integrated Clerk's `<UserProfile />` component (includes billing tab)
- ✅ Keeps custom stats section (points, submissions, upvotes, streak)
- ✅ Falls back to custom implementation if billing not enabled
- ✅ Controlled by `VITE_CLERK_BILLING_ENABLED` environment variable

### **3. Configuration**
- ✅ Created `src/lib/config/clerkBilling.ts` for centralized control
- ✅ Supports environment variable: `VITE_CLERK_BILLING_ENABLED=true`

## 📋 **How to Enable Clerk Billing**

### **Step 1: Enable Billing in Clerk Dashboard**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Billing** section
4. Click **Enable Billing**

### **Step 2: Create Subscription Products**

1. In Clerk Dashboard → **Billing** → **Products**
2. Click **Create Product**
3. Create **"Pro"** product:
   - Name: `Pro`
   - Description: `Pro subscription plan`
   - Click **Save**
4. Create **"Premium"** product:
   - Name: `Premium`
   - Description: `Premium subscription plan`
   - Click **Save**

### **Step 3: Create Prices**

1. For **"Pro"** product:
   - Click **Add Price**
   - Amount: `30` (or your preferred amount)
   - Currency: `USD` (or USDT equivalent)
   - Interval: `Monthly`
   - Click **Save**
2. For **"Premium"** product:
   - Click **Add Price**
   - Amount: `100` (or your preferred amount)
   - Currency: `USD` (or USDT equivalent)
   - Interval: `Monthly`
   - Click **Save**

### **Step 4: Enable in Your App**

**Option A: Environment Variable (Recommended)**

Add to `.env.local`:
```bash
VITE_CLERK_BILLING_ENABLED=true
```

Add to GitHub Secrets (for deployment):
- Key: `VITE_CLERK_BILLING_ENABLED`
- Value: `true`

**Option B: Config File**

Edit `src/lib/config/clerkBilling.ts`:
```typescript
export const CLERK_BILLING_ENABLED = true; // Change from false to true
```

### **Step 5: Verify**

1. Run verification script:
   ```bash
   node verify-clerk-subscriptions.js
   ```
2. You should see products and prices listed
3. Visit `/subscription` page - should show Clerk's `<PricingTable />`
4. Visit `/profile` page - should show Clerk's `<UserProfile />` with billing tab

## 🔄 **How It Works**

### **When Clerk Billing is Enabled (`VITE_CLERK_BILLING_ENABLED=true`):**

**SubscriptionPage.tsx:**
- Shows Clerk's `<PricingTable />` component
- Displays products/prices from Clerk Dashboard
- Handles subscription checkout automatically
- Manages billing via Clerk's system

**ProfilePage.tsx:**
- Shows custom stats section (points, submissions, etc.)
- Shows Clerk's `<UserProfile />` component below stats
- `<UserProfile />` includes billing management tab automatically
- Users can manage subscriptions, payment methods, invoices

### **When Clerk Billing is Disabled (default):**

**SubscriptionPage.tsx:**
- Shows custom pricing table
- Uses `SubscriptionPurchase` component
- Integrates with smart contracts (USDT payments)
- Stores subscription in `publicMetadata`

**ProfilePage.tsx:**
- Shows custom profile page
- Displays subscription tier from `publicMetadata`
- Custom stats and account information

## 📊 **Current Status**

| Component | Clerk Billing | Custom Implementation |
|-----------|--------------|----------------------|
| **SubscriptionPage** | ✅ Ready (disabled) | ✅ Active (default) |
| **ProfilePage** | ✅ Ready (disabled) | ✅ Active (default) |
| **Billing Management** | ✅ Ready (disabled) | ✅ Active (via publicMetadata) |

## 🎯 **Next Steps**

1. ✅ **Enable Clerk Billing** in Dashboard (Steps 1-3 above)
2. ✅ **Set `VITE_CLERK_BILLING_ENABLED=true`** (Step 4)
3. ✅ **Verify** with `verify-clerk-subscriptions.js` (Step 5)
4. ✅ **Test** subscription flow on `/subscription` page
5. ✅ **Test** billing management on `/profile` page

## 💡 **Benefits of Clerk Billing**

- ✅ **Automatic Payment Processing**: Stripe integration built-in
- ✅ **Subscription Management**: Users can upgrade/downgrade/cancel
- ✅ **Invoice Management**: Automatic invoice generation
- ✅ **Payment Methods**: Users can manage credit cards
- ✅ **Billing History**: Complete transaction history
- ✅ **Less Code**: No need to build custom billing UI

## ⚠️ **Important Notes**

- **Current Implementation**: Uses custom smart contract integration (USDT payments)
- **Clerk Billing**: Uses Stripe (credit card payments)
- **Migration**: If switching to Clerk Billing, you may need to migrate existing subscriptions
- **Hybrid Approach**: You can keep both systems (custom for crypto, Clerk for fiat)

## 📚 **References**

- [Clerk Billing Documentation](https://clerk.com/docs/billing)
- [Clerk React Billing Guide](https://clerk.com/docs/react/billing/b2c-saas)
- [Clerk PricingTable Component](https://clerk.com/docs/react/components/billing/pricing-table)
- [Clerk UserProfile Component](https://clerk.com/docs/react/components/user/user-profile)

