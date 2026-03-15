import { Game } from './types';

const STORAGE_KEY = 'poker-tracker-games';

interface StorageData {
  version: number;
  games: Game[];
}

function readStorage(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, games: [] };
    const parsed = JSON.parse(raw) as StorageData;
    if (!parsed.version || !Array.isArray(parsed.games)) {
      return { version: 1, games: [] };
    }
    return parsed;
  } catch {
    return { version: 1, games: [] };
  }
}

function writeStorage(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function loadAllGames(): Game[] {
  return readStorage().games;
}

export function loadGame(id: string): Game | null {
  return readStorage().games.find((g) => g.id === id) ?? null;
}

export function saveGame(game: Game): void {
  const data = readStorage();
  const idx = data.games.findIndex((g) => g.id === game.id);
  if (idx >= 0) {
    data.games[idx] = game;
  } else {
    data.games.push(game);
  }
  writeStorage(data);
}

export function deleteGame(id: string): void {
  const data = readStorage();
  data.games = data.games.filter((g) => g.id !== id);
  writeStorage(data);
}
