import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Safer polyfill for process.env in the browser.
// Only creates the object if it doesn't exist, preserving any existing env variables.
const globalAny = window as any;
if (!globalAny.process) {
  globalAny.process = { env: {} };
} else if (!globalAny.process.env) {
  globalAny.process.env = {};
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