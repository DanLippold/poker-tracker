'use client';

import { useCallback } from 'react';

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

export function useTTS() {
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

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
  }, []);

  return { speak };
}
