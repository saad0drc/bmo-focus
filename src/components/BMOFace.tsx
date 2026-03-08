import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Emotion } from '../hooks/useBMOState';
import { TimerMode } from '../hooks/useTimer';

interface BMOFaceProps {
  emotion: Emotion;
  timeLeft?: number;
  isActive?: boolean;
  mode?: TimerMode;
  activeTaskTitle?: string | null;
}

export function BMOFace({ emotion, timeLeft, isActive, mode, activeTaskTitle }: BMOFaceProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const faceRef = useRef<HTMLDivElement>(null);

  // Track mouse for eye movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!faceRef.current) return;
      
      const rect = faceRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate normalized position (-1 to 1)
      const x = (e.clientX - centerX) / (window.innerWidth / 2);
      const y = (e.clientY - centerY) / (window.innerHeight / 2);
      
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Eye movement limits - Reduced for subtler movement
  const eyeX = mousePos.x * 6;
  const eyeY = mousePos.y * 5;

  // Mouth paths for different emotions
  const mouthPaths: Record<Emotion, string> = {
    idle:     "M 30 50 Q 50 60 70 50",      // Gentle smile
    focus:    "M 40 55 Q 50 55 60 55",      // Small concentration mouth
    focus2:   "M 38 52 L 62 52",            // Dead-straight line — intense
    success:  "M 30 45 Q 50 75 70 45",      // Big open smile
    sleepy:   "M 38 56 Q 50 56 62 56",      // Relaxed flat
    break:    "M 28 50 Q 50 70 72 50",      // Wide happy arc
    confused: "M 35 55 Q 50 45 65 55",      // Wobbly
    excited:  "M 30 45 Q 50 80 70 45",      // Huge open smile
    tired:    "M 35 60 Q 50 55 65 60",      // Frown
  };

  // Eye variants
  const eyeVariants: Record<Emotion, { scaleY: number; height: number; width: number; borderRadius: string }> = {
    idle:     { scaleY: 1,    height: 12, width: 12, borderRadius: "100%" },
    focus:    { scaleY: 0.55, height: 12, width: 12, borderRadius: "100%" }, // Squint
    focus2:   { scaleY: 0.25, height: 12, width: 14, borderRadius: "30%" }, // Intense rectangle squint
    success:  { scaleY: 1.2,  height: 14, width: 12, borderRadius: "100%" }, // Wide eyes
    sleepy:   { scaleY: 0.1,  height: 12, width: 12, borderRadius: "100%" }, // Almost closed
    break:    { scaleY: 1.3,  height: 14, width: 14, borderRadius: "100%" }, // Wide happy eyes
    confused: { scaleY: 1,    height: 12, width: 12, borderRadius: "100%" }, // One big one small in render
    excited:  { scaleY: 1,    height: 16, width: 16, borderRadius: "20%" }, // Star-like
    tired:    { scaleY: 0.5,  height: 12, width: 12, borderRadius: "100%" }, // Droopy
  };

  const modeLabel: Record<TimerMode, { text: string; emoji: string; color: string; dot: string }> = {
    focus:      { text: 'FOCUS',      emoji: '🍅', color: 'bg-[#1F4E5A]/90 text-[#DCF6E6]',    dot: 'bg-[#FF5E5E]' },
    shortBreak: { text: 'BREAK',      emoji: '☕', color: 'bg-[#6BCB77]/90 text-[#1F4E5A]',    dot: 'bg-[#6BCB77]' },
    longBreak:  { text: 'LONG BREAK', emoji: '⭐', color: 'bg-[#FFD93D]/90 text-[#1F4E5A]',    dot: 'bg-[#FFD93D]' },
  };

  // Blinking logic
  const [isBlinking, setIsBlinking] = useState(false);
  useEffect(() => {
    const blinkLoop = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      
      const nextBlink = Math.random() * 4000 + 2000; // 2-6 seconds
      setTimeout(blinkLoop, nextBlink);
    };
    
    const timeout = setTimeout(blinkLoop, 3000);
    return () => clearTimeout(timeout);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Eye transition config for smooth movement
  const eyeTransition = {
    type: "spring",
    stiffness: 120,
    damping: 15,
    mass: 0.8
  };

  return (
    <div 
      ref={faceRef}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#E8F5E9]"
    >
      {/* CRT Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.02)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.01),rgba(0,0,255,0.01))]" style={{ backgroundSize: "100% 3px, 3px 100%" }} />
      
      {/* Subtle Screen Flicker */}
      <motion.div 
        animate={{ opacity: [0.01, 0.03, 0.01] }}
        transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        className="absolute inset-0 bg-white pointer-events-none z-20 mix-blend-overlay"
      />

      {/* Active mode badge + task name */}
      <AnimatePresence>
        {isActive && mode && (
          <motion.div
            key="mode-badge"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="absolute top-5 left-0 right-0 flex flex-col items-center gap-1.5 z-30 px-4"
          >
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${modeLabel[mode].color}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${modeLabel[mode].dot}`} />
              {modeLabel[mode].emoji} {modeLabel[mode].text}
            </div>
            {activeTaskTitle && (
              <div className="text-[10px] font-bold text-[#1F4E5A]/60 truncate max-w-[85%] text-center font-mono tracking-wide">
                {activeTaskTitle}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eyes Container */}
      <div className="flex justify-between w-40 mb-8 transition-all duration-500" style={{ transform: isActive ? 'translateY(-24px)' : 'none' }}>
        {/* Left Eye */}
        <motion.div
          animate={{
            x: eyeX,
            y: eyeY,
            scaleY: isBlinking ? 0.1 : eyeVariants[emotion].scaleY,
            height: eyeVariants[emotion].height,
            width: emotion === 'confused' ? 16 : emotion === 'focus2' ? 14 : eyeVariants[emotion].width,
            borderRadius: eyeVariants[emotion].borderRadius
          }}
          transition={{
            x: eyeTransition,
            y: eyeTransition,
            scaleY: { duration: 0.1 }
          }}
          className="bg-[#1F4E5A] shadow-sm"
        />
        
        {/* Right Eye */}
        <motion.div
          animate={{
            x: eyeX,
            y: eyeY,
            scaleY: isBlinking ? 0.1 : emotion === 'focus2' ? eyeVariants[emotion].scaleY * 1.6 : eyeVariants[emotion].scaleY,
            height: eyeVariants[emotion].height,
            width: emotion === 'confused' ? 8 : emotion === 'focus2' ? 10 : eyeVariants[emotion].width,
            borderRadius: eyeVariants[emotion].borderRadius
          }}
          transition={{
            x: eyeTransition,
            y: eyeTransition,
            scaleY: { duration: 0.1 }
          }}
          className="bg-[#1F4E5A] shadow-sm"
        />
      </div>

      {/* Mouth */}
      <svg 
        width="100" 
        height="80" 
        viewBox="0 0 100 80" 
        className="absolute top-1/2 -mt-2 transition-all duration-500"
        style={{ transform: isActive ? 'translateY(-24px)' : 'none' }}
      >
        <motion.path
          d={mouthPaths[emotion] || mouthPaths.idle}
          fill="transparent"
          stroke="#1F4E5A"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={false}
          animate={{ d: mouthPaths[emotion] || mouthPaths.idle }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </svg>

      {/* Blush for success/excited/break */}
      {(emotion === 'success' || emotion === 'excited' || emotion === 'break') && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
            className="absolute top-1/2 left-14 w-5 h-2.5 bg-[#FF9AA2] rounded-full blur-md transition-all duration-500"
            style={{ transform: isActive ? 'translateY(-24px)' : 'none' }}
          />
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
            className="absolute top-1/2 right-14 w-5 h-2.5 bg-[#FF9AA2] rounded-full blur-md transition-all duration-500"
            style={{ transform: isActive ? 'translateY(-24px)' : 'none' }}
          />
        </>
      )}

      {/* Zzz for sleepy */}
      {emotion === 'sleepy' && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.7, 0], y: -18 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
          className="absolute top-[38%] right-[28%] text-[#1F4E5A]/60 font-black text-xs pointer-events-none z-30"
          style={{ transform: isActive ? 'translateY(-24px)' : 'none' }}
        >
          z z z
        </motion.div>
      )}

      {/* Timer */}
      {timeLeft !== undefined && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute bottom-6 font-pixel tracking-widest transition-all duration-500 ${
            isActive ? 'text-[#1F4E5A] scale-110 text-5xl' : 'text-[#1F4E5A]/45 scale-100 text-4xl'
          }`}
        >
          {formatTime(timeLeft)}
        </motion.div>
      )}
    </div>
  );
}
