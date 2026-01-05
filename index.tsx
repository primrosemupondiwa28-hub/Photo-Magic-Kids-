import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Polyfill for process.env in the browser to prevent "process is not defined" or 
// initialization errors when the SDK looks for the API key.
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);