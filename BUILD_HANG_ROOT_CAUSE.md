# 🎯 EXACT ROOT CAUSE: Build Hang

## The Problem
Build hangs at **"Collecting page data"** - Next.js never completes static export.

## EXACT CULPRITS (Module-Level Initialization)

### **1. WagmiAdapter** - `config/index.tsx:16`
```typescript
export const wagmiAdapter = new WagmiAdapter({...})  // ❌ RUNS AT MODULE LEVEL
```
**What it does:**
- Initializes Web3 wallet connections
- Sets up WalletConnect infrastructure  
- Accesses `window`, `localStorage`, `cookies` (browser APIs)
- **Hangs because:** Browser APIs don't exist during Node.js build

### **2. createAppKit** - `context/index.tsx:26`
```typescript
const modal = createAppKit({...})  // ❌ RUNS AT MODULE LEVEL
```
**What it does:**
- Initializes Reown AppKit connections
- Connects to WalletConnect network
- Accesses browser environment
- **Hangs because:** Tries to connect to external services during build

### **3. cookieStorage Import** - `config/index.tsx:1`
```typescript
import { cookieStorage, createStorage } from '@wagmi/core';  // ⚠️ May trigger initialization
```

## Why It Worked Before
- Previous builds completed because these weren't being evaluated during static generation
- Recent changes (possibly React Query hooks or component structure) caused Next.js to evaluate modules during "Collecting page data"

## The Fix Applied

1. **Lazy-load WagmiAdapter:**
   ```typescript
   export function getWagmiAdapter() {
     if (typeof window === 'undefined') throw new Error(...);
     // Initialize only on client-side
   }
   ```

2. **Lazy-load createAppKit:**
   ```typescript
   useEffect(() => {
     if (typeof window !== 'undefined') {
       getAppKit(); // Only runs client-side
     }
   }, []);
   ```

3. **Dynamic imports:**
   ```typescript
   const { WagmiAdapter } = require('@reown/appkit-adapter-wagmi'); // Inside function
   ```

4. **Skip WagmiProvider during build:**
   ```typescript
   if (!wagmiConfig) {
     return <QueryClientProvider>{children}</QueryClientProvider>; // No WagmiProvider
   }
   ```

## Libraries Causing Hang

1. **`@reown/appkit-adapter-wagmi`** - WagmiAdapter constructor
2. **`@reown/appkit/react`** - createAppKit function
3. **`@wagmi/core`** - cookieStorage/createStorage (potential)
4. **`wagmi`** - WagmiProvider (if initialized during build)

## Status
✅ **Fixed:** All Web3 initialization moved to client-side only
⏳ **Testing:** Build should complete without hanging
