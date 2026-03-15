'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface TimerControlsProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
}

export function TimerControls({ isPaused, onPause, onResume, onSkip }: TimerControlsProps) {
  const [confirmSkip, setConfirmSkip] = useState(false);

  function handleSkip() {
    setConfirmSkip(false);
    onSkip();
  }

  return (
    <div className="flex items-center justify-center gap-4">
      {isPaused ? (
        <Button size="lg" onClick={onResume} className="min-w-32">
          ▶ Resume
        </Button>
      ) : (
        <Button size="lg" variant="secondary" onClick={onPause} className="min-w-32">
          ⏸ Pause
        </Button>
      )}

      {confirmSkip ? (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={handleSkip}>
            Skip →
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmSkip(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setConfirmSkip(true)}>
          Skip Level
        </Button>
      )}
    </div>
  );
}
