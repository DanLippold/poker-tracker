export interface BlindLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  durationSeconds: number;
}

export interface GameConfig {
  startingChips: number;
  chipDenominations: number[];
  chipColors?: string[];
  blindDurationMinutes: number;
  anteStartLevel: number | null;
  schedule: BlindLevel[];
}

export interface GameState {
  currentLevelIndex: number;
  remainingSeconds: number;
  isPaused: boolean;
  lastTickAt: number | null;
}

export interface Game {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: number;
  updatedAt: number;
  config: GameConfig;
  state: GameState;
}

export interface GameFormValues {
  name: string;
  startingChips: number;
  chipDenominations: number[];
  chipColors: string[];
  blindDurationMinutes: number;
  anteStartLevel: number | null;
}
