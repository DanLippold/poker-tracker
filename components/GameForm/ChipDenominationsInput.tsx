'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

const PRESET_COLORS = ['white', 'red', 'green', 'black', 'blue', 'purple', 'orange', 'cyan'];
const DEFAULT_COLORS = ['white', 'red', 'green', 'black', 'blue'];

const LIGHT_COLORS = new Set(['white', 'yellow', 'cyan', 'lime', 'silver']);

function isLight(color: string): boolean {
  return LIGHT_COLORS.has(color);
}

function chipStyle(color: string, size: number): React.CSSProperties {
  return {
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    border: '3px solid rgba(255,255,255,0.5)',
    boxShadow: `0 0 0 2px ${color}, 0 0 0 5px rgba(255,255,255,0.25), 0 0 0 7px ${color}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size <= 44 ? 10 : 13,
    fontWeight: 'bold',
    color: isLight(color) ? '#222' : '#fff',
    flexShrink: 0,
    userSelect: 'none' as const,
  };
}

interface ChipDenominationsInputProps {
  value: number[];
  colors: string[];
  onChange: (values: number[], colors: string[]) => void;
}

export function ChipDenominationsInput({ value, colors, onChange }: ChipDenominationsInputProps) {
  const [input, setInput] = useState('');
  const [pendingRemove, setPendingRemove] = useState<number | null>(null);

  function cycleColor(index: number) {
    const current = colors[index] ?? 'white';
    const currentIdx = PRESET_COLORS.indexOf(current);
    const nextIdx = (currentIdx + 1) % PRESET_COLORS.length;
    const newColors = [...colors];
    newColors[index] = PRESET_COLORS[nextIdx];
    onChange(value, newColors);
  }

  function add() {
    const num = parseInt(input, 10);
    if (!num || num <= 0) return;
    if (value.includes(num)) return;
    const newDenoms = [...value, num].sort((a, b) => a - b);
    const insertedIndex = newDenoms.indexOf(num);
    const newColors = [...colors];
    // Assign next default color not yet in use, or cycle
    const usedColors = new Set(colors);
    const nextColor =
      DEFAULT_COLORS.find((c) => !usedColors.has(c)) ??
      PRESET_COLORS[newDenoms.length % PRESET_COLORS.length];
    newColors.splice(insertedIndex, 0, nextColor);
    onChange(newDenoms, newColors);
    setInput('');
  }

  function remove(denom: number) {
    if (pendingRemove !== denom) {
      setPendingRemove(denom);
      return;
    }
    const idx = value.indexOf(denom);
    const newDenoms = value.filter((d) => d !== denom);
    const newColors = colors.filter((_, i) => i !== idx);
    setPendingRemove(null);
    onChange(newDenoms, newColors);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-6 mb-3">
        {value.map((denom, i) => {
          const color = colors[i] ?? 'white';
          return (
            <div key={denom} className="flex flex-col items-center gap-1">
              <div
                style={chipStyle(color, 44)}
                onClick={() => cycleColor(i)}
                title="Click to change color"
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {denom >= 1000 ? `${denom / 1000}k` : denom}
              </div>
              {pendingRemove === denom ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => remove(denom)}
                    className="text-[var(--color-danger)] text-xs font-semibold leading-none cursor-pointer"
                    aria-label={`Confirm remove ${denom}`}
                  >
                    Remove?
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingRemove(null)}
                    className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] text-xs leading-none cursor-pointer"
                    aria-label="Cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => remove(denom)}
                  className="text-[var(--color-muted)] hover:text-[var(--color-danger)] text-base leading-none cursor-pointer px-1"
                  aria-label={`Remove ${denom}`}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && e.target.value !== String(v)) setInput(String(v));
          }}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="e.g. 25"
          className="w-28 bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          min="1"
        />
        <Button type="button" variant="secondary" size="sm" onClick={add}>
          Add
        </Button>
      </div>
      <p className="text-xs text-[var(--color-muted)] mt-1">Click a chip to change its color</p>
    </div>
  );
}
