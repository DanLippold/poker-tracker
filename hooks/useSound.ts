'use client';

import { useRef, useCallback } from 'react';

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  function getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    // Resume if suspended (required by some browsers after user gesture)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }

  function playTone(ctx: AudioContext, freq: number, startTime: number, duration: number, gain: number) {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    gainNode.gain.setValueAtTime(gain, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  const playLevelUp = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const tones = [880, 660, 440];
    tones.forEach((freq, i) => {
      playTone(ctx, freq, ctx.currentTime + i * 0.25, 0.2, 0.4);
    });
  }, []);

  const playWarning = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 440, ctx.currentTime, 0.15, 0.2);
  }, []);

  // Call this on first user gesture to initialize AudioContext
  const initAudio = useCallback(() => {
    getCtx();
  }, []);

  return { playLevelUp, playWarning, initAudio };
}
