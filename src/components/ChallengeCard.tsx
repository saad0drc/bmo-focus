import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, X, Trophy } from 'lucide-react';
import { Challenge } from '../types';

interface ChallengeCardProps {
  activeChallenge: Challenge | null;
  todayCompleted: Challenge | null;
  onOpenPlanner: () => void;
  onAbandon: () => void;
}

const IDLE_QUOTES = [
  { emoji: '🎮', text: 'HEY!! Wanna go on a FOCUS ADVENTURE?! I have a whole plan!!' },
  { emoji: '⭐', text: "OH! OH! Let's do a CHALLENGE today! You can totally do it!!" },
  { emoji: '🌟', text: 'Do you wanna do a FOCUS CHALLENGE?? SO fun!! Let me help you!!' },
  { emoji: '🕹️', text: "PSST! I know how to WIN at studying. Wanna try my FOCUS GAME?!" },
  { emoji: '🏆', text: 'Are you ready to FOCUS?? I believe in you! Let\'s make a plan!!' },
];

function fmtTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function ChallengeCard({ activeChallenge, todayCompleted, onOpenPlanner, onAbandon }: ChallengeCardProps) {
  const [quoteIdx] = useState(() => Math.floor(Math.random() * IDLE_QUOTES.length));

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
          <Trophy size={22} className="text-[#FFD93D] shrink-0" fill="#FFD93D" />
          <div className="flex-1 min-w-0">
            <p className="font-pixel text-sm text-[#1F4E5A] tracking-widest leading-tight">
              CHALLENGE COMPLETE!!
            </p>
            <p className="text-xs text-[#1F4E5A]/55 font-bold mt-1">
              {fmtTime(todayCompleted.goalMinutes)} goal &bull;{' '}
              {todayCompleted.pomodorosCompleted} 🍅 &bull; Mathematical!
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
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-[#FFD93D]" fill="#FFD93D" />
            <span className="font-pixel text-sm text-[#1F4E5A] tracking-widest">
              {activeChallenge.dayLabel.toUpperCase()} CHALLENGE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-pixel text-sm text-[#1F4E5A]/40">{fmtTime(activeChallenge.goalMinutes)}</span>
            <button
              onClick={onAbandon}
              title="Give up"
              className="text-[#1F4E5A]/25 hover:text-[#FF5E5E] transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Pomodoro dots */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Array.from({ length: activeChallenge.pomodorosNeeded }).map((_, i) => (
            <motion.div
              key={i}
              initial={i === activeChallenge.pomodorosCompleted - 1 ? { scale: 1.6 } : false}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px]
                ${i < activeChallenge.pomodorosCompleted
                  ? 'bg-[#FF5E5E] border-[#CC3D3D]'
                  : 'bg-[#1F4E5A]/10 border-[#1F4E5A]/20'
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
        <div className="flex justify-between mt-1.5">
          <span className="font-pixel text-xs text-[#1F4E5A]/40">
            {activeChallenge.pomodorosCompleted}/{activeChallenge.pomodorosNeeded} 🍅
          </span>
          <span className="font-pixel text-xs text-[#4ECDC4]">{pct}%</span>
          <span className="font-pixel text-xs text-[#1F4E5A]/40">
            {fmtTime(activeChallenge.focusMinutesLogged)}/{fmtTime(activeChallenge.goalMinutes)}
          </span>
        </div>
      </motion.div>
    );
  }

  // ── IDLE ─────────────────────────────────────────────────────────────────────
  const q = IDLE_QUOTES[quoteIdx];
  return (
    <motion.div
      key="idle"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[460px] sm:max-w-[500px] lg:max-w-[560px] bg-[#DCF6E6] rounded-2xl border-[4px] border-[#1F4E5A] px-4 py-3 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl shrink-0">{q.emoji}</span>
        <p className="flex-1 font-pixel text-sm font-bold leading-snug tracking-wide text-[#1F4E5A]">
          {q.text}
        </p>
        <button
          onClick={onOpenPlanner}
          className="shrink-0 px-3 py-2 bg-[#4ECDC4] rounded-xl border-b-[3px] border-[#1F4E5A]/30 text-[#1F4E5A] font-black uppercase tracking-widest text-[11px] hover:brightness-105 active:border-b-0 active:translate-y-0.5 transition-all whitespace-nowrap shadow-sm"
        >
          ACCEPT!
        </button>
      </div>
    </motion.div>
  );
}

