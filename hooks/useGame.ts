'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Game, GameState } from '@/lib/types';
import { loadAllGames, loadGame, saveGame, deleteGame } from '@/lib/storage';

export function useGame(id?: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAllGames(loadAllGames());
  }, []);

  useEffect(() => {
    if (id) {
      setGame(loadGame(id));
    }
  }, [id]);

  const handleSaveGame = useCallback((g: Game) => {
    saveGame(g);
    setGame(g);
    setAllGames(loadAllGames());
  }, []);

  const handleDeleteGame = useCallback((gameId: string) => {
    deleteGame(gameId);
    setAllGames(loadAllGames());
  }, []);

  // Debounced state update — max one localStorage write per second
  const updateGameState = useCallback((gameId: string, partialState: Partial<GameState>) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const current = loadGame(gameId);
      if (!current) return;
      const updated: Game = {
        ...current,
        updatedAt: Date.now(),
        state: { ...current.state, ...partialState },
      };
      saveGame(updated);
      setGame(updated);
    }, 1000);
  }, []);

  return { game, allGames, saveGame: handleSaveGame, deleteGame: handleDeleteGame, updateGameState };
}
