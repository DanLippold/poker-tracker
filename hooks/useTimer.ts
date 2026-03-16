'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  remainingSeconds: number;
  isPaused: boolean;
  onTick: (newRemaining: number) => void;
  onLevelUp: () => void;
  onWarning: () => void;
  onFiveMinuteWarning?: () => void;
}

export function useTimer({ remainingSeconds, isPaused, onTick, onLevelUp, onWarning, onFiveMinuteWarning }: UseTimerOptions) {
  const lastTickAtRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(remainingSeconds);
  const warningFiredRef = useRef(false);
  const fiveMinWarnFiredRef = useRef(false);
  const isPausedRef = useRef(isPaused);

  // Keep refs in sync with props
  remainingRef.current = remainingSeconds;
  isPausedRef.current = isPaused;

  const tick = useCallback(() => {
    if (isPausedRef.current) return;

    const now = Date.now();
    if (lastTickAtRef.current === null) {
      lastTickAtRef.current = now;
      return;
    }

    const elapsed = Math.floor((now - lastTickAtRef.current) / 1000);
    if (elapsed < 1) return;

    lastTickAtRef.current = now;
    const newRemaining = Math.max(0, remainingRef.current - elapsed);

    // Five-minute warning
    if (!fiveMinWarnFiredRef.current && newRemaining <= 300 && remainingRef.current > 300) {
      fiveMinWarnFiredRef.current = true;
      onFiveMinuteWarning?.();
    }

    // Warning beep at 30s
    if (!warningFiredRef.current && newRemaining <= 30 && newRemaining > 0) {
      warningFiredRef.current = true;
      onWarning();
    }

    onTick(newRemaining);

    if (newRemaining === 0) {
      onLevelUp();
      warningFiredRef.current = false;
      fiveMinWarnFiredRef.current = false;
    }
  }, [onTick, onLevelUp, onWarning, onFiveMinuteWarning]);

  // Start/stop interval based on paused state
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      lastTickAtRef.current = null;
    } else {
      lastTickAtRef.current = Date.now();
      intervalRef.current = setInterval(tick, 500);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, tick]);

  // Handle tab visibility changes — catch up elapsed time
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !isPausedRef.current) {
        // Force a tick immediately to catch up
        tick();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [tick]);

  // Reset warning flags when remaining resets (new level)
  useEffect(() => {
    if (remainingSeconds > 30) {
      warningFiredRef.current = false;
    }
    if (remainingSeconds > 300) {
      fiveMinWarnFiredRef.current = false;
    }
  }, [remainingSeconds]);
}
