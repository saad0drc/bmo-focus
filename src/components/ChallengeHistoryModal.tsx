import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Clock } from 'lucide-react';
import { Challenge } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  challenges: Challenge[];
}

function fmtTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function ChallengeHistoryModal({ isOpen, onClose, challenges }: Props) {
  const completed = challenges.filter(c => c.completed);
  const totalFocusMinutes = completed.reduce((sum, c) => sum + c.focusMinutesLogged, 0);
  const sorted = [...challenges].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1F4E5A]/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-[#DCF6E6] w-full max-w-md rounded-3xl border-[6px] border-[#1F4E5A] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#1F4E5A] p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5E5E]" />
                <div className="w-3 h-3 rounded-full bg-[#FFD93D]" />
                <h2 className="font-pixel text-xl text-[#DCF6E6] uppercase tracking-widest">
                  Challenge Log
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-[#DCF6E6]/60 hover:text-[#DCF6E6] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Totals bar */}
            <div className="bg-[#1F4E5A]/10 px-5 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Trophy size={15} className="text-[#FFD93D]" fill="#FFD93D" />
                <span className="font-pixel text-lg text-[#1F4E5A]">
                  {completed.length} DONE
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#4ECDC4]" />
                <span className="text-sm font-black text-[#1F4E5A]/60">
                  {fmtTime(totalFocusMinutes)} total
                </span>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-4 space-y-2 custom-scrollbar">
              {sorted.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-3">🎮</div>
                  <p className="font-pixel text-sm text-[#1F4E5A]/50 tracking-widest">NO CHALLENGES YET!</p>
                  <p className="text-xs text-[#1F4E5A]/40 font-bold mt-1">Start your first one down below!</p>
                </div>
              ) : (
                sorted.map(c => (
                  <div
                    key={c.id}
                    className={`rounded-xl p-3 border-2 flex items-center gap-3
                      ${c.completed
                        ? 'bg-[#6BCB77]/10 border-[#6BCB77]/30'
                        : c.abandoned
                        ? 'bg-[#FF5E5E]/8 border-[#FF5E5E]/20 opacity-60'
                        : 'bg-[#4ECDC4]/10 border-[#4ECDC4]/30'
                      }`}
                  >
                    <div className="text-xl shrink-0">
                      {c.completed ? '🏆' : c.abandoned ? '💔' : '⚡'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-[#1F4E5A] text-xs uppercase tracking-wide">
                          {c.dayLabel}
                        </span>
                        <span className="text-[9px] text-[#1F4E5A]/35 font-bold">{c.date}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-[10px] font-bold text-[#1F4E5A]/55">
                          Goal: {fmtTime(c.goalMinutes)}
                        </span>
                        <span className="text-[10px] font-bold text-[#1F4E5A]/55">
                          {c.pomodorosCompleted}/{c.pomodorosNeeded} 🍅
                        </span>
                        {c.completed && (
                          <span className="text-[10px] font-black text-[#6BCB77]">
                            {fmtTime(c.focusMinutesLogged)} focused!
                          </span>
                        )}
                      </div>
                    </div>
                    {c.completed && (
                      <span className="shrink-0 text-[9px] font-black text-[#6BCB77] uppercase tracking-wide">
                        DONE!
                      </span>
                    )}
                    {c.abandoned && (
                      <span className="shrink-0 text-[9px] font-black text-[#FF5E5E]/60 uppercase tracking-wide">
                        QUIT
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#1F4E5A]/5 p-2 text-center shrink-0">
              <div className="text-[10px] font-pixel text-[#1F4E5A]/40">BMO CHALLENGE LOG v1.0</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
