# CLAUDE.md — Poker Tracker

## Project Overview

A Texas Hold'em blind timer application built with **Next.js 16 + React 19 + Tailwind CSS 4**. This is a **fully client-side app** — no backend, no API routes, no database. All state is persisted in browser localStorage.

Key capabilities:
- Auto-generate blind progression schedules from starting chip count
- Real-time countdown timer with audio/visual alerts
- Chip denomination management with color customization
- Game creation, cloning, deletion, and settings import/export

---

## Tech Stack

| Tool | Version | Notes |
|------|---------|-------|
| Next.js | 16.1.6 | App Router, no API routes |
| React | 19.2.3 | |
| TypeScript | ^5 | Strict mode enabled |
| Tailwind CSS | ^4 | PostCSS config, CSS custom properties for theme |
| Package manager | pnpm | Use `pnpm` for all installs |

---

## Project Structure

```
poker-tracker/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout with fonts
│   ├── page.tsx                # Home: game list dashboard
│   ├── globals.css             # Theme variables + animations
│   ├── new/page.tsx            # New game creation form
│   └── game/[id]/page.tsx      # Active game timer view
├── components/
│   ├── ActiveGame/             # In-game display components
│   │   ├── ActiveGame.tsx      # Main game controller (loads state, manages writes)
│   │   ├── BlindDisplay.tsx    # Current small/big blind + ante
│   │   ├── ChipDisplay.tsx     # Chip denominations with color chips
│   │   ├── CountdownTimer.tsx  # MM:SS countdown with color urgency states
│   │   ├── FiveMinuteWarning.tsx  # Animated modal at 5:00 remaining
│   │   ├── GameSettingsEditor.tsx # In-game settings modal
│   │   ├── NextLevelPreview.tsx   # "Up next" blind level
│   │   └── TimerControls.tsx   # Play/Pause/Skip controls
│   ├── GameForm/               # Game creation/configuration
│   │   ├── GameForm.tsx        # Main form (chips, schedule, denominations)
│   │   ├── ChipDenominationsInput.tsx  # Add/remove chips with color cycling
│   │   ├── BlindSchedulePreview.tsx    # Read-only schedule table
│   │   └── RoundEditorTable.tsx        # Editable schedule with cascade logic
│   ├── GameList/               # Game management dashboard
│   │   ├── GameList.tsx        # All games sorted by status
│   │   ├── GameCard.tsx        # Individual game card with actions
│   │   └── EmptyState.tsx      # Empty state placeholder
│   └── ui/                     # Reusable primitives
│       ├── Button.tsx          # Variants: primary, secondary, danger, ghost
│       ├── Card.tsx            # Surface container
│       └── Badge.tsx           # Status indicator
├── hooks/
│   ├── useGame.ts              # Game CRUD + debounced localStorage writes
│   ├── useTimer.ts             # Countdown logic, warnings, tick interval
│   └── useSound.ts             # Web Audio API tones (level-up + warning)
└── lib/
    ├── types.ts                # All TypeScript interfaces
    ├── storage.ts              # localStorage read/write helpers
    ├── blindSchedule.ts        # Blind schedule generation algorithm
    └── utils.ts                # formatTime, formatChips, generateId
```

---

## Development Commands

```bash
pnpm dev       # Start dev server (localhost:3000)
pnpm build     # Production build
pnpm start     # Start production server
pnpm lint      # ESLint check
```

**No test suite is currently configured.**

---

## Core Data Model

Defined in `lib/types.ts`:

```typescript
interface BlindLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  durationSeconds: number;
}

interface GameConfig {
  startingChips: number;
  chipDenominations: number[];
  chipColors: string[];           // parallel array to chipDenominations
  blindDurationMinutes: number;
  anteStartLevel: number | null;  // null = no antes
  schedule: BlindLevel[];
}

interface GameState {
  currentLevelIndex: number;
  remainingSeconds: number;
  isPaused: boolean;
  lastTickAt: number;             // timestamp for drift correction
}

interface Game {
  id: string;                     // UUID
  name: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: number;
  updatedAt: number;
  config: GameConfig;
  state: GameState;
}
```

---

## localStorage Schema

All game data lives under these keys:

| Key | Contents |
|-----|---------|
| `poker-tracker-games` | `{ version: 1, games: Game[] }` |
| `poker-tracker-denoms` | `number[]` — last used chip denominations |
| `poker-tracker-colors` | `string[]` — last used chip colors |

Storage operations are in `lib/storage.ts`. All functions handle parse errors gracefully and return safe defaults.

---

## Key Conventions

### State Management
- No global state library (no Redux, Zustand, etc.). State flows through React hooks.
- `useGame` provides game CRUD, debouncing writes to ~1 write/second max.
- `ActiveGame.tsx` additionally debounces timer state writes every ~5 seconds to avoid excessive I/O.

### Blind Schedule Algorithm (`lib/blindSchedule.ts`)
- Anchors the starting big blind at ~1% of starting chips
- Scales each level by ~1.5x
- Snaps blind values to clean chip denomination values via `snapToCleanValue()`
- Generates 6–20 levels depending on starting chip count
- Antes activate at `anteStartLevel` if configured

### Cascade Editing (RoundEditorTable)
- Editing a value in the schedule cascades proportional changes to dependent subsequent rows
- The final row can always be freely edited without cascading

### Timer Architecture (`hooks/useTimer.ts`)
- 500ms tick interval for accuracy
- Handles tab visibility changes: resumes correct countdown when tab refocuses using `lastTickAt` drift correction
- Fires callbacks: `onTick`, `onLevelUp`, `onWarning` (30s), `onFiveMinuteWarning` (300s)

### Audio (`hooks/useSound.ts`)
- Uses Web Audio API (no external audio files)
- `playLevelUp`: 3-tone ascending melody (880Hz → 660Hz → 440Hz)
- `playWarning`: Single tone at 440Hz
- Initializes AudioContext on first user interaction to comply with browser autoplay policy

### Styling
- Tailwind CSS v4 with CSS custom properties defined in `app/globals.css`
- Dark theme only — all colors reference CSS variables (not hardcoded hex in components)
- Theme variables: `--color-background`, `--color-surface`, `--color-border`, `--color-accent` (green), `--color-accent-gold`, `--color-danger`, `--color-muted`, `--color-foreground`
- Animations defined in `globals.css`: `warning-slide-in`, `warning-fade-out`, `chip-float`, `card-deal`, `gold-pulse`

### Component Patterns
- Feature modules grouped by directory (`ActiveGame/`, `GameForm/`, `GameList/`)
- `ui/` contains only generic, stateless presentational components
- No CSS modules — Tailwind utility classes only
- `'use client'` directive on all interactive components (everything is client-side)

---

## Routing

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `GameList` | Dashboard — all games |
| `/new` | `GameForm` | Create a new game |
| `/game/[id]` | `ActiveGame` | Live timer for a specific game |

---

## Adding New Features — Checklist

1. **New type?** → Add to `lib/types.ts`
2. **New localStorage key?** → Add read/write helpers in `lib/storage.ts`
3. **New timer event?** → Add callback to `useTimer.ts` interface + `ActiveGame.tsx`
4. **New UI primitive?** → Add to `components/ui/` with variant props following `Button.tsx` pattern
5. **New chip color?** → The 8 preset colors are defined in `ChipDenominationsInput.tsx`

---

## Known Limitations

- No server-side rendering benefits (all `'use client'`)
- localStorage is not shared across devices or browsers
- No authentication or multi-user support
- No test suite configured yet
