import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Check, X, Edit2 } from 'lucide-react';

interface ChallengePanelProps {
  challenge: string;
  isCompleted: boolean;
  isActive: boolean; // Timer is running
  onSetChallenge: (challenge: string) => void;
  onToggleComplete: () => void;
  onClear: () => void;
}

export function ChallengePanel({
  challenge,
  isCompleted,
  isActive,
  onSetChallenge,
  onToggleComplete,
  onClear
}: ChallengePanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState(challenge);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput(challenge);
  }, [challenge]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSetChallenge(input.trim());
      setIsEditing(false);
    }
  };

  const startEditing = () => {
    if (!isActive) {
      setIsEditing(true);
    }
  };

  return (
    <div className="w-full max-w-sm mb-2 relative z-20 px-2">
      {/* Slot Background */}
      <div className="absolute inset-x-4 top-2 bottom-0 bg-[#14363F] rounded-b-xl opacity-20 transform translate-y-2" />
      
      <AnimatePresence mode="wait">
        {!challenge || isEditing ? (
          <motion.form
            key="input"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onSubmit={handleSubmit}
            className="relative"
          >
            <div className="relative flex items-center bg-[#14363F] p-1 rounded-lg border-[3px] border-[#0F2930] shadow-[inset_0_4px_8px_rgba(0,0,0,0.3)]">
              <div className="absolute left-3 text-[#63C5DA]/50">
                <Target size={18} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="INSERT_CARTRIDGE..."
                className="w-full pl-10 pr-10 py-3 rounded-md bg-transparent border-none text-[#DCF6E6] placeholder-[#DCF6E6]/30 focus:outline-none font-mono text-sm tracking-widest transition-all uppercase shadow-none"
                disabled={isActive && !isEditing}
              />
              {input.trim() && (
                <button
                  type="submit"
                  className="absolute right-2 p-1.5 bg-[#DCF6E6] text-[#1F4E5A] rounded hover:bg-[#DCF6E6]/80 transition-all shadow-sm active:scale-95"
                >
                  <Check size={14} strokeWidth={3} />
                </button>
              )}
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative p-4 rounded-t-lg rounded-b-xl border-[3px] transition-all group overflow-hidden ${
              isCompleted 
                ? 'bg-[#6BCB77] border-[#55A660] shadow-[0_6px_0_#46894F]' 
                : isActive 
                  ? 'bg-[#FFD93D] border-[#E5C02A] shadow-[0_6px_0_#C4A322]'
                  : 'bg-[#DCF6E6] border-[#1F4E5A] shadow-[0_6px_0_#14363F]'
            }`}
          >
            {/* Cartridge Grip Lines */}
            <div className="absolute top-0 left-0 w-full h-3 bg-black/5 flex justify-center gap-1 pt-1">
               {[...Array(10)].map((_, i) => (
                 <div key={i} className="w-0.5 h-full bg-black/10" />
               ))}
            </div>

            <div className="flex items-center gap-4 relative z-10 mt-2">
              <button
                onClick={onToggleComplete}
                className={`w-10 h-10 rounded-lg border-[3px] flex items-center justify-center transition-all shrink-0 shadow-inner ${
                  isCompleted
                    ? 'bg-white/20 border-white/40 text-white'
                    : 'bg-white/50 border-[#1F4E5A]/20 hover:border-[#1F4E5A] text-[#1F4E5A] hover:bg-white/80'
                }`}
              >
                {isCompleted ? <Check size={20} strokeWidth={4} /> : <div className="w-3 h-3 rounded-sm bg-[#1F4E5A]/10" />}
              </button>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${
                  isCompleted ? 'text-white/80' : 'text-[#1F4E5A]/40'
                }`}>
                  Current Mission
                </div>
                <div className={`font-pixel text-lg leading-tight truncate ${
                  isCompleted ? 'text-white line-through decoration-2 decoration-white/50' : 'text-[#1F4E5A]'
                }`}>
                  {challenge}
                </div>
              </div>

              {!isActive && (
                <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={startEditing}
                    className="p-1 hover:bg-black/10 rounded text-[#1F4E5A]/40 hover:text-[#1F4E5A] transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={onClear}
                    className="p-1 hover:bg-black/10 rounded text-[#1F4E5A]/40 hover:text-[#FF5E5E] transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Active Recording Light */}
            {isActive && !isCompleted && (
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#FF5E5E] animate-pulse shadow-[0_0_5px_#FF5E5E]" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
