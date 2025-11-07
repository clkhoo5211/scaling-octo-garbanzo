# 🔧 Build Warning Fix: React Native Dependencies

## Issue

**Warning:** `Module not found: Can't resolve '@react-native-async-storage/async-storage'`

**Root Cause:**
- MetaMask SDK (`@metamask/sdk`) has peer dependencies on React Native packages
- These packages are NOT needed for browser builds (Next.js static export)
- Webpack tries to resolve them during build, causing warnings

**Impact:**
- ⚠️ Build completes with warnings (does NOT break build)
- ✅ App works correctly (React Native code never executed in browser)
- ⚠️ Warning is annoying and clutters build output

## Solution Applied

### 1. NormalModuleReplacementPlugin

Replaces React Native modules with empty stub module:

```javascript
new webpack.NormalModuleReplacementPlugin(
  /^@react-native-async-storage\/async-storage$/,
  require.resolve('./webpack/react-native-stub.js')
)
```

### 2. IgnorePlugin (Backup)

Also uses IgnorePlugin to ignore the modules:

```javascript
new webpack.IgnorePlugin({
  resourceRegExp: /^@react-native-async-storage\/async-storage$/,
})
```

### 3. Alias to False

Sets alias to `false` to prevent resolution:

```javascript
config.resolve.alias = {
  '@react-native-async-storage/async-storage': false,
  'react-native': false,
}
```

### 4. Externals

Adds to externals to prevent bundling:

```javascript
config.externals.push('@react-native-async-storage/async-storage', 'react-native');
```

## Files Created

- `webpack/react-native-stub.js` - Empty stub module

## Why This Works

1. **NormalModuleReplacementPlugin** replaces the module import with our stub
2. **IgnorePlugin** prevents webpack from trying to resolve it
3. **Alias to false** tells webpack to ignore it
4. **Externals** prevents bundling

## Clerk Compatibility

**✅ Clerk works perfectly with static exports!**

- Clerk is configured client-side only (`ClerkProvider` in `providers.tsx`)
- No Server Actions used (which would break static export)
- All Clerk features work: `useUser()`, `useAuth()`, metadata updates
- The warning is **NOT** related to Clerk

## Testing

After applying this fix:

1. **Local Build:**
   ```bash
   npm run build
   ```
   - Should complete without React Native warnings

2. **GitHub Actions:**
   - Push changes
   - Check build logs
   - Warning should be gone

## If Warning Persists

If the warning still appears, it's a **known limitation** of MetaMask SDK:

1. The warning doesn't break the build ✅
2. The app works correctly ✅
3. React Native code is never executed in browser ✅
4. Can be safely ignored if fix doesn't work

**Alternative:** Consider updating `@metamask/sdk` version or using a different wallet connector if the warning is unacceptable.

