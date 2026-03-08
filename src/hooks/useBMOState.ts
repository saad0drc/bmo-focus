import { useState, useCallback } from 'react';

export type Emotion = 'idle' | 'focus' | 'focus2' | 'success' | 'sleepy' | 'break' | 'confused' | 'excited' | 'tired';

export function useBMOState() {
  const [emotion, setEmotionRaw] = useState<Emotion>('idle');

  const setEmotion = useCallback((e: Emotion) => {
    setEmotionRaw(e);
  }, []);

  /** Set emotion and revert to idle after `duration` ms */
  const flashEmotion = useCallback((e: Emotion, duration = 5000) => {
    setEmotionRaw(e);
    setTimeout(() => setEmotionRaw('idle'), duration);
  }, []);

  return { emotion, setEmotion, flashEmotion };
}
