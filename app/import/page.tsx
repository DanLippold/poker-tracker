'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GameForm } from '@/components/GameForm/GameForm';
import { GameConfig } from '@/lib/types';

function ImportContent() {
  const searchParams = useSearchParams();

  const { config, error } = useMemo(() => {
    const raw = searchParams.get('settings');
    if (!raw) return { config: null, error: 'No settings found in the URL.' };
    try {
      const parsed = JSON.parse(decodeURIComponent(raw));
      if (typeof parsed.startingChips !== 'number') throw new Error('Invalid format');
      return { config: parsed as GameConfig & { name?: string }, error: null };
    } catch {
      return { config: null, error: 'The share link is invalid or corrupted.' };
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <Link href="/" className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] text-sm">
          ← Back
        </Link>
        <div className="mt-8 text-center">
          <p className="text-[var(--color-danger)] mb-4">{error}</p>
          <a
            href="/new"
            className="text-[var(--color-accent)] hover:underline text-sm"
          >
            Create a new game instead
          </a>
        </div>
      </div>
    );
  }

  return <GameForm initialConfig={config!} />;
}

export default function ImportPage() {
  return (
    <Suspense>
      <ImportContent />
    </Suspense>
  );
}
