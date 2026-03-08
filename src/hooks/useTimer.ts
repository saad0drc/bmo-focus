import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
  sessionsPerRound?: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsPerRound: 4,
};

const STORAGE_KEY = 'bmo_timer_state';
const LEGACY_SETTINGS_KEY = 'bmo_timer_settings';

// Evaluated once at module load — safe to use in hooks
const isChromeExt = ((): boolean => {
  try { return typeof chrome !== 'undefined' && !!chrome?.runtime?.id; }
  catch { return false; }
})();

interface BgTimerState {
  mode: TimerMode;
  isActive: boolean;
  endTime: number | null;
  pausedTimeLeft: number | null;
  sessionCount: number;
  settings: TimerSettings;
  lastCompletedAt: number | null;
  lastCompletedMode: TimerMode | null;
}

const DEFAULT_BG_STATE: BgTimerState = {
  mode: 'focus',
  isActive: false,
  endTime: null,
  pausedTimeLeft: null,
  sessionCount: 0,
  settings: DEFAULT_SETTINGS,
  lastCompletedAt: null,
  lastCompletedMode: null,
};

function sendBgMessage(type: string, payload: object = {}): void {
  try {
    chrome.runtime.sendMessage({ type, ...payload }, () => {
      void chrome.runtime.lastError; // suppress "no receiver" errors
    });
  } catch { /* service worker not ready yet — fine, local state already updated */ }
}

export interface TimerState {
  timeLeft: number;
  isActive: boolean;
  mode: TimerMode;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setMode: (mode: TimerMode) => void;
  progress: number;
  settings: TimerSettings;
  updateSettings: (s: TimerSettings) => void;
  sessionCount: number;
  isExtension: boolean;
}

export function useTimer(onComplete: (completedMode: TimerMode) => void): TimerState {
  // ── Core state (drives the UI directly in all cases) ──────────────────────
  const [mode, setModeState] = useState<TimerMode>('focus');
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  // Refs for stable access inside callbacks / effects
  const modeRef      = useRef<TimerMode>('focus');
  const settingsRef  = useRef<TimerSettings>(DEFAULT_SETTINGS);
  const isActiveRef  = useRef(false);
  const endTimeRef   = useRef<number | null>(null);           // absolute ms when session ends
  const lastCompletedAtRef   = useRef<number | null>(null);
  const devSessionCountRef   = useRef(0);                    // dev-mode round counter
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);

  // ── Sync local state from a background storage snapshot ──────────────────
  const applyBgState = useCallback((s: BgTimerState) => {
    setModeState(s.mode);
    setSettings(s.settings);
    setSessionCount(s.sessionCount);

    if (s.isActive && s.endTime) {
      endTimeRef.current = s.endTime;
      setIsActive(true);
      setTimeLeft(Math.max(1, Math.ceil((s.endTime - Date.now()) / 1000)));
    } else {
      endTimeRef.current = null;
      setIsActive(false);
      const tl = s.pausedTimeLeft != null
        ? Math.ceil(s.pausedTimeLeft / 1000)
        : s.settings[s.mode] * 60;
      setTimeLeft(tl);
    }
  }, []);

  // ── Load initial state & watch for external changes (extension only) ──────
  useEffect(() => {
    if (!isChromeExt) {
      // Dev mode: restore settings from localStorage
      try {
        const raw = localStorage.getItem(LEGACY_SETTINGS_KEY);
        if (raw) setSettings(JSON.parse(raw));
      } catch { /* ignore */ }
      return;
    }

    // Restore timer state from the background worker
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const s: BgTimerState = { ...DEFAULT_BG_STATE, ...result[STORAGE_KEY] };
      applyBgState(s);
      lastCompletedAtRef.current = s.lastCompletedAt;
    });

    // React to changes made by the background (alarms, other tabs)
    const onChange = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (!changes[STORAGE_KEY]) return;
      const s: BgTimerState = { ...DEFAULT_BG_STATE, ...changes[STORAGE_KEY].newValue };
      applyBgState(s);

      if (s.lastCompletedAt && s.lastCompletedAt !== lastCompletedAtRef.current) {
        lastCompletedAtRef.current = s.lastCompletedAt;
        onCompleteRef.current(s.lastCompletedMode ?? 'focus');
      }
    };

    chrome.storage.onChanged.addListener(onChange);
    return () => chrome.storage.onChanged.removeListener(onChange);
  }, [applyBgState]);

  // ── Countdown tick ────────────────────────────────────────────────────────
  // Runs whenever the timer is active. Works the same in ext + dev modes.
  useEffect(() => {
    if (!isActive) return;

    const tick = () => {
      if (!endTimeRef.current) return;

      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);

      // Completion — only handled locally in dev mode;
      // in extension mode the background alarm fires and updates storage.
      if (remaining <= 0 && !isChromeExt) {
        setIsActive(false);
        endTimeRef.current = null;

        const completedMode = modeRef.current;
        const s = settingsRef.current;
        const sessionsPerRound = s.sessionsPerRound ?? 4;

        devSessionCountRef.current++;
        setSessionCount(devSessionCountRef.current);

        const nextMode: TimerMode = completedMode !== 'focus'
          ? 'focus'
          : devSessionCountRef.current % sessionsPerRound === 0 ? 'longBreak' : 'shortBreak';

        onCompleteRef.current(completedMode);

        // Auto-advance: same rhythm as before
        setTimeout(() => {
          setModeState(nextMode);
          setTimeLeft(settingsRef.current[nextMode] * 60);
          endTimeRef.current = null;
          setTimeout(() => {
            endTimeRef.current = Date.now() + settingsRef.current[nextMode] * 60 * 1000;
            setIsActive(true);
          }, 900);
        }, 2800);
      }
    };

    tick(); // run immediately so display is correct from the first frame
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [isActive]);

  // ── Controls — update local state immediately, then tell the background ───
  const startTimer = useCallback(() => {
    if (isActiveRef.current) return;
    // Calculate end time from the current displayed timeLeft (use ref to avoid stale closure)
    const tl = endTimeRef.current
      ? Math.max(1, Math.ceil((endTimeRef.current - Date.now()) / 1000))
      : 0;
    // We need the actual timeLeft value — access via a setter trick or store in ref
    // Use the state directly via a functional update to get current value
    setTimeLeft(prev => {
      endTimeRef.current = Date.now() + prev * 1000;
      return prev;
    });
    setIsActive(true);
    if (isChromeExt) sendBgMessage('START');
  }, []);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
    endTimeRef.current = null;
    if (isChromeExt) sendBgMessage('PAUSE');
  }, []);

  const resetTimer = useCallback(() => {
    const full = settingsRef.current[modeRef.current] * 60;
    setIsActive(false);
    setTimeLeft(full);
    endTimeRef.current = null;
    if (isChromeExt) sendBgMessage('RESET');
  }, []);

  const setMode = useCallback((newMode: TimerMode) => {
    const full = settingsRef.current[newMode] * 60;
    setModeState(newMode);
    setIsActive(false);
    setTimeLeft(full);
    endTimeRef.current = null;
    if (isChromeExt) sendBgMessage('SET_MODE', { mode: newMode });
  }, []);

  const updateSettings = useCallback((newSettings: TimerSettings) => {
    setSettings(newSettings);
    if (!isActiveRef.current) {
      setTimeLeft(newSettings[modeRef.current] * 60);
    }
    if (isChromeExt) sendBgMessage('UPDATE_SETTINGS', { settings: newSettings });
    else localStorage.setItem(LEGACY_SETTINGS_KEY, JSON.stringify(newSettings));
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────
  const initialDuration = settings[mode] * 60;
  const progress = initialDuration > 0 ? 1 - timeLeft / initialDuration : 0;

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
    updateSettings,
    sessionCount,
    isExtension: isChromeExt,
  };
}
