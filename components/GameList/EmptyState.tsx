import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl mb-6">🃏</div>
      <h2 className="text-2xl font-semibold mb-2">No games yet</h2>
      <p className="text-[var(--color-muted)] mb-8">Create a new game to start tracking blinds.</p>
      <Link href="/new">
        <Button size="lg">New Game</Button>
      </Link>
    </div>
  );
}
