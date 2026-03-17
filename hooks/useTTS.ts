'use client';

import { useSpeak } from 'react-text-to-speech';

export function useTTS() {
  const { speak } = useSpeak();
  return { speak };
}
