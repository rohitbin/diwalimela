import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        // 1. Immediately check for updates from server upon launching
        registration.update().catch(() => {});

        // 2. Check for updates whenever the user switches back to the app on their phone
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        });

        // 3. Periodic check every 60 seconds
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 1000);

        // 4. When a new service worker is found, tell it to take over immediately
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  installingWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              }
            };
          }
        };
      })
      .catch((err) => {
        console.warn('SW registration issue:', err);
      });
  });

  // 5. When the updated service worker takes over, reload to display latest code!
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}


