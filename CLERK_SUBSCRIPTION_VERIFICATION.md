# Clerk Subscription Plans Verification Guide

**Date:** 2025-11-09  
**Question:** Are subscription plans configured in Clerk Dashboard?

## 🔍 Current Status

### ❌ **NOT IMPLEMENTED**

**Current Implementation:**
- ❌ **NO** `<PricingTable />` component from Clerk React
- ❌ **NO** `<UserProfile />` component with billing tab
- ✅ Custom `ProfilePage.tsx` (displays subscription from `publicMetadata`)
- ✅ Custom `SubscriptionPage.tsx` (hardcoded plans: Free, Pro, Premium)
- ✅ Subscription data stored in Clerk `publicMetadata` (not Clerk Billing API)

### What Clerk React Provides

According to [Clerk React Documentation](https://clerk.com/docs/react/billing/b2c-saas):

1. **`<PricingTable />` Component**
   ```jsx
   import { PricingTable } from '@clerk/clerk-react';
   
   <PricingTable />
   ```
   - Automatically displays subscription plans from Clerk Dashboard
   - Requires plans configured in Clerk Dashboard → Billing

2. **`<UserProfile />` Component with Billing Tab**
   ```jsx
   import { UserProfile } from '@clerk/clerk-react';
   
   <UserProfile />
   ```
   - Includes billing management tab when billing is enabled
   - Shows current subscription and allows plan changes

3. **`useAuth().has()` Method**
   ```jsx
   const { has } = useAuth();
   const hasPremium = has({ plan: 'premium' });
   ```
   - Checks if user has specific plan or feature

## 📋 Verification Steps

### Step 1: Check Clerk Secret Key

To verify subscription plans via API, you need `CLERK_SECRET_KEY` (not publishable key).

**Current Status:**
- ✅ `VITE_CLERK_PUBLISHABLE_KEY` found in `.env.local`
- ❌ `CLERK_SECRET_KEY` not found (needed for API verification)

**To get Secret Key:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **API Keys**
4. Copy the **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Step 2: Add Secret Key to .env.local

```bash
# Add to .env.local
CLERK_SECRET_KEY=sk_test_...
```

### Step 3: Run Verification Script

```bash
node verify-clerk-subscriptions.js
```

This will:
- ✅ Test Clerk API connection
- ✅ List all products (subscription plans)
- ✅ List all prices (subscription tiers)
- ✅ Verify billing is enabled

## 🔧 Implementation Status

### Current Code

**ProfilePage.tsx:**
- Uses custom implementation
- Reads subscription from `user.publicMetadata.subscription_tier`
- Does NOT use Clerk's `<UserProfile />` component

**SubscriptionPage.tsx:**
- Uses custom implementation
- Hardcoded plans (Free, Pro, Premium)
- Does NOT use Clerk's `<PricingTable />` component

### What Needs to Be Done

1. **Enable Clerk Billing** (if not already enabled)
   - Clerk Dashboard → Billing → Enable Billing

2. **Create Subscription Plans in Clerk Dashboard**
   - Create Products: "Pro", "Premium"
   - Create Prices: 30 USDT/month, 100 USDT/month
   - Configure features for each plan

3. **Replace Custom Components with Clerk Components**
   - Replace custom `SubscriptionPage` with `<PricingTable />`
   - Replace custom `ProfilePage` with `<UserProfile />` (or add billing tab)

4. **Update Subscription Logic**
   - Use Clerk's billing API instead of `publicMetadata`
   - Use `useAuth().has({ plan: 'pro' })` for access checks

## 📝 Next Steps

1. **Add CLERK_SECRET_KEY to .env.local**
2. **Run verification script** to check if plans exist
3. **If plans don't exist**: Create them in Clerk Dashboard
4. **If plans exist**: Integrate `<PricingTable />` and `<UserProfile />` components

## 🔗 References

- [Clerk React Billing Documentation](https://clerk.com/docs/react/billing/b2c-saas)
- [Clerk PricingTable Component](https://clerk.com/docs/react/billing/b2c-saas#pricing-table)
- [Clerk UserProfile Component](https://clerk.com/docs/react/components/user-profile)
- [Clerk Authorization Checks](https://clerk.com/docs/guides/authorization-checks)

