# Web3News - Decentralized News Aggregation

A React-based decentralized news aggregation platform with crypto-powered rewards, built with Vite, React Router, Reown AppKit, and Clerk.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd web3news-aggregator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your keys:
   ```
   VITE_REOWN_PROJECT_ID=your_reown_project_id
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_SUPABASE_URL=your_supabase_url (optional)
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key (optional)
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000`

## 📦 Build & Deploy

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to GitHub Pages
See [GITHUB_PAGES_DEPLOYMENT.md](./GITHUB_PAGES_DEPLOYMENT.md) for detailed instructions.

The app automatically deploys to GitHub Pages on push to `main` branch via GitHub Actions.

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Authentication**: Reown AppKit (Primary) + Clerk (Secondary)
- **Web3**: Wagmi + Viem
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **PWA**: Vite PWA Plugin

## 📁 Project Structure

```
src/
├── pages/           # Page components (React Router routes)
├── components/      # Reusable React components
├── lib/
│   ├── hooks/      # Custom React hooks
│   ├── services/   # API and service functions
│   ├── stores/     # Zustand stores
│   └── utils/      # Utility functions
├── App.tsx         # Main app component with routing
└── main.tsx        # React entry point

config/              # Configuration files
context/             # React context providers
public/              # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run format` - Format code with Prettier

## 🌐 Environment Variables

All environment variables must be prefixed with `VITE_` to be available in the build:

- `VITE_REOWN_PROJECT_ID` - Reown AppKit project ID
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `VITE_SUPABASE_URL` - Supabase URL (optional)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (optional)
- `VITE_BASE_PATH` - Base path for GitHub Pages (auto-set in CI/CD)

## 📚 Documentation

- [Migration Summary](./MIGRATION_SUMMARY.md) - Next.js to React migration details
- [Files to Delete](./FILES_TO_DELETE.md) - Cleanup guide for Next.js files
- [GitHub Pages Deployment](./GITHUB_PAGES_DEPLOYMENT.md) - Deployment instructions

## 🔐 Authentication

The app uses a dual authentication system:

1. **Reown AppKit** (Primary) - Handles wallet connections and social logins
2. **Clerk** (Secondary) - Manages user metadata and profiles

Users authenticate via Reown, and Clerk automatically syncs user data.

## 📝 License

[Your License Here]
