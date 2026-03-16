'use client';

import { BlindLevel } from '@/lib/types';

interface RoundEditorTableProps {
  schedule: BlindLevel[];
  onChange: (schedule: BlindLevel[]) => void;
}

export function RoundEditorTable({ schedule, onChange }: RoundEditorTableProps) {
  function update(index: number, field: keyof BlindLevel, value: number) {
    const updated = schedule.map((level, i) => {
      if (i !== index) return level;
      return { ...level, [field]: value };
    });
    onChange(updated);
  }

  function addRow() {
    const last = schedule[schedule.length - 1];
    const newLevel: BlindLevel = {
      level: schedule.length + 1,
      smallBlind: last ? last.bigBlind : 25,
      bigBlind: last ? last.bigBlind * 2 : 50,
      ante: last ? last.ante : 0,
      durationSeconds: last ? last.durationSeconds : 15 * 60,
    };
    onChange([...schedule, newLevel]);
  }

  function removeRow(index: number) {
    if (schedule.length <= 1) return;
    const updated = schedule
      .filter((_, i) => i !== index)
      .map((level, i) => ({ ...level, level: i + 1 }));
    onChange(updated);
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--color-muted)] text-left">
              <th className="pb-2 pr-2 font-medium">#</th>
              <th className="pb-2 pr-2 font-medium">Small</th>
              <th className="pb-2 pr-2 font-medium">Big</th>
              <th className="pb-2 pr-2 font-medium">Ante</th>
              <th className="pb-2 pr-2 font-medium">Min</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {schedule.map((lvl, i) => (
              <tr key={i} className="border-t border-[var(--color-border)]">
                <td className="py-1.5 pr-2 text-[var(--color-muted)]">{lvl.level}</td>
                <td className="py-1.5 pr-2">
                  <input
                    type="number"
                    value={lvl.smallBlind}
                    onChange={(e) => update(i, 'smallBlind', Number(e.target.value))}
                    className="w-16 bg-[var(--color-background)] border border-[var(--color-border)] rounded px-2 py-0.5 font-mono text-sm focus:outline-none focus:border-[var(--color-accent)]"
                    min="0"
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <input
                    type="number"
                    value={lvl.bigBlind}
                    onChange={(e) => update(i, 'bigBlind', Number(e.target.value))}
                    className="w-16 bg-[var(--color-background)] border border-[var(--color-border)] rounded px-2 py-0.5 font-mono text-sm text-[var(--color-accent-gold)] focus:outline-none focus:border-[var(--color-accent)]"
                    min="0"
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <input
                    type="number"
                    value={lvl.ante}
                    onChange={(e) => update(i, 'ante', Number(e.target.value))}
                    className="w-16 bg-[var(--color-background)] border border-[var(--color-border)] rounded px-2 py-0.5 font-mono text-sm focus:outline-none focus:border-[var(--color-accent)]"
                    min="0"
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <input
                    type="number"
                    value={Math.round(lvl.durationSeconds / 60)}
                    onChange={(e) => update(i, 'durationSeconds', Number(e.target.value) * 60)}
                    className="w-14 bg-[var(--color-background)] border border-[var(--color-border)] rounded px-2 py-0.5 font-mono text-sm focus:outline-none focus:border-[var(--color-accent)]"
                    min="1"
                  />
                </td>
                <td className="py-1.5">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    disabled={schedule.length <= 1}
                    className="text-[var(--color-muted)] hover:text-[var(--color-danger)] text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Remove round"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-2 text-xs text-[var(--color-accent)] hover:underline cursor-pointer"
      >
        + Add Round
      </button>
    </div>
  );
}
