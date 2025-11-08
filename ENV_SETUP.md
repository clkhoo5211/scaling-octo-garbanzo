# Environment Variables Setup Guide

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Reown AppKit Project ID
# Get your project ID from https://cloud.reown.com
VITE_REOWN_PROJECT_ID=your-project-id-here

# Clerk Authentication
# Get your publishable key from https://dashboard.clerk.com
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key-here

# Base path for GitHub Pages deployment (optional)
# Format: /repository-name (e.g., /scaling-octo-garbanzo)
# Leave empty or set to "/" for root deployment
VITE_BASE_PATH=/
```

## Optional Environment Variables

```bash
# Supabase Configuration (if using Supabase)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Quick Setup

1. Copy this template to create your `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace the placeholder values with your actual keys

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Getting Your Keys

### Reown AppKit Project ID
1. Go to https://cloud.reown.com
2. Sign up or log in
3. Create a new project
4. Copy your Project ID from the project dashboard

### Clerk Publishable Key
1. Go to https://dashboard.clerk.com
2. Sign up or log in
3. Create a new application
4. Copy your Publishable Key from the API Keys section

## Troubleshooting

If you see the error "Project ID is not defined":
1. Make sure your `.env` file exists in the root directory
2. Check that `VITE_REOWN_PROJECT_ID` is set correctly
3. Restart your development server after creating/updating `.env`
4. Make sure the variable name starts with `VITE_` (required for Vite)

Note: The application will still run without these keys, but wallet connection and authentication features will not work.

