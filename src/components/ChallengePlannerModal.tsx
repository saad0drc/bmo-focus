import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  focusDuration: number;
  onClose: () => void;
  onStart: (goalMinutes: number, focusDuration: number) => void;
}

const BMO_LINES = [
  "I am ready to help you focus!! Tell me how long!",
  "Okay! Let's make a plan! You can totally do this!",
  "I believe in you!! Just tell me your goal today!",
];

export function ChallengePlannerModal({ isOpen, focusDuration, onClose, onStart }: Props) {
  const [hours, setHours] = useState(1);
  const [mins, setMins] = useState(0);
  const [lineIdx] = useState(() => Math.floor(Math.random() * BMO_LINES.length));

  const goalMinutes = hours * 60 + mins;
  const pomodorosPreview = Math.max(1, Math.ceil(goalMinutes / focusDuration));

  const dayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleSubmit = () => {
    if (goalMinutes < 1) return;
    onStart(goalMinutes, focusDuration);
    onClose();
  };

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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border-4 border-[#1F4E5A]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#1F4E5A]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4ECDC4] flex items-center justify-center border-2 border-[#1a4a52] shadow-[3px_3px_0px_rgba(0,0,0,0.25)]">
                  <Zap size={18} className="text-[#1F4E5A]" fill="#FFD93D" />
                </div>
                <div>
                  <h2 className="font-pixel text-lg text-[#DCF6E6] uppercase tracking-widest leading-none">
                    Focus Challenge
                  </h2>
                  <p className="text-[10px] text-[#4ECDC4]/80 font-bold uppercase tracking-widest mt-0.5">
                    {dayLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-[#DCF6E6]/50 hover:text-[#DCF6E6] rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* BMO quote */}
            <div className="bg-[#DCF6E6] px-5 pt-4 pb-3 border-b border-[#1F4E5A]/10">
              <p className="font-pixel text-sm text-[#1F4E5A] leading-snug tracking-wide text-center">
                🎮 &quot;{BMO_LINES[lineIdx]}&quot;
              </p>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5 bg-[#F0F4F8]">
              {/* Label */}
              <p className="text-[10px] font-black uppercase tracking-widest text-[#1F4E5A]/40 text-center">
                How long do you want to focus today?
              </p>

              {/* Time inputs */}
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-[#1F4E5A]/40 text-center">
                    Hours
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={hours}
                    onChange={e => setHours(Math.max(0, Math.min(12, parseInt(e.target.value) || 0)))}
                    className="w-full px-2 py-3 rounded-xl bg-white border-[3px] border-[#1F4E5A]/15 text-[#1F4E5A] font-pixel text-3xl text-center focus:outline-none focus:border-[#4ECDC4] transition-all shadow-sm"
                    autoFocus
                  />
                </div>
                <div className="font-pixel text-3xl text-[#1F4E5A]/30 pb-3">:</div>
                <div className="flex-1 space-y-1.5">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-[#1F4E5A]/40 text-center">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    step={5}
                    value={mins}
                    onChange={e => setMins(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-full px-2 py-3 rounded-xl bg-white border-[3px] border-[#1F4E5A]/15 text-[#1F4E5A] font-pixel text-3xl text-center focus:outline-none focus:border-[#4ECDC4] transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* BMO breakdown */}
              <AnimatePresence>
                {goalMinutes > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#4ECDC4]/15 rounded-xl py-3 px-4 border-2 border-[#4ECDC4]/30 text-center">
                      <p className="text-xs font-bold text-[#1F4E5A]/70 leading-relaxed">
                        That&apos;s{' '}
                        <span className="font-pixel text-lg text-[#1F4E5A] align-middle">
                          {pomodorosPreview}
                        </span>{' '}
                        🍅 pomodoros of{' '}
                        <span className="font-black text-[#1F4E5A]">{focusDuration} min</span> each.{' '}
                        <span className="font-black text-[#4ECDC4]">Let&apos;s GO!!</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t-2 border-[#1F4E5A]/10 bg-[#F0F4F8] flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-[#1F4E5A]/50 hover:text-[#1F4E5A] transition-colors uppercase tracking-wide"
              >
                Nevermind
              </button>
              <button
                onClick={handleSubmit}
                disabled={goalMinutes < 1}
                className="px-6 py-2.5 bg-[#4ECDC4] text-[#1F4E5A] text-sm font-black rounded-xl shadow-[4px_4px_0px_rgba(31,78,90,0.2)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(31,78,90,0.2)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <Zap size={15} fill="currentColor" />
                Accept!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
