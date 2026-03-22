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
    <div className="flex items-center justify-center gap-4 lg:gap-6">
      {isPaused ? (
        <Button size="lg" onClick={onResume} className="min-w-32 lg:min-w-44 lg:text-lg lg:px-8 lg:py-4">
          ▶ Resume
        </Button>
      ) : (
        <Button size="lg" variant="secondary" onClick={onPause} className="min-w-32 lg:min-w-44 lg:text-lg lg:px-8 lg:py-4">
          ⏸ Pause
        </Button>
      )}

      {confirmSkip ? (
        <div className="flex items-center gap-2 lg:gap-3">
          <Button size="sm" variant="secondary" onClick={handleSkip} className="lg:text-base lg:px-4 lg:py-2">
            Skip →
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmSkip(false)} className="lg:text-base lg:px-4 lg:py-2">
            Cancel
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setConfirmSkip(true)} className="lg:text-base lg:px-4 lg:py-2">
          Skip Level
        </Button>
      )}
    </div>
  );
}
