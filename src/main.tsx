// Compatibility shield for browser extension fetch interceptors
try {
  const origFetch = window.fetch ? window.fetch.bind(window) : undefined;
  let activeFetch = origFetch;
  Object.defineProperty(window, 'fetch', {
    get() {
      return activeFetch;
    },
    set(newFn) {
      activeFetch = newFn;
    },
    configurable: true,
    enumerable: true,
  });
} catch {
  // Ignore if already configured
}

import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
