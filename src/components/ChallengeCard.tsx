import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, X, Trophy, Flame } from 'lucide-react';
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
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-gradient-to-b from-[#6BCB77] via-[#4ECDC4] to-[#6BCB77] rounded-2xl border-[4px] border-[#1F4E5A] px-5 py-4 shadow-[0_12px_30px_rgba(107,203,119,0.45)] ring-2 ring-[#FFD93D]/30"
      >
        <div className="flex items-center gap-4 justify-between">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 12, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 2 }}
            className="text-4xl shrink-0 drop-shadow-lg"
          >
            🏆
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="font-pixel text-sm text-[#1F4E5A] font-black tracking-widest leading-tight drop-shadow-sm">
              ✨ LEGENDARY QUEST COMPLETE! ✨
            </p>
            <p className="font-pixel text-xs text-[#1F4E5A] tracking-widest mt-1 drop-shadow-sm opacity-90">
              {fmtTime(todayCompleted.goalMinutes)} • {todayCompleted.pomodorosCompleted}🍅 • YOU RULE!
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── ACTIVE ───────────────────────────────────────────────────────────────────
  if (activeChallenge) {
    const pct = Math.round((activeChallenge.pomodorosCompleted / activeChallenge.pomodorosNeeded) * 100);
    const remaining = activeChallenge.pomodorosNeeded - activeChallenge.pomodorosCompleted;
    
    return (
      <motion.div
        key="active"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-gradient-to-b from-[#4ECDC4] via-[#63C5DA] to-[#4ECDC4] rounded-2xl border-[4px] border-[#1F4E5A] px-5 py-4 shadow-[0_12px_30px_rgba(78,205,196,0.4)] ring-2 ring-[#DCF6E6]/20"
      >
        {/* Row 1: Title + Tomatoes + Stats + Progress + Abandon */}
        <div className="flex items-center gap-3 justify-between">
          {/* Left: Title */}
          <div className="flex items-center gap-2 shrink-0">
            <motion.div 
              animate={{ rotate: [0, 360] }} 
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl drop-shadow-lg"
            >
              ⚡
            </motion.div>
            <span className="font-pixel text-sm text-[#1F4E5A] font-black tracking-widest drop-shadow-sm">
              {activeChallenge.dayLabel.toUpperCase()}
            </span>
          </div>

          {/* Tomatoes */}
          <div className="flex gap-1 shrink-0">
            {Array.from({ length: Math.min(activeChallenge.pomodorosNeeded, 6) }).map((_, i) => (
              <motion.span
                key={i}
                initial={i === activeChallenge.pomodorosCompleted - 1 ? { scale: 1.3 } : false}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className={`text-xl transition-all drop-shadow-md ${
                  i < activeChallenge.pomodorosCompleted ? 'opacity-100' : 'opacity-25 grayscale'
                }`}
              >
                🍅
              </motion.span>
            ))}
            {activeChallenge.pomodorosNeeded > 6 && (
              <span className="font-pixel text-xs text-[#1F4E5A] font-black">+{activeChallenge.pomodorosNeeded - 6}</span>
            )}
          </div>

          {/* Stats inline */}
          <div className="flex gap-3 shrink-0 text-[#1F4E5A] font-pixel font-black text-xs drop-shadow-sm">
            <div className="text-center">
              <div className="text-[9px] opacity-70">GOAL</div>
              <div>{fmtTime(activeChallenge.goalMinutes)}</div>
            </div>
            <div className="w-px h-6 bg-[#1F4E5A]/30" />
            <div className="text-center">
              <div className="text-[9px] opacity-70">DONE</div>
              <div>{activeChallenge.pomodorosCompleted}/{activeChallenge.pomodorosNeeded}</div>
            </div>
            <div className="w-px h-6 bg-[#1F4E5A]/30" />
            <div className="text-center">
              <div className="text-[9px] opacity-70">LOG</div>
              <div>{fmtTime(activeChallenge.focusMinutesLogged)}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-16 h-3 bg-[#1F4E5A]/20 rounded-lg overflow-hidden border-2 border-[#1F4E5A]/40">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FFD93D] via-[#6BCB77] to-[#4ECDC4]"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="font-pixel text-xs text-[#1F4E5A] font-black whitespace-nowrap w-8 drop-shadow-sm">{pct}%</span>
          </div>

          {/* Abandon button */}
          <motion.button
            onClick={onAbandon}
            whileHover={{ scale: 1.25, rotate: 90 }}
            whileTap={{ scale: 0.8 }}
            className="text-[#1F4E5A] hover:text-[#FF5E5E] transition-colors shrink-0 drop-shadow-md"
            title="Give up"
          >
            <X size={18} />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ── IDLE ─────────────────────────────────────────────────────────────────────
  const q = IDLE_QUOTES[quoteIdx];
  return (
    <motion.div
      key="idle"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-b from-[#4ECDC4] via-[#63C5DA] to-[#4ECDC4] rounded-2xl border-[4px] border-[#1F4E5A] px-6 py-5 shadow-[0_12px_30px_rgba(78,205,196,0.4)] ring-2 ring-[#DCF6E6]/20"
    >
      {/* ALL IN ONE ROW: emoji + text on left, button on right */}
      <div className="flex items-center gap-4 justify-between">
        {/* Left: emoji + text */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <motion.span
            animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="text-3xl shrink-0 drop-shadow-lg"
          >
            {q.emoji}
          </motion.span>
          <p 
            className="font-pixel text-base text-[#1F4E5A] font-black leading-snug tracking-wider drop-shadow-lg"
            style={{
              textShadow: '0 2px 4px rgba(31, 78, 90, 0.5), 0 0 8px rgba(107, 203, 119, 0.3)',
              WebkitTextStroke: '0.5px rgba(31, 78, 90, 0.2)',
              letterSpacing: '0.05em'
            }}
          >
            {q.text}
          </p>
        </div>
        
        {/* Right: button */}
        <motion.button
          onClick={onOpenPlanner}
          whileHover={{ scale: 1.12, y: -2 }}
          whileTap={{ scale: 0.95, y: 0 }}
          className="px-4 py-2 bg-gradient-to-b from-[#FFD93D] to-[#FFC300] text-[#1F4E5A] rounded-lg font-black uppercase tracking-widest text-xs font-pixel hover:brightness-115 active:translate-y-0.5 transition-all border-3 border-[#1F4E5A] shadow-[4px_4px_0px_rgba(31,78,90,0.4)] group shrink-0 whitespace-nowrap"
        >
          <span className="flex items-center gap-1">
            ACCEPT! <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ✨
            </motion.span>
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}

