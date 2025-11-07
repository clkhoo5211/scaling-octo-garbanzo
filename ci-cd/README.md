# CI/CD Configuration

This directory contains CI/CD pipeline configurations and deployment scripts.

## GitHub Actions Workflows

All workflows are located in `.github/workflows/`:

- **deploy.yml** - Deploy to GitHub Pages on push to main
- **ci.yml** - Code quality checks (lint, format, typecheck, test)
- **security.yml** - Security scanning (npm audit, Snyk)
- **dependabot.yml** - Auto-merge Dependabot PRs
- **pr-validation.yml** - Validate PR commit messages
- **issue-labeler.yml** - Auto-label issues

## Deployment

### GitHub Pages

The project is configured to deploy to GitHub Pages automatically on push to `main` branch.

**Required Secrets:**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_REOWN_PROJECT_ID`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

**Setup:**

1. Go to repository Settings → Pages
2. Enable GitHub Pages
3. Select source: "GitHub Actions"
4. Add required secrets in Settings → Secrets and variables → Actions

### Manual Deployment

```bash
# Build locally
npm run build

# Deploy to GitHub Pages (if using gh-pages)
npx gh-pages -d out
```

## Environment Variables

All environment variables must be set in GitHub Secrets for CI/CD to work.

See `.env.example` for required variables.
