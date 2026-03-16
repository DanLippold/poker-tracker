import { Game } from './types';

const STORAGE_KEY = 'poker-tracker-games';
const DENOMS_KEY = 'poker-tracker-denoms';
const COLORS_KEY = 'poker-tracker-colors';

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

export function loadDefaultDenominations(): number[] {
  try {
    const raw = localStorage.getItem(DENOMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveDefaultDenominations(denoms: number[]): void {
  try {
    localStorage.setItem(DENOMS_KEY, JSON.stringify(denoms));
  } catch {
    // ignore
  }
}

export function loadDefaultColors(): string[] {
  try {
    const raw = localStorage.getItem(COLORS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveDefaultColors(colors: string[]): void {
  try {
    localStorage.setItem(COLORS_KEY, JSON.stringify(colors));
  } catch {
    // ignore
  }
}
