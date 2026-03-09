# BMO Focus — Copilot Instructions

## Project Overview

Chrome extension Pomodoro timer & task manager that replaces the new tab page, themed as BMO from *Adventure Time*. Runs fully client-side — no backend, no external APIs in use (though `@google/genai` is a dependency for future AI features). React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS v4 + Framer Motion.

## Commands

```bash
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build → dist/ (load unpacked in Chrome)
npm run lint     # TypeScript type-check only (tsc --noEmit)
npm run preview  # Preview production build
npm run clean    # Remove dist/
```

No test suite — testing is manual via the browser or by loading the extension from `dist/`.

## Architecture

**Single-page app.** `App.tsx` is the only page; there is no router. Modal visibility (`isSettingsOpen`, `isTaskModalOpen`, `editingTask`) is lifted state in `App.tsx`.

**State is managed exclusively through custom hooks** — no Redux, Context, Zustand, etc.:
- `useTimer` — timer state machine, controls (start/pause/reset/setMode), Chrome extension sync
- `useTasks` — task CRUD, pomodoro counter, streak tracking, daily reset logic
- `useSessions` — session persistence + stat computations (today, week, chart data)
- `useBMOState` — BMO emotion state + `flashEmotion(type, ms)` helper

**Component roles:**
- `App.tsx` — orchestration: wires hooks together, handles timer-completion callbacks (sound, emotion, confetti, session recording), syncs browser tab title
- `BMOFace.tsx` / `BMOControls.tsx` — presentational, receive props + callbacks only
- `TaskBoard.tsx`, `StatsBoard.tsx` — panel components, read computed data from hooks
- `TaskModal.tsx`, `SettingsModal.tsx` — modals rendered at root level (`fixed z-50`) to avoid CSS stacking context issues

**Chrome extension hybrid mode:** `useTimer` detects `typeof chrome?.runtime?.id` to decide whether to sync timer state with a background service worker via `chrome.storage.local` and `chrome.runtime.sendMessage`, or fall back to `localStorage` for web dev.

## Key Conventions

### localStorage Keys
| Key | Value |
|-----|-------|
| `bmo_tasks` | `Task[]` |
| `bmo_sessions` | `Session[]` |
| `bmo_timer_settings` | `TimerSettings` (legacy fallback) |

### Dates
All date values are `YYYY-MM-DD` strings in **local timezone** (not UTC) to avoid midnight offset bugs. Use `new Date().toLocaleDateString('en-CA')` or equivalent.

### Shared Types
All shared types live in `src/types.ts`. Add new types there rather than co-locating them in components.

### `@` Alias
`@` resolves to the project root (e.g., `import { Task } from '@/src/types'`).

### Tailwind v4
Theme is defined via CSS variables in `src/index.css`, not `tailwind.config.*`. Brand colors:
- `#4ECDC4` — BMO teal (primary)
- `#1F4E5A` — dark navy (text/borders)
- `#6BCB77` — lime green (success/break)
- `#FF5E5E` — red (focus/danger)
- `#FFD93D` — yellow (long break/pinned)
- `#E8F5E9` — BMO screen green

### Audio
All sounds are **procedurally generated** with the Web Audio API in `src/utils/audio.ts` — no audio files. Call via the exported `playSound` object (e.g., `playSound.focusComplete()`). Each call creates and auto-cleans its own `AudioContext`.

### BMO Emotions
9 emotion types: `idle | focus | focus2 | success | sleepy | break | confused | excited | tired`. Set directly via `setEmotion()` or temporarily via `flashEmotion(type, durationMs)` which auto-reverts to `idle`.

### Task Migration
`useTasks` runs migration on load to handle older localStorage formats (e.g., `text` → `title`, `sessionsCompleted` → `completedPomodoros`). When changing the `Task` type, add a migration case rather than breaking existing data.

### Framer Motion
Use `AnimatePresence` + `layout` for list animations in `TaskBoard`. Use spring animations for BMO face transitions. The package is imported as `motion` (not `framer-motion`).
