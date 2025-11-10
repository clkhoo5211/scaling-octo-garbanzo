#!/usr/bin/env node
/**
 * Ad Slot Subscriptions Verification Script
 * Verifies ad slot subscriptions stored in Clerk publicMetadata
 * 
 * Usage: node verify-ad-slot-subscriptions.js [userId]
 * 
 * Requires:
 * - CLERK_SECRET_KEY in environment or .env.local
 * - Optional: userId to check specific user, otherwise lists all users with subscriptions
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
const userId = process.argv[2]; // Optional user ID argument

console.log('🔍 Ad Slot Subscriptions Verification\n');
console.log('📋 Configuration:');
console.log(`   Secret Key: ${CLERK_SECRET_KEY ? CLERK_SECRET_KEY.substring(0, 20) + '...' : '❌ Not found'}`);
if (userId) {
  console.log(`   User ID: ${userId}\n`);
} else {
  console.log(`   User ID: All users\n`);
}

if (!CLERK_SECRET_KEY) {
  console.error('❌ Error: CLERK_SECRET_KEY not found!');
  console.error('   Please set CLERK_SECRET_KEY in .env.local or environment variables');
  console.error('   You can find it in Clerk Dashboard → API Keys → Secret Key');
  process.exit(1);
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
 * Get user by ID
 */
async function getUser(userId) {
  try {
    const user = await clerkAPIRequest(`/users/${userId}`);
    return user;
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
}

/**
 * List all users (paginated)
 */
async function listUsers(limit = 500) {
  try {
    const users = await clerkAPIRequest(`/users?limit=${limit}`);
    return users;
  } catch (error) {
    throw new Error(`Failed to list users: ${error.message}`);
  }
}

/**
 * Extract ad slot subscriptions from user metadata
 */
function getAdSlotSubscriptions(user) {
  const metadata = user.public_metadata || {};
  const subscriptions = metadata.ad_slot_subscriptions || [];
  return Array.isArray(subscriptions) ? subscriptions : [];
}

/**
 * Format subscription for display
 */
function formatSubscription(sub, index) {
  return {
    index: index + 1,
    id: sub.id || 'N/A',
    slot_id: sub.slot_id || 'N/A',
    notification_email: sub.notification_email ? '✅' : '❌',
    notification_push: sub.notification_push ? '✅' : '❌',
    created_at: sub.created_at || 'N/A',
  };
}

/**
 * Main verification function
 */
async function verifyAdSlotSubscriptions() {
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

    let users = [];
    
    if (userId) {
      // Check specific user
      console.log(`👤 Fetching user: ${userId}...\n`);
      const user = await getUser(userId);
      users = [user];
    } else {
      // List all users
      console.log('👥 Fetching all users...\n');
      const usersResponse = await listUsers();
      users = usersResponse.data || [];
      console.log(`✅ Found ${users.length} user(s)\n`);
    }

    // Check subscriptions for each user
    let totalSubscriptions = 0;
    let usersWithSubscriptions = 0;

    console.log('📋 Checking ad slot subscriptions in publicMetadata...\n');
    console.log('═'.repeat(80));

    for (const user of users) {
      const subscriptions = getAdSlotSubscriptions(user);
      
      if (subscriptions.length > 0) {
        usersWithSubscriptions++;
        totalSubscriptions += subscriptions.length;
        
        console.log(`\n👤 User: ${user.id}`);
        console.log(`   Email: ${user.email_addresses?.[0]?.email_address || 'N/A'}`);
        console.log(`   Username: ${user.username || 'N/A'}`);
        console.log(`   Subscriptions: ${subscriptions.length}\n`);
        
        subscriptions.forEach((sub, index) => {
          const formatted = formatSubscription(sub, index);
          console.log(`   ${formatted.index}. Slot ID: ${formatted.slot_id}`);
          console.log(`      Subscription ID: ${formatted.id}`);
          console.log(`      Email Notifications: ${formatted.notification_email}`);
          console.log(`      Push Notifications: ${formatted.notification_push}`);
          console.log(`      Created: ${formatted.created_at}`);
          console.log('');
        });
      }
    }

    console.log('═'.repeat(80));
    console.log('\n📊 Summary:');
    console.log(`   Total users checked: ${users.length}`);
    console.log(`   Users with subscriptions: ${usersWithSubscriptions}`);
    console.log(`   Total subscriptions: ${totalSubscriptions}`);
    console.log('');

    if (totalSubscriptions === 0) {
      console.log('⚠️  No ad slot subscriptions found in any user\'s publicMetadata');
      console.log('');
      console.log('💡 This is normal if:');
      console.log('   - No users have subscribed to ad slots yet');
      console.log('   - Subscriptions are stored elsewhere');
      console.log('');
      console.log('📝 To test:');
      console.log('   1. Sign in to your app');
      console.log('   2. Subscribe to an ad slot');
      console.log('   3. Run this script again to verify');
    } else {
      console.log('✅ Ad slot subscriptions are stored in Clerk publicMetadata!');
      console.log('');
      console.log('💡 Metadata structure:');
      console.log('   user.public_metadata.ad_slot_subscriptions = [');
      console.log('     {');
      console.log('       id: string,');
      console.log('       clerk_id: string,');
      console.log('       slot_id: string,');
      console.log('       notification_email: boolean,');
      console.log('       notification_push: boolean,');
      console.log('       created_at: string');
      console.log('     }');
      console.log('   ]');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('   1. Verify CLERK_SECRET_KEY is correct');
    console.error('   2. Check that users exist in your Clerk instance');
    console.error('   3. Ensure you have the correct API permissions');
    process.exit(1);
  }
}

// Run verification
verifyAdSlotSubscriptions().catch(console.error);

