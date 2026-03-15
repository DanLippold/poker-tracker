import { formatTime } from '@/lib/utils';

interface CountdownTimerProps {
  remainingSeconds: number;
  isPaused: boolean;
}

export function CountdownTimer({ remainingSeconds, isPaused }: CountdownTimerProps) {
  const isWarning = remainingSeconds <= 30 && remainingSeconds > 0;
  const isUrgent = remainingSeconds <= 10 && remainingSeconds > 0;

  let colorClass = 'text-[var(--color-foreground)]';
  if (isUrgent) colorClass = 'text-[var(--color-danger)]';
  else if (isWarning) colorClass = 'text-amber-400';

  const pulseClass = isUrgent && !isPaused ? 'animate-pulse' : '';

  return (
    <div className={`text-center ${pulseClass}`}>
      <div className={`text-7xl font-mono font-bold tabular-nums ${colorClass}`}>
        {formatTime(remainingSeconds)}
      </div>
      {isPaused && (
        <div className="text-sm text-[var(--color-muted)] mt-2 uppercase tracking-widest">
          Paused
        </div>
      )}
    </div>
  );
}
