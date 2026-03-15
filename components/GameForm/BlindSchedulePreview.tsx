import { BlindLevel } from '@/lib/types';

interface BlindSchedulePreviewProps {
  schedule: BlindLevel[];
}

export function BlindSchedulePreview({ schedule }: BlindSchedulePreviewProps) {
  if (schedule.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[var(--color-muted)] text-left">
            <th className="pb-2 pr-4 font-medium">Level</th>
            <th className="pb-2 pr-4 font-medium">Small</th>
            <th className="pb-2 pr-4 font-medium">Big</th>
            <th className="pb-2 font-medium">Ante</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((lvl) => (
            <tr key={lvl.level} className="border-t border-[var(--color-border)]">
              <td className="py-1.5 pr-4 text-[var(--color-muted)]">{lvl.level}</td>
              <td className="py-1.5 pr-4 font-mono">{lvl.smallBlind}</td>
              <td className="py-1.5 pr-4 font-mono text-[var(--color-accent-gold)]">{lvl.bigBlind}</td>
              <td className="py-1.5 font-mono text-[var(--color-muted)]">
                {lvl.ante > 0 ? lvl.ante : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
