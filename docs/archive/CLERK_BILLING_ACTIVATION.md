# Clerk Billing Activation Guide

**Date:** 2025-11-09  
**Issue:** Plans created but not showing in app

## 🔍 **Problem Identified**

From your Clerk Dashboard screenshot, I can see:
- ✅ Plans are created ("Free" and "abc")
- ❌ **"Billing for Users is inactive"** - This is the issue!

## ✅ **Solution: Activate Billing**

### **Step 1: Click "Configure Billing" Button**

In your Clerk Dashboard:
1. You should see an alert: **"Billing for Users is inactive."**
2. Click the **"Configure Billing"** button next to it
3. This will activate billing for your application

### **Step 2: Complete Billing Setup**

After clicking "Configure Billing":
1. You may need to connect a payment processor (Stripe)
2. Configure billing settings
3. Enable billing for users

### **Step 3: Enable in Your App**

After billing is activated in Clerk Dashboard:

**Option A: Environment Variable (Recommended)**

Add to `.env.local`:
```bash
VITE_CLERK_BILLING_ENABLED=true
```

**Option B: Config File**

Edit `src/lib/config/clerkBilling.ts`:
```typescript
export const CLERK_BILLING_ENABLED = true; // Change from false to true
```

### **Step 4: Verify Plans Are Accessible**

Run the verification script:
```bash
node verify-clerk-subscriptions.js
```

You should see:
- ✅ Products listed (your plans)
- ✅ Prices listed (monthly/annual pricing)

### **Step 5: Test in App**

1. Restart your dev server (if running)
2. Visit `/subscription` page
3. You should see Clerk's `<PricingTable />` with your plans

## 🔧 **Troubleshooting**

### **If Plans Still Don't Show:**

1. **Check Browser Console:**
   - Open DevTools → Console
   - Look for errors related to Clerk Billing

2. **Verify Environment Variable:**
   ```bash
   # In your terminal
   echo $VITE_CLERK_BILLING_ENABLED
   # Should output: true
   ```

3. **Check Clerk Dashboard:**
   - Go to Billing → User Plans
   - Ensure plans are **published** (not draft)
   - Ensure billing is **active**

4. **Verify Clerk Components:**
   - Check if `<PricingTable />` is rendering
   - Check network tab for API calls to Clerk

## 📋 **Current Status**

Based on your screenshot:
- ✅ Plans created: "Free" and "abc"
- ❌ Billing inactive (needs activation)
- ❌ `VITE_CLERK_BILLING_ENABLED` probably not set

## 🎯 **Next Steps**

1. ✅ **Click "Configure Billing"** in Clerk Dashboard
2. ✅ **Set `VITE_CLERK_BILLING_ENABLED=true`** in `.env.local`
3. ✅ **Restart dev server** (if running)
4. ✅ **Run verification:** `node verify-clerk-subscriptions.js`
5. ✅ **Test in app:** Visit `/subscription` page

## 💡 **Important Notes**

- **Billing must be ACTIVE** for plans to show in `<PricingTable />`
- **Plans must be PUBLISHED** (not draft)
- **Environment variable must be set** for Clerk components to render
- **Restart required** after changing environment variables

