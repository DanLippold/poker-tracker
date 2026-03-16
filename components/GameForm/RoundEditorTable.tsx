'use client';

import { BlindLevel } from '@/lib/types';
import { snapToCleanValue } from '@/lib/blindSchedule';

interface RoundEditorTableProps {
  schedule: BlindLevel[];
  onChange: (schedule: BlindLevel[]) => void;
  denominations?: number[];
}

export function RoundEditorTable({ schedule, onChange, denominations }: RoundEditorTableProps) {
  function snapBB(raw: number): number {
    if (!denominations?.length) return Math.ceil(raw / 25) * 25;
    const snapped = snapToCleanValue(raw, denominations);
    // Ensure even so SB = BB/2 is clean
    if (snapped % 2 !== 0) return snapped + (denominations[0] ?? 5);
    return snapped;
  }

  function update(index: number, field: keyof BlindLevel, value: number) {
    const updated = schedule.map((level, i) => {
      if (i !== index) return level;
      return { ...level, [field]: value };
    });

    // Cascade: recompute normal rows below if their bigBlind is less than the edited row's bigBlind
    // Skip over break rows during cascade
    if (!updated[index].isBreak) {
      let prevBB = updated[index].bigBlind;
      for (let j = index + 1; j < updated.length; j++) {
        if (updated[j].isBreak) continue;
        if (updated[j].bigBlind < prevBB) {
          const newBB = snapBB(prevBB * 1.5);
          updated[j] = { ...updated[j], bigBlind: newBB, smallBlind: newBB / 2 };
          prevBB = newBB;
        } else {
          prevBB = updated[j].bigBlind;
        }
      }
    }

    onChange(updated);
  }

  function renumber(levels: BlindLevel[]): BlindLevel[] {
    let normalCount = 0;
    return levels.map((lvl) => {
      if (lvl.isBreak) return lvl;
      normalCount++;
      return { ...lvl, level: normalCount };
    });
  }

  function addRow() {
    const lastNormal = [...schedule].reverse().find((l) => !l.isBreak);
    const last = schedule[schedule.length - 1];
    const newLevel: BlindLevel = {
      level: 0,
      smallBlind: lastNormal ? lastNormal.bigBlind : 25,
      bigBlind: lastNormal ? lastNormal.bigBlind * 2 : 50,
      ante: lastNormal ? lastNormal.ante : 0,
      durationSeconds: last ? last.durationSeconds : 15 * 60,
    };
    onChange(renumber([...schedule, newLevel]));
  }

  function addBreak() {
    const lastBreak = [...schedule].reverse().find((l) => l.isBreak);
    const defaultDuration = lastBreak ? lastBreak.durationSeconds : 5 * 60;
    const breakLevel: BlindLevel = {
      level: 0,
      smallBlind: 0,
      bigBlind: 0,
      ante: 0,
      durationSeconds: defaultDuration,
      isBreak: true,
    };
    onChange([...schedule, breakLevel]);
  }

  function removeRow(index: number) {
    if (schedule.length <= 1) return;
    onChange(renumber(schedule.filter((_, i) => i !== index)));
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
            {schedule.map((lvl, i) =>
              lvl.isBreak ? (
                <tr key={i} className="border-t border-[var(--color-border)]" style={{ background: 'rgba(46,160,67,0.06)' }}>
                  <td className="py-1.5 pr-2 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
                    ☕
                  </td>
                  <td className="py-1.5 pr-2 text-xs font-medium" style={{ color: 'var(--color-accent)' }} colSpan={3}>
                    Break
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      type="number"
                      value={Math.round(lvl.durationSeconds / 60)}
                      onChange={(e) => update(i, 'durationSeconds', Number(e.target.value) * 60)}
                      onBlur={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) update(i, 'durationSeconds', v * 60); }}
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
                      aria-label="Remove break"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={i} className="border-t border-[var(--color-border)]">
                  <td className="py-1.5 pr-2 text-[var(--color-muted)]">{lvl.level}</td>
                  <td className="py-1.5 pr-2">
                    <input
                      type="number"
                      value={lvl.smallBlind}
                      onChange={(e) => update(i, 'smallBlind', Number(e.target.value))}
                      onBlur={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) update(i, 'smallBlind', v); }}
                      className="w-16 bg-[var(--color-background)] border border-[var(--color-border)] rounded px-2 py-0.5 font-mono text-sm focus:outline-none focus:border-[var(--color-accent)]"
                      min="0"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      type="number"
                      value={lvl.bigBlind}
                      onChange={(e) => update(i, 'bigBlind', Number(e.target.value))}
                      onBlur={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) update(i, 'bigBlind', v); }}
                      className="w-16 bg-[var(--color-background)] border border-[var(--color-border)] rounded px-2 py-0.5 font-mono text-sm text-[var(--color-accent-gold)] focus:outline-none focus:border-[var(--color-accent)]"
                      min="0"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      type="number"
                      value={lvl.ante}
                      onChange={(e) => update(i, 'ante', Number(e.target.value))}
                      onBlur={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) update(i, 'ante', v); }}
                      className="w-16 bg-[var(--color-background)] border border-[var(--color-border)] rounded px-2 py-0.5 font-mono text-sm focus:outline-none focus:border-[var(--color-accent)]"
                      min="0"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      type="number"
                      value={Math.round(lvl.durationSeconds / 60)}
                      onChange={(e) => update(i, 'durationSeconds', Number(e.target.value) * 60)}
                      onBlur={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) update(i, 'durationSeconds', v * 60); }}
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
              )
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center gap-4">
        <button
          type="button"
          onClick={addRow}
          className="text-xs text-[var(--color-accent)] hover:underline cursor-pointer"
        >
          + Add Round
        </button>
        <button
          type="button"
          onClick={addBreak}
          className="text-xs hover:underline cursor-pointer"
          style={{ color: 'var(--color-accent)' }}
        >
          + Add Break
        </button>
      </div>
    </div>
  );
}
