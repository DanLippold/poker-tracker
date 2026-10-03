'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Keep the caption up briefly after the voice finishes so it doesn't vanish mid-read
const CAPTION_LINGER_MS = 1500;

function getGoogleFemaleVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();

  // Prefer Google US English female voices in priority order
  const preferred = [
    'Google US English',
    'Google UK English Female',
    'Google Australian English',
  ];

  for (const name of preferred) {
    const match = voices.find((v) => v.name === name);
    if (match) return match;
  }

  // Fall back to any Google voice
  return voices.find((v) => v.name.startsWith('Google')) ?? null;
}

// Rough reading time, used as a safety net when the browser never fires `end`
function estimateDurationMs(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return words * 450 + 1000;
}

export function useTTS() {
  // Text currently being narrated, for on-screen captions
  const [spokenText, setSpokenText] = useState<string | null>(null);
  // Holding the active utterance also stops Chrome from garbage-collecting it before `end` fires
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    clearTimerRef.current = null;
    fallbackTimerRef.current = null;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return;

    clearTimers();
    setSpokenText(text);

    const hideCaption = (delayMs: number) => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => setSpokenText(null), delayMs);
    };

    if (!window.speechSynthesis) {
      hideCaption(estimateDurationMs(text));
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    const finish = () => {
      // Ignore events from an utterance that was cancelled by a newer one
      if (utteranceRef.current !== utterance) return;
      utteranceRef.current = null;
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      hideCaption(CAPTION_LINGER_MS);
    };
    utterance.onend = finish;
    utterance.onerror = finish;

    // If speech is blocked or `end` never arrives, still take the caption down
    fallbackTimerRef.current = setTimeout(finish, estimateDurationMs(text) * 2);

    const trySpeak = () => {
      const voice = getGoogleFemaleVoice();
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      trySpeak();
    } else {
      // Voices load asynchronously on first call — wait for them
      window.speechSynthesis.addEventListener('voiceschanged', trySpeak, { once: true });
    }
  }, [clearTimers]);

  return { speak, spokenText };
}
