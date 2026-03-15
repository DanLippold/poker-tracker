import { BlindLevel } from '@/lib/types';

interface NextLevelPreviewProps {
  nextLevel: BlindLevel | null;
}

export function NextLevelPreview({ nextLevel }: NextLevelPreviewProps) {
  return (
    <div className="text-center text-sm text-[var(--color-muted)]">
      {nextLevel ? (
        <>
          <span className="uppercase tracking-wider text-xs">Up next </span>
          <span className="font-mono">
            {nextLevel.smallBlind.toLocaleString()} / {nextLevel.bigBlind.toLocaleString()}
            {nextLevel.ante > 0 && ` (ante ${nextLevel.ante.toLocaleString()})`}
          </span>
        </>
      ) : (
        <span className="uppercase tracking-wider text-xs">Final Level</span>
      )}
    </div>
  );
}
