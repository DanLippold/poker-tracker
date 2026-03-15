'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ChipDenominationsInputProps {
  value: number[];
  onChange: (value: number[]) => void;
}

export function ChipDenominationsInput({ value, onChange }: ChipDenominationsInputProps) {
  const [input, setInput] = useState('');

  function add() {
    const num = parseInt(input, 10);
    if (!num || num <= 0) return;
    if (value.includes(num)) return;
    const updated = [...value, num].sort((a, b) => a - b);
    onChange(updated);
    setInput('');
  }

  function remove(denom: number) {
    onChange(value.filter((d) => d !== denom));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((denom) => (
          <span
            key={denom}
            className="flex items-center gap-1 bg-[var(--color-border)] text-[var(--color-foreground)] px-2 py-0.5 rounded text-sm"
          >
            {denom}
            <button
              type="button"
              onClick={() => remove(denom)}
              className="text-[var(--color-muted)] hover:text-[var(--color-danger)] leading-none cursor-pointer"
              aria-label={`Remove ${denom}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="e.g. 25"
          className="w-28 bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          min="1"
        />
        <Button type="button" variant="secondary" size="sm" onClick={add}>
          Add
        </Button>
      </div>
    </div>
  );
}
