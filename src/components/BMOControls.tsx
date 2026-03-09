import React from 'react';
import { TimerMode } from '../hooks/useTimer';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { playSound } from '../utils/audio';

interface BMOControlsProps {
  isActive: boolean;
  mode: TimerMode;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeChange: (mode: TimerMode) => void;
  onSettings: () => void;
}

export function BMOControls({ 
  isActive, 
  mode, 
  onStart, 
  onPause, 
  onReset,
  onModeChange,
  onSettings
}: BMOControlsProps) {
  
  const handleModeCycle = (direction: 'up' | 'down') => {
    playSound.modeChange();
    const modes: TimerMode[] = ['focus', 'shortBreak', 'longBreak'];
    const currentIndex = modes.indexOf(mode);
    const newIndex = direction === 'up'
      ? (currentIndex + 1) % modes.length
      : (currentIndex - 1 + modes.length) % modes.length;
    onModeChange(modes[newIndex]);
  };

  const handleStart = () => { playSound.start(); onStart(); };
  const handlePause = () => { playSound.pause(); onPause(); };
  const handleReset = () => { playSound.reset(); onReset(); };

  const modeMeta = {
    focus:      { label: 'Focus',      color: 'bg-[#FF5E5E]/20 text-[#c0392b]' },
    shortBreak: { label: 'Break',       color: 'bg-[#6BCB77]/20 text-[#2e7d32]' },
    longBreak:  { label: 'Long Break', color: 'bg-[#FFD93D]/20 text-[#8a6d00]' },
  };

  return (
    <div className="flex items-center justify-between w-full max-w-[340px] px-2 sm:px-3 gap-2">

      {/* Left: D-Pad mode switcher */}
      <div className="flex flex-col items-center gap-2">
        {/* Mode label chip */}
        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-current/20 ${modeMeta[mode].color}`}>
          {modeMeta[mode].label}
        </span>

        {/* Cross shape */}
        <div className="relative w-20 h-20">
          {/* Vertical arm */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[26px] h-20 bg-[#FFD93D] rounded-[6px] shadow-[2px_3px_0_rgba(0,0,0,0.18),inset_1px_1px_0_rgba(255,255,255,0.45)]" />
          {/* Horizontal arm */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-[26px] bg-[#FFD93D] rounded-[6px] shadow-[2px_3px_0_rgba(0,0,0,0.18),inset_1px_1px_0_rgba(255,255,255,0.45)]" />
          {/* Center hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-[#E5C02A] rounded-full shadow-inner z-10" />

          {/* Up */}
          <button
            onClick={() => handleModeCycle('up')}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[26px] h-7 flex items-center justify-center rounded-t-[6px] hover:bg-white/25 active:scale-95 transition-all z-10"
          >
            <ChevronUp size={15} className="text-[#1a4a52]/70" strokeWidth={3} />
          </button>

          {/* Down */}
          <button
            onClick={() => handleModeCycle('down')}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[26px] h-7 flex items-center justify-center rounded-b-[6px] hover:bg-white/25 active:scale-95 transition-all z-10"
          >
            <ChevronDown size={15} className="text-[#1a4a52]/70" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className="flex flex-col items-center gap-3">
        {/* Reset button — top */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleReset}
          title="Reset timer"
          className="w-9 h-9 rounded-full bg-[#63C5DA] shadow-[0_3px_0_#3BAFC7,inset_2px_2px_4px_rgba(255,255,255,0.45)] border border-black/10 flex items-center justify-center active:shadow-none active:translate-y-0.5 transition-all"
        >
          <RotateCcw size={15} className="text-[#1a4a52]" strokeWidth={2.5} />
        </motion.button>

        {/* Start/Pause + Settings row */}
        <div className="flex items-center gap-4">
          {/* Red — Start/Pause */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={isActive ? handlePause : handleStart}
            title={isActive ? 'Pause' : 'Start'}
            className="w-[62px] h-[62px] rounded-full bg-[#FF6B6B] shadow-[0_4px_0_#C0392B,inset_2px_2px_6px_rgba(255,255,255,0.45)] border-2 border-black/5 flex items-center justify-center active:shadow-none active:translate-y-1 transition-all"
          >
            {isActive
              ? <Pause  size={22} className="text-[#7b0000]" strokeWidth={4} fill="#7b0000" />
              : <Play   size={22} className="text-[#7b0000] ml-1" strokeWidth={4} fill="#7b0000" />
            }
          </motion.button>

          {/* Green — Settings */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onSettings}
            title="Settings"
            className="w-12 h-12 rounded-full bg-[#6BCB77] shadow-[0_3px_0_#388E3C,inset_2px_2px_5px_rgba(255,255,255,0.45)] border-2 border-black/5 flex items-center justify-center active:shadow-none active:translate-y-0.5 transition-all"
          >
            <Settings size={18} className="text-[#1a4a52]" strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

    </div>
  );
}
