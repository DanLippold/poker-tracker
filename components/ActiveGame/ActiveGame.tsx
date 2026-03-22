'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadGame, saveGame } from '@/lib/storage';
import { Game, BlindLevel } from '@/lib/types';
import { useTimer } from '@/hooks/useTimer';
import { useSound } from '@/hooks/useSound';
import { useTTS } from '@/hooks/useTTS';
import { BlindDisplay } from './BlindDisplay';
import { CountdownTimer } from './CountdownTimer';
import { NextLevelPreview } from './NextLevelPreview';
import { TimerControls } from './TimerControls';
import { GameSettingsEditor } from './GameSettingsEditor';
import { ChipDisplay } from './ChipDisplay';
import { FiveMinuteWarning } from './FiveMinuteWarning';

interface ActiveGameProps {
  id: string;
}

export function ActiveGame({ id }: ActiveGameProps) {
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFiveMinWarning, setShowFiveMinWarning] = useState(false);
  const { playLevelUp, playWarning, playFiveMinuteWarning, initAudio } = useSound();
  const { speak } = useTTS();
  const gameRef = useRef<Game | null>(null);
  const prevLevelIndexRef = useRef<number | null>(null);

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

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  function buildNarrationText(level: BlindLevel): string {
    if (level.isBreak) {
      const mins = Math.round(level.durationSeconds / 60);
      return `A ${mins} minute break has started.`;
    }
    const base = `The next blind level is starting. Small blind is ${level.smallBlind}, big blind is ${level.bigBlind}.`;
    if (level.ante > 0) {
      return `The next blind level is starting. Small blind is ${level.smallBlind}, big blind is ${level.bigBlind}. Ante is ${level.ante}.`;
    }
    return base;
  }

  // Narrate the level that just became active whenever currentLevelIndex changes
  useEffect(() => {
    if (!game || game.status === 'completed') return;
    const { currentLevelIndex } = game.state;
    if (prevLevelIndexRef.current !== null && prevLevelIndexRef.current !== currentLevelIndex) {
      if (game.config.ttsNarrationEnabled !== false) {
        const level = game.config.schedule[currentLevelIndex];
        if (level) speak(buildNarrationText(level));
      }
    }
    prevLevelIndexRef.current = currentLevelIndex;
  }, [game, speak]);

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

  const handleFiveMinWarning = useCallback(() => {
    playFiveMinuteWarning();
    setShowFiveMinWarning(true);
  }, [playFiveMinuteWarning]);

  const handleDismissFiveMinWarning = useCallback(() => {
    setShowFiveMinWarning(false);
  }, []);

  function handleExportSettings() {
    if (!game) return;
    const payload = {
      version: 1,
      name: game.name,
      startingChips: game.config.startingChips,
      chipDenominations: game.config.chipDenominations,
      chipColors: game.config.chipColors,
      blindDurationMinutes: game.config.blindDurationMinutes,
      breakDurationMinutes: game.config.breakDurationMinutes,
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
    onFiveMinuteWarning: handleFiveMinWarning,
  });

  if (!mounted || !game) return null;

  const { schedule } = game.config;
  const { currentLevelIndex, remainingSeconds, isPaused } = game.state;
  const currentLevel = schedule[currentLevelIndex];
  const nextLevel = schedule[currentLevelIndex + 1] ?? null;
  const isCompleted = game.status === 'completed';
  const chipDenominations = game.config.chipDenominations;
  const chipColors = game.config.chipColors ?? [];

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
      <main className="flex-1 flex flex-col items-center justify-center gap-8 lg:gap-12 xl:gap-16 px-4 py-8 lg:py-16 xl:py-20">
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

            <ChipDisplay denominations={chipDenominations} colors={chipColors} />

            <CountdownTimer remainingSeconds={remainingSeconds} isPaused={isPaused} />

            <TimerControls
              isPaused={isPaused}
              onPause={handlePause}
              onResume={handleResume}
              onSkip={handleSkip}
            />

            <NextLevelPreview nextLevel={nextLevel} />

            {/* Level progress */}
            <div className="text-xs lg:text-sm xl:text-base text-[var(--color-muted)]">
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

      {/* Five-minute warning overlay */}
      {showFiveMinWarning && (
        <FiveMinuteWarning onDismiss={handleDismissFiveMinWarning} />
      )}
    </div>
  );
}
