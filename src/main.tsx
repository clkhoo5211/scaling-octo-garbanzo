import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app/globals.css';

// Polyfill Buffer for Node.js modules (required by WagmiAdapter)
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;
(globalThis as any).Buffer = Buffer;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

