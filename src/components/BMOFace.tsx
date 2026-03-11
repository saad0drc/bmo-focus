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
  const faceRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ── Idle sub-emotion: two triggers only ─────────────────────────────────────
  // 1. Mouse hovers over BMO's face → shy
  // 2. Mouse moves fast anywhere    → surprised (750ms flash)
  const [idleEmotion, setIdleEmotion] = useState<Emotion>('idle');
  const isActiveRef   = useRef(isActive);
  const emotionRef    = useRef(emotion);
  const isOverFaceRef = useRef(false);
  const prevMouse     = useRef({ x: 0, y: 0, t: Date.now() });
  const speedTimer    = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { isActiveRef.current  = isActive;  }, [isActive]);
  useEffect(() => { emotionRef.current   = emotion;   }, [emotion]);

  // Sync idle sub-emotion when external state changes
  useEffect(() => {
    if (isActive || emotion !== 'idle') {
      setIdleEmotion(emotion);
    } else {
      setIdleEmotion(isOverFaceRef.current ? 'shy' : 'idle');
    }
  }, [isActive, emotion]);

  // Global mouse move: track position + speed
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!faceRef.current) return;
      const rect = faceRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - (rect.left + rect.width  / 2)) / (window.innerWidth  / 2),
        y: (e.clientY - (rect.top  + rect.height / 2)) / (window.innerHeight / 2),
      });

      // Fast mouse → surprised (idle only)
      if (!isActiveRef.current && emotionRef.current === 'idle') {
        const now = Date.now();
        const dt  = Math.max(now - prevMouse.current.t, 1);
        const dx  = e.clientX - prevMouse.current.x;
        const dy  = e.clientY - prevMouse.current.y;
        if (Math.sqrt(dx * dx + dy * dy) / dt > 1.8) {
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

  const handleMouseEnter = () => {
    isOverFaceRef.current = true;
    if (!isActiveRef.current && emotionRef.current === 'idle') setIdleEmotion('shy');
  };
  const handleMouseLeave = () => {
    isOverFaceRef.current = false;
    if (!isActiveRef.current && emotionRef.current === 'idle') setIdleEmotion('idle');
  };

  // What actually renders
  const eff: Emotion = (!isActive && emotion === 'idle') ? idleEmotion : emotion;

  // ── Mouth paths ──────────────────────────────────────────────────────────────
  const mouths: Record<Emotion, string> = {
    idle:      'M 28 50 Q 50 64 72 50',      // relaxed friendly arc
    focus:     'M 40 55 Q 50 55 60 55',      // small, concentrated
    focus2:    'M 38 52 L 62 52',            // flat intense line
    success:   'M 26 44 Q 50 78 74 44',      // huge joyful grin
    sleepy:    'M 38 56 Q 50 56 62 56',      // barely there
    break:     'M 28 50 Q 50 70 72 50',      // wide warm smile
    confused:  'M 35 55 Q 50 45 65 55',      // wobbly / wavy
    excited:   'M 26 44 Q 50 82 74 44',      // biggest happiest grin
    tired:     'M 36 60 Q 50 55 64 60',      // little frown
    shy:       'M 40 52 Q 50 59 60 52',      // tiny sweet shy smile
    surprised: 'M 38 47 Q 50 68 62 47',      // open "O" mouth
    curious:   'M 33 51 Q 50 63 67 51',      // wide curious smile
    bored:     'M 36 57 Q 50 53 64 57',      // slight droopy frown
  };

  // ── Eye shape per emotion ─────────────────────────────────────────────────
  //  scaleY controls lid height; w/h control circle size; r = border-radius
  const eyes: Record<Emotion, { scaleY: number; h: number; w: number; r: string }> = {
    idle:      { scaleY: 1,    h: 12, w: 12, r: '100%' },
    focus:     { scaleY: 0.5,  h: 12, w: 12, r: '100%' },   // squinting
    focus2:    { scaleY: 0.2,  h: 12, w: 14, r: '30%'  },   // intense rectangle
    success:   { scaleY: 1.2,  h: 14, w: 12, r: '100%' },
    sleepy:    { scaleY: 0.1,  h: 12, w: 12, r: '100%' },   // almost closed
    break:     { scaleY: 1.3,  h: 14, w: 14, r: '100%' },   // big happy eyes
    confused:  { scaleY: 1,    h: 12, w: 12, r: '100%' },   // asymmetric via render
    excited:   { scaleY: 1.1,  h: 16, w: 16, r: '20%'  },   // star-shaped
    tired:     { scaleY: 0.45, h: 12, w: 12, r: '100%' },   // droopy
    shy:       { scaleY: 0.4,  h: 11, w: 12, r: '100%' },   // squinting, looking away
    surprised: { scaleY: 1.55, h: 16, w: 15, r: '100%' },   // wide open circles
    curious:   { scaleY: 1.1,  h: 13, w: 12, r: '100%' },   // one raised
    bored:     { scaleY: 0.35, h: 12, w: 13, r: '40%'  },   // heavy-lidded
  };

  const ev = eyes[eff] ?? eyes.idle;

  // Per-emotion eye position override
  const eyeX = eff === 'shy'       ? -mousePos.x * 2.5  // look slightly away
             : eff === 'surprised' ? mousePos.x * 9      // very reactive
             : mousePos.x * 6;
  const eyeY = eff === 'shy'       ? 4                   // always look down a bit
             : eff === 'surprised' ? mousePos.y * 8
             : mousePos.y * 5;

  const spring = { type: 'spring', stiffness: 120, damping: 15, mass: 0.8 } as const;

  // ── Mode badge labels ─────────────────────────────────────────────────────
  const modeLabel: Record<TimerMode, { text: string; emoji: string; color: string; dot: string }> = {
    focus:      { text: 'FOCUS',      emoji: '🍅', color: 'bg-[#1F4E5A]/90 text-[#DCF6E6]', dot: 'bg-[#FF5E5E]'  },
    shortBreak: { text: 'BREAK',      emoji: '☕', color: 'bg-[#6BCB77]/90 text-[#1F4E5A]', dot: 'bg-[#6BCB77]'  },
    longBreak:  { text: 'LONG BREAK', emoji: '⭐', color: 'bg-[#FFD93D]/90 text-[#1F4E5A]', dot: 'bg-[#FFD93D]'  },
  };

  // ── Blinking ──────────────────────────────────────────────────────────────
  const [isBlinking, setIsBlinking] = useState(false);
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
      setTimeout(blink, Math.random() * 4500 + 2000);
    };
    const t = setTimeout(blink, 3000);
    return () => clearTimeout(t);
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const shifted = isActive ? 'translateY(-24px)' : 'none';
  const showBlush = eff === 'success' || eff === 'excited' || eff === 'break' || eff === 'shy';

  return (
    <div
      ref={faceRef}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#E8F5E9] cursor-default"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* CRT scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.02) 50%), linear-gradient(90deg, rgba(255,0,0,0.01), rgba(0,255,0,0.01), rgba(0,0,255,0.01))',
          backgroundSize: '100% 3px, 3px 100%',
        }}
      />
      <motion.div
        animate={{ opacity: [0.01, 0.03, 0.01] }}
        transition={{ duration: 0.2, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
        className="absolute inset-0 bg-white pointer-events-none z-20 mix-blend-overlay"
      />

      {/* Active mode badge + task name */}
      <AnimatePresence>
        {isActive && mode && (
          <motion.div
            key="badge"
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
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

      {/* ── Eyes ─────────────────────────────────────────────────────────────── */}
      <div className="flex justify-between w-40 mb-8 transition-all duration-500" style={{ transform: shifted }}>
        {/* Left eye */}
        <motion.div
          animate={{
            x: eyeX, y: eyeY,
            scaleY: isBlinking ? 0.08 : ev.scaleY,
            height: ev.h,
            width: eff === 'confused' ? 16 : eff === 'focus2' ? 14 : ev.w,
            borderRadius: ev.r,
          }}
          transition={{ x: spring, y: spring, scaleY: { duration: 0.1 } }}
          className="bg-[#1F4E5A] shadow-sm"
        />
        {/* Right eye — asymmetric for confused & curious */}
        <motion.div
          animate={{
            x: eyeX, y: eyeY,
            scaleY: isBlinking ? 0.08
              : eff === 'focus2'   ? ev.scaleY * 1.6   // intense: one eye more squinted
              : eff === 'confused' ? ev.scaleY * 0.5   // one big one small
              : eff === 'curious'  ? ev.scaleY * 1.3   // one slightly raised
              : ev.scaleY,
            height: ev.h,
            width: eff === 'confused' ? 8 : eff === 'focus2' ? 10 : ev.w,
            borderRadius: ev.r,
          }}
          transition={{ x: spring, y: spring, scaleY: { duration: 0.1 } }}
          className="bg-[#1F4E5A] shadow-sm"
        />
      </div>

      {/* ── Mouth ────────────────────────────────────────────────────────────── */}
      <svg
        width="100" height="80" viewBox="0 0 100 80"
        className="absolute top-1/2 -mt-2 transition-all duration-500"
        style={{ transform: shifted }}
      >
        <motion.path
          d={mouths[eff] ?? mouths.idle}
          fill="transparent"
          stroke="#1F4E5A"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={false}
          animate={{ d: mouths[eff] ?? mouths.idle }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      </svg>

      {/* ── Blush ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showBlush && (
          <>
            <motion.div
              key="blush-l"
              initial={{ opacity: 0 }} animate={{ opacity: eff === 'shy' ? 0.5 : 0.28 }} exit={{ opacity: 0 }}
              className="absolute top-1/2 left-14 w-6 h-3 bg-[#FF9AA2] rounded-full blur-md pointer-events-none"
              style={{ transform: shifted }}
            />
            <motion.div
              key="blush-r"
              initial={{ opacity: 0 }} animate={{ opacity: eff === 'shy' ? 0.5 : 0.28 }} exit={{ opacity: 0 }}
              className="absolute top-1/2 right-14 w-6 h-3 bg-[#FF9AA2] rounded-full blur-md pointer-events-none"
              style={{ transform: shifted }}
            />
          </>
        )}
      </AnimatePresence>

      {/* ── Zzz — sleepy only ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {eff === 'sleepy' && (
          <motion.div
            key="zzz"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.65, 0], y: -18 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
            className="absolute top-[38%] right-[26%] text-[#1F4E5A]/55 font-black text-xs pointer-events-none z-30"
            style={{ transform: shifted }}
          >
            z z z
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sweat drop — surprised only ──────────────────────────────────────── */}
      <AnimatePresence>
        {eff === 'surprised' && (
          <motion.div
            key="sweat"
            initial={{ opacity: 0, y: -6, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute top-[24%] right-[21%] text-sm pointer-events-none z-30"
            style={{ transform: shifted }}
          >
            💧
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Timer display ────────────────────────────────────────────────────── */}
      {timeLeft !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute bottom-6 font-pixel tracking-widest transition-all duration-500 ${
            isActive ? 'text-[#1F4E5A] scale-110 text-5xl' : 'text-[#1F4E5A]/45 text-4xl'
          }`}
        >
          {formatTime(timeLeft)}
        </motion.div>
      )}
    </div>
  );
}
