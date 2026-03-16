'use client';

import { useEffect, useState } from 'react';

interface FiveMinuteWarningProps {
  onDismiss: () => void;
}

const SUITS = ['♠', '♥', '♦', '♣'];
const SUIT_COLORS = ['#e6edf3', '#e53e3e', '#e53e3e', '#e6edf3'];

// Card rotation angles for the fan
const CARD_ROTS = ['-18deg', '-6deg', '6deg', '18deg'];

const CHIP_COLORS = [
  { bg: 'white', text: '#222', shadow: 'rgba(255,255,255,0.5)' },
  { bg: '#c0392b', text: '#fff', shadow: 'rgba(192,57,43,0.6)' },
  { bg: '#27ae60', text: '#fff', shadow: 'rgba(39,174,96,0.6)' },
  { bg: '#1a1a1a', text: '#fff', shadow: 'rgba(0,0,0,0.8)' },
];

const CHIP_ANIMATIONS = ['chip-float', 'chip-float-2', 'chip-float-3', 'chip-float'];

export function FiveMinuteWarning({ onDismiss }: FiveMinuteWarningProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 3800);
    const dismissTimer = setTimeout(() => onDismiss(), 4400);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(dismissTimer);
    };
  }, [onDismiss]);

  function handleClick() {
    setExiting(true);
    setTimeout(onDismiss, 450);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClick}
      style={{ background: 'rgba(0, 0, 0, 0.72)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className={exiting ? 'warning-panel-exit' : 'warning-panel-enter'}
        style={{
          background: 'linear-gradient(160deg, #1a2030 0%, #0d1117 100%)',
          border: '1px solid rgba(212, 168, 83, 0.35)',
          borderRadius: 20,
          padding: '40px 52px',
          maxWidth: 420,
          width: '90vw',
          textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,168,83,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative corner dots */}
        <div style={{ position: 'absolute', top: 14, left: 14, width: 6, height: 6, borderRadius: '50%', background: 'rgba(212,168,83,0.4)' }} />
        <div style={{ position: 'absolute', top: 14, right: 14, width: 6, height: 6, borderRadius: '50%', background: 'rgba(212,168,83,0.4)' }} />
        <div style={{ position: 'absolute', bottom: 14, left: 14, width: 6, height: 6, borderRadius: '50%', background: 'rgba(212,168,83,0.4)' }} />
        <div style={{ position: 'absolute', bottom: 14, right: 14, width: 6, height: 6, borderRadius: '50%', background: 'rgba(212,168,83,0.4)' }} />

        {/* Card fan */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24, height: 72, alignItems: 'flex-end' }}>
          {SUITS.map((suit, i) => (
            <div
              key={suit}
              style={{
                width: 42,
                height: 62,
                background: 'linear-gradient(145deg, #f8f4ee, #ede8e0)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                color: SUIT_COLORS[i],
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                transform: `rotate(${CARD_ROTS[i]})`,
                transformOrigin: 'bottom center',
                animation: `card-deal 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s both`,
                ['--card-start-rot' as string]: `${CARD_ROTS[i]}`,
                ['--card-end-rot' as string]: `${CARD_ROTS[i]}`,
              }}
            >
              {suit}
            </div>
          ))}
        </div>

        {/* Chip row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
          {CHIP_COLORS.map((chip, i) => (
            <div
              key={i}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: chip.bg,
                border: '2px solid rgba(255,255,255,0.4)',
                boxShadow: `0 0 0 2px ${chip.bg}, 0 0 0 4px rgba(255,255,255,0.2), 0 4px 10px ${chip.shadow}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 7,
                fontWeight: 'bold',
                color: chip.text,
                animation: `${CHIP_ANIMATIONS[i]} ${1.8 + i * 0.3}s ease-in-out ${i * 0.15}s infinite`,
              }}
            >
              ●
            </div>
          ))}
        </div>

        {/* Main text */}
        <div
          style={{
            fontSize: 42,
            fontWeight: 900,
            letterSpacing: '0.12em',
            color: '#d4a853',
            lineHeight: 1,
            marginBottom: 8,
            animation: 'gold-pulse 2s ease-in-out infinite',
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          5 MINUTES
        </div>

        <div
          style={{
            fontSize: 13,
            letterSpacing: '0.2em',
            color: '#6e7681',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          remaining in this round
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(212,168,83,0.3))' }} />
          <span style={{ color: 'rgba(212,168,83,0.5)', fontSize: 14 }}>♠</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(212,168,83,0.3))' }} />
        </div>

        <div style={{ fontSize: 11, color: '#4a5060', letterSpacing: '0.1em' }}>
          TAP TO DISMISS
        </div>
      </div>
    </div>
  );
}
