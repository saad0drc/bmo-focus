/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import { useBMOState } from './hooks/useBMOState';
import { useTimer, TimerMode, TimerSettings } from './hooks/useTimer';
import { useTasks } from './hooks/useTasks';
import { useSessions } from './hooks/useSessions';
import { BMOFace } from './components/BMOFace';
import { BMOControls } from './components/BMOControls';
import { TaskBoard } from './components/TaskBoard';
import { TaskModal } from './components/TaskModal';
import { StatsBoard } from './components/StatsBoard';
import { SettingsModal } from './components/SettingsModal';
import { Session } from './types';
import { Task, TaskSettings } from './types';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { playSound } from './utils/audio';

const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

export default function App() {
  const { emotion, setEmotion, flashEmotion } = useBMOState();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Task modal state — lifted here so it's outside any CSS-transformed parent
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const { tasks, addTask, updateTask, toggleTask, deleteTask, incrementPomodoro, completeRound } = useTasks();
  const { sessions, addSession } = useSessions();

  const handleOpenAdd = () => { setEditingTask(undefined); setIsTaskModalOpen(true); };
  const handleOpenEdit = (task: Task) => { setEditingTask(task); setIsTaskModalOpen(true); };
  const handleModalSave = (title: string, settings: TaskSettings, dueDate?: string) => {
    if (editingTask) {
      updateTask(editingTask.id, { title, settings, dueDate });
    } else {
      addTask(title, settings, dueDate);
    }
  };

  // Refs so the timer callback always reads current values without re-subscribing
  const modeRef = useRef<TimerMode>('focus');
  const settingsRef = useRef<TimerSettings>(DEFAULT_SETTINGS);
  const activeTaskIdRef = useRef<string | null>(null);
  const tasksRef = useRef<Task[]>([]);
  // Refs for timer control functions — populated after useTimer call below
  const setModeRef = useRef<(m: TimerMode) => void>(() => {});
  const startTimerRef = useRef<() => void>(() => {});
  // Tracks how many focus sessions completed in the current round (for long-break logic)
  const focusSessionCountRef = useRef(0);

  useEffect(() => { activeTaskIdRef.current = activeTaskId; }, [activeTaskId]);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);

  // Confetti on success
  useEffect(() => {
    if (emotion === 'success') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#63C5DA', '#FF5E5E', '#FFD93D', '#6BCB77'],
      });
    }
  }, [emotion]);

  const handleTimerComplete = useCallback(() => {
    const mode = modeRef.current;
    const s = settingsRef.current;

    // Local date string (avoids UTC offset bug)
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

    const scheduleAdvance = (nextMode: TimerMode, delay = 2800) => {
      setTimeout(() => {
        playSound.transition();
        setModeRef.current(nextMode);
        setTimeout(() => startTimerRef.current(), 900);
      }, delay);
    };

    if (mode === 'focus') {
      focusSessionCountRef.current += 1;
      const taskId = activeTaskIdRef.current;
      const duration = s.focus;

      addSession({ id: crypto.randomUUID(), taskId, duration, completed: true, date: today });

      if (taskId) {
        const task = tasksRef.current.find(t => t.id === taskId);
        const newCount = (task?.completedPomodoros ?? 0) + 1;
        const target   = task?.settings?.sessionsPerRound ?? 4;

        if (newCount >= target) {
          completeRound(taskId, duration);
          playSound.roundComplete();
          flashEmotion('success', 9000);
        } else {
          incrementPomodoro(taskId, duration);
          playSound.focusComplete();
          flashEmotion('success');
        }
      } else {
        playSound.focusComplete();
        flashEmotion('success');
      }

      // Decide break type: long every N sessions (use task setting or default 4)
      const task = tasksRef.current.find(t => t.id === activeTaskIdRef.current);
      const longBreakEvery = task?.settings?.sessionsPerRound ?? 4;
      const nextMode: TimerMode =
        focusSessionCountRef.current % longBreakEvery === 0 ? 'longBreak' : 'shortBreak';

      scheduleAdvance(nextMode);

    } else if (mode === 'shortBreak') {
      playSound.breakComplete();
      flashEmotion('idle');
      scheduleAdvance('focus', 2000);

    } else {
      // longBreak
      playSound.longBreakComplete();
      flashEmotion('idle');
      focusSessionCountRef.current = 0; // reset round counter after long break
      scheduleAdvance('focus', 2500);
    }
  }, [addSession, incrementPomodoro, completeRound, flashEmotion]);

  const { timeLeft, isActive, mode, startTimer, pauseTimer, resetTimer, setMode, settings, updateSettings } =
    useTimer(handleTimerComplete);

  // Sync timer control functions into refs (used by handleTimerComplete for auto-advance)
  useEffect(() => { setModeRef.current = setMode; }, [setMode]);
  useEffect(() => { startTimerRef.current = startTimer; }, [startTimer]);

  // Tick sound — only during breaks (not focus, so you can actually focus 😄)
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;
    if (mode === 'focus') return;
    playSound.tick();
  }, [timeLeft, isActive, mode]);

  // Randomly pick between face variants when mode changes
  const focusVariantRef = useRef<'focus' | 'focus2'>('focus');
  const breakVariantRef = useRef<'sleepy' | 'break'>('sleepy');
  useEffect(() => {
    focusVariantRef.current = Math.random() < 0.5 ? 'focus' : 'focus2';
    breakVariantRef.current = Math.random() < 0.5 ? 'sleepy' : 'break';
  }, [mode]);

  useEffect(() => {
    modeRef.current = mode;
    settingsRef.current = settings;
  }, [mode, settings]);

  // Sync per-task timer settings when active task changes
  useEffect(() => {
    if (!activeTaskId) return;
    const task = tasks.find(t => t.id === activeTaskId);
    if (task?.settings) {
      updateSettings({
        focus: task.settings.focusDuration,
        shortBreak: task.settings.shortBreakDuration,
        longBreak: task.settings.longBreakDuration,
      });
    }
  }, [activeTaskId, tasks, updateSettings]);

  // Sync BMO emotion with timer state
  useEffect(() => {
    if (emotion === 'success') return;
    if (isActive) {
      if (mode === 'focus') setEmotion(focusVariantRef.current);
      else if (mode === 'shortBreak') setEmotion(breakVariantRef.current);
      else setEmotion('excited');
    } else {
      setEmotion('idle');
    }
  }, [isActive, mode, emotion, setEmotion]);

  const handleTaskToggle = (id: string) => toggleTask(id);

  const activeTask = tasks.find(t => t.id === activeTaskId) ?? null;

  return (
    <div className="min-h-screen w-full flex flex-col p-4 relative bg-[#1a2332] overflow-y-auto font-sans selection:bg-[#4ECDC4] selection:text-[#1F4E5A]">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(#4ECDC4 1px, transparent 1px),
            linear-gradient(90deg, #4ECDC4 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: 'center center',
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      {/* Modals — rendered at root level, outside any CSS-transformed parents */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
      />
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleModalSave}
        initialTask={editingTask}
      />

      {/* Main 3-column grid */}
      <div className="flex-1 w-full max-w-[96rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start justify-center relative z-10 px-4 pt-3 pb-4">

        {/* Left — Mission Log */}
        <div className="lg:col-span-3 h-[560px] lg:h-[620px] flex flex-col mt-0">
          <motion.div
            initial={{ x: -50, opacity: 0, y: 0 }}
            animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
            transition={{
              x: { duration: 0.5, delay: 0.2 },
              opacity: { duration: 0.5, delay: 0.2 },
              y: { duration: 4.1, repeat: Infinity, ease: 'easeInOut', delay: 0.9 },
            }}
            className="bg-[#F5F5F0] p-2 rounded-[1.5rem] border-[4px] border-[#1a2332] shadow-[6px_6px_0px_rgba(0,0,0,0.35),0_15px_40px_rgba(0,0,0,0.25)] h-full flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-8 bg-[#1a2332] flex items-center justify-center">
              <div className="w-16 h-1.5 bg-[#4ECDC4]/30 rounded-full" />
            </div>
            <div className="mt-6 relative z-20 h-full flex flex-col bg-[#DCF6E6] rounded-xl border-2 border-[#1F4E5A]/10 overflow-hidden">
              <TaskBoard
                tasks={tasks}
                activeTaskId={activeTaskId}
                onAdd={addTask}
                onUpdate={updateTask}
                onToggle={handleTaskToggle}
                onDelete={deleteTask}
                onSelectActive={setActiveTaskId}
                onOpenAdd={handleOpenAdd}
                onOpenEdit={handleOpenEdit}
              />
            </div>
          </motion.div>
        </div>

        {/* Center — BMO */}
        <div className="lg:col-span-6 flex justify-center items-start h-full pt-0">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
            transition={{
              scale: { duration: 0.5 },
              opacity: { duration: 0.5 },
              y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.7 },
            }}
            className="relative bg-gradient-to-b from-[#5ADCD5] via-[#4ECDC4] to-[#36B8AF] p-6 rounded-[4rem] border-[8px] border-[#1a4a52] shadow-[0_35px_100px_rgba(0,0,0,0.55),0_10px_25px_rgba(0,0,0,0.3),inset_-8px_-14px_28px_rgba(0,0,0,0.18),inset_8px_8px_20px_rgba(255,255,255,0.28)] w-full max-w-[560px] flex flex-col items-center gap-4 z-20"
          >
            {/* Side grips */}
            <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-5 h-52 flex flex-col justify-between py-3 opacity-30">
              {[...Array(10)].map((_, i) => <div key={i} className="w-full h-2 rounded-r-full bg-[#1a4a52]" />)}
            </div>
            <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-5 h-52 flex flex-col justify-between py-3 opacity-30">
              {[...Array(10)].map((_, i) => <div key={i} className="w-full h-2 rounded-l-full bg-[#1a4a52]" />)}
            </div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-white/15 rounded-b-[100%] blur-sm pointer-events-none" />

            {/* Screen */}
            <div className="relative z-10 w-full aspect-[4/3] bg-[#E8F5E9] rounded-[2rem] border-[7px] border-[#1a4a52] overflow-hidden shadow-[inset_0_4px_20px_rgba(0,0,0,0.12),inset_0_0_40px_rgba(31,78,90,0.08),0_4px_0_rgba(0,0,0,0.15)] group">
              <div className="absolute inset-0 rounded-[1.5rem] shadow-[inset_0_2px_8px_rgba(0,0,0,0.15)] pointer-events-none z-30" />
              <div className="absolute top-4 right-8 w-28 h-20 bg-white/25 rounded-full blur-2xl pointer-events-none z-20" />
              <div className="absolute top-3 right-6 w-10 h-6 bg-white/40 rounded-full blur-md pointer-events-none z-20 rotate-[-30deg]" />
              <BMOFace
                emotion={emotion}
                timeLeft={timeLeft}
                isActive={isActive}
                mode={mode}
                activeTaskTitle={activeTask?.title ?? null}
              />
            </div>

            {/* Controls */}
            <div className="w-full flex justify-center mt-1 mb-5">
              <BMOControls
                isActive={isActive}
                mode={mode}
                onStart={startTimer}
                onPause={pauseTimer}
                onReset={resetTimer}
                onModeChange={setMode}
                onSettings={() => setIsSettingsOpen(true)}
              />
            </div>

            {/* Speaker vents */}
            <div className="absolute top-10 left-7 flex flex-col gap-2 opacity-50">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full bg-[#1a4a52] ${i === 3 ? 'w-8' : 'w-12'}`} />
              ))}
            </div>

            {/* Power LED */}
            <div className="absolute top-10 right-7 flex flex-col items-center gap-1">
              <div className={`w-3 h-3 rounded-full border border-[#1a4a52] transition-all duration-500 ${isActive ? 'bg-[#6BCB77] shadow-[0_0_10px_#6BCB77,0_0_20px_rgba(107,203,119,0.4)]' : 'bg-[#1a4a52]/30'}`} />
              <span className="text-[6px] font-black text-[#1a4a52]/50 uppercase tracking-widest">PWR</span>
            </div>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[#1a4a52]/40 font-black tracking-[0.4em] text-sm">BMO</div>
          </motion.div>
        </div>

        {/* Right — Data Center */}
        <div className="lg:col-span-3 h-[560px] lg:h-[620px] flex flex-col mt-0">
          <motion.div
            initial={{ x: 50, opacity: 0, y: 0 }}
            animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
            transition={{
              x: { duration: 0.5, delay: 0.2 },
              opacity: { duration: 0.5, delay: 0.2 },
              y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 },
            }}
            className="bg-[#F5F5F0] p-2 rounded-[1.5rem] border-[4px] border-[#1a2332] shadow-[6px_6px_0px_rgba(0,0,0,0.35),0_15px_40px_rgba(0,0,0,0.25)] h-full flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-8 bg-[#1a2332] flex items-center justify-center">
              <div className="w-16 h-1.5 bg-[#4ECDC4]/30 rounded-full" />
            </div>
            <div className="mt-6 relative z-10 h-full flex flex-col bg-[#F5F5F0] rounded-xl border-2 border-[#1F4E5A]/10 overflow-hidden">
              <StatsBoard sessions={sessions} tasks={tasks} />
            </div>
          </motion.div>
        </div>

      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-[#DCF6E6]/40 text-[10px] font-bold tracking-[0.2em] pointer-events-none uppercase">
        BMO OS v4.0 • Adventure Time
      </div>
    </div>
  );
}
