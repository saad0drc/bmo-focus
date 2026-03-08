import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

const STORAGE_KEY_SETTINGS = 'bmo_timer_settings';

interface TimerState {
  timeLeft: number;
  isActive: boolean;
  mode: TimerMode;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setMode: (mode: TimerMode) => void;
  progress: number;
  settings: TimerSettings;
  updateSettings: (newSettings: TimerSettings) => void;
}

export function useTimer(onComplete: () => void): TimerState {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focus * 60);
  const [isActive, setIsActive] = useState(false);
  
  // Load settings
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
        // Only update time if timer is not active and matches default of that mode
        if (!isActive) {
           // This might cause a jump if we reload, but it's safer
        }
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  // Update time when settings or mode change, but only if not active
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(settings[mode] * 60);
    }
  }, [settings, mode, isActive]);

  const updateSettings = useCallback((newSettings: TimerSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
    if (!isActive) {
      setTimeLeft(newSettings[mode] * 60);
    }
  }, [isActive, mode]);

  const startTimer = useCallback(() => {
    if (!isActive) {
      setIsActive(true);
    }
  }, [isActive]);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(settings[mode] * 60);
  }, [mode, settings]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, onComplete]);

  const initialDuration = settings[mode] * 60;
  const progress = 1 - (timeLeft / initialDuration);

  return {
    timeLeft,
    isActive,
    mode,
    startTimer,
    pauseTimer,
    resetTimer,
    setMode,
    progress,
    settings,
    updateSettings
  };
}
