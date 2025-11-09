#!/usr/bin/env node
/**
 * Clerk Subscription Plans Verification Script
 * Verifies subscription plans configured in Clerk Dashboard
 * 
 * Usage: node verify-clerk-subscriptions.js
 * 
 * Requires:
 * - CLERK_SECRET_KEY in environment or .env.local
 * - Or VITE_CLERK_PUBLISHABLE_KEY to extract instance info
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
function loadEnv() {
  try {
    const envPath = join(__dirname, '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        env[key] = value;
      }
    });
    
    return env;
  } catch (error) {
    console.warn('⚠️  Could not load .env.local, using process.env');
    return {};
  }
}

const env = { ...process.env, ...loadEnv() };

const CLERK_SECRET_KEY = env.CLERK_SECRET_KEY || env.CLERK_SECRET_KEY_BACKEND;
const CLERK_PUBLISHABLE_KEY = env.VITE_CLERK_PUBLISHABLE_KEY || env.CLERK_PUBLISHABLE_KEY;

console.log('🔍 Clerk Subscription Plans Verification\n');
console.log('📋 Configuration:');
console.log(`   Publishable Key: ${CLERK_PUBLISHABLE_KEY ? CLERK_PUBLISHABLE_KEY.substring(0, 20) + '...' : '❌ Not found'}`);
console.log(`   Secret Key: ${CLERK_SECRET_KEY ? CLERK_SECRET_KEY.substring(0, 20) + '...' : '❌ Not found'}\n`);

if (!CLERK_SECRET_KEY) {
  console.error('❌ Error: CLERK_SECRET_KEY not found!');
  console.error('   Please set CLERK_SECRET_KEY in .env.local or environment variables');
  console.error('   You can find it in Clerk Dashboard → API Keys → Secret Key');
  process.exit(1);
}

// Extract instance from publishable key if available
let instanceId = null;
if (CLERK_PUBLISHABLE_KEY) {
  // Publishable key format: pk_test_<base64> or pk_live_<base64>
  const parts = CLERK_PUBLISHABLE_KEY.split('_');
  if (parts.length >= 3) {
    try {
      const decoded = Buffer.from(parts[2], 'base64').toString('utf-8');
      // Extract instance from decoded string
      const match = decoded.match(/clerk\.accounts\.dev/);
      if (match) {
        instanceId = decoded.split('.')[0];
      }
    } catch (e) {
      // Ignore decode errors
    }
  }
}

// Clerk API endpoints
const CLERK_API_BASE = 'https://api.clerk.com/v1';

/**
 * Make API request to Clerk
 */
function clerkAPIRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = `${CLERK_API_BASE}${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${json.error || data}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${data}`));
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * List all products (subscription plans)
 */
async function listProducts() {
  try {
    console.log('📦 Fetching subscription products from Clerk...\n');
    const products = await clerkAPIRequest('/products');
    return products;
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      console.warn('⚠️  Products endpoint not found. Clerk Billing might not be enabled.');
      console.warn('   To enable: Clerk Dashboard → Billing → Enable Billing');
      return null;
    }
    throw error;
  }
}

/**
 * List all prices (subscription tiers)
 */
async function listPrices() {
  try {
    console.log('💰 Fetching subscription prices from Clerk...\n');
    const prices = await clerkAPIRequest('/prices');
    return prices;
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      console.warn('⚠️  Prices endpoint not found.');
      return null;
    }
    throw error;
  }
}

/**
 * Main verification function
 */
async function verifySubscriptions() {
  try {
    // Test API connection
    console.log('🔌 Testing Clerk API connection...');
    try {
      const instance = await clerkAPIRequest('/instance');
      console.log(`✅ Connected to Clerk instance: ${instance.name || 'Unknown'}\n`);
    } catch (error) {
      console.error(`❌ API Connection failed: ${error.message}`);
      console.error('   Please verify your CLERK_SECRET_KEY is correct');
      process.exit(1);
    }

    // List products
    const products = await listProducts();
    if (products && products.data) {
      console.log(`✅ Found ${products.data.length} product(s):\n`);
      products.data.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name || 'Unnamed Product'}`);
        console.log(`      ID: ${product.id}`);
        console.log(`      Description: ${product.description || 'No description'}`);
        console.log(`      Active: ${product.active ? '✅' : '❌'}`);
        console.log('');
      });
    } else if (products === null) {
      console.log('⚠️  Products API not available (Billing may not be enabled)\n');
    } else {
      console.log('⚠️  No products found\n');
    }

    // List prices
    const prices = await listPrices();
    if (prices && prices.data) {
      console.log(`✅ Found ${prices.data.length} price(s):\n`);
      prices.data.forEach((price, index) => {
        console.log(`   ${index + 1}. ${price.nickname || 'Unnamed Price'}`);
        console.log(`      ID: ${price.id}`);
        console.log(`      Product: ${price.product || 'N/A'}`);
        console.log(`      Amount: ${price.unit_amount ? (price.unit_amount / 100) : 'N/A'} ${price.currency || 'USD'}`);
        console.log(`      Interval: ${price.recurring?.interval || 'one-time'}`);
        console.log(`      Active: ${price.active ? '✅' : '❌'}`);
        console.log('');
      });
    } else if (prices === null) {
      console.log('⚠️  Prices API not available\n');
    } else {
      console.log('⚠️  No prices found\n');
    }

    // Summary
    console.log('📊 Summary:');
    console.log(`   Products: ${products?.data?.length || 0}`);
    console.log(`   Prices: ${prices?.data?.length || 0}`);
    console.log('');
    
    if (!products?.data?.length && !prices?.data?.length) {
      console.log('⚠️  WARNING: No subscription plans found!');
      console.log('');
      console.log('📝 To set up subscription plans:');
      console.log('   1. Go to Clerk Dashboard → Billing');
      console.log('   2. Enable Billing if not already enabled');
      console.log('   3. Create Products (e.g., "Pro", "Premium")');
      console.log('   4. Create Prices for each product');
      console.log('   5. Configure features for each plan');
      console.log('');
      console.log('📚 Documentation: https://clerk.com/docs/billing');
    } else {
      console.log('✅ Subscription plans are configured in Clerk!');
      console.log('');
      console.log('💡 Next steps:');
      console.log('   - Use <PricingTable /> component to display plans');
      console.log('   - Use <UserProfile /> component with billing tab');
      console.log('   - Use useAuth().has({ plan: "pro" }) to check access');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('   1. Verify CLERK_SECRET_KEY is correct');
    console.error('   2. Check Clerk Dashboard → Billing is enabled');
    console.error('   3. Ensure you have the correct API permissions');
    process.exit(1);
  }
}

// Run verification
verifySubscriptions().catch(console.error);

