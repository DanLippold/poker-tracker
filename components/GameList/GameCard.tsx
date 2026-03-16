'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Game } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatTime } from '@/lib/utils';

interface GameCardProps {
  game: Game;
  onDelete: (id: string) => void;
  onClone: (id: string) => void;
}

export function GameCard({ game, onDelete, onClone }: GameCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const currentLevel = game.config.schedule[game.state.currentLevelIndex];
  const levelLabel = currentLevel
    ? `Level ${currentLevel.level} — ${currentLevel.smallBlind}/${currentLevel.bigBlind}`
    : 'Completed';

  const created = new Date(game.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold truncate">{game.name}</span>
          <Badge status={game.status} />
        </div>
        <div className="text-sm text-[var(--color-muted)]">{levelLabel}</div>
        {game.status !== 'completed' && (
          <div className="text-xs text-[var(--color-muted)] mt-0.5">
            {formatTime(game.state.remainingSeconds)} remaining
          </div>
        )}
        <div className="text-xs text-[var(--color-muted)] mt-0.5">{created}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {game.status !== 'completed' && (
          <Link href={`/game/${game.id}`}>
            <Button variant="secondary" size="sm">
              {game.status === 'active' ? 'Resume' : 'Start'}
            </Button>
          </Link>
        )}
        <Button variant="ghost" size="sm" onClick={() => onClone(game.id)} title="Clone game">
          Clone
        </Button>
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <Button variant="danger" size="sm" onClick={() => onDelete(game.id)}>
              Confirm
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
}
