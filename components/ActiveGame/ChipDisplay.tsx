import React from 'react';

const LIGHT_COLORS = new Set(['white', 'yellow', 'cyan', 'lime', 'silver']);

function isLight(color: string): boolean {
  return LIGHT_COLORS.has(color);
}

interface PokerChipProps {
  value: number;
  color: string;
  size?: number;
}

export function PokerChip({ value, color, size = 52 }: PokerChipProps) {
  const label = value >= 1000 ? `${value / 1000}k` : String(value);
  const textColor = isLight(color) ? '#222' : '#fff';
  const fontSize = size <= 44 ? 10 : size <= 56 ? 13 : 15;

  return (
    <div
      style={{
        width: `clamp(${size}px, ${(size / 1024) * 100}vw, ${size * 2}px)`,
        height: `clamp(${size}px, ${(size / 1024) * 100}vw, ${size * 2}px)`,
        borderRadius: '50%',
        background: color,
        border: '3px solid rgba(255,255,255,0.5)',
        boxShadow: `0 0 0 2px ${color}, 0 0 0 6px rgba(255,255,255,0.2), 0 0 0 8px ${color}, 0 4px 12px rgba(0,0,0,0.5)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `clamp(${fontSize}px, ${(fontSize / 1024) * 100}vw, ${fontSize * 2}px)`,
        fontWeight: 'bold',
        color: textColor,
        flexShrink: 0,
        userSelect: 'none',
        letterSpacing: '-0.02em',
      }}
    >
      {label}
    </div>
  );
}

interface ChipDisplayProps {
  denominations: number[];
  colors: string[];
}

export function ChipDisplay({ denominations, colors }: ChipDisplayProps) {
  if (!denominations.length) return null;

  return (
    <div className="flex gap-3 lg:gap-5 xl:gap-7 items-center justify-center flex-wrap">
      {denominations.map((denom, i) => (
        <PokerChip key={denom} value={denom} color={colors[i] ?? 'white'} size={52} />
      ))}
    </div>
  );
}
