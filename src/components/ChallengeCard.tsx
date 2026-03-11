import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, X, Trophy } from 'lucide-react';
import { Challenge } from '../types';

interface ChallengeCardProps {
  activeChallenge: Challenge | null;
  todayCompleted: Challenge | null;
  focusDuration: number; // minutes
  onStart: (goalMinutes: number, focusDuration: number) => void;
  onAbandon: () => void;
}

const IDLE_QUOTES = [
  'PSST! Hey! Wanna go on a FOCUS ADVENTURE today?! 🎮',
  'HEY! Wanna challenge yourself today? I will cheer you on! ⭐',
  'Do you wanna do a FOCUS CHALLENGE? It will be SO fun! 🌟',
];

function fmtTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function ChallengeCard({ activeChallenge, todayCompleted, focusDuration, onStart, onAbandon }: ChallengeCardProps) {
  const [isPlanning, setIsPlanning] = useState(false);
  const [hours, setHours] = useState(1);
  const [mins, setMins] = useState(0);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * IDLE_QUOTES.length));

  const goalMinutes = hours * 60 + mins;
  const pomodorosPreview = Math.max(1, Math.ceil(goalMinutes / focusDuration));

  const handleStart = () => {
    if (goalMinutes < 1) return;
    onStart(goalMinutes, focusDuration);
    setIsPlanning(false);
  };

  // ── COMPLETED ────────────────────────────────────────────────────────────────
  if (todayCompleted && !activeChallenge) {
    return (
      <motion.div
        key="completed"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[460px] sm:max-w-[500px] lg:max-w-[560px] bg-[#DCF6E6] rounded-2xl border-[4px] border-[#1F4E5A] px-4 py-3 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
      >
        <div className="flex items-center gap-3">
          <Trophy size={20} className="text-[#FFD93D] shrink-0" fill="#FFD93D" />
          <div className="flex-1 min-w-0">
            <p className="font-pixel text-xs text-[#1F4E5A] leading-tight tracking-wide">CHALLENGE COMPLETE!!</p>
            <p className="text-[10px] text-[#1F4E5A]/60 font-bold mt-0.5">
              {fmtTime(todayCompleted.goalMinutes)} goal •{' '}
              {todayCompleted.pomodorosCompleted} 🍅 • Mathematical!
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── ACTIVE ───────────────────────────────────────────────────────────────────
  if (activeChallenge) {
    const pct = Math.round((activeChallenge.pomodorosCompleted / activeChallenge.pomodorosNeeded) * 100);
    return (
      <motion.div
        key="active"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[460px] sm:max-w-[500px] lg:max-w-[560px] bg-[#DCF6E6] rounded-2xl border-[4px] border-[#1F4E5A] px-4 py-3 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
      >
        {/* Title row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Zap size={12} className="text-[#FFD93D]" fill="#FFD93D" />
            <span className="font-pixel text-[10px] text-[#1F4E5A] tracking-widest">
              {activeChallenge.dayLabel.toUpperCase()} CHALLENGE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-[#1F4E5A]/40">{fmtTime(activeChallenge.goalMinutes)}</span>
            <button
              onClick={onAbandon}
              title="Give up"
              className="text-[#1F4E5A]/30 hover:text-[#FF5E5E] transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Pomodoro dots */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {Array.from({ length: activeChallenge.pomodorosNeeded }).map((_, i) => (
            <motion.div
              key={i}
              initial={i === activeChallenge.pomodorosCompleted - 1 ? { scale: 1.6 } : false}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px]
                ${i < activeChallenge.pomodorosCompleted
                  ? 'bg-[#FF5E5E] border-[#CC3D3D]'
                  : 'bg-[#1F4E5A]/10 border-[#1F4E5A]/25'
                }`}
            >
              {i < activeChallenge.pomodorosCompleted ? '🍅' : ''}
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-[#1F4E5A]/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#6BCB77] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-[#1F4E5A]/40 font-bold">
            {activeChallenge.pomodorosCompleted}/{activeChallenge.pomodorosNeeded} 🍅
          </span>
          <span className="text-[9px] text-[#4ECDC4] font-black">{pct}%</span>
          <span className="text-[9px] text-[#1F4E5A]/40 font-bold">
            {fmtTime(activeChallenge.focusMinutesLogged)}/{fmtTime(activeChallenge.goalMinutes)}
          </span>
        </div>
      </motion.div>
    );
  }

  // ── PLANNING ─────────────────────────────────────────────────────────────────
  if (isPlanning) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="planning"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="w-full max-w-[460px] sm:max-w-[500px] lg:max-w-[560px] bg-[#DCF6E6] rounded-2xl border-[4px] border-[#1F4E5A] px-4 py-3 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
        >
          <p className="font-pixel text-[10px] text-[#1F4E5A]/60 text-center tracking-widest mb-3">
            HOW LONG TODAY?
          </p>

          {/* Time inputs */}
          <div className="flex items-end gap-3 mb-3">
            <div className="flex-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#1F4E5A]/40 block mb-1 text-center">
                Hours
              </label>
              <input
                type="number"
                min={0}
                max={12}
                value={hours}
                onChange={e => setHours(Math.max(0, Math.min(12, parseInt(e.target.value) || 0)))}
                className="w-full px-2 py-2 rounded-xl bg-white border-[3px] border-[#1F4E5A]/20 text-[#1F4E5A] font-pixel text-2xl text-center focus:outline-none focus:border-[#4ECDC4] transition-all"
              />
            </div>
            <div className="font-pixel text-2xl text-[#1F4E5A]/30 pb-2">:</div>
            <div className="flex-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#1F4E5A]/40 block mb-1 text-center">
                Mins
              </label>
              <input
                type="number"
                min={0}
                max={59}
                step={5}
                value={mins}
                onChange={e => setMins(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-full px-2 py-2 rounded-xl bg-white border-[3px] border-[#1F4E5A]/20 text-[#1F4E5A] font-pixel text-2xl text-center focus:outline-none focus:border-[#4ECDC4] transition-all"
              />
            </div>
          </div>

          {/* BMO breakdown */}
          <AnimatePresence>
            {goalMinutes > 0 && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[10px] font-bold text-[#1F4E5A]/70 text-center bg-[#4ECDC4]/15 rounded-xl py-2 px-3 mb-3 overflow-hidden"
              >
                That&apos;s{' '}
                <span className="font-black text-[#1F4E5A]">{pomodorosPreview} 🍅</span>{' '}
                pomodoros! I&apos;ll be cheering for you!!
              </motion.p>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsPlanning(false)}
              className="py-2.5 bg-[#1F4E5A]/10 rounded-xl border-b-[3px] border-[#1F4E5A]/20 text-[#1F4E5A] font-bold uppercase tracking-widest text-[9px] hover:brightness-95 active:border-b-0 active:translate-y-0.5 transition-all"
            >
              Nevermind
            </button>
            <button
              onClick={handleStart}
              disabled={goalMinutes < 1}
              className="py-2.5 bg-[#4ECDC4] rounded-xl border-b-[3px] border-[#1F4E5A]/30 text-[#1F4E5A] font-bold uppercase tracking-widest text-[9px] hover:brightness-105 active:border-b-0 active:translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Let&apos;s GO! 🎮
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── IDLE ─────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      key="idle"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[460px] sm:max-w-[500px] lg:max-w-[560px] bg-[#DCF6E6] rounded-2xl border-[4px] border-[#1F4E5A] px-4 py-3 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl shrink-0">🎮</span>
        <p className="flex-1 text-[10px] font-bold text-[#1F4E5A]/70 leading-snug">
          {IDLE_QUOTES[quoteIdx]}
        </p>
        <button
          onClick={() => setIsPlanning(true)}
          className="shrink-0 px-3 py-2 bg-[#4ECDC4] rounded-xl border-b-[3px] border-[#1F4E5A]/30 text-[#1F4E5A] font-black uppercase tracking-widest text-[9px] hover:brightness-105 active:border-b-0 active:translate-y-0.5 transition-all whitespace-nowrap shadow-sm"
        >
          ACCEPT!
        </button>
      </div>
    </motion.div>
  );
}
