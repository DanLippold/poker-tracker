import { BlindLevel, GameFormValues } from './types';

export function snapToCleanValue(raw: number, denoms: number[]): number {
  // Find largest denomination <= raw/2 to use as rounding unit
  const unit = [...denoms].reverse().find((d) => d <= raw / 2) ?? denoms[0];
  return Math.ceil(raw / unit) * unit;
}

export function generateBlindSchedule(values: GameFormValues): BlindLevel[] {
  const { startingChips, chipDenominations, blindDurationMinutes, breakDurationMinutes, anteStartLevel } = values;
  const sortedDenoms = [...chipDenominations].sort((a, b) => a - b);
  const minDenom = sortedDenoms[0];
  const durationSeconds = blindDurationMinutes * 60;
  const breakSeconds = (breakDurationMinutes ?? 5) * 60;

  // Anchor BB at ~1% of starting chips, snapped to clean denomination
  const rawStartBB = startingChips * 0.01;
  let bb = snapToCleanValue(rawStartBB, sortedDenoms);

  // Ensure BB is at least the smallest denomination
  if (bb < sortedDenoms[0]) bb = sortedDenoms[0] * 2;

  const normalLevels: BlindLevel[] = [];
  const maxBB = startingChips * 0.25;
  const MIN_LEVELS = 6;
  const MAX_LEVELS = 20;

  let levelNumber = 1;
  while (normalLevels.length < MAX_LEVELS) {
    // Ensure BB is even so SB = BB/2 is clean
    if (bb % 2 !== 0) bb += sortedDenoms[0];

    const sb = bb / 2;

    let ante = 0;
    if (anteStartLevel !== null && levelNumber >= anteStartLevel) {
      // Antes start at minDenom, increase by minDenom per level, capped at BB
      const anteOffset = levelNumber - anteStartLevel; // 0-based
      const rawAnte = minDenom * (anteOffset + 1);
      ante = Math.min(rawAnte, bb);
    }

    normalLevels.push({ level: levelNumber, smallBlind: sb, bigBlind: bb, ante, durationSeconds });
    levelNumber++;

    if (normalLevels.length >= MIN_LEVELS && bb >= maxBB) break;

    // Next BB: multiply by ~1.5 and snap to clean value
    const nextRaw = bb * 1.5;
    bb = snapToCleanValue(nextRaw, sortedDenoms);
    // Prevent getting stuck at same value
    if (bb <= normalLevels[normalLevels.length - 1].bigBlind) {
      bb = normalLevels[normalLevels.length - 1].bigBlind + sortedDenoms[0];
      bb = snapToCleanValue(bb, sortedDenoms);
    }
  }

  // Insert a break round after every 3 normal rounds
  const schedule: BlindLevel[] = [];
  for (let i = 0; i < normalLevels.length; i++) {
    schedule.push(normalLevels[i]);
    if ((i + 1) % 3 === 0 && i + 1 < normalLevels.length) {
      schedule.push({ level: 0, smallBlind: 0, bigBlind: 0, ante: 0, durationSeconds: breakSeconds, isBreak: true });
    }
  }

  return schedule;
}
