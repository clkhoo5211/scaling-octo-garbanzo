import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Providers } from './app/providers';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { ServiceWorkerRegistration } from './components/ServiceWorkerRegistration';
import { ManifestLink } from './components/ManifestLink';
import { CookieConsentBanner } from './components/compliance';
import { PWAInstallHandler } from './components/pwa/PWAInstallHandler';
import { DailyLoginPointsHandler } from './components/points/DailyLoginPointsHandler';
import './app/globals.css';

// Pages
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import SearchPage from './pages/SearchPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import BookmarksPage from './pages/BookmarksPage';
import ListsPage from './pages/ListsPage';
import AuctionsPage from './pages/AuctionsPage';
import PointsPage from './pages/PointsPage';
import GovernancePage from './pages/GovernancePage';
import MessagesPage from './pages/MessagesPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SocialPage from './pages/SocialPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

// Get base path from environment variable (for GitHub Pages)
// Format: /repository-name (e.g., /scaling-octo-garbanzo)
const basePath = import.meta.env.VITE_BASE_PATH || '/';

function App() {
  return (
    <Providers>
      <BrowserRouter basename={basePath}>
        <ManifestLink />
        <DailyLoginPointsHandler />
        <div className="min-h-screen bg-gray-100">
          <Header />
          <main className="min-h-screen pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/article" element={<ArticlePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/lists" element={<ListsPage />} />
              <Route path="/auctions" element={<AuctionsPage />} />
              <Route path="/points" element={<PointsPage />} />
              <Route path="/governance" element={<GovernancePage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/social" element={<SocialPage />} />
              <Route path="/cookie-policy" element={<CookiePolicyPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            </Routes>
          </main>
          <BottomNav />
          <ServiceWorkerRegistration />
          <CookieConsentBanner />
          <PWAInstallHandler />
        </div>
      </BrowserRouter>
    </Providers>
  );
}

export default App;

