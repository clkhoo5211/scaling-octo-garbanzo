# Reown AppKit Fix & Country-Specific News Implementation

## Summary

Fixed the Reown AppKit "W3mFrame: iframe is not set" error and implemented country-specific news based on IP geolocation detection.

## 1. Reown AppKit Fix ✅

### Problem
- Error: `W3mFrame: iframe is not set`
- Error: `SwitchChainError: An error occurred when attempting to switch chain`
- AppKit modal wasn't initializing properly

### Root Cause
The `AppKitProvider` component was missing from the provider tree. Reown AppKit requires `AppKitProvider` to wrap components that use `useAppKit` hooks to initialize the W3mFrame iframe.

### Solution
1. **Added AppKitProvider** to `src/app/providers.tsx`:
   - Wraps all children components that use `useAppKit` hooks
   - Only renders on client-side (after mount) to prevent SSR issues
   - Properly initializes the W3mFrame iframe

2. **Updated Provider Structure**:
   ```tsx
   <ContextProvider>
     <AppKitProvider> {/* NEW - Initializes W3mFrame iframe */}
       <ClerkProvider>
         <ReownClerkIntegration>
           <ToastProvider>
             {children}
           </ToastProvider>
         </ReownClerkIntegration>
       </ClerkProvider>
     </AppKitProvider>
   </ContextProvider>
   ```

### Files Changed
- `src/app/providers.tsx` - Added AppKitProvider wrapper
- `context/index.tsx` - Exported appKit instance

## 2. Country-Specific News Implementation ✅

### Features
- **IP Geolocation Detection**: Automatically detects user's country from IP address
- **Country-Specific RSS Sources**: Adds local news sources based on detected country
- **Caching**: Geolocation results cached for 24 hours to reduce API calls
- **Fallback**: Defaults to US news if detection fails

### Implementation

#### 1. Geolocation API Route (`/api/geolocation`)
- Detects country from IP address
- Uses free IP geolocation services:
  - Primary: `ipapi.co` (1000 requests/day)
  - Fallback: `ip-api.com` (45 requests/minute)
- Returns country code, country name, and IP

#### 2. Country News Sources (`src/lib/sources/rss/country.ts`)
Added RSS sources for 10 major countries:
- **US**: ABC News, CBS News, NBC News, USA Today
- **UK**: BBC UK, The Guardian UK, Sky News UK
- **Canada**: CBC News, CTV News
- **Australia**: ABC Australia, SBS News
- **India**: Times of India, The Hindu
- **Germany**: DW News (DE), Der Spiegel
- **France**: France 24, Le Monde
- **Japan**: NHK World, Japan Times
- **China**: Xinhua News, China Daily
- **Brazil**: BBC Brasil, Folha de S.Paulo

#### 3. Geolocation Hook (`src/lib/hooks/useGeolocation.ts`)
- Client-side hook to detect user's country
- Caches result in localStorage (24 hours)
- Returns `{ geolocation, isLoading }`

#### 4. RSS API Integration (`src/app/api/rss/route.ts`)
- When fetching "general" category, automatically adds country-specific sources
- Detects country from request headers/IP
- Merges country sources with general sources

### Usage

#### Client-Side Detection
```tsx
import { useGeolocation } from '@/lib/hooks/useGeolocation';

function MyComponent() {
  const { geolocation, isLoading } = useGeolocation();
  
  if (isLoading) return <div>Detecting location...</div>;
  
  return (
    <div>
      Your country: {geolocation?.countryName} ({geolocation?.countryCode})
    </div>
  );
}
```

#### Server-Side Detection (API Route)
The RSS API route automatically detects country and adds country-specific sources:
```
GET /api/rss?category=general
```

Or manually specify country:
```
GET /api/rss?category=general&country=GB
```

### How It Works

1. **User visits site** → Client-side hook detects country via `/api/geolocation`
2. **Country detected** → Result cached in localStorage for 24 hours
3. **User views "General" category** → Server-side RSS API detects country from IP
4. **Country sources added** → Local news sources merged with general sources
5. **Articles displayed** → User sees mix of international + local news

### Benefits

1. **Personalized Content**: Users see news relevant to their location
2. **Better Coverage**: More sources = more articles
3. **Automatic Detection**: No user input required
4. **Performance**: Caching reduces API calls
5. **Fallback**: Always works even if detection fails

### Supported Countries

Currently supports 10 countries with 2-4 news sources each:
- 🇺🇸 United States (4 sources)
- 🇬🇧 United Kingdom (3 sources)
- 🇨🇦 Canada (2 sources)
- 🇦🇺 Australia (2 sources)
- 🇮🇳 India (2 sources)
- 🇩🇪 Germany (2 sources)
- 🇫🇷 France (2 sources)
- 🇯🇵 Japan (2 sources)
- 🇨🇳 China (2 sources)
- 🇧🇷 Brazil (2 sources)

### Future Enhancements

- Add more countries (Spain, Italy, Mexico, etc.)
- Add country-specific categories (not just "general")
- Allow users to manually select country
- Show country badge in UI
- Add "Local" category tab

## Testing

### Test Reown Fix
1. Open browser console
2. Click "Connect to Sign In" button
3. Verify: No "W3mFrame: iframe is not set" error
4. Verify: AppKit modal opens correctly

### Test Country Detection
1. Visit site
2. Check browser console for geolocation logs
3. Check localStorage for `web3news_geolocation` key
4. View "General" category
5. Verify: Country-specific sources are included

## Files Created/Modified

### Created
- `src/app/api/geolocation/route.ts` - IP geolocation API
- `src/lib/hooks/useGeolocation.ts` - Geolocation hook
- `src/lib/sources/rss/country.ts` - Country-specific RSS sources

### Modified
- `src/app/providers.tsx` - Added AppKitProvider
- `context/index.tsx` - Exported appKit instance
- `src/app/api/rss/route.ts` - Added country detection and source merging

## Status

✅ **Reown AppKit Fix**: Complete - AppKitProvider properly wraps components
✅ **Country Detection**: Complete - IP geolocation working
✅ **Country Sources**: Complete - 10 countries with 20+ sources
✅ **Integration**: Complete - Automatically adds country sources to "general" category

All changes compile successfully! 🚀

