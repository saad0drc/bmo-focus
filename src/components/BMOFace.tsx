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

  // ── Internal idle sub-emotion (only overrides when truly idle & not active) ──
  const [idleEmotion, setIdleEmotion] = useState<Emotion>('idle');
  const isActiveRef = useRef(isActive);
  const emotionRef = useRef(emotion);
  const isOverFaceRef = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0, t: Date.now() });
  const speedTimer = useRef<ReturnType<typeof setTimeout>>();
  const randomIdleTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { emotionRef.current = emotion; }, [emotion]);

  // When timer activates or emotion changes externally, reset idle sub-emotion
  useEffect(() => {
    if (isActive || emotion !== 'idle') setIdleEmotion(emotion);
    else setIdleEmotion(isOverFaceRef.current ? 'shy' : 'idle');
  }, [isActive, emotion]);

  // Random idle drifting: occasionally show bored or curious
  useEffect(() => {
    const schedule = () => {
      const delay = Math.random() * 12000 + 8000; // 8–20s
      randomIdleTimer.current = setTimeout(() => {
        if (!isActiveRef.current && emotionRef.current === 'idle' && !isOverFaceRef.current) {
          const pick: Emotion[] = ['bored', 'curious', 'idle', 'idle'];
          setIdleEmotion(pick[Math.floor(Math.random() * pick.length)]);
          // Revert after 3s
          setTimeout(() => {
            if (!isActiveRef.current && emotionRef.current === 'idle')
              setIdleEmotion(isOverFaceRef.current ? 'shy' : 'idle');
          }, 3000);
        }
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(randomIdleTimer.current);
  }, []);

  // Mouse tracking — speed → surprised, position for eyes
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!faceRef.current) return;
      const rect = faceRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setMousePos({
        x: (e.clientX - cx) / (window.innerWidth / 2),
        y: (e.clientY - cy) / (window.innerHeight / 2),
      });

      // Speed detection — only when idle & not active
      if (!isActiveRef.current && emotionRef.current === 'idle') {
        const now = Date.now();
        const dt = Math.max(now - prevMouse.current.t, 1);
        const dx = e.clientX - prevMouse.current.x;
        const dy = e.clientY - prevMouse.current.y;
        const speed = Math.sqrt(dx * dx + dy * dy) / dt;

        if (speed > 1.8) {
          setIdleEmotion('surprised');
          clearTimeout(speedTimer.current);
          speedTimer.current = setTimeout(() => {
            if (!isActiveRef.current && emotionRef.current === 'idle')
              setIdleEmotion(isOverFaceRef.current ? 'shy' : 'idle');
          }, 750);
        }
        prevMouse.current = { x: e.clientX, y: e.clientY, t: now };
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Face hover → shy
  const handleMouseEnter = () => {
    isOverFaceRef.current = true;
    if (!isActiveRef.current && emotionRef.current === 'idle')
      setIdleEmotion('shy');
  };
  const handleMouseLeave = () => {
    isOverFaceRef.current = false;
    if (!isActiveRef.current && emotionRef.current === 'idle')
      setIdleEmotion('idle');
  };

  // Effective emotion used for rendering
  const eff: Emotion = (!isActive && emotion === 'idle') ? idleEmotion : emotion;

  // ── Mouth paths ──────────────────────────────────────────────────────────────
  const mouthPaths: Record<Emotion, string> = {
    idle:      "M 30 50 Q 50 60 70 50",
    focus:     "M 40 55 Q 50 55 60 55",
    focus2:    "M 38 52 L 62 52",
    success:   "M 30 45 Q 50 75 70 45",
    sleepy:    "M 38 56 Q 50 56 62 56",
    break:     "M 28 50 Q 50 70 72 50",
    confused:  "M 35 55 Q 50 45 65 55",
    excited:   "M 30 45 Q 50 80 70 45",
    tired:     "M 35 60 Q 50 55 65 60",
    // New faces
    shy:       "M 41 53 Q 50 59 59 53",    // small tight smile, mouth almost hidden
    surprised: "M 36 47 Q 50 70 64 47",    // wide open arc — "O" mouth
    curious:   "M 33 51 Q 50 63 67 50",    // asymmetric smile, curious
    bored:     "M 36 57 Q 50 53 64 57",    // slight frown / flat
  };

  // ── Eye shape variants ───────────────────────────────────────────────────────
  const eyeVariants: Record<Emotion, { scaleY: number; h: number; w: number; r: string }> = {
    idle:      { scaleY: 1,    h: 12, w: 12, r: "100%" },
    focus:     { scaleY: 0.55, h: 12, w: 12, r: "100%" },
    focus2:    { scaleY: 0.25, h: 12, w: 14, r: "30%"  },
    success:   { scaleY: 1.2,  h: 14, w: 12, r: "100%" },
    sleepy:    { scaleY: 0.1,  h: 12, w: 12, r: "100%" },
    break:     { scaleY: 1.3,  h: 14, w: 14, r: "100%" },
    confused:  { scaleY: 1,    h: 12, w: 12, r: "100%" },
    excited:   { scaleY: 1,    h: 16, w: 16, r: "20%"  },
    tired:     { scaleY: 0.5,  h: 12, w: 12, r: "100%" },
    // New faces
    shy:       { scaleY: 0.45, h: 11, w: 12, r: "100%" }, // squinting down
    surprised: { scaleY: 1.5,  h: 16, w: 15, r: "100%" }, // very wide O eyes
    curious:   { scaleY: 1.1,  h: 13, w: 12, r: "100%" }, // slightly wide
    bored:     { scaleY: 0.38, h: 12, w: 13, r: "40%"  }, // heavy-lidded
  };

  const ev = eyeVariants[eff] ?? eyeVariants.idle;

  // Eye movement — per-emotion overrides
  const eyeX = eff === 'shy'
    ? -mousePos.x * 3       // look slightly away
    : eff === 'surprised'
    ? mousePos.x * 9        // very reactive
    : mousePos.x * 6;
  const eyeY = eff === 'shy'
    ? 4                     // always look slightly downward
    : eff === 'surprised'
    ? mousePos.y * 8
    : mousePos.y * 5;

  const eyeSpring = { type: "spring", stiffness: 120, damping: 15, mass: 0.8 } as const;

  // ── Mode label ───────────────────────────────────────────────────────────────
  const modeLabel: Record<TimerMode, { text: string; emoji: string; color: string; dot: string }> = {
    focus:      { text: 'FOCUS',      emoji: '🍅', color: 'bg-[#1F4E5A]/90 text-[#DCF6E6]', dot: 'bg-[#FF5E5E]' },
    shortBreak: { text: 'BREAK',      emoji: '☕', color: 'bg-[#6BCB77]/90 text-[#1F4E5A]', dot: 'bg-[#6BCB77]' },
    longBreak:  { text: 'LONG BREAK', emoji: '⭐', color: 'bg-[#FFD93D]/90 text-[#1F4E5A]', dot: 'bg-[#FFD93D]' },
  };

  // ── Blinking ─────────────────────────────────────────────────────────────────
  const [isBlinking, setIsBlinking] = useState(false);
  useEffect(() => {
    const blinkLoop = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      setTimeout(blinkLoop, Math.random() * 4000 + 2000);
    };
    const t = setTimeout(blinkLoop, 3000);
    return () => clearTimeout(t);
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const faceShift = isActive ? 'translateY(-24px)' : 'none';

  // Show blush for these emotions
  const showBlush = eff === 'success' || eff === 'excited' || eff === 'break' || eff === 'shy';

  return (
    <div
      ref={faceRef}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#E8F5E9]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* CRT scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.02)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.01),rgba(0,0,255,0.01))]"
        style={{ backgroundSize: "100% 3px, 3px 100%" }}
      />
      <motion.div
        animate={{ opacity: [0.01, 0.03, 0.01] }}
        transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        className="absolute inset-0 bg-white pointer-events-none z-20 mix-blend-overlay"
      />

      {/* Mode badge */}
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

      {/* Eyes */}
      <div
        className="flex justify-between w-40 mb-8 transition-all duration-500"
        style={{ transform: faceShift }}
      >
        {/* Left eye */}
        <motion.div
          animate={{
            x: eyeX,
            y: eyeY,
            scaleY: isBlinking ? 0.1 : ev.scaleY,
            height: ev.h,
            width: eff === 'confused' ? 16 : eff === 'focus2' ? 14 : ev.w,
            borderRadius: ev.r,
          }}
          transition={{ x: eyeSpring, y: eyeSpring, scaleY: { duration: 0.1 } }}
          className="bg-[#1F4E5A] shadow-sm"
        />
        {/* Right eye — some emotions make it asymmetric */}
        <motion.div
          animate={{
            x: eyeX,
            y: eyeY,
            scaleY: isBlinking ? 0.1
              : eff === 'focus2'   ? ev.scaleY * 1.6
              : eff === 'curious'  ? ev.scaleY * 1.25   // one eye raised = curious
              : ev.scaleY,
            height: ev.h,
            width: eff === 'confused' ? 8 : eff === 'focus2' ? 10 : ev.w,
            borderRadius: ev.r,
          }}
          transition={{ x: eyeSpring, y: eyeSpring, scaleY: { duration: 0.1 } }}
          className="bg-[#1F4E5A] shadow-sm"
        />
      </div>

      {/* Mouth */}
      <svg
        width="100" height="80" viewBox="0 0 100 80"
        className="absolute top-1/2 -mt-2 transition-all duration-500"
        style={{ transform: faceShift }}
      >
        <motion.path
          d={mouthPaths[eff] ?? mouthPaths.idle}
          fill="transparent"
          stroke="#1F4E5A"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={false}
          animate={{ d: mouthPaths[eff] ?? mouthPaths.idle }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </svg>

      {/* Blush */}
      {showBlush && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: eff === 'shy' ? 0.45 : 0.3 }}
            className="absolute top-1/2 left-14 w-5 h-2.5 bg-[#FF9AA2] rounded-full blur-md"
            style={{ transform: faceShift }}
          />
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: eff === 'shy' ? 0.45 : 0.3 }}
            className="absolute top-1/2 right-14 w-5 h-2.5 bg-[#FF9AA2] rounded-full blur-md"
            style={{ transform: faceShift }}
          />
        </>
      )}

      {/* Zzz for sleepy */}
      {eff === 'sleepy' && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.7, 0], y: -18 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
          className="absolute top-[38%] right-[28%] text-[#1F4E5A]/60 font-black text-xs pointer-events-none z-30"
          style={{ transform: faceShift }}
        >
          z z z
        </motion.div>
      )}

      {/* Sweat drop for surprised */}
      {eff === 'surprised' && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: [0, 0.8, 0], y: [0, 10, 10] }}
          transition={{ duration: 0.8, ease: "easeIn" }}
          className="absolute top-[30%] right-[22%] text-[#4D96FF] font-black text-sm pointer-events-none z-30"
          style={{ transform: faceShift }}
        >
          💧
        </motion.div>
      )}

      {/* Question mark for curious */}
      {eff === 'curious' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.7, 0.5], scale: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute top-[22%] right-[20%] text-[#1F4E5A]/50 font-black text-base pointer-events-none z-30"
          style={{ transform: faceShift }}
        >
          ?
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
