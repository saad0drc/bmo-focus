type NoteEvent = { freq: number; start: number; dur: number };

// Lazy-initialized shared AudioContext — created once, reused forever
let sharedCtx: AudioContext | null = null;
let ctxResumed = false;

function getAudioContext(): AudioContext | null {
  if (sharedCtx) return sharedCtx;
  
  try {
    const Ctor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    sharedCtx = new Ctor();
    return sharedCtx;
  } catch {
    return null;
  }
}

function withCtx(run: (ctx: AudioContext) => number | void) {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Ensure context is running (user interaction will have triggered this, but make sure)
  const resume = () => {
    if (ctxResumed || ctx.state === 'running') {
      ctxResumed = true;
      try {
        run(ctx);
      } catch (e) {
        console.error('Audio scheduling error:', e);
      }
      return;
    }
    
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        ctxResumed = true;
        try {
          run(ctx);
        } catch (e) {
          console.error('Audio scheduling error:', e);
        }
      }).catch(() => {
        console.error('Failed to resume AudioContext');
      });
    }
  };

  resume();
}

// Global volume multiplier (0.0 = silent, 1.0 = full)
export let globalSoundVolume = 0.7; // Default 70%

export function setSoundVolume(percent: number) {
  globalSoundVolume = Math.max(0, Math.min(100, percent)) / 100;
}

/** Schedule a sequence of notes using the Web Audio API. */
function playSequence(notes: NoteEvent[], type: OscillatorType = 'square', vol = 0.22) {
  withCtx((ctx) => {
    const master = ctx.createGain();
    master.gain.setValueAtTime(vol * globalSoundVolume, ctx.currentTime);
    master.connect(ctx.destination);

    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.connect(env);
      env.connect(master);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      env.gain.setValueAtTime(0, ctx.currentTime + start);
      env.gain.linearRampToValueAtTime(1, ctx.currentTime + start + 0.01);
      env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    });

    return Math.max(...notes.map(n => n.start + n.dur), 0.2) + 0.1;
  });
}

// Note frequencies (Hz)
const C4 = 261.63, E4 = 329.63, G4 = 392.00;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880.00, B5 = 987.77;
const C6 = 1046.50, E6 = 1318.51;

export const playSound = {

  /** Button: start timer */
  start: () => playSequence([
    { freq: 440, start: 0,    dur: 0.08 },
    { freq: 880, start: 0.08, dur: 0.06 },
  ], 'square', 0.12),

  /** Button: pause timer */
  pause: () => playSequence([
    { freq: 440, start: 0,    dur: 0.06 },
    { freq: 220, start: 0.07, dur: 0.08 },
  ], 'triangle', 0.10),

  /** Button: reset timer */
  reset: () => playSequence([
    { freq: 880, start: 0,    dur: 0.05 },
    { freq: 440, start: 0.06, dur: 0.05 },
    { freq: 220, start: 0.12, dur: 0.10 },
  ], 'sawtooth', 0.10),

  /** D-pad: mode change */
  modeChange: () => playSequence([
    { freq: 880, start: 0, dur: 0.05 },
  ], 'sine', 0.07),

  /** Focus session complete — bright ascending BMO arpeggio (level-up!) */
  focusComplete: () => {
    playSequence([
      { freq: C5, start: 0.00, dur: 0.12 },
      { freq: E5, start: 0.10, dur: 0.12 },
      { freq: G5, start: 0.20, dur: 0.12 },
      { freq: C6, start: 0.30, dur: 0.40 },
    ], 'square', 0.22);
    // Harmony (quieter sine layer)
    playSequence([
      { freq: E4, start: 0.00, dur: 0.12 },
      { freq: G4, start: 0.10, dur: 0.12 },
      { freq: C5, start: 0.20, dur: 0.12 },
      { freq: E5, start: 0.30, dur: 0.40 },
    ], 'sine', 0.08);
  },

  /** Short break complete — two quick "wake up" pings */
  breakComplete: () => {
    playSequence([
      { freq: G5,  start: 0.00, dur: 0.10 },
      { freq: C5,  start: 0.12, dur: 0.18 },
    ], 'square', 0.18);
  },

  /** Long break complete — gentle 4-note ascending scale */
  longBreakComplete: () => {
    playSequence([
      { freq: C5, start: 0.00, dur: 0.14 },
      { freq: E5, start: 0.16, dur: 0.14 },
      { freq: G5, start: 0.32, dur: 0.14 },
      { freq: A5, start: 0.48, dur: 0.40 },
    ], 'triangle', 0.20);
  },

  /** Task round complete — full BMO celebration fanfare! */
  roundComplete: () => {
    // Main melody: ascending triumphant run
    playSequence([
      { freq: C5,  start: 0.00, dur: 0.10 },
      { freq: E5,  start: 0.10, dur: 0.10 },
      { freq: G5,  start: 0.20, dur: 0.10 },
      { freq: C6,  start: 0.30, dur: 0.10 },
      { freq: E6,  start: 0.40, dur: 0.10 },
      { freq: C6,  start: 0.52, dur: 0.12 },
      { freq: G5,  start: 0.66, dur: 0.12 },
      { freq: C6,  start: 0.80, dur: 0.50 },
    ], 'square', 0.22);
    // Counter melody (lower harmony)
    playSequence([
      { freq: C4,  start: 0.00, dur: 0.10 },
      { freq: E4,  start: 0.10, dur: 0.10 },
      { freq: G4,  start: 0.20, dur: 0.10 },
      { freq: C5,  start: 0.30, dur: 0.60 },
      { freq: D5,  start: 0.52, dur: 0.12 },
      { freq: B5,  start: 0.80, dur: 0.50 },
    ], 'sine', 0.10);
  },

  /** Subtle clock tick — plays every second while timer is active */
  tick: () => {
    withCtx((ctx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, ctx.currentTime);
      gain.gain.setValueAtTime(0.028 * globalSoundVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001 * globalSoundVolume, ctx.currentTime + 0.022);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
      return 0.12;
    });
  },

  /** Two-tone "swoosh" played when switching between modes */
  transition: () => {
    playSequence([
      { freq: 440, start: 0.00, dur: 0.14 },
      { freq: 660, start: 0.12, dur: 0.22 },
    ], 'sine', 0.16);
  },

  /** Kept for backwards compatibility */
  complete: () => playSound.focusComplete(),
};
