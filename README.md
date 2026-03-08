# 🤖 BMO Focus

> *"I will always be here for you."* — BMO

A Pomodoro focus timer and task manager that replaces your Chrome new tab page — styled as **BMO** from *Adventure Time*. Stay focused, track your work, and let BMO cheer you on.

---

## ✨ Features

### 🍅 Pomodoro Timer
- Full Pomodoro cycle: **Focus → Short Break → Long Break**, auto-advancing between modes
- Configurable session lengths and sessions-per-round via the Settings panel
- Visual countdown displayed on BMO's screen
- Timer auto-starts after each mode transition

### 🎵 BMO Sounds
- Subtle **tick sound** every second during breaks (silent during focus — so you can actually focus)
- Unique sound per event:
  - 🎶 **Focus complete** — bright ascending arpeggio
  - ☕ **Break complete** — gentle two-note boop
  - ⭐ **Long break complete** — soft 4-note scale
  - 🏆 **Round complete** — full fanfare with confetti celebration
  - 🔀 **Mode transition** — two-tone swoosh between sessions
- All sounds generated via the **Web Audio API** — no external files

### 🤖 BMO Face & Emotions
- BMO's face changes with the current state:
  - **Focus** — determined squint (two variants)
  - **Break** — wide happy eyes with blush
  - **Long break** — sleepy with floating `z z z`
  - **Success / Round complete** — celebration face
- Active task name and mode badge displayed on BMO's screen
- BMO **floats** gently at all times

### ✅ Task Manager (Mission Log)
- Create, edit, and delete tasks with per-task Pomodoro targets
- Visual progress dots showing completed vs. target sessions
- Tasks auto-complete when their Pomodoro round finishes
- Active task drives BMO's session tracking

### 📊 Data Center (Stats)
- **Today's stats**: focus sessions, total focus time, tasks completed, current streak
- **7-day bar chart** with color-coded best day
- **Week summary** chips with daily breakdown
- **Task progress bar** showing overall completion rate
- All data stored locally in `localStorage` — no backend, fully private

### ⚙️ Settings
- Customize focus duration, short break, long break, and sessions per round
- Settings persist across browser sessions

---

## 🚀 Installation

### Load as a Chrome Extension

1. **Clone the repo**
   
   ```bash
   git clone https://github.com/saad0drc/bmo-focus.git
   cd bmo-focus
   ```
   
2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load into Chrome**
   - Open `chrome://extensions`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked**
   - Select the `dist/` folder

5. Open a new tab — BMO is waiting for you 🤖

---

## 🛠 Development

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build → dist/
npm run lint     # TypeScript type check
```

> After any code change, run `npm run build` and reload the extension in `chrome://extensions`.

---

## 🧰 Tech Stack

| Tool | Purpose |
|------|---------|
| [React 19](https://react.dev) | UI framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Vite](https://vitejs.dev) | Build tool |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [Framer Motion](https://motion.dev) | Animations & floating effects |
| [Recharts](https://recharts.org) | Stats bar chart |
| [Lucide React](https://lucide.dev) | Icons |
| [canvas-confetti](https://github.com/catdad/canvas-confetti) | Celebration effect |
| Web Audio API | All sounds (no files) |
| localStorage | Data persistence |

---

## 📁 Project Structure

```
src/
├── App.tsx                  # Root: layout, timer logic, modal orchestration
├── components/
│   ├── BMOFace.tsx          # BMO screen: face, emotions, mode badge, task display
│   ├── BMOControls.tsx      # D-pad, start/pause, reset, settings button
│   ├── TaskBoard.tsx        # Mission Log: task list with pomodoro progress dots
│   ├── TaskModal.tsx        # Add/edit task modal
│   ├── StatsBoard.tsx       # Data Center: stats grid, chart, week summary
│   └── SettingsModal.tsx    # Timer settings panel
├── hooks/
│   ├── useTimer.ts          # Timer state machine (countdown, modes, settings)
│   ├── useTasks.ts          # Task CRUD + pomodoro tracking + round completion
│   ├── useSessions.ts       # Session persistence + all stat computations
│   └── useBMOState.ts       # BMO emotion state with flash/reset logic
├── utils/
│   └── audio.ts             # All Web Audio sounds (tick, transition, complete, etc.)
└── types.ts                 # Shared TypeScript types
```

---

## 🎮 How to Use

1. **Add a task** in the Mission Log (left panel) — set a name and Pomodoro target
2. **Select it** as your active task
3. **Hit Start** on BMO's controls — focus timer begins
4. When the session ends, BMO plays a sound and **auto-advances** to the break
5. After your breaks, BMO loops back to focus automatically
6. When all your Pomodoros are done — 🎉 confetti and a fanfare!
7. Check the **Data Center** (right panel) for your daily and weekly stats

---

## 📄 License

MIT — do whatever you want, just don't make BMO sad.

---

<p align="center">Made with 💚 and a lot of focus sessions</p>
# bmo-focus
