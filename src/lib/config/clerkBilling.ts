/**
 * Clerk Billing Configuration
 * Controls whether to use Clerk's built-in billing components or custom implementation
 */

// Set this to true after enabling Clerk Billing in your Clerk Dashboard
// Steps:
// 1. Go to Clerk Dashboard → Billing
// 2. Enable Billing
// 3. Create Products (e.g., "Pro", "Premium")
// 4. Create Prices for each product (e.g., 30 USDT/month, 100 USDT/month)
// 5. Set this to true
export const CLERK_BILLING_ENABLED = import.meta.env.VITE_CLERK_BILLING_ENABLED === 'true';

// Alternative: Check via environment variable
// Add VITE_CLERK_BILLING_ENABLED=true to your .env.local or GitHub Secrets

