#!/usr/bin/env node
/**
 * Enhanced Clerk Subscription Plans Verification Script
 * Verifies subscription plans configured in Clerk Dashboard
 * Tries multiple API endpoints and shows detailed error messages
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
const CLERK_SECRET_KEY = env.CLERK_SECRET_KEY || env.CLERK_SECRET_KEY_BACKEND || 'sk_test_Tk0ngkVeenjGGecV507lDMpjlbdEg3MKC4Lv36wOvc';

console.log('🔍 Enhanced Clerk Subscription Plans Verification\n');
console.log('📋 Configuration:');
console.log(`   Secret Key: ${CLERK_SECRET_KEY ? CLERK_SECRET_KEY.substring(0, 20) + '...' : '❌ Not found'}\n`);

if (!CLERK_SECRET_KEY) {
  console.error('❌ Error: CLERK_SECRET_KEY not found!');
  process.exit(1);
}

// Clerk API endpoints
const CLERK_API_BASE = 'https://api.clerk.com/v1';

/**
 * Make API request to Clerk with detailed error handling
 */
function clerkAPIRequest(endpoint, method = 'GET', body = null, showDetails = false) {
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
            if (showDetails) {
              console.log(`   Status: ${res.statusCode}`);
              console.log(`   Response: ${JSON.stringify(json, null, 2)}`);
            }
            reject(new Error(`API Error ${res.statusCode}: ${JSON.stringify(json)}`));
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
 * Try multiple endpoints to find subscription plans
 */
async function findSubscriptionPlans() {
  const endpoints = [
    '/products',
    '/prices',
    '/billing/products',
    '/billing/prices',
    '/subscriptions',
    '/billing/subscriptions',
  ];

  console.log('🔍 Trying multiple API endpoints...\n');

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing: ${endpoint}`);
      const result = await clerkAPIRequest(endpoint);
      console.log(`✅ Success! Found data at ${endpoint}\n`);
      return { endpoint, data: result };
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`   ❌ Not found (404)\n`);
      } else if (error.message.includes('403')) {
        console.log(`   ⚠️  Forbidden (403) - Check API permissions\n`);
      } else {
        console.log(`   ⚠️  Error: ${error.message}\n`);
      }
    }
  }

  return null;
}

/**
 * Get instance information
 */
async function getInstanceInfo() {
  try {
    const instance = await clerkAPIRequest('/instance');
    return instance;
  } catch (error) {
    console.error(`❌ Failed to get instance info: ${error.message}`);
    return null;
  }
}

/**
 * List all users and check their subscription metadata
 */
async function checkUserSubscriptions() {
  try {
    console.log('👥 Checking users for subscription metadata...\n');
    const usersResponse = await clerkAPIRequest('/users?limit=100');
    const users = usersResponse.data || [];
    
    console.log(`Found ${users.length} user(s)\n`);
    
    let usersWithSubscriptions = 0;
    for (const user of users) {
      const metadata = user.public_metadata || {};
      const subscriptionTier = metadata.subscription_tier;
      const subscriptionExpiry = metadata.subscription_expiry;
      
      if (subscriptionTier && subscriptionTier !== 'free') {
        usersWithSubscriptions++;
        console.log(`👤 User: ${user.id}`);
        console.log(`   Email: ${user.email_addresses?.[0]?.email_address || 'N/A'}`);
        console.log(`   Subscription Tier: ${subscriptionTier}`);
        console.log(`   Expiry: ${subscriptionExpiry || 'N/A'}`);
        console.log('');
      }
    }
    
    if (usersWithSubscriptions === 0) {
      console.log('⚠️  No users with active subscriptions found in metadata\n');
    }
    
    return usersWithSubscriptions;
  } catch (error) {
    console.error(`❌ Failed to check users: ${error.message}\n`);
    return 0;
  }
}

/**
 * Main verification function
 */
async function verifySubscriptions() {
  try {
    // Test API connection
    console.log('🔌 Testing Clerk API connection...');
    const instance = await getInstanceInfo();
    if (instance) {
      console.log(`✅ Connected to Clerk instance`);
      console.log(`   Name: ${instance.name || 'Unknown'}`);
      console.log(`   ID: ${instance.id || 'Unknown'}\n`);
    }

    // Try to find subscription plans via API
    const plansResult = await findSubscriptionPlans();
    
    if (plansResult) {
      console.log('📦 Subscription Plans Found:\n');
      const data = plansResult.data.data || plansResult.data || [];
      
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((item, index) => {
          console.log(`   ${index + 1}. ${JSON.stringify(item, null, 2)}`);
          console.log('');
        });
      } else {
        console.log('   Data structure:', JSON.stringify(plansResult.data, null, 2));
      }
    } else {
      console.log('⚠️  Could not find subscription plans via API endpoints\n');
      console.log('💡 This might mean:');
      console.log('   1. Clerk Billing uses a different API structure');
      console.log('   2. Plans are configured but accessed differently');
      console.log('   3. You need to use Clerk\'s frontend SDK to access plans\n');
    }

    // Check user metadata for subscriptions
    await checkUserSubscriptions();

    // Summary
    console.log('📊 Summary:');
    console.log(`   API Plans Found: ${plansResult ? 'Yes' : 'No'}`);
    console.log('');
    
    console.log('💡 Next Steps:');
    console.log('   1. Check Clerk Dashboard → Billing for active plans');
    console.log('   2. Verify plans are published (not draft)');
    console.log('   3. Use Clerk\'s frontend SDK (<PricingTable />) to display plans');
    console.log('   4. Check user.publicMetadata.subscription_tier in your app');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run verification
verifySubscriptions().catch(console.error);

