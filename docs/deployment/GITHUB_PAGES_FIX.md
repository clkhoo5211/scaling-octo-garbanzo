# GitHub Pages 404 Fix

## Problem
GitHub Pages is serving the source `index.html` file (with `/src/main.tsx`) instead of the built `dist/index.html` (with `/assets/index-*.js`).

## Root Cause
GitHub Pages is configured to deploy from a **branch** instead of **GitHub Actions**.

## Solution

### Step 1: Change GitHub Pages Source
1. Go to: https://github.com/clkhoo5211/scaling-octo-garbanzo/settings/pages
2. Under **"Source"**, change from **"Deploy from a branch"** to **"GitHub Actions"**
3. Save the changes

### Step 2: Wait for Deployment
After changing the source, wait 2-3 minutes for GitHub Actions to complete the deployment.

### Step 3: Verify
Visit https://clkhoo5211.github.io/scaling-octo-garbanzo/ and check:
- The page should load correctly
- No 404 errors for `/src/main.tsx`
- Console should show assets loading from `/scaling-octo-garbanzo/assets/`

## Why This Happens
- **Branch deployment**: GitHub Pages serves files directly from the repository (source files)
- **GitHub Actions deployment**: GitHub Pages serves files from the built artifact (`dist/` folder)

Our workflow correctly builds and uploads `dist/`, but if GitHub Pages is set to deploy from a branch, it ignores the artifact and serves the source files instead.

## Current Workflow Status
✅ Workflow builds correctly  
✅ Workflow uploads `dist/` artifact  
✅ Built `dist/index.html` has correct asset paths  
❌ GitHub Pages serving source files (needs settings change)

