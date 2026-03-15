import { BlindLevel } from '@/lib/types';

interface BlindDisplayProps {
  level: BlindLevel;
}

export function BlindDisplay({ level }: BlindDisplayProps) {
  return (
    <div className="text-center">
      <div className="text-sm font-medium text-[var(--color-muted)] uppercase tracking-widest mb-4">
        Level {level.level}
      </div>
      <div className="flex items-center justify-center gap-4 mb-2">
        <div className="text-center">
          <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Small</div>
          <div className="text-5xl font-mono font-bold">{level.smallBlind.toLocaleString()}</div>
        </div>
        <div className="text-3xl text-[var(--color-muted)] mt-4">/</div>
        <div className="text-center">
          <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Big</div>
          <div className="text-5xl font-mono font-bold text-[var(--color-accent-gold)]">
            {level.bigBlind.toLocaleString()}
          </div>
        </div>
      </div>
      {level.ante > 0 && (
        <div className="mt-4 text-sm text-[var(--color-muted)]">
          Ante: <span className="font-mono text-[var(--color-foreground)]">{level.ante.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
