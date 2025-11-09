# 🔑 GitHub Secrets Setup Guide

## Web3News - Blockchain Content Aggregator

**Repository**: https://github.com/clkhoo5211/scaling-octo-garbanzo  
**Secrets Page**: https://github.com/clkhoo5211/scaling-octo-garbanzo/settings/secrets/actions

---

## 📋 Required Secrets (4 Total)

You need to add these 4 secrets to your GitHub repository for the deployment to work:

| #   | Secret Name                         | Purpose                  | Where to Get It       |
| --- | ----------------------------------- | ------------------------ | --------------------- |
| 1   | `NEXT_PUBLIC_SUPABASE_URL`          | Supabase project URL     | Supabase Dashboard    |
| 2   | `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | Supabase public API key  | Supabase Dashboard    |
| 3   | `NEXT_PUBLIC_REOWN_PROJECT_ID`      | Reown AppKit project ID  | Reown Cloud Dashboard |
| 4   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk authentication key | Clerk Dashboard       |

---

## 🔐 Step-by-Step: How to Get Each Key

### 1. NEXT_PUBLIC_SUPABASE_URL

**What it is**: Your Supabase project's API endpoint URL

**How to get it:**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Sign in** with your account (or create one if you don't have it)
3. **Select your project** (or create a new project if needed)
4. **Go to**: Settings → API (left sidebar)
5. **Find**: "Project URL" section
6. **Copy** the URL (format: `https://xxxxx.supabase.co`)
   - Example: `https://abcdefghijklmnop.supabase.co`

**What to copy**: The entire URL starting with `https://` and ending with `.supabase.co`

**Where to add**: GitHub → Settings → Secrets → New repository secret → Name: `NEXT_PUBLIC_SUPABASE_URL`

---

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY

**What it is**: Your Supabase anonymous/public API key (safe to expose in frontend)

**How to get it:**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to**: Settings → API (left sidebar)
4. **Find**: "Project API keys" section
5. **Look for**: `anon` `public` key
6. **Click** the eye icon to reveal the key
7. **Copy** the entire key (long string starting with `eyJ...`)

**Important**:

- Use the `anon` `public` key (NOT the `service_role` key)
- This key is safe to expose in frontend code
- It's protected by Row Level Security (RLS) policies

**Where to add**: GitHub → Settings → Secrets → New repository secret → Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 3. NEXT_PUBLIC_REOWN_PROJECT_ID

**What it is**: Your Reown AppKit (formerly WalletConnect) project ID

**How to get it:**

1. **Go to Reown Cloud**: https://cloud.reown.com
2. **Sign in** (or create account if needed)
3. **Create a new project** (or select existing one):
   - Click "Create Project" or select existing project
   - Name: "Web3News" (or your preferred name)
   - Description: "Web3News Aggregator"
4. **After creating**, you'll see your **Project ID**
   - Format: Usually a UUID or short string
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
5. **Copy** the Project ID

**Alternative**: If you already have a project:

- Go to your project dashboard
- Project ID is shown at the top or in project settings

**Where to add**: GitHub → Settings → Secrets → New repository secret → Name: `NEXT_PUBLIC_REOWN_PROJECT_ID`

---

### 4. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

**What it is**: Clerk's publishable key for user authentication

**How to get it:**

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. **Sign in** (or create account if needed)
3. **Create a new application** (or select existing):
   - Click "Create Application"
   - Name: "Web3News" (or your preferred name)
   - Choose authentication methods (Email, Social, etc.)
   - Click "Create"
4. **Go to**: API Keys (left sidebar)
5. **Find**: "Publishable key" section
6. **Copy** the publishable key
   - Format: Usually starts with `pk_test_` or `pk_live_`
   - Example: `pk_test_abcdefghijklmnopqrstuvwxyz1234567890`

**Important**:

- Use the **Publishable key** (NOT the Secret key)
- Publishable keys start with `pk_`
- Secret keys start with `sk_` and should NEVER be exposed

**Where to add**: GitHub → Settings → Secrets → New repository secret → Name: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

---

## 📝 How to Add Secrets to GitHub

### Step-by-Step Process:

1. **Go to Secrets Page**:
   - Visit: https://github.com/clkhoo5211/scaling-octo-garbanzo/settings/secrets/actions
   - Or: Repository → Settings → Secrets and variables → Actions

2. **Add Each Secret**:
   - Click "New repository secret" button
   - **Name**: Enter the exact secret name (case-sensitive!)
   - **Secret**: Paste the value you copied
   - Click "Add secret"

3. **Repeat for All 4 Secrets**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_REOWN_PROJECT_ID`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

4. **Verify**:
   - You should see all 4 secrets listed
   - Names must match exactly (case-sensitive)

---

## ✅ Verification Checklist

After adding all secrets, verify:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Starts with `https://` and ends with `.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Long string starting with `eyJ...`
- [ ] `NEXT_PUBLIC_REOWN_PROJECT_ID` - Project ID from Reown Cloud
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Starts with `pk_test_` or `pk_live_`

---

## 🚨 Important Notes

### Security:

- ✅ **Publishable keys** are safe to expose (they're meant for frontend)
- ❌ **Secret keys** should NEVER be added as secrets (they're for backend only)
- ✅ All keys starting with `NEXT_PUBLIC_` are safe for frontend use

### Format Requirements:

- **No extra spaces** before or after the value
- **Case-sensitive** - Names must match exactly
- **Complete values** - Copy the entire key/URL

### If You Don't Have Accounts Yet:

**Supabase** (Free tier available):

- Sign up: https://supabase.com
- Free tier includes: 500MB database, 2GB bandwidth, 50,000 monthly active users

**Reown** (Free tier available):

- Sign up: https://cloud.reown.com
- Free tier includes: Basic project features

**Clerk** (Free tier available):

- Sign up: https://clerk.com
- Free tier includes: 10,000 monthly active users, basic authentication

---

## 🔗 Quick Links

- **GitHub Secrets**: https://github.com/clkhoo5211/scaling-octo-garbanzo/settings/secrets/actions
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Reown Cloud**: https://cloud.reown.com
- **Clerk Dashboard**: https://dashboard.clerk.com

---

## 📊 Summary

**You need 4 secrets:**

1. **Supabase URL** → Get from Supabase Dashboard → Settings → API
2. **Supabase Anon Key** → Get from Supabase Dashboard → Settings → API
3. **Reown Project ID** → Get from Reown Cloud → Create/Select Project
4. **Clerk Publishable Key** → Get from Clerk Dashboard → API Keys

**All are free to set up** and have free tiers available!

Once you add all 4 secrets, the GitHub Actions workflow will automatically deploy your site to GitHub Pages! 🚀
