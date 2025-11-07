# Chinese Platforms API Guide

**Last Updated:** 2025-01-XX  
**Research Method:** Online web search + GitHub exploration  
**Sources:** Multiple web searches, GitHub projects, platform documentation

## 📊 Platform API Status Summary

| Platform | Free API? | RSS Feed? | Status | Notes |
|----------|-----------|-----------|--------|-------|
| **TechCrunch** | ❌ No API | ✅ **YES** (Free RSS) | ✅ **Already Implemented** | RSS feed available |
| **知乎 (Zhihu)** | ❌ No Official API | ❌ No RSS | ❌ Not Available | Only unofficial/paid options |
| **微博 (Weibo)** | ⚠️ Official API (Requires Approval) | ❌ No RSS | ⚠️ Possible with Registration | May have fees/limits |
| **小红书 (Xiaohongshu)** | ❌ No Official API | ❌ No RSS | ❌ Not Available | Only unofficial/paid options |

---

## ✅ TechCrunch

**Status:** ✅ **Already Implemented**

**Free RSS Feed:** ✅ Yes
- URL: `https://techcrunch.com/feed/`
- Status: ✅ Currently active in `src/lib/sources/rss/tech.ts`
- Update Frequency: 15 minutes
- Max Articles: 20

**Implementation:**
```typescript
// Already in: src/lib/sources/rss/tech.ts
export const techCrunchSource = new BaseRSSSource({
  id: "techcrunch",
  name: "TechCrunch",
  url: "https://techcrunch.com/feed/",
  category: "tech",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});
```

**Note:** TechCrunch does NOT provide a public REST API, but RSS feed is free and working.

---

## ❌ 知乎 (Zhihu)

**Status:** ❌ **No Official Public API**

**Research Findings (2024-2025):**
- ✅ **Confirmed:** Zhihu does NOT provide an official public API
- ✅ **Confirmed:** No official developer platform (no open.zhihu.com)
- ✅ **Confirmed:** No official RSS feeds available
- ⚠️ **Found:** Unofficial APIs exist on GitHub:
  - `justoneapi` - Multi-platform data API (includes Zhihu)
  - `MoreAPI` - Non-official RESTful API platform
  - Various scraping tools and projects

**Official API:** ❌ No
- Multiple sources confirm: No official public API
- No developer platform available
- Only available through internal partnerships (not public)

**RSS Feed:** ❌ No
- No official RSS feed available
- No alternative RSS methods found

**Unofficial Options Found:**
- ⚠️ `justoneapi` (GitHub: scrapyman/data-api)
- ⚠️ `MoreAPI` (GitHub: liulu1550/MoreAPI)
- ⚠️ Various scraping tools

**Risks of Unofficial APIs:**
- ❌ **Violates Terms of Service** - Not authorized by Zhihu
- ❌ **Legal/compliance issues** - May violate Chinese regulations
- ❌ **Unstable** - Can break anytime due to anti-scraping measures
- ❌ **Data accuracy** - May be incomplete or inaccurate
- ❌ **IP blocking** - Risk of being blocked by platform

**Research Sources:**
- Multiple web searches confirm no official API
- GitHub projects show only unofficial solutions
- No official developer documentation found

**Recommendation:** ❌ **Do NOT implement** - No official API, only risky unofficial options

---

## ⚠️ 微博 (Weibo)

**Status:** ⚠️ **Possible but Requires Registration**

**Official API:** ⚠️ Yes (with restrictions)
- **Weibo Open Platform:** https://open.weibo.com/
- Requires developer account registration
- Requires application approval
- May have usage fees/limits
- Rate limiting applies

**RSS Feed:** ❌ No official RSS feed

**API Access Steps:**
1. Register at https://open.weibo.com/
2. Create an application
3. Get API keys (App Key, App Secret)
4. Request access permissions
5. Implement OAuth authentication
6. Follow rate limits and ToS

**API Endpoints Available:**
- Public timeline
- User timeline
- Search tweets
- User info
- Comments, likes, reposts

**Limitations:**
- ⚠️ Requires OAuth authentication
- ⚠️ Rate limits (varies by tier)
- ⚠️ May require payment for high volume
- ⚠️ Content restrictions (Chinese regulations)

**Recommendation:** ⚠️ **Possible but complex** - Requires:
- Developer account setup
- OAuth implementation
- Rate limit handling
- Compliance with Chinese regulations

**Alternative:** Use Weibo RSS aggregators (if available) or third-party services

---

## ❌ 小红书 (Xiaohongshu / Little Red Book)

**Status:** ❌ **No Official Public API**

**Research Findings (2024-2025):**
- ✅ **Confirmed:** Xiaohongshu does NOT provide an official public API
- ✅ **Confirmed:** No official developer platform (no open.xiaohongshu.com)
- ✅ **Confirmed:** No official RSS feeds available
- ⚠️ **Found:** Unofficial APIs exist on GitHub:
  - `MoreAPI` - Multi-platform API (includes Xiaohongshu)
  - `justoneapi` - Data API service
  - `hkcityu/xiaohongshu` - GitHub project for Xiaohongshu data
  - Various scraping tools

**Official API:** ❌ No
- Multiple sources confirm: No official public API
- No developer platform available
- Content is heavily protected (anti-scraping measures)

**RSS Feed:** ❌ No
- No official RSS feed available
- No alternative RSS methods found

**Unofficial Options Found:**
- ⚠️ `MoreAPI` (GitHub: liulu1550/MoreAPI) - Supports Xiaohongshu
- ⚠️ `justoneapi` (GitHub: scrapyman/data-api)
- ⚠️ `hkcityu/xiaohongshu` (GitHub) - Specific Xiaohongshu scraper
- ⚠️ Various Python scraping libraries

**Risks of Unofficial APIs:**
- ❌ **High risk** - Violates Terms of Service (not authorized)
- ❌ **Legal/compliance issues** - Chinese platform regulations
- ❌ **Anti-scraping measures** - Captcha, IP blocking, rate limiting
- ❌ **Unstable** - Can break anytime due to platform updates
- ❌ **Data accuracy** - May be incomplete or inaccurate
- ❌ **Authentication required** - May need login/session management

**Research Sources:**
- Multiple web searches confirm no official API
- GitHub projects show only unofficial scraping solutions
- No official developer documentation found
- All solutions require web scraping (violates ToS)

**Recommendation:** ❌ **Do NOT implement** - No official API, high risk, violates ToS

---

## 🎯 Recommendations

### ✅ **Can Implement Now:**
1. **TechCrunch** - ✅ Already implemented via RSS

### ⚠️ **Possible but Complex:**
1. **微博 (Weibo)** - Requires:
   - Developer account registration
   - OAuth implementation
   - API key management
   - Rate limit handling
   - Compliance considerations

### ❌ **Should NOT Implement:**
1. **知乎 (Zhihu)** - No official API, only unofficial/risky options
2. **小红书 (Xiaohongshu)** - No official API, high risk of ToS violation

---

## 🔄 Alternative Approaches

### For Chinese Content:

1. **Use RSS Aggregators:**
   - Some Chinese news sites may have RSS feeds
   - Check individual sites for RSS availability

2. **Use Official APIs Only:**
   - Only implement platforms with official APIs
   - Follow all ToS and rate limits

3. **Partner with Content Providers:**
   - Contact platforms directly for partnership
   - May require business agreements

4. **Focus on International Sources:**
   - Many international platforms have free RSS feeds
   - More reliable and compliant

---

## 📝 Implementation Priority

### High Priority (Free & Reliable):
- ✅ TechCrunch (already done)
- ✅ Other RSS feeds (BBC, Reuters, etc. - already done)

### Medium Priority (Requires Setup):
- ⚠️ Weibo (if user wants Chinese social content)

### Low Priority (Not Recommended):
- ❌ Zhihu (no official API)
- ❌ Xiaohongshu (no official API, high risk)

---

## 🔗 Useful Links

- **Weibo Open Platform:** https://open.weibo.com/
- **TechCrunch RSS:** https://techcrunch.com/feed/
- **Weibo API Docs:** https://open.weibo.com/wiki/API

---

## ⚠️ Legal Disclaimer

**Important:** Using unofficial APIs or web scraping may:
- Violate platform Terms of Service
- Result in IP bans or legal action
- Be unreliable and break without notice
- Require complex authentication/captcha handling

**Recommendation:** Only use official APIs with proper authentication and compliance.

---

## 📚 Research Methodology

**Research Conducted:**
1. ✅ Multiple web searches for official APIs
2. ✅ Checked for developer platforms (open.zhihu.com, open.xiaohongshu.com)
3. ✅ Searched GitHub for unofficial solutions
4. ✅ Checked for RSS feed availability
5. ✅ Reviewed platform documentation

**Findings:**
- **知乎 (Zhihu):** No official API confirmed by multiple sources
- **小红书 (Xiaohongshu):** No official API confirmed by multiple sources
- **微博 (Weibo):** Official API exists but requires registration
- **TechCrunch:** RSS feed available (already implemented)

**Unofficial Solutions Found:**
- GitHub projects: `MoreAPI`, `justoneapi`, `hkcityu/xiaohongshu`
- All require web scraping (violates ToS)
- Not recommended for production use

**Note:** If you find official APIs for these platforms, please let me know and I'll update this guide!

