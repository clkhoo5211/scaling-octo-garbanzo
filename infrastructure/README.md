# Infrastructure Configuration

This directory contains infrastructure as code configurations and deployment scripts.

## Architecture

- **Type**: Static Site (Next.js static export)
- **Hosting**: GitHub Pages (free tier)
- **CDN**: GitHub Pages CDN
- **Database**: Supabase (external service)
- **Authentication**: Clerk + Reown AppKit (external services)

## Deployment Platforms

### GitHub Pages (Primary)
- Free hosting
- Automatic HTTPS
- CDN distribution
- Automatic deployments via GitHub Actions

### Vercel (Alternative)
- Configuration: `vercel.json`
- Features: Edge functions, analytics, preview deployments

### Netlify (Alternative)
- Configuration: `netlify.toml`
- Features: Form handling, split testing, edge functions

## Environment Setup

### Development
- Local development server: `npm run dev`
- Environment file: `.env.local`

### Production
- Build command: `npm run build`
- Output directory: `out/`
- Environment variables: Set in GitHub Secrets

## Monitoring

### Application Monitoring
- Supabase Analytics (database metrics)
- Clerk Analytics (user metrics)
- Dune Analytics (on-chain metrics)

### Error Tracking
- Error logging via `errorHandler.ts`
- Future: Sentry integration (optional)

## Security

### Secrets Management
- GitHub Secrets for CI/CD
- Environment variables for build-time
- Supabase RLS for database security

### Security Scanning
- npm audit (weekly)
- Snyk security scan (optional)
- Dependabot for dependency updates

## Backup & Recovery

### Database
- Supabase automatic backups
- Point-in-time recovery (Supabase Pro)

### Code
- Git repository (GitHub)
- GitHub Actions artifacts

## Scaling

### Current Setup
- Static site (no server scaling needed)
- CDN caching via GitHub Pages
- Database scaling handled by Supabase

### Future Scaling
- Add CDN (CloudFlare) for better performance
- Database read replicas (Supabase Pro)
- Edge functions for dynamic content (Vercel)

