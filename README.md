# 🤖 BMO Focus

> *"I will always be here for you."* — BMO

A beautiful **Pomodoro focus timer and task manager** that replaces your Chrome new tab page. Meet **BMO** — your cute, pixel-perfect focus companion from *Adventure Time* who cheers you on, celebrates your wins, and helps you stay productive with style.

**BMO Focus** combines the proven Pomodoro Technique with a charming retro handheld device aesthetic. Every focus session comes with ambient sounds, emotional feedback, and satisfying visual rewards. All data stays on your machine — no tracking, no backend, fully private.

---

## 📚 Table of Contents

Quick links to navigate this guide:

- [🤖 What is BMO?](#-what-is-bmo)
- [✨ Features](#-features)
  - [🍅 Pomodoro Timer](#-pomodoro-timer-with-three-modes)
  - [🎵 Unique Sounds](#-unique-sounds-for-every-event)
  - [🤖 BMO Face & Emotions](#-bmo-face--emotions)
  - [✅ Task Manager](#-task-manager-mission-log)
  - [⚡ Challenge System](#-challenge-system)
  - [📊 Data Center](#-data-center-stats-dashboard)
  - [🎨 Customizable Config](#-customizable-system-config)
- [🚀 Getting Started](#-getting-started-step-by-step)
  - [Prerequisites](#prerequisites)
  - [Step 1: Clone Repository](#step-1-clone-the-repository)
  - [Step 2: Install Dependencies](#step-2-install-dependencies)
  - [Step 3: Build Extension](#step-3-build-the-extension)
  - [Step 4: Load into Chrome](#step-4-load-bmo-into-chrome)
  - [Step 5: Open New Tab](#step-5-open-a-new-tab)
- [🎮 How to Use](#-how-to-use-bmo-focus)
  - [Adding Tasks](#adding-your-first-task)
  - [Starting Sessions](#starting-a-focus-session)
  - [Tracking Progress](#tracking-progress)
  - [Using Challenges](#using-the-challenge-system)
- [🛠 Development Commands](#-development-commands)
- [📱 Device Support](#-using-on-different-devices)
- [🧰 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🎨 Customization Guide](#-customization)
- [🐛 Troubleshooting](#-troubleshooting)
- [📄 License](#-license)
- [🙏 Credits](#-credits)

---

## 🎮 What is BMO?

BMO is a character from the TV show *Adventure Time*. In the show, BMO is a sentient video game console and the most adorable character you'll ever meet. BMO has a simple goal: *"I will always be here for you."*

**BMO Focus** brings this spirit to life as your personal productivity companion:
- **Cute & Expressive** — BMO's face changes based on what you're doing (focus, break, success)
- **Supportive & Encouraging** — BMO delivers random motivational quotes and celebrates when you finish challenges
- **Responsive & Alive** — Floating animations, emotional sounds, and satisfying interaction feedback
- **Pixel-Perfect Aesthetic** — A handcrafted retro device design with modern UX

Think of BMO as your accountability buddy who actually wants you to succeed. 💚

---

## ✨ Features

### 🍅 Pomodoro Timer with Three Modes
- **Focus** — Deep work session (default 25 min) with silence for concentration
- **Short Break** — Quick recharge (default 5 min) with gentle ticking sound
- **Long Break** — Extended rest after every 4 focus sessions (default 15 min)
- Timer auto-advances between modes — no manual switching needed
- Current timer display shows on BMO's screen in large, readable text

### 🎵 Unique Sounds for Every Event
- **Silent during focus** — So you can actually concentrate without distraction
- **Tick during breaks** — Subtle ambient sound to keep you engaged but not stressed
- **Focus complete** — Bright ascending arpeggio (satisfying musical reward)
- **Break complete** — Gentle two-note boop (friendly wake-up call)
- **Long break complete** — Soft 4-note scale (relaxing transition back to focus)
- **Round complete** — Full fanfare with orchestral flourish (celebratory!)
- **Mode transition** — Two-tone swoosh between sessions (smooth and musical)
- **All sounds are procedurally generated via Web Audio API** — No audio files needed

### 🤖 BMO Face & Emotions
- **Idle** — Calm, neutral expression waiting for you to start
- **Focus** — Determined squint with two intensity levels
- **Break** — Wide happy eyes with a little blush (happy rest time!)
- **Long Break** — Sleepy expression with floating `zzz` (deep rest mode)
- **Success** — Excited celebration face (you did it!)
- **Confused** — Puzzled expression (not sure what you're up to)
- BMO **gently floats** at all times with a breathing animation
- Active task name and current mode badge displayed on the screen

### ✅ Task Manager (Mission Log)
- **Create unlimited tasks** with custom names and Pomodoro targets
- **Track progress** with visual dots (●) for completed vs. goal sessions
- **Edit or delete** tasks anytime
- **Auto-complete** tasks when you finish all their Pomodoros
- **Active task indicator** — Shows which task is currently being tracked
- See your task list grow as you accomplish more throughout the day

### ⚡ Challenge System
- **Daily focus challenges** with motivational quotes from BMO
- **Visual progress tracking** with tomato emojis (🍅) representing each completed session
- **Challenge cards** that display your goal, time logged, and completion percentage
- **Adaptive difficulty** — Set goals that match your energy level
- **Challenge history** — Review past achievements and see your growth

### 📊 Data Center (Stats Dashboard)
- **Today's snapshot** — Focus sessions completed, total focus time, tasks done, current streak
- **7-day bar chart** — Visual graph showing your productivity throughout the week
- **Week summary chips** — Daily breakdown with best/worst day highlighted
- **Task progress bar** — Overall completion rate across all tasks
- **All data stored locally** — No cloud sync, no ads, no tracking, fully private

### 🎨 Customizable System Config
- **Timer lengths** — Adjust focus, short break, and long break durations to your style
- **Sound volume** — Control how loud your alerts are (0-100%)
- **Sound effects toggle** — Turn audio on/off whenever you want
- **Auto-start timer** — Automatically begin the next session without clicking
- **Desktop notifications** — Get alerted even if you're in another browser tab
- **Challenge system toggle** — Enable/disable daily challenges
- **Reset all data** — Clear everything and start fresh
- All settings persist across browser sessions

---

## 🚀 Getting Started (Step-by-Step)

### Prerequisites
Before you begin, make sure you have:
- **Google Chrome** browser installed
- **Node.js** (version 16 or higher) with npm
- **Git** for cloning the repository
- A code editor (optional, but helpful for development)

### Step 1: Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/saad0drc/bmo-focus.git
cd bmo-focus
```

This downloads BMO Focus to your computer and enters the project folder.

### Step 2: Install Dependencies

Still in the `bmo-focus` folder, run:

```bash
npm install
```

This installs all the required libraries and tools. It may take a minute or two. You'll see npm downloading packages and creating a `node_modules` folder.

### Step 3: Build the Extension

Run:

```bash
npm run build
```

This creates a production-ready version of BMO Focus in the `dist/` folder. You should see output like:

```
✓ built in 5.42s
```

Great! The extension is now ready to load into Chrome.

### Step 4: Load BMO into Chrome

1. **Open Chrome's Extension Settings**
   - Type `chrome://extensions` into the address bar and press Enter
   - You should see a page with "Extensions" at the top

2. **Enable Developer Mode**
   - Look for the **Developer mode** toggle in the top-right corner
   - Click it to turn it on (it should turn blue)

3. **Load the Extension**
   - Click the blue **Load unpacked** button that now appears
   - A file browser will open
   - Navigate to your `bmo-focus` folder
   - Open the `dist/` subfolder
   - Click **Select Folder**

4. **Verify Installation**
   - You should see "BMO Focus" appear in your extensions list
   - Check the box to enable it if it's not already enabled
   - You might see a small BMO icon appear in your Chrome toolbar

### Step 5: Open a New Tab

Open a **new tab** in Chrome (press `Ctrl+T` or `Cmd+T`). 

**BMO is waiting for you!** 🤖

You should see:
- BMO's cute face in the center of the screen
- Control buttons below (D-pad, play/pause, reset, settings)
- Mission Log on the left (where you add tasks)
- Data Center on the right (where you see your stats)

---

## 🎮 How to Use BMO Focus

### Adding Your First Task

1. Look at the **Mission Log** panel on the left side
2. Click the **➕ Add Task** button
3. Enter a task name (e.g., "Learn React")
4. Set the **Pomodoro goal** (e.g., "3 sessions" = 75 minutes)
5. Click **Create** or **Save**

Your task now appears in the Mission Log!

### Starting a Focus Session

1. **Select your task** — Click on it in the Mission Log to make it active
2. **Configure your settings** (optional) — Click the ⚙️ icon to adjust timer lengths
3. **Click Start** — Press the play button on BMO's controls
4. **Focus!** — The timer counts down and BMO's face shows you're in focus mode
5. **BMO stays silent** — So you can concentrate without distraction

### When Your Timer Ends

1. **BMO plays a sound** — A satisfying "ding!" lets you know time's up
2. **Auto-advance to break** — The timer automatically switches to break mode
3. **Take a break** — Stretch, get water, rest your eyes
4. **Auto-advance back to focus** — After your break, BMO is ready for the next session
5. **Repeat** — After 4 focus sessions, you get a longer break (well deserved!)

### Tracking Progress

- **Mission Log** — See filled (●) vs. empty (○) dots for each task's progress
- **Data Center** — Check today's stats: sessions completed, total time, current streak
- **Weekly chart** — View your 7-day productivity graph
- **Task completion** — Watch the overall progress bar fill as you finish tasks

### Using the Challenge System

1. Click the **⚡ Challenge** quote at the bottom
2. Set your **daily goal** (e.g., "5 Pomodoros today")
3. Watch the **challenge card** track your progress with 🍅 tomatoes
4. Get **motivational quotes** from BMO as you work
5. See a **victory message** when you complete your challenge

---

## 🛠 Development Commands

If you want to modify BMO Focus or contribute:

```bash
# Start development server (live reload at http://localhost:3000)
npm run dev

# Build for production (creates dist/ folder)
npm run build

# Type-check without building
npm run lint

# Preview the production build locally
npm run preview

# Clean up build files
npm run clean
```

**After making changes:**
1. Run `npm run build`
2. Reload the extension in `chrome://extensions` (click the reload icon)
3. Open a new tab to see your changes

---

## 📱 Using on Different Devices

### Desktop & Laptop (Recommended)
BMO Focus works best on desktop with the full 3-column layout:
- Left: Mission Log
- Center: BMO device
- Right: Data Center

### Tablet
On medium screens, BMO is centered with collapsible panels above and below.

### Mobile
On small screens, use snap-scroll to swipe between pages:
- Swipe right → BMO (timer and controls)
- Swipe left → Mission Log (tasks)
- Swipe left → Data Center (stats)

---

## 🧰 Tech Stack

BMO Focus is built with modern web technologies:

| Technology | Purpose |
|-----------|---------|
| [React 19](https://react.dev) | Interactive UI framework |
| [TypeScript](https://www.typescriptlang.org) | Type-safe JavaScript |
| [Vite](https://vitejs.dev) | Lightning-fast build tool |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first styling |
| [Framer Motion](https://motion.dev) | Smooth animations & interactions |
| [Recharts](https://recharts.org) | Beautiful stats charts |
| [Lucide React](https://lucide.dev) | Crisp icons |
| [canvas-confetti](https://github.com/catdad/canvas-confetti) | Celebration effects |
| **Web Audio API** | Procedural sound generation |
| **localStorage** | Local data persistence |

**No external APIs, no tracking, no backend.** Everything runs in your browser.

---

## 📁 Project Structure

```
src/
├── App.tsx                      # Main app: layout, orchestration, timer logic
├── components/
│   ├── BMOFace.tsx              # BMO's display screen (face, emotions, task info)
│   ├── BMOControls.tsx          # Control buttons (d-pad, play/pause, settings)
│   ├── TaskBoard.tsx            # Mission Log panel (task list & management)
│   ├── TaskModal.tsx            # Task creation/editing modal
│   ├── ChallengeCard.tsx        # Daily challenge display with progress
│   ├── ChallengePlannerModal.tsx # Challenge creation modal
│   ├── ChallengeHistoryModal.tsx # Past challenges review
│   ├── StatsBoard.tsx           # Data Center panel (stats & charts)
│   ├── SettingsModal.tsx        # System Config (timer, sound, features)
│   └── [other components]       # Utility modals and helpers
├── hooks/
│   ├── useTimer.ts              # Timer state machine & settings
│   ├── useTasks.ts              # Task CRUD & Pomodoro tracking
│   ├── useSessions.ts           # Session persistence & stats
│   └── useBMOState.ts           # BMO emotion logic
├── utils/
│   └── audio.ts                 # Web Audio procedural sounds
├── types.ts                     # TypeScript shared types
└── index.css                    # Global styles & CSS variables
```

---

## 🎨 Customization

### Changing BMO's Colors
Edit `src/index.css` and modify the CSS variables:
```css
--color-bmo-teal: #4ECDC4;      /* Main color */
--color-bmo-dark: #1F4E5A;      /* Text/borders */
--color-bmo-screen: #E8F5E9;    /* Screen background */
```

### Adding New Sounds
Edit `src/utils/audio.ts` and add new sound functions following the existing pattern.

### Changing Timer Defaults
Edit `src/hooks/useTimer.ts` and modify `DEFAULT_SETTINGS`:
```typescript
focus: 25,          // minutes
shortBreak: 5,      // minutes
longBreak: 15,      // minutes
```

---

## 🐛 Troubleshooting

### "Extension doesn't appear in Chrome"
- Make sure you enabled **Developer mode** in `chrome://extensions`
- Make sure you selected the **`dist/` folder**, not the project root
- Try clicking the reload icon next to the extension

### "Timer doesn't make sounds"
- Check if sound is enabled in **System Config** (⚙️ icon)
- Make sure your volume isn't muted
- Check Chrome's tab audio icon (browser may be blocking autoplay audio)
- Try the **Test Sound** button in settings

### "Tasks keep disappearing"
- BMO uses `localStorage` to save data
- If you clear browser data, tasks will be deleted
- Check if your browser allows `localStorage` for extensions

### "Extension stops working after update"
- Reload the extension in `chrome://extensions`
- Close and reopen your new tabs

---

## 📄 License

MIT — Use BMO Focus however you want. Just don't make BMO sad. 💚

---

## 🙏 Credits

**Inspired by:**
- *Adventure Time* and the character BMO (created by Pendleton Ward)
- The Pomodoro Technique (Francesco Cirillo)
- Countless focus artists and productivity enthusiasts

**Made with love, determination, and many focus sessions.** ✨

---

<p align="center">
  💚 <strong>Stay focused. Stay cute. Let BMO guide you.</strong> 💚
</p>
