import { BlindLevel } from '@/lib/types';

interface NextLevelPreviewProps {
  nextLevel: BlindLevel | null;
}

export function NextLevelPreview({ nextLevel }: NextLevelPreviewProps) {
  return (
    <div className="text-center text-lg lg:text-2xl xl:text-3xl 2xl:text-4xl text-[var(--color-muted)]">
      {nextLevel ? (
        nextLevel.isBreak ? (
          <>
            <span className="uppercase tracking-wider text-sm lg:text-lg xl:text-xl 2xl:text-2xl">Up next </span>
            <span className="font-mono font-semibold text-[var(--color-foreground)]">Break ({Math.round(nextLevel.durationSeconds / 60)} min)</span>
          </>
        ) : (
          <>
            <span className="uppercase tracking-wider text-sm lg:text-lg xl:text-xl 2xl:text-2xl">Up next </span>
            <span className="font-mono font-semibold text-[var(--color-foreground)]">
              {nextLevel.smallBlind.toLocaleString()} / {nextLevel.bigBlind.toLocaleString()}
              {nextLevel.ante > 0 && ` (ante ${nextLevel.ante.toLocaleString()})`}
            </span>
          </>
        )
      ) : (
        <span className="uppercase tracking-wider text-sm lg:text-lg xl:text-xl 2xl:text-2xl">Final Level</span>
      )}
    </div>
  );
}
