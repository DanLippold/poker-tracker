'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Game, GameFormValues } from '@/lib/types';
import { generateBlindSchedule } from '@/lib/blindSchedule';
import { saveGame } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChipDenominationsInput } from './ChipDenominationsInput';
import { BlindSchedulePreview } from './BlindSchedulePreview';

const DEFAULT_DENOMS = [5, 10, 25, 100, 500];

export function GameForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [startingChips, setStartingChips] = useState(5000);
  const [chipDenominations, setChipDenominations] = useState<number[]>(DEFAULT_DENOMS);
  const [blindDurationMinutes, setBlindDurationMinutes] = useState(15);
  const [anteEnabled, setAnteEnabled] = useState(false);
  const [anteStartLevel, setAnteStartLevel] = useState(5);
  const [showSchedule, setShowSchedule] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const formValues: GameFormValues = {
    name,
    startingChips,
    chipDenominations,
    blindDurationMinutes,
    anteStartLevel: anteEnabled ? anteStartLevel : null,
  };

  const schedule = useMemo(() => {
    if (chipDenominations.length < 1 || startingChips <= 0 || blindDurationMinutes <= 0) return [];
    try {
      return generateBlindSchedule(formValues);
    } catch {
      return [];
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startingChips, chipDenominations, blindDurationMinutes, anteEnabled, anteStartLevel]);

  function validate(): boolean {
    const errs: Partial<Record<string, string>> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (startingChips <= 0) errs.startingChips = 'Must be greater than 0';
    if (chipDenominations.length < 1) errs.chipDenominations = 'Add at least one denomination';
    if (blindDurationMinutes < 1 || blindDurationMinutes > 120) errs.blindDurationMinutes = '1–120 minutes';
    if (anteEnabled && (anteStartLevel < 1 || anteStartLevel > schedule.length)) {
      errs.anteStartLevel = `Must be between 1 and ${schedule.length}`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const now = Date.now();
    const game: Game = {
      id: generateId(),
      name: name.trim(),
      status: 'paused',
      createdAt: now,
      updatedAt: now,
      config: {
        startingChips,
        chipDenominations,
        blindDurationMinutes,
        anteStartLevel: anteEnabled ? anteStartLevel : null,
        schedule,
      },
      state: {
        currentLevelIndex: 0,
        remainingSeconds: blindDurationMinutes * 60,
        isPaused: true,
        lastTickAt: null,
      },
    };

    saveGame(game);
    router.push(`/game/${game.id}`);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-8">
        <a href="/" className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] text-sm">
          ← Back
        </a>
        <h1 className="text-2xl font-bold mt-4">New Game</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Game Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Game Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Friday Night Poker"
            className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
          {errors.name && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Starting Chips */}
        <div>
          <label className="block text-sm font-medium mb-1">Starting Chips Per Player</label>
          <input
            type="number"
            value={startingChips}
            onChange={(e) => setStartingChips(Number(e.target.value))}
            min="100"
            step="100"
            className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
          {errors.startingChips && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.startingChips}</p>}
        </div>

        {/* Chip Denominations */}
        <div>
          <label className="block text-sm font-medium mb-2">Chip Denominations</label>
          <ChipDenominationsInput value={chipDenominations} onChange={setChipDenominations} />
          {errors.chipDenominations && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.chipDenominations}</p>}
        </div>

        {/* Blind Duration */}
        <div>
          <label className="block text-sm font-medium mb-1">Blind Duration (minutes)</label>
          <input
            type="number"
            value={blindDurationMinutes}
            onChange={(e) => setBlindDurationMinutes(Number(e.target.value))}
            min="1"
            max="120"
            className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
          {errors.blindDurationMinutes && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.blindDurationMinutes}</p>}
        </div>

        {/* Antes */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={anteEnabled}
              onChange={(e) => setAnteEnabled(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            <span className="text-sm font-medium">Enable Antes</span>
          </label>
          {anteEnabled && (
            <div className="mt-2">
              <label className="block text-xs text-[var(--color-muted)] mb-1">Start antes at level:</label>
              <input
                type="number"
                value={anteStartLevel}
                onChange={(e) => setAnteStartLevel(Number(e.target.value))}
                min="1"
                max={schedule.length || 20}
                className="w-24 bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--color-accent)]"
              />
              {errors.anteStartLevel && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.anteStartLevel}</p>}
            </div>
          )}
        </div>

        {/* Blind Schedule Preview */}
        {schedule.length > 0 && (
          <Card className="p-4">
            <button
              type="button"
              onClick={() => setShowSchedule((v) => !v)}
              className="w-full flex items-center justify-between text-sm font-medium cursor-pointer"
            >
              <span>Blind Schedule ({schedule.length} levels)</span>
              <span className="text-[var(--color-muted)]">{showSchedule ? '▲' : '▼'}</span>
            </button>
            {showSchedule && (
              <div className="mt-3">
                <BlindSchedulePreview schedule={schedule} />
              </div>
            )}
          </Card>
        )}

        <Button type="submit" size="lg" className="w-full">
          Create Game
        </Button>
      </form>
    </div>
  );
}
