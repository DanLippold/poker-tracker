'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadGame, saveGame } from '@/lib/storage';
import { Game } from '@/lib/types';
import { useTimer } from '@/hooks/useTimer';
import { useSound } from '@/hooks/useSound';
import { BlindDisplay } from './BlindDisplay';
import { CountdownTimer } from './CountdownTimer';
import { NextLevelPreview } from './NextLevelPreview';
import { TimerControls } from './TimerControls';
import { GameSettingsEditor } from './GameSettingsEditor';

interface ActiveGameProps {
  id: string;
}

export function ActiveGame({ id }: ActiveGameProps) {
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { playLevelUp, playWarning, initAudio } = useSound();

  useEffect(() => {
    const g = loadGame(id);
    if (!g) {
      router.replace('/');
      return;
    }
    setGame(g);
    setMounted(true);
  }, [id, router]);

  const persist = useCallback((updated: Game) => {
    saveGame(updated);
    setGame(updated);
  }, []);

  const handleTick = useCallback((newRemaining: number) => {
    setGame((prev) => {
      if (!prev) return prev;
      const updated: Game = {
        ...prev,
        updatedAt: Date.now(),
        state: { ...prev.state, remainingSeconds: newRemaining },
      };
      // Debounce: only persist to localStorage every ~5 seconds
      if (Math.floor(newRemaining) % 5 === 0) saveGame(updated);
      return updated;
    });
  }, []);

  const handleLevelUp = useCallback(() => {
    playLevelUp();
    setGame((prev) => {
      if (!prev) return prev;
      const nextIndex = prev.state.currentLevelIndex + 1;
      if (nextIndex >= prev.config.schedule.length) {
        const completed: Game = {
          ...prev,
          status: 'completed',
          updatedAt: Date.now(),
          state: { ...prev.state, remainingSeconds: 0, isPaused: true },
        };
        saveGame(completed);
        return completed;
      }
      const updated: Game = {
        ...prev,
        updatedAt: Date.now(),
        state: {
          ...prev.state,
          currentLevelIndex: nextIndex,
          remainingSeconds: prev.config.schedule[nextIndex].durationSeconds,
        },
      };
      saveGame(updated);
      return updated;
    });
  }, [playLevelUp]);

  const handlePause = useCallback(() => {
    setGame((prev) => {
      if (!prev) return prev;
      const updated: Game = {
        ...prev,
        status: 'paused',
        updatedAt: Date.now(),
        state: { ...prev.state, isPaused: true, lastTickAt: null },
      };
      saveGame(updated);
      return updated;
    });
  }, []);

  const handleResume = useCallback(() => {
    initAudio();
    setGame((prev) => {
      if (!prev) return prev;
      const updated: Game = {
        ...prev,
        status: 'active',
        updatedAt: Date.now(),
        state: { ...prev.state, isPaused: false, lastTickAt: Date.now() },
      };
      saveGame(updated);
      return updated;
    });
  }, [initAudio]);

  const handleSkip = useCallback(() => {
    setGame((prev) => {
      if (!prev) return prev;
      const nextIndex = prev.state.currentLevelIndex + 1;
      if (nextIndex >= prev.config.schedule.length) {
        const completed: Game = {
          ...prev,
          status: 'completed',
          updatedAt: Date.now(),
          state: { ...prev.state, remainingSeconds: 0, isPaused: true },
        };
        saveGame(completed);
        return completed;
      }
      const updated: Game = {
        ...prev,
        updatedAt: Date.now(),
        state: {
          ...prev.state,
          currentLevelIndex: nextIndex,
          remainingSeconds: prev.config.schedule[nextIndex].durationSeconds,
        },
      };
      saveGame(updated);
      return updated;
    });
  }, []);

  const handleSettingsSave = useCallback((updated: Game) => {
    persist(updated);
    setShowSettings(false);
  }, [persist]);

  function handleExportSettings() {
    if (!game) return;
    const payload = {
      version: 1,
      name: game.name,
      startingChips: game.config.startingChips,
      chipDenominations: game.config.chipDenominations,
      blindDurationMinutes: game.config.blindDurationMinutes,
      anteStartLevel: game.config.anteStartLevel,
      schedule: game.config.schedule,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.name.replace(/\s+/g, '-').toLowerCase()}-settings.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useTimer({
    remainingSeconds: game?.state.remainingSeconds ?? 0,
    isPaused: game?.state.isPaused ?? true,
    onTick: handleTick,
    onLevelUp: handleLevelUp,
    onWarning: playWarning,
  });

  if (!mounted || !game) return null;

  const { schedule } = game.config;
  const { currentLevelIndex, remainingSeconds, isPaused } = game.state;
  const currentLevel = schedule[currentLevelIndex];
  const nextLevel = schedule[currentLevelIndex + 1] ?? null;
  const isCompleted = game.status === 'completed';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)]">
        <Link href="/" className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] text-sm">
          ← Games
        </Link>
        <h1 className="text-sm font-medium text-[var(--color-muted)]">{game.name}</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportSettings}
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] cursor-pointer"
            title="Export settings as JSON"
          >
            Export
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] cursor-pointer"
            title="Edit game settings"
          >
            Settings
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center gap-10 px-4 py-12">
        {isCompleted ? (
          <div className="text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold mb-2">Game Over</h2>
            <p className="text-[var(--color-muted)] mb-8">All blind levels completed.</p>
            <Link href="/">
              <button className="text-[var(--color-accent)] hover:underline text-sm">
                Back to Games
              </button>
            </Link>
          </div>
        ) : (
          <>
            {currentLevel && <BlindDisplay level={currentLevel} />}

            <CountdownTimer remainingSeconds={remainingSeconds} isPaused={isPaused} />

            <TimerControls
              isPaused={isPaused}
              onPause={handlePause}
              onResume={handleResume}
              onSkip={handleSkip}
            />

            <NextLevelPreview nextLevel={nextLevel} />

            {/* Level progress */}
            <div className="text-xs text-[var(--color-muted)]">
              Level {currentLevelIndex + 1} of {schedule.length}
            </div>
          </>
        )}
      </main>

      {/* Settings editor modal */}
      {showSettings && (
        <GameSettingsEditor
          game={game}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
