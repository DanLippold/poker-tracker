'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Game } from '@/lib/types';
import { loadAllGames, deleteGame } from '@/lib/storage';
import { GameCard } from './GameCard';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui/Button';

export function GameList() {
  const [games, setGames] = useState<Game[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setGames(loadAllGames());
    setMounted(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteGame(id);
    setGames(loadAllGames());
  }, []);

  if (!mounted) return null;

  const sorted = [...games].sort((a, b) => {
    const priority = (g: Game) => (g.status === 'active' ? 0 : g.status === 'paused' ? 1 : 2);
    if (priority(a) !== priority(b)) return priority(a) - priority(b);
    return b.updatedAt - a.updatedAt;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Poker Blinds Tracker</h1>
        <Link href="/new">
          <Button>New Game</Button>
        </Link>
      </div>
      {sorted.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((game) => (
            <GameCard key={game.id} game={game} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
