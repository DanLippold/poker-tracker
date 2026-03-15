'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Game, GameFormValues, BlindLevel, GameConfig } from '@/lib/types';
import { generateBlindSchedule } from '@/lib/blindSchedule';
import { saveGame, loadDefaultDenominations, saveDefaultDenominations } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChipDenominationsInput } from './ChipDenominationsInput';
import { BlindSchedulePreview } from './BlindSchedulePreview';
import { RoundEditorTable } from './RoundEditorTable';

const DEFAULT_DENOMS = [5, 10, 25, 100, 500];

interface GameFormProps {
  /** When provided, form operates in "import from config" mode with pre-filled values */
  initialConfig?: GameConfig & { name?: string };
}

export function GameForm({ initialConfig }: GameFormProps = {}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialConfig?.name ?? '');
  const [startingChips, setStartingChips] = useState(initialConfig?.startingChips ?? 5000);
  const [chipDenominations, setChipDenominations] = useState<number[]>(
    initialConfig?.chipDenominations ?? DEFAULT_DENOMS,
  );
  const [blindDurationMinutes, setBlindDurationMinutes] = useState(
    initialConfig?.blindDurationMinutes ?? 15,
  );
  const [anteEnabled, setAnteEnabled] = useState(
    initialConfig ? initialConfig.anteStartLevel !== null : false,
  );
  const [anteStartLevel, setAnteStartLevel] = useState(initialConfig?.anteStartLevel ?? 5);
  const [showSchedule, setShowSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [customSchedule, setCustomSchedule] = useState<BlindLevel[] | null>(
    initialConfig?.schedule ?? null,
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [importError, setImportError] = useState('');

  // Load saved denominations from localStorage on first render (only when no initialConfig)
  useEffect(() => {
    if (initialConfig) return;
    const saved = loadDefaultDenominations();
    if (saved.length > 0) setChipDenominations(saved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formValues: GameFormValues = {
    name,
    startingChips,
    chipDenominations,
    blindDurationMinutes,
    anteStartLevel: anteEnabled ? anteStartLevel : null,
  };

  const autoSchedule = useMemo(() => {
    if (chipDenominations.length < 1 || startingChips <= 0 || blindDurationMinutes <= 0) return [];
    try {
      return generateBlindSchedule(formValues);
    } catch {
      return [];
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startingChips, chipDenominations, blindDurationMinutes, anteEnabled, anteStartLevel]);

  const displaySchedule = customSchedule ?? autoSchedule;

  // When core settings change, clear custom schedule so auto-gen takes over
  function handleSettingsChange(setter: () => void) {
    setter();
    setCustomSchedule(null);
  }

  function validate(): boolean {
    const errs: Partial<Record<string, string>> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (startingChips <= 0) errs.startingChips = 'Must be greater than 0';
    if (chipDenominations.length < 1) errs.chipDenominations = 'Add at least one denomination';
    if (blindDurationMinutes < 1 || blindDurationMinutes > 120) errs.blindDurationMinutes = '1–120 minutes';
    if (anteEnabled && (anteStartLevel < 1 || anteStartLevel > displaySchedule.length)) {
      errs.anteStartLevel = `Must be between 1 and ${displaySchedule.length}`;
    }
    if (displaySchedule.length === 0) errs.schedule = 'Schedule must have at least one level';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const now = Date.now();
    const schedule = displaySchedule;
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
        remainingSeconds: schedule[0].durationSeconds,
        isPaused: true,
        lastTickAt: null,
      },
    };

    saveGame(game);
    saveDefaultDenominations(chipDenominations);
    router.push(`/game/${game.id}`);
  }

  function handleExportSettings() {
    const payload = {
      version: 1,
      name: name.trim() || 'Poker Game',
      startingChips,
      chipDenominations,
      blindDurationMinutes,
      anteStartLevel: anteEnabled ? anteStartLevel : null,
      schedule: displaySchedule,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${payload.name.replace(/\s+/g, '-').toLowerCase()}-settings.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError('');
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (typeof parsed.startingChips !== 'number') throw new Error('Invalid format');
        if (parsed.name) setName(parsed.name);
        if (typeof parsed.startingChips === 'number') setStartingChips(parsed.startingChips);
        if (Array.isArray(parsed.chipDenominations)) setChipDenominations(parsed.chipDenominations);
        if (typeof parsed.blindDurationMinutes === 'number') setBlindDurationMinutes(parsed.blindDurationMinutes);
        if (parsed.anteStartLevel !== undefined) {
          setAnteEnabled(parsed.anteStartLevel !== null);
          if (parsed.anteStartLevel !== null) setAnteStartLevel(parsed.anteStartLevel);
        }
        if (Array.isArray(parsed.schedule) && parsed.schedule.length > 0) {
          setCustomSchedule(parsed.schedule);
        } else {
          setCustomSchedule(null);
        }
        setShowSchedule(true);
      } catch {
        setImportError('Invalid JSON file. Make sure it was exported from this app.');
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-imported
    e.target.value = '';
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-8">
        <a href="/" className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] text-sm">
          ← Back
        </a>
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-2xl font-bold">New Game</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] cursor-pointer"
            >
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        </div>
        {importError && <p className="text-[var(--color-danger)] text-xs mt-1">{importError}</p>}
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
            onChange={(e) => handleSettingsChange(() => setStartingChips(Number(e.target.value)))}
            min="100"
            step="100"
            className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
          {errors.startingChips && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.startingChips}</p>}
        </div>

        {/* Chip Denominations */}
        <div>
          <label className="block text-sm font-medium mb-2">Chip Denominations</label>
          <ChipDenominationsInput
            value={chipDenominations}
            onChange={(v) => handleSettingsChange(() => setChipDenominations(v))}
          />
          {errors.chipDenominations && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.chipDenominations}</p>}
        </div>

        {/* Blind Duration */}
        <div>
          <label className="block text-sm font-medium mb-1">Blind Duration (minutes)</label>
          <input
            type="number"
            value={blindDurationMinutes}
            onChange={(e) => handleSettingsChange(() => setBlindDurationMinutes(Number(e.target.value)))}
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
              onChange={(e) => handleSettingsChange(() => setAnteEnabled(e.target.checked))}
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
                onChange={(e) => handleSettingsChange(() => setAnteStartLevel(Number(e.target.value)))}
                min="1"
                max={displaySchedule.length || 20}
                className="w-24 bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--color-accent)]"
              />
              {errors.anteStartLevel && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.anteStartLevel}</p>}
            </div>
          )}
        </div>

        {/* Blind Schedule */}
        {displaySchedule.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between text-sm font-medium mb-1">
              <button
                type="button"
                onClick={() => setShowSchedule((v) => !v)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span>Blind Schedule ({displaySchedule.length} levels){customSchedule ? ' ✎' : ''}</span>
                <span className="text-[var(--color-muted)]">{showSchedule ? '▲' : '▼'}</span>
              </button>
              <div className="flex items-center gap-3">
                {customSchedule && (
                  <button
                    type="button"
                    onClick={() => { setCustomSchedule(null); setEditingSchedule(false); }}
                    className="text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] cursor-pointer"
                  >
                    Reset to auto
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!editingSchedule && !customSchedule) setCustomSchedule(autoSchedule);
                    setEditingSchedule((v) => !v);
                    setShowSchedule(true);
                  }}
                  className="text-xs text-[var(--color-accent)] hover:underline cursor-pointer"
                >
                  {editingSchedule ? 'Done editing' : 'Edit rounds'}
                </button>
              </div>
            </div>
            {showSchedule && (
              <div className="mt-3">
                {editingSchedule && customSchedule ? (
                  <RoundEditorTable schedule={customSchedule} onChange={setCustomSchedule} />
                ) : (
                  <BlindSchedulePreview schedule={displaySchedule} />
                )}
              </div>
            )}
          </Card>
        )}
        {errors.schedule && <p className="text-[var(--color-danger)] text-xs">{errors.schedule}</p>}

        <div className="flex gap-3">
          <Button type="submit" size="lg" className="flex-1">
            Create Game
          </Button>
          {displaySchedule.length > 0 && (
            <Button type="button" variant="secondary" size="lg" onClick={handleExportSettings}>
              Export JSON
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
