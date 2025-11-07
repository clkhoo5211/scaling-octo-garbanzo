# 🔗 Integration Specifications
## Web3News - Blockchain Content Aggregator

**Created:** 2025-11-07  
**Design Agent:** System Architect  
**Status:** ✅ Complete  
**Next Agent:** Data Agent (`/data`)

---

## 🔌 INTEGRATION 1: REOWN APPKIT

### Purpose
Web3 authentication and wallet management (PRIMARY authentication)

### Configuration

**File:** `lib/config/reown.ts`

```typescript
import { createAppKit } from '@reown/appkit/react';
import { Ethereum, Polygon, BSC, Arbitrum, Optimism, Base } from '@reown/appkit/networks';

export const appKit = createAppKit({
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!,
  metadata: {
    name: 'Web3News',
    description: 'Decentralized news aggregation with crypto-powered rewards',
    url: 'https://web3news.xyz',
    icons: ['/icon-192.png', '/icon-512.png'],
  },
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'twitter', 'discord', 'github'],
    emailShowWallets: true,
  },
  networks: [
    Ethereum,
    Polygon,
    BSC,
    Arbitrum,
    Optimism,
    Base,
  ],
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#6366F1',
    '--w3m-background': '#0F172A',
  },
});
```

### Provider Setup

**File:** `app/providers.tsx`

```typescript
'use client';

import { AppKitProvider } from '@reown/appkit/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/nextjs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppKitProvider>
      <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ClerkProvider>
    </AppKitProvider>
  );
}
```

### Functions

**`connectWallet()`**
```typescript
import { useAppKit } from '@reown/appkit/react';

export function useConnectWallet() {
  const { open } = useAppKit();
  
  const connect = async () => {
    await open();
  };
  
  return { connect };
}
```

**`getAccount()`**
```typescript
export function useAccount() {
  const { address, isConnected } = useAppKit();
  return { address, isConnected };
}
```

**`switchChain()`**
```typescript
export function useSwitchChain() {
  const { setChain } = useAppKit();
  
  const switchChain = async (chainId: number) => {
    await setChain({ chainId });
  };
  
  return { switchChain };
}
```

### Error Handling
- Retry logic: 3 retries with exponential backoff
- Fallback: Email login if social login fails
- Error logging: Console + error tracking service

---

## 🔐 INTEGRATION 2: CLERK

### Purpose
User management and subscriptions (SECONDARY authentication)

### Configuration

**File:** `lib/config/clerk.ts`

```typescript
import { ClerkProvider } from '@clerk/nextjs';

export const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  appearance: {
    theme: 'dark',
    variables: {
      colorPrimary: '#6366F1',
      colorBackground: '#0F172A',
    },
  },
};
```

### Provider Setup

**File:** `app/layout.tsx`

```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider {...clerkConfig}>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Functions

**`getUser()`**
```typescript
import { useUser } from '@clerk/nextjs';

export function useClerkUser() {
  const { user, isLoaded, isSignedIn } = useUser();
  return { user, isLoaded, isSignedIn };
}
```

**`updateUserMetadata()`**
```typescript
export async function updateUserMetadata(metadata: Record<string, any>) {
  const { user } = useUser();
  if (!user) throw new Error('Not authenticated');
  
  await user.update({
    unsafeMetadata: {
      ...user.unsafeMetadata,
      ...metadata,
    },
  });
}
```

**`getSubscriptionTier()`**
```typescript
export function useSubscriptionTier() {
  const { user } = useUser();
  const tier = user?.unsafeMetadata?.subscription_tier as 'free' | 'pro' | 'premium' | undefined;
  return tier || 'free';
}
```

### Webhook Integration

**File:** `app/api/webhooks/clerk/route.ts`

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');
  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error', { status: 400 });
  }
  
  const payload = await req.json();
  const body = JSON.stringify(payload);
  
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  
  let evt: any;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    return new Response('Error', { status: 400 });
  }
  
  // Handle user.created event
  if (evt.type === 'user.created') {
    const { id, email_addresses } = evt.data;
    // Link wallet address to Clerk user metadata
    // (if wallet address available from Reown)
  }
  
  return new Response('OK', { status: 200 });
}
```

### Error Handling
- Retry logic: 3 retries with exponential backoff
- Error logging: Console + error tracking service
- Fallback: Manual user creation if webhook fails

---

## 🗄️ INTEGRATION 3: SUPABASE

### Purpose
Content database (no users table)

### Configuration

**File:** `lib/config/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Functions

**`queryTable()`**
```typescript
export async function queryTable<T>(
  table: string,
  filters?: Record<string, any>
): Promise<T[]> {
  let query = supabase.from(table).select('*');
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data as T[];
}
```

**`insertRow()`**
```typescript
export async function insertRow<T>(
  table: string,
  row: Partial<T>
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .insert(row)
    .select()
    .single();
  
  if (error) throw error;
  return data as T;
}
```

**`realtimeSubscription()`**
```typescript
export function useRealtimeSubscription<T>(
  table: string,
  callback: (payload: any) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table,
      }, callback)
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback]);
}
```

### Error Handling
- Retry logic: 3 retries with exponential backoff
- Error logging: Console + Supabase error tracking
- Fallback: IndexedDB cache on Supabase failure

---

## 🌐 INTEGRATION 4: EXTERNAL CONTENT APIs

### Purpose
Aggregate content from 30+ sources

### Rate Limiting

**File:** `lib/services/rateLimiter.ts`

```typescript
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  async wait(source: string, limit = 10, window = 60000): Promise<void> {
    const now = Date.now();
    const requests = this.requests.get(source) || [];
    
    // Remove old requests (outside window)
    const recentRequests = requests.filter(time => now - time < window);
    
    if (recentRequests.length >= limit) {
      const oldestRequest = recentRequests[0];
      const waitTime = window - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(source, recentRequests);
  }
}

export const rateLimiter = new RateLimiter();
```

### CORS Proxy

**File:** `lib/services/corsProxy.ts`

```typescript
const CORS_PROXY = process.env.NEXT_PUBLIC_CORS_PROXY || 'https://cors-anywhere.herokuapp.com/';

export async function fetchWithCORS(url: string): Promise<Response> {
  // Check if CORS is needed
  try {
    const response = await fetch(url, { mode: 'cors' });
    return response;
  } catch (error) {
    // Use CORS proxy as fallback
    return fetch(`${CORS_PROXY}${url}`);
  }
}
```

### Error Handling
- Retry logic: 3 retries with exponential backoff
- Fallback: Cached data from IndexedDB
- Error logging: Console + error tracking service

---

## ✅ INTEGRATION SPECIFICATIONS COMPLETE

**Status:** ✅ Integration Specifications Complete  
**Next:** Security and Performance Architecture  
**Next Agent:** Data Agent (`/data`) - After design approval

**Total Integrations:** 4 major integrations  
**Integration Types:** Authentication (Reown, Clerk), Database (Supabase), External APIs (30+ sources)

