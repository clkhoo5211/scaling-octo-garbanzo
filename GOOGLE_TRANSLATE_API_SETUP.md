# How to Get Google Translate API Key

## Step-by-Step Guide

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 2. Create a New Project (or Select Existing)
- Click the project dropdown at the top
- Click "New Project"
- Enter project name: `web3news-translator` (or any name)
- Click "Create"
- Wait for project creation (takes a few seconds)
- Select the new project from the dropdown

### 3. Enable Cloud Translation API
- Go to: https://console.cloud.google.com/apis/library/translate.googleapis.com
- Or search for "Cloud Translation API" in the API Library
- Click "Enable"
- Wait for API to be enabled (takes a few seconds)

### 4. Set Up Billing (Required)
⚠️ **Note**: Translation API requires billing, but you get FREE tier:
- FREE: 500,000 characters/month
- After free tier: $20 per 1 million characters

**Steps:**
- Go to: https://console.cloud.google.com/billing
- Click "Link a billing account" or "Create billing account"
- Fill in billing information (credit card required)
- Select your project and link it to billing account

### 5. Create API Key
- Go to: https://console.cloud.google.com/apis/credentials
- Click "Create Credentials" → "API Key"
- Copy the API key (you'll see it in a popup)
- ⚠️ **IMPORTANT**: Click "Restrict Key" to secure it

### 6. Restrict API Key (Recommended for Security)
- Click "Restrict Key" button
- Under "API restrictions":
  - Select "Restrict key"
  - Check only "Cloud Translation API"
- Under "Application restrictions":
  - Select "HTTP referrers (web sites)"
  - Add your domain(s):
    - `http://localhost:*` (for local development)
    - `https://clkhoo5211.github.io/*` (for GitHub Pages)
    - `https://yourdomain.com/*` (if you have custom domain)
- Click "Save"

### 7. Add API Key to Your Project

**For Local Development (.env file):**
```bash
# Create .env file in project root
VITE_GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

**For GitHub Pages (GitHub Secrets):**
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `VITE_GOOGLE_TRANSLATE_API_KEY`
5. Value: Paste your API key
6. Click "Add secret"

**For Vercel/Netlify:**
1. Go to your project settings
2. Environment Variables
3. Add: `VITE_GOOGLE_TRANSLATE_API_KEY` = `your_api_key_here`
4. Save

## Cost Estimate

**FREE Tier:**
- 500,000 characters/month = FREE
- Estimated usage: ~5,000 articles × 100 chars = 500k/month ✅

**If you exceed free tier:**
- $20 per 1 million characters
- Very unlikely for MVP stage

## Security Best Practices

1. ✅ **Always restrict API key** to specific APIs
2. ✅ **Add HTTP referrer restrictions** to prevent unauthorized use
3. ✅ **Never commit API key** to Git (use .env or secrets)
4. ✅ **Monitor usage** in Google Cloud Console
5. ✅ **Set up billing alerts** to avoid unexpected charges

## Testing Your API Key

After adding the key, test it:

```bash
# In your project directory
npm run dev

# Open browser console and try translating an article
# You should see translation working without errors
```

## Troubleshooting

**Error: "API key not valid"**
- Check API key is correct (no extra spaces)
- Verify Translation API is enabled
- Check API key restrictions allow your domain

**Error: "Billing not enabled"**
- Translation API requires billing account
- Even with free tier, billing must be set up

**Error: "Quota exceeded"**
- You've exceeded 500k chars/month free tier
- Check usage in Google Cloud Console
- Consider upgrading or optimizing translations

## Useful Links

- Google Cloud Console: https://console.cloud.google.com/
- Translation API Docs: https://cloud.google.com/translate/docs
- Pricing: https://cloud.google.com/translate/pricing
- API Key Management: https://console.cloud.google.com/apis/credentials

