# Live Site MCP Verification Guide

**Site URL:** https://clkhoo5211.github.io/scaling-octo-garbanzo/

## 🔍 How to Verify MCP Server Usage

### Method 1: Browser Console (Recommended)

1. **Open the site** in your browser:
   ```
   https://clkhoo5211.github.io/scaling-octo-garbanzo/
   ```

2. **Open Developer Tools:**
   - Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
   - Or right-click → "Inspect"

3. **Run Verification Script:**
   - Copy the contents of `verify-mcp-live-site.js`
   - Paste into Console tab
   - Press Enter
   - Review the output

### Method 2: Check Console Logs

Look for these log messages when you switch categories:

**✅ If MCP is Working:**
```
[RSS] Attempting MCP category fetch for tech...
[MCP] Fetching news by category tech...
[RSS] ✅ MCP category fetch succeeded for tech: 25 articles
```

**❌ If MCP is NOT Working:**
```
[RSS] Attempting MCP category fetch for tech...
[RSS] ⚠️ MCP category fetch failed for tech: ... Falling back to individual RSS feeds...
```

### Method 3: Network Tab Inspection

1. **Open Network Tab** in DevTools
2. **Filter by:** `web3news-mcp-server` or `Fetch/XHR`
3. **Switch categories** (Tech, Crypto, Business, etc.)
4. **Look for POST requests** to:
   ```
   https://web3news-mcp-server.vercel.app/api/server
   ```

5. **Check Request Details:**
   - **Method:** POST
   - **Request Payload:** Should contain:
     ```json
     {
       "method": "tools/call",
       "params": {
         "name": "get_news_by_category",
         "arguments": {
           "category": "tech",
           "max_items_per_source": 5
         }
       }
     }
     ```
   - **Response:** Should contain articles in JSON format

### Method 4: Quick Environment Check

Run this in browser console:

```javascript
// Check MCP configuration
console.log('MCP Server URL:', import.meta.env.VITE_MCP_SERVER_URL);
console.log('MCP Category Fetch:', import.meta.env.VITE_USE_MCP_CATEGORY_FETCH);
```

**Expected Output:**
- `MCP Server URL:` Should show `https://web3news-mcp-server.vercel.app/api/server`
- `MCP Category Fetch:` Should show `true` or `undefined` (defaults to true)

### Method 5: Direct MCP Test

Test MCP server directly from browser console:

```javascript
fetch('https://web3news-mcp-server.vercel.app/api/server', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'get_news_by_category',
      arguments: { category: 'tech', max_items_per_source: 2 }
    }
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ MCP Server Response:', data);
  const text = data.result?.content?.[0]?.text || '';
  console.log('Articles found:', text.includes('##') ? 'Yes' : 'No');
  console.log('Response preview:', text.substring(0, 200));
})
.catch(err => console.error('❌ MCP Server Error:', err));
```

## ✅ Expected Behavior

### If MCP is Working Correctly:

1. **Console Logs:**
   - `[RSS] Attempting MCP category fetch for [category]...`
   - `[RSS] ✅ MCP category fetch succeeded for [category]: X articles`

2. **Network Requests:**
   - POST requests to `web3news-mcp-server.vercel.app`
   - Request contains `get_news_by_category` tool call
   - Response contains articles

3. **Article Count:**
   - Should see 20-50 articles per category
   - Articles from multiple sources
   - Recent publication dates

### If MCP is NOT Working:

1. **Console Logs:**
   - `[RSS] ⚠️ MCP category fetch failed...`
   - `Falling back to individual RSS feeds...`

2. **Network Requests:**
   - No requests to `web3news-mcp-server.vercel.app`
   - Direct RSS feed fetches instead
   - May see CORS errors

3. **Article Count:**
   - Fewer articles (only from CORS-allowed feeds)
   - May see "Failed to fetch" errors

## 🔧 Troubleshooting

### Issue: No MCP Requests in Network Tab

**Possible Causes:**
1. `VITE_MCP_SERVER_URL` not set in GitHub Secrets
2. Site not rebuilt after adding secret
3. MCP category fetch disabled

**Solution:**
1. Check GitHub Secrets: Settings → Secrets → Actions
2. Verify `VITE_MCP_SERVER_URL` is set
3. Trigger new deployment (push a commit)

### Issue: MCP Requests Fail

**Possible Causes:**
1. MCP server is down
2. CORS issues
3. Network timeout

**Solution:**
1. Test MCP server directly: `https://web3news-mcp-server.vercel.app/api/server`
2. Check Vercel deployment status
3. Verify MCP server logs

### Issue: Using Default MCP URL

**Check:**
```javascript
console.log('MCP URL:', import.meta.env.VITE_MCP_SERVER_URL);
```

If it shows `undefined`, the GitHub Secret is not set.

## 📊 Verification Checklist

- [ ] Open site: https://clkhoo5211.github.io/scaling-octo-garbanzo/
- [ ] Open Developer Tools (F12)
- [ ] Check Console for MCP logs
- [ ] Check Network tab for MCP requests
- [ ] Switch categories and verify MCP calls
- [ ] Verify articles are loading
- [ ] Check article sources match MCP server sources

## 🎯 Quick Verification

**Fastest way to check:**

1. Open site → F12 → Console tab
2. Switch to "Tech" category
3. Look for: `[RSS] ✅ MCP category fetch succeeded for tech`
4. If you see this → ✅ MCP is working!
5. If you see: `Falling back to individual RSS feeds` → ⚠️ MCP not working

## 📝 Notes

- MCP requests only happen when switching categories
- First load may use cached articles
- Clear cache and reload to see fresh MCP requests
- Network tab shows all HTTP requests (including MCP)
