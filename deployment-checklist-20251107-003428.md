# Deployment Checklist
## Web3News - Blockchain Content Aggregator

**Created:** 2025-11-07  
**Status:** Ready for DevOps Phase  
**Next Agent:** DevOps Agent (`/devops`)

---

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] Create `.env.local` file from `.env.example`
- [ ] Configure Supabase credentials:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Configure Reown AppKit:
  - [ ] `NEXT_PUBLIC_REOWN_PROJECT_ID`
- [ ] Configure Clerk:
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - [ ] `CLERK_SECRET_KEY` (if needed)
- [ ] Optional API tokens:
  - [ ] `NEXT_PUBLIC_PRODUCT_HUNT_TOKEN`
  - [ ] `NEXT_PUBLIC_GITHUB_TOKEN`

### Database Setup
- [ ] Create Supabase project
- [ ] Run database schema migration (`database-schema-20251107-003428.sql`)
- [ ] Configure Row Level Security (RLS) policies
- [ ] Set up database indexes for performance
- [ ] Configure Supabase Realtime for messaging

### Build Verification
- [ ] Run `npm run build` successfully
- [ ] Verify static export generates `out/` directory
- [ ] Check for build warnings/errors
- [ ] Verify all environment variables are accessible
- [ ] Test PWA manifest generation
- [ ] Verify Service Worker registration

### Code Quality
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run typecheck` - no TypeScript errors
- [ ] Run `npm run format:check` - code formatted
- [ ] Run `npm run test` - all tests passing
- [ ] Review test coverage report

### PWA Configuration
- [ ] Verify `manifest.json` is generated correctly
- [ ] Check PWA icons (192x192, 512x512) exist
- [ ] Test Service Worker registration
- [ ] Verify offline functionality
- [ ] Test background sync
- [ ] Verify push notification setup (if enabled)

---

## 🚀 Deployment Platforms

### Option 1: Vercel (Recommended for Next.js)

**Configuration:** `vercel.json` created

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Configure environment variables in Vercel dashboard
5. Set up custom domain (optional)

**Environment Variables:**
- Add all `NEXT_PUBLIC_*` variables in Vercel dashboard
- Set `NODE_ENV=production`

**Features:**
- Automatic HTTPS
- CDN distribution
- Edge functions support
- Analytics included

---

### Option 2: Netlify

**Configuration:** `netlify.toml` created

**Steps:**
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Login: `netlify login`
3. Deploy: `netlify deploy --prod`
4. Configure environment variables in Netlify dashboard
5. Set up custom domain (optional)

**Environment Variables:**
- Add all `NEXT_PUBLIC_*` variables in Netlify dashboard
- Set `NODE_ENV=production`

**Features:**
- Automatic HTTPS
- CDN distribution
- Form handling
- Split testing

---

### Option 3: GitHub Pages

**Configuration:** `.github/workflows/deploy.yml` (to be created by DevOps agent)

**Steps:**
1. Enable GitHub Pages in repository settings
2. Configure GitHub Actions secrets:
   - `REOWN_PROJECT_ID`
   - `CLERK_PUBLISHABLE_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Push to `main` branch (triggers deployment)
4. Configure custom domain (optional)

**Features:**
- Free hosting
- Automatic deployments on push
- Custom domain support
- HTTPS via Let's Encrypt

---

## 🔧 Post-Deployment Verification

### Functionality Tests
- [ ] Homepage loads correctly
- [ ] Article feed displays articles
- [ ] Search functionality works
- [ ] Authentication flow (Reown + Clerk) works
- [ ] Wallet connection works
- [ ] Article reader view works
- [ ] Bookmark functionality works
- [ ] Points system displays correctly
- [ ] Governance page loads
- [ ] Auctions page loads
- [ ] Messaging interface works (if enabled)

### Performance Tests
- [ ] Lighthouse score > 90 (Performance)
- [ ] Lighthouse score > 90 (Accessibility)
- [ ] Lighthouse score > 90 (Best Practices)
- [ ] Lighthouse score > 90 (SEO)
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s
- [ ] Cumulative Layout Shift < 0.1

### PWA Tests
- [ ] App installable on mobile
- [ ] App installable on desktop
- [ ] Offline mode works
- [ ] Service Worker updates correctly
- [ ] Push notifications work (if enabled)
- [ ] Background sync works

### Security Tests
- [ ] HTTPS enabled
- [ ] Environment variables not exposed
- [ ] CORS configured correctly
- [ ] Content Security Policy configured
- [ ] No sensitive data in client-side code

---

## 📊 Monitoring Setup

### Analytics
- [ ] Supabase Analytics configured
- [ ] Clerk Analytics configured
- [ ] Dune Analytics configured (on-chain metrics)
- [ ] Error tracking configured (optional: Sentry)

### Logging
- [ ] Error logging configured
- [ ] Performance monitoring configured
- [ ] User activity tracking configured

---

## 🔐 Security Checklist

- [ ] All API keys secured (not in client code)
- [ ] Supabase RLS policies configured
- [ ] CORS configured correctly
- [ ] Content Security Policy headers set
- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] No sensitive data in build output

---

## 📝 Documentation Updates

- [ ] Update README with deployment URL
- [ ] Document environment variable setup
- [ ] Create deployment guide
- [ ] Document troubleshooting steps
- [ ] Update API documentation with production URLs

---

## 🎯 Success Criteria

- ✅ Application builds successfully
- ✅ All pages load without errors
- ✅ Authentication works
- ✅ PWA installable and functional
- ✅ Performance scores meet targets
- ✅ No security vulnerabilities
- ✅ Monitoring configured
- ✅ Documentation complete

---

## 🚨 Rollback Plan

If deployment fails:
1. Revert to previous working commit
2. Check build logs for errors
3. Verify environment variables
4. Test locally before redeploying
5. Document issues in `change-log.md`

---

## 📞 Support

For deployment issues:
1. Check build logs
2. Verify environment variables
3. Review error messages
4. Check Service Worker registration
5. Verify PWA manifest

---

**Next Steps:**
1. Complete DevOps agent setup (`/devops`)
2. Configure CI/CD pipelines
3. Set up monitoring
4. Deploy to staging environment
5. Deploy to production

