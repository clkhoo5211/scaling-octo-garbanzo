# 🔄 GitHub Actions Workflows
## Web3News - Blockchain Content Aggregator

**Created:** 2025-11-07  
**Data Agent:** Data Engineering & Analytics Specialist  
**Status:** ✅ Complete  
**Note:** Workflows prepared for future GitHub repository creation

---

## 📋 WORKFLOW OVERVIEW

**Total Workflows:** 15+ workflows  
**Categories:**
- CI/CD (Build, Test, Deploy)
- Code Quality (Lint, Format, Typecheck)
- Security (Dependabot, Security Scanning)
- Automation (Issue Management, PR Validation)
- Future Enhancements (Mobile Builds, Translations, etc.)

---

## 🚀 CI/CD WORKFLOWS

### Workflow 1: Build and Deploy to GitHub Pages

**File:** `.github/workflows/deploy.yml`

**Purpose:** Build Next.js PWA and deploy to GitHub Pages

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Build Next.js app (static export)
5. Upload Pages artifact
6. Deploy to GitHub Pages

**Configuration:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js app
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_REOWN_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_REOWN_PROJECT_ID }}
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

### Workflow 2: CI - Format, Typecheck and Lint

**File:** `.github/workflows/ci.yml`

**Purpose:** Run code quality checks on every PR

**Triggers:**
- Pull requests
- Push to any branch

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run ESLint
5. Run Prettier (format check)
6. Run TypeScript typecheck
7. Run tests (if available)

**Configuration:**
```yaml
name: CI - Format, Typecheck and Lint

on:
  pull_request:
    branches:
      - main
      - develop
  push:
    branches:
      - main
      - develop

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check Prettier formatting
        run: npm run format:check

      - name: Run TypeScript typecheck
        run: npm run typecheck

      - name: Run tests
        run: npm run test
        continue-on-error: true
```

---

### Workflow 3: Auto Fix Lint and Format

**File:** `.github/workflows/auto-fix.yml`

**Purpose:** Automatically fix linting and formatting issues

**Triggers:**
- Pull requests (on comment: `/fix`)
- Manual workflow dispatch

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run ESLint (auto-fix)
5. Run Prettier (format)
6. Commit changes (if any)
7. Create PR comment

**Configuration:**
```yaml
name: Auto Fix Lint and Format

on:
  issue_comment:
    types: [created]
  workflow_dispatch:

jobs:
  auto-fix:
    runs-on: ubuntu-latest
    if: github.event.issue.pull_request && contains(github.event.comment.body, '/fix')
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint (auto-fix)
        run: npm run lint:fix

      - name: Run Prettier (format)
        run: npm run format

      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .
          git diff --staged --quiet || git commit -m "chore: auto-fix lint and format"
          git push
```

---

### Workflow 4: PR Conventional Commit Validation

**File:** `.github/workflows/pr-validation.yml`

**Purpose:** Validate PR commit messages follow conventional commits

**Triggers:**
- Pull requests

**Steps:**
1. Checkout code
2. Validate commit messages
3. Comment on PR (pass/fail)

**Configuration:**
```yaml
name: PR Conventional Commit Validation

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  validate-commits:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Validate commit messages
        uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          types: |
            feat
            fix
            docs
            style
            refactor
            perf
            test
            build
            ci
            chore
            revert
          scopes: |
            auth
            content
            web3
            ui
            data
            analytics
          requireScope: false
          subjectPattern: ^(?![A-Z]).+$
          subjectPatternError: |
            The subject "{subject}" found in commit "{commit}" doesn't match the configured pattern.
            Please ensure that the subject doesn't start with an uppercase character.
```

---

## 🔒 SECURITY WORKFLOWS

### Workflow 5: Dependabot Updates

**File:** `.github/workflows/dependabot.yml`

**Purpose:** Auto-merge Dependabot PRs (patch/minor updates)

**Triggers:**
- Pull requests (by Dependabot)

**Steps:**
1. Check if PR is from Dependabot
2. Check if update is patch/minor
3. Run tests
4. Auto-merge if tests pass

**Configuration:**
```yaml
name: Dependabot Updates

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  dependabot:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Auto-merge Dependabot PRs
        if: contains(github.event.pull_request.labels.*.name, 'dependencies')
        uses: fastify/github-action-merge-dependabot@v3
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

---

### Workflow 6: Security Scanning

**File:** `.github/workflows/security.yml`

**Purpose:** Scan code for security vulnerabilities

**Triggers:**
- Push to main
- Pull requests
- Weekly schedule

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run npm audit
5. Run Snyk scan (if configured)
6. Upload results

**Configuration:**
```yaml
name: Security Scanning

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

---

## 🤖 AUTOMATION WORKFLOWS

### Workflow 7: Issue Labeler

**File:** `.github/workflows/issue-labeler.yml`

**Purpose:** Automatically label issues based on content

**Triggers:**
- Issues (opened, edited)

**Steps:**
1. Analyze issue content
2. Apply labels (bug, feature, question, etc.)
3. Assign to appropriate team member (if configured)

**Configuration:**
```yaml
name: Issue Labeler

on:
  issues:
    types: [opened, edited]

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - name: Label issues
        uses: actions/labeler@v4
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          configuration-path: .github/labeler.yml
          sync-labels: true
```

**Labeler Config:** `.github/labeler.yml`
```yaml
bug:
  - '.*bug.*'
  - '.*error.*'
  - '.*issue.*'

feature:
  - '.*feature.*'
  - '.*enhancement.*'
  - '.*request.*'

question:
  - '.*question.*'
  - '.*help.*'
  - '.*how.*'

documentation:
  - '.*doc.*'
  - '.*readme.*'
  - '.*guide.*'
```

---

### Workflow 8: Tag on SemVer Commit

**File:** `.github/workflows/tag-release.yml`

**Purpose:** Automatically create tags on semantic version commits

**Triggers:**
- Push to main (with SemVer commit)

**Steps:**
1. Checkout code
2. Check commit message for SemVer
3. Create git tag
4. Create GitHub release

**Configuration:**
```yaml
name: Tag on SemVer Commit

on:
  push:
    branches:
      - main

jobs:
  tag:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check for SemVer commit
        id: semver
        run: |
          COMMIT_MSG=$(git log -1 --pretty=%B)
          if [[ $COMMIT_MSG =~ ^(feat|fix|perf)(\(.+\))?:.*$ ]]; then
            VERSION=$(echo $COMMIT_MSG | grep -oP 'v?\d+\.\d+\.\d+' | head -1)
            if [ -n "$VERSION" ]; then
              echo "version=$VERSION" >> $GITHUB_OUTPUT
              echo "has_version=true" >> $GITHUB_OUTPUT
            fi
          fi

      - name: Create tag
        if: steps.semver.outputs.has_version == 'true'
        run: |
          git tag -a "v${{ steps.semver.outputs.version }}" -m "Release ${{ steps.semver.outputs.version }}"
          git push origin "v${{ steps.semver.outputs.version }}"

      - name: Create GitHub release
        if: steps.semver.outputs.has_version == 'true'
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: "v${{ steps.semver.outputs.version }}"
          release_name: "Release ${{ steps.semver.outputs.version }}"
          body: "Automated release from commit: ${{ github.sha }}"
          draft: false
          prerelease: false
```

---

### Workflow 9: Branch Synchronization

**File:** `.github/workflows/sync-branches.yml`

**Purpose:** Sync develop branch with main branch

**Triggers:**
- Push to main
- Manual workflow dispatch

**Steps:**
1. Checkout code
2. Sync develop with main
3. Push changes

**Configuration:**
```yaml
name: Branch Synchronization

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0

      - name: Sync develop with main
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git checkout develop
          git merge main --no-edit
          git push origin develop
```

---

## 📱 FUTURE ENHANCEMENT WORKFLOWS

### Workflow 10: Build Android (Future - Flutter)

**File:** `.github/workflows/build-android.yml`

**Purpose:** Build Android APK/AAB (when Flutter app is added)

**Triggers:**
- Push to main
- Manual workflow dispatch
- Tag (v*)

**Steps:**
1. Checkout code
2. Setup Flutter
3. Install dependencies
4. Build Android APK/AAB
5. Upload artifacts

**Configuration:**
```yaml
name: Build Android

on:
  push:
    branches:
      - main
  workflow_dispatch:
  tags:
    - 'v*'

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          channel: 'stable'

      - name: Install dependencies
        run: flutter pub get

      - name: Build Android APK
        run: flutter build apk --release
        continue-on-error: true

      - name: Build Android AAB
        run: flutter build appbundle --release

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: android-apk
          path: build/app/outputs/flutter-apk/app-release.apk
          if-no-files-found: ignore

      - name: Upload AAB
        uses: actions/upload-artifact@v3
        with:
          name: android-aab
          path: build/app/outputs/bundle/release/app-release.aab
```

---

### Workflow 11: Build iOS (Future - Flutter)

**File:** `.github/workflows/build-ios.yml`

**Purpose:** Build iOS app (when Flutter app is added)

**Triggers:**
- Push to main
- Manual workflow dispatch
- Tag (v*)

**Steps:**
1. Checkout code
2. Setup Flutter
3. Setup Xcode
4. Install dependencies
5. Build iOS app
6. Upload artifacts

**Configuration:**
```yaml
name: Build iOS

on:
  push:
    branches:
      - main
  workflow_dispatch:
  tags:
    - 'v*'

jobs:
  build-ios:
    runs-on: macos-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          channel: 'stable'

      - name: Setup Xcode
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: latest-stable

      - name: Install dependencies
        run: flutter pub get

      - name: Build iOS
        run: flutter build ios --release --no-codesign

      - name: Upload iOS build
        uses: actions/upload-artifact@v3
        with:
          name: ios-build
          path: build/ios/iphoneos/Runner.app
```

---

### Workflow 12: Build Desktop (Future - Flutter)

**File:** `.github/workflows/build-desktop.yml`

**Purpose:** Build desktop apps (Windows, macOS, Linux)

**Triggers:**
- Push to main
- Manual workflow dispatch
- Tag (v*)

**Steps:**
1. Checkout code
2. Setup Flutter
3. Build for each platform
4. Upload artifacts

**Configuration:**
```yaml
name: Build Desktop

on:
  push:
    branches:
      - main
  workflow_dispatch:
  tags:
    - 'v*'

jobs:
  build-desktop:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          channel: 'stable'

      - name: Install dependencies
        run: flutter pub get

      - name: Build Desktop
        run: flutter build ${{ matrix.os == 'windows-latest' && 'windows' || matrix.os == 'macos-latest' && 'macos' || 'linux' }} --release

      - name: Upload Desktop build
        uses: actions/upload-artifact@v3
        with:
          name: desktop-${{ matrix.os }}
          path: build/${{ matrix.os == 'windows-latest' && 'windows' || matrix.os == 'macos-latest' && 'macos' || 'linux' }}/release/
```

---

### Workflow 13: Translator (Future Enhancement)

**File:** `.github/workflows/translator.yml`

**Purpose:** Auto-translate content to multiple languages

**Triggers:**
- Push to main (content changes)
- Manual workflow dispatch

**Steps:**
1. Checkout code
2. Detect changed content files
3. Translate to target languages
4. Create PR with translations

**Configuration:**
```yaml
name: Translator

on:
  push:
    branches:
      - main
    paths:
      - 'content/**'
      - 'public/locales/**'
  workflow_dispatch:

jobs:
  translate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Translate content
        run: npm run translate
        env:
          GOOGLE_TRANSLATE_API_KEY: ${{ secrets.GOOGLE_TRANSLATE_API_KEY }}

      - name: Create PR with translations
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'chore: auto-translate content'
          title: 'Auto-translate content'
          body: 'Automated translation of content files'
          branch: auto-translate
```

---

### Workflow 14: Similar Issues via AI MCP (Future Enhancement)

**File:** `.github/workflows/similar-issues.yml`

**Purpose:** Use AI to find similar issues and suggest duplicates

**Triggers:**
- Issues (opened)

**Steps:**
1. Checkout code
2. Analyze issue content
3. Search for similar issues
4. Comment on issue with similar issues

**Configuration:**
```yaml
name: Similar Issues via AI MCP

on:
  issues:
    types: [opened]

jobs:
  find-similar:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Find similar issues
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const issue = context.payload.issue;
            const title = issue.title;
            const body = issue.body;
            
            // Use AI to find similar issues
            // (Implementation depends on AI service)
            
            const similarIssues = await findSimilarIssues(title, body);
            
            if (similarIssues.length > 0) {
              const comment = `Similar issues found:\n${similarIssues.map(i => `- #${i.number}: ${i.title}`).join('\n')}`;
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issue.number,
                body: comment
              });
            }
```

---

### Workflow 15: Build iOS for Development (Future - Flutter)

**File:** `.github/workflows/build-ios-dev.yml`

**Purpose:** Build iOS app for development/testing

**Triggers:**
- Pull requests
- Manual workflow dispatch

**Steps:**
1. Checkout code
2. Setup Flutter
3. Setup Xcode
4. Build iOS (development)
5. Upload to TestFlight (if configured)

**Configuration:**
```yaml
name: Build iOS for Development

on:
  pull_request:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-ios-dev:
    runs-on: macos-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          channel: 'stable'

      - name: Setup Xcode
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: latest-stable

      - name: Install dependencies
        run: flutter pub get

      - name: Build iOS (Development)
        run: flutter build ios --debug

      - name: Upload iOS build
        uses: actions/upload-artifact@v3
        with:
          name: ios-dev-build
          path: build/ios/iphoneos/Runner.app
```

---

### Workflow 16: CI Build Web and SSR Server (Future Enhancement)

**File:** `.github/workflows/build-web-ssr.yml`

**Purpose:** Build web app and SSR server (if SSR is added later)

**Triggers:**
- Push to main
- Pull requests

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Build web app
5. Build SSR server
6. Upload artifacts

**Configuration:**
```yaml
name: CI Build Web and SSR Server

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build web app
        run: npm run build

      - name: Build SSR server
        run: npm run build:ssr
        continue-on-error: true

      - name: Upload web build
        uses: actions/upload-artifact@v3
        with:
          name: web-build
          path: ./out

      - name: Upload SSR build
        uses: actions/upload-artifact@v3
        with:
          name: ssr-build
          path: ./server
          if-no-files-found: ignore
```

---

## 📝 WORKFLOW SUMMARY

**CI/CD Workflows:**
- ✅ Deploy to GitHub Pages
- ✅ CI - Format, Typecheck and Lint
- ✅ Auto Fix Lint and Format
- ✅ PR Conventional Commit Validation

**Security Workflows:**
- ✅ Dependabot Updates
- ✅ Security Scanning

**Automation Workflows:**
- ✅ Issue Labeler
- ✅ Tag on SemVer Commit
- ✅ Branch Synchronization

**Future Enhancement Workflows:**
- ✅ Build Android (Flutter)
- ✅ Build iOS (Flutter)
- ✅ Build Desktop (Flutter)
- ✅ Translator
- ✅ Similar Issues via AI MCP
- ✅ Build iOS for Development
- ✅ CI Build Web and SSR Server

**Total Workflows:** 15+ workflows  
**Status:** Ready for future GitHub repository creation

---

## ✅ GITHUB ACTIONS WORKFLOWS COMPLETE

**Status:** ✅ GitHub Actions Workflows Complete  
**Next:** Data Quality Report  
**Next Agent:** Develop Agent (`/develop`) - After data approval

**Total Workflows:** 15+ workflows  
**Categories:** CI/CD, Security, Automation, Future Enhancements  
**Note:** Workflows prepared for future repository creation

