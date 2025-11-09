# 🤔 Why MetaMask SDK Checks for React Native in Next.js?

## The Root Cause

**MetaMask SDK is a multi-platform library** that supports:
- ✅ Browser (Chrome, Firefox, Safari)
- ✅ React Native (iOS/Android mobile apps)
- ✅ Node.js (server-side)

When MetaMask SDK is installed, it includes **peer dependencies** for ALL platforms, even if you're only using one.

## The Dependency Chain

Here's what happens in YOUR project:

```
Your Next.js App
    ↓
Reown AppKit (@reown/appkit)
    ↓
WagmiAdapter (@reown/appkit-adapter-wagmi)
    ↓
Wagmi Connectors (@wagmi/connectors)
    ↓
MetaMask Connector (includes @metamask/sdk)
    ↓
MetaMask SDK checks for:
    ├─ Browser packages ✅ (you have these)
    ├─ React Native packages ❌ (you DON'T have these - but SDK checks anyway!)
    └─ Node.js packages ✅ (you have these)
```

## Why MetaMask SDK Does This

### 1. **Single Package for Multiple Platforms**
MetaMask SDK is designed to work in **all environments** from one package:
- Mobile developers need React Native packages
- Web developers need browser packages
- Server developers need Node.js packages

### 2. **Peer Dependencies**
MetaMask SDK declares React Native packages as **peer dependencies**:
```json
{
  "peerDependencies": {
    "@react-native-async-storage/async-storage": "*",
    "react-native": "*"
  }
}
```

This means:
- ✅ If you're building React Native → install React Native packages
- ❌ If you're building Next.js → you DON'T need them
- ⚠️ But MetaMask SDK still **checks** for them during build

### 3. **Build-Time Detection**
During webpack bundling, MetaMask SDK code runs and tries to:
1. Check if React Native packages exist
2. Import them if available
3. Fall back to browser code if not

This happens **even in Next.js builds** because MetaMask SDK doesn't know your target platform until runtime.

## Why This Causes Confusion

### The Warning Message
```
Module not found: Can't resolve '@react-native-async-storage/async-storage'
```

This warning is **misleading** because:
- ❌ It suggests you need React Native packages
- ✅ But you're building a Next.js web app
- ✅ You DON'T need React Native packages
- ✅ MetaMask SDK works fine without them (it falls back to browser code)

### Why It's Confusing

1. **You're using Next.js** (web framework)
2. **Warning mentions React Native** (mobile framework)
3. **You think**: "Wait, am I using React Native?"
4. **Answer**: No! It's just MetaMask SDK checking for optional dependencies

## The Solution

The webpack configuration tells webpack:
- "Ignore React Native modules when MetaMask SDK tries to import them"
- "Don't fail the build if they're missing"
- "Use browser code instead"

This is safe because:
- ✅ MetaMask SDK has fallback code for browsers
- ✅ Your Next.js app only runs in browsers
- ✅ React Native code is never executed

## Real-World Analogy

Think of MetaMask SDK like a **multi-language dictionary**:
- It has entries for English, Spanish, French, etc.
- When you open it, it checks: "Do you have Spanish installed?"
- If not, it says: "Warning: Spanish not found"
- But it still works perfectly in English!

Similarly:
- MetaMask SDK checks: "Do you have React Native?"
- If not, it says: "Warning: React Native not found"
- But it still works perfectly in browser mode!

## Summary

| Question | Answer |
|----------|--------|
| **Why the confusion?** | MetaMask SDK checks for React Native even in Next.js |
| **Do you need React Native?** | ❌ No - you're building a Next.js web app |
| **Why does SDK check?** | It's a multi-platform library (browser + mobile) |
| **Is this a problem?** | ❌ No - just a build warning, app works fine |
| **Solution?** | Webpack config suppresses the warning |

## Bottom Line

**You're using Next.js correctly.**  
**MetaMask SDK is just being thorough** by checking for all possible dependencies.  
**The webpack config handles it** so your build succeeds.

This is a common issue with multi-platform libraries - they check for dependencies they might not need in your specific use case.

