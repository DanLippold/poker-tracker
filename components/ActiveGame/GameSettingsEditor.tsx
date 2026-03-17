'use client';

import { useState } from 'react';
import { Game, BlindLevel } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { RoundEditorTable } from '@/components/GameForm/RoundEditorTable';

interface GameSettingsEditorProps {
  game: Game;
  onSave: (updated: Game) => void;
  onClose: () => void;
}

export function GameSettingsEditor({ game, onSave, onClose }: GameSettingsEditorProps) {
  const [gameName, setGameName] = useState(game.name);
  const [schedule, setSchedule] = useState<BlindLevel[]>(game.config.schedule);
  const [ttsNarrationEnabled, setTtsNarrationEnabled] = useState(game.config.ttsNarrationEnabled ?? false);

  function handleSave() {
    const currentLevelIndex = Math.min(game.state.currentLevelIndex, schedule.length - 1);
    const updated: Game = {
      ...game,
      name: gameName.trim() || game.name,
      updatedAt: Date.now(),
      config: {
        ...game.config,
        schedule,
        ttsNarrationEnabled,
      },
      state: {
        ...game.state,
        currentLevelIndex,
        // If we're still on the same level, keep remaining time. Otherwise reset.
        remainingSeconds:
          currentLevelIndex === game.state.currentLevelIndex
            ? game.state.remainingSeconds
            : schedule[currentLevelIndex].durationSeconds,
      },
    };
    onSave(updated);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Edit Game Settings</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] text-xl leading-none cursor-pointer"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto flex-1">
          {/* Game name */}
          <div>
            <label className="block text-sm font-medium mb-1">Game Name</label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Voice narration toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Voice narration</label>
            <button
              type="button"
              role="switch"
              aria-checked={ttsNarrationEnabled}
              onClick={() => setTtsNarrationEnabled((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                ttsNarrationEnabled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  ttsNarrationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Round editor */}
          <div>
            <label className="block text-sm font-medium mb-2">Rounds</label>
            <RoundEditorTable
              schedule={schedule}
              onChange={setSchedule}
              denominations={game.config.chipDenominations}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5 pt-4 border-t border-[var(--color-border)]">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
