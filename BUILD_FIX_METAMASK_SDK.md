# 🐛 Build Fix: MetaMask SDK React Native Dependency Issue

## Issue Description

**Error:** Build fails with warning about missing React Native dependency
```
Module not found: Can't resolve '@react-native-async-storage/async-storage' 
in '/home/runner/work/scaling-octo-garbanzo/scaling-octo-garbanzo/node_modules/@metamask/sdk/dist/browser/es'
```

**Root Cause:**
- `@metamask/sdk` has a peer dependency on `@react-native-async-storage/async-storage` (React Native package)
- This dependency is not needed for browser builds (Next.js static export)
- Webpack is trying to resolve it during the build process
- The import chain: `@metamask/sdk` → `@wagmi/connectors` → `@reown/appkit-adapter-wagmi` → `config/index.tsx`

**Impact:**
- Build completes with warnings (not failing)
- But warnings indicate potential runtime issues
- Static export may have problems if dependency is accessed at runtime

---

## Solution

### Option 1: Webpack Alias (Recommended)

Add webpack configuration to alias the React Native module to an empty mock for browser builds.

**File:** `next.config.js`

```javascript
webpack: (config, { isServer, dev }) => {
  // ... existing config ...
  
  if (!isServer) {
    // Client-side only - exclude React Native dependencies
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      // Also exclude other React Native dependencies if needed
      'react-native': false,
    };
  }
  
  return config;
}
```

### Option 2: Webpack Externals

Add the React Native package to webpack externals so it's not bundled.

**File:** `next.config.js`

```javascript
webpack: (config, { isServer, dev }) => {
  // ... existing config ...
  
  if (!isServer) {
    // Exclude React Native dependencies from browser bundle
    config.externals = config.externals || [];
    config.externals.push('@react-native-async-storage/async-storage');
  }
  
  return config;
}
```

### Option 3: Package.json Overrides (Alternative)

Use npm/yarn overrides to exclude the peer dependency.

**File:** `package.json`

```json
{
  "overrides": {
    "@metamask/sdk": {
      "@react-native-async-storage/async-storage": false
    }
  }
}
```

**Note:** This may not work with all package managers.

---

## Recommended Fix

**Use Option 1 (Webpack Alias)** - Most reliable for Next.js static export.

**Updated `next.config.js`:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: process.env.GITHUB_REPOSITORY_NAME
    ? `/${process.env.GITHUB_REPOSITORY_NAME}`
    : "",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ["@reown/appkit"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer, dev }) => {
    // Disable webpack cache
    config.cache = false;

    // Required for Reown AppKit SSR compatibility
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    if (!isServer) {
      // Client-side only - no server actions
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Exclude React Native dependencies for browser builds
      config.resolve.alias = {
        ...config.resolve.alias,
        '@clerk/nextjs/server': false,
        '@react-native-async-storage/async-storage': false,
        'react-native': false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
```

---

## Testing

After applying the fix:

1. **Local Build Test:**
   ```bash
   npm run build
   ```
   - Should complete without warnings about React Native dependencies
   - Static export should generate successfully

2. **GitHub Actions Test:**
   - Push changes to trigger GitHub Actions workflow
   - Verify build completes successfully
   - Check deployment to GitHub Pages

3. **Runtime Test:**
   - Verify MetaMask wallet connection still works
   - Test Reown AppKit functionality
   - Ensure no runtime errors related to async storage

---

## Additional Notes

- **Why this happens:** MetaMask SDK supports both React Native and browser environments, but Next.js static export only needs browser code
- **Why it's safe:** The React Native async storage is only used in React Native apps, not in browser builds
- **Alternative:** If issues persist, consider using a different wallet connector or updating MetaMask SDK version

---

## Status

- **Issue:** Build warning about missing React Native dependency
- **Priority:** Medium (build completes but warnings indicate potential issues)
- **Fix:** Webpack alias to exclude React Native dependencies
- **Estimated Time:** 15 minutes

