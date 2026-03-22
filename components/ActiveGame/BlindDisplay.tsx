import { BlindLevel } from '@/lib/types';

interface BlindDisplayProps {
  level: BlindLevel;
}

export function BlindDisplay({ level }: BlindDisplayProps) {
  if (level.isBreak) {
    return (
      <div className="text-center">
        <div className="text-sm lg:text-base xl:text-lg font-medium text-[var(--color-muted)] uppercase tracking-widest mb-4 lg:mb-6">
          Intermission
        </div>
        <div
          className="text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-mono font-black uppercase tracking-widest"
          style={{ color: 'var(--color-accent)' }}
        >
          Break
        </div>
        <div className="mt-4 lg:mt-6 text-sm lg:text-base xl:text-lg text-[var(--color-muted)]">
          Blinds resume after the break
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-sm lg:text-base xl:text-lg font-medium text-[var(--color-muted)] uppercase tracking-widest mb-4 lg:mb-6 xl:mb-8">
        Level {level.level}
      </div>
      <div className="flex items-center justify-center gap-4 lg:gap-8 xl:gap-12 mb-2">
        <div className="text-center">
          <div className="text-xs lg:text-sm xl:text-base text-[var(--color-muted)] uppercase tracking-wider mb-1 lg:mb-2">Small</div>
          <div className="text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-mono font-bold">{level.smallBlind.toLocaleString()}</div>
        </div>
        <div className="text-3xl lg:text-4xl xl:text-5xl text-[var(--color-muted)] mt-4 lg:mt-6">/</div>
        <div className="text-center">
          <div className="text-xs lg:text-sm xl:text-base text-[var(--color-muted)] uppercase tracking-wider mb-1 lg:mb-2">Big</div>
          <div className="text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-mono font-bold text-[var(--color-accent-gold)]">
            {level.bigBlind.toLocaleString()}
          </div>
        </div>
      </div>
      {level.ante > 0 && (
        <div className="mt-4 lg:mt-6 text-sm lg:text-base xl:text-lg text-[var(--color-muted)]">
          Ante: <span className="font-mono text-[var(--color-foreground)]">{level.ante.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
