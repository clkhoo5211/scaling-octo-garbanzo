import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app/globals.css';

// Polyfill Buffer for Node.js modules (required by WagmiAdapter)
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;
(globalThis as any).Buffer = Buffer;

// Suppress Coinbase analytics errors - these are expected when ad blockers block analytics
// Analytics is disabled in Reown config, but Coinbase SDK still tries to initialize
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    // Suppress Coinbase analytics errors
    const errorMessage = args.join(' ');
    if (
      errorMessage.includes('cca-lite.coinbase.com') ||
      errorMessage.includes('Analytics SDK') ||
      errorMessage.includes('AnalyticsSDKApiError') ||
      (typeof args[0] === 'string' && args[0].includes('Failed to fetch') && errorMessage.includes('coinbase'))
    ) {
      // Silently ignore - analytics is disabled and blocked by ad blockers (expected behavior)
      return;
    }
    // Log all other errors normally
    originalConsoleError.apply(console, args);
  };

  // Also suppress unhandled promise rejections for Coinbase analytics
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (
      reason &&
      typeof reason === 'object' &&
      'message' in reason &&
      (reason.message?.includes('cca-lite.coinbase.com') ||
       reason.message?.includes('Analytics SDK') ||
       reason.message?.includes('Failed to fetch'))
    ) {
      event.preventDefault(); // Suppress the error
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

