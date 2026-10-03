'use client';

import { useEffect } from 'react';

/**
 * Keeps the screen from dimming/sleeping while `enabled` is true, using the
 * Screen Wake Lock API. The browser drops the lock whenever the tab is hidden,
 * so it is re-acquired when the tab becomes visible again. Silently no-ops on
 * browsers without support or when the request is denied (e.g. low battery).
 */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      if (document.visibilityState !== 'visible') return;
      if (sentinel && !sentinel.released) return;
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) {
          lock.release().catch(() => {});
          return;
        }
        sentinel = lock;
      } catch {
        // Denied or unavailable — nothing else to do.
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') request();
    };

    request();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      sentinel?.release().catch(() => {});
    };
  }, [enabled]);
}
