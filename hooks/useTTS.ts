'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSpeech } from 'react-text-to-speech';

interface SpeechRequest {
  text: string;
  seq: number;
}

export function useTTS() {
  const [request, setRequest] = useState<SpeechRequest>({ text: '', seq: 0 });
  const { start } = useSpeech({ text: request.text });

  useEffect(() => {
    if (!request.text || request.seq === 0) return;
    const timer = setTimeout(() => {
      start();
    }, 1000);
    return () => clearTimeout(timer);
  }, [request, start]);

  const speak = useCallback((text: string) => {
    setRequest((prev) => ({ text, seq: prev.seq + 1 }));
  }, []);

  return { speak };
}
