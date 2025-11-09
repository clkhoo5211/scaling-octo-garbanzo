# 🔍 Why React Native Dependencies with Reown?

## The Dependency Chain

Even though you're using **Reown AppKit**, the React Native dependency warning comes from this chain:

```
Reown AppKit
    ↓
WagmiAdapter (@reown/appkit-adapter-wagmi)
    ↓
Wagmi Connectors (@wagmi/connectors)
    ↓
MetaMask Connector (includes @metamask/sdk)
    ↓
MetaMask SDK checks for React Native packages
    ↓
⚠️ Warning: Can't resolve '@react-native-async-storage/async-storage'
```

## Why This Happens

1. **Reown AppKit** uses **WagmiAdapter** for wallet connections
2. **WagmiAdapter** includes **MetaMask connector** by default
3. **MetaMask SDK** (`@metamask/sdk`) supports both:
   - Browser environments (what you need)
   - React Native environments (not needed)
4. **MetaMask SDK** checks for React Native packages even in browser builds
5. Next.js static export doesn't need React Native packages

## The Fix

The webpack configuration now:
1. **Ignores** React Native modules when imported from `@metamask/sdk`
2. **Aliases** them to `false` to prevent resolution
3. **Externals** them to prevent bundling

This allows:
- ✅ Reown AppKit to work perfectly
- ✅ MetaMask wallet connections to work
- ✅ Build to succeed without React Native packages

## Important Notes

- **The warning is harmless** - MetaMask SDK works fine without React Native packages in browser builds
- **Reown AppKit doesn't need React Native** - it's purely a MetaMask SDK quirk
- **Your app works correctly** - this is just a build-time warning, not a runtime error

## Alternative Solutions

If the warning persists and is unacceptable:

1. **Use a different wallet connector** (e.g., WalletConnect only, skip MetaMask)
2. **Wait for MetaMask SDK update** (they may fix this in future versions)
3. **Suppress the warning** (current approach - recommended)

The current fix is the **recommended approach** - it suppresses the warning while maintaining full functionality.

