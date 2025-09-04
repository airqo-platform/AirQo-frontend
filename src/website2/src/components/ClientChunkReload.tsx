'use client';

import { useEffect } from 'react';

// Listens for unhandledrejection and error events that are typical when a
// chunk fails to load (ChunkLoadError). When detected, we attempt a hard
// reload to fetch a matching set of chunks. This is a pragmatic recovery
// strategy for clients that have stale HTML referencing updated static files.
export default function ClientChunkReload() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      const msg = event?.message || '';
      if (msg.includes('Loading chunk') || msg.includes('ChunkLoadError')) {
        // Try a full reload once. Avoid infinite reload loops by checking a flag on sessionStorage.
        try {
          const reloaded = sessionStorage.getItem('chunk_reload_attempted');
          if (!reloaded) {
            sessionStorage.setItem('chunk_reload_attempted', 'true');
            // Force reload to fetch latest assets
            window.location.reload();
          }
        } catch {
          window.location.reload();
        }
      }
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event?.reason;
      const msg = typeof reason === 'string' ? reason : reason?.message || '';
      if (msg.includes('Loading chunk') || msg.includes('ChunkLoadError')) {
        try {
          const reloaded = sessionStorage.getItem('chunk_reload_attempted');
          if (!reloaded) {
            sessionStorage.setItem('chunk_reload_attempted', 'true');
            window.location.reload();
          }
        } catch {
          window.location.reload();
        }
      }
    }

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
