import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
  sessionsPerRound?: number;
  soundEnabled?: boolean;
  soundVolume?: number; // 0-100
  autoStart?: boolean; // auto-start timer on tab load
  notificationsEnabled?: boolean; // desktop notifications
}

const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsPerRound: 4,
  soundEnabled: true,
  soundVolume: 70,
  autoStart: false,
  notificationsEnabled: true,
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
  activeTaskSessionsPerRound?: number;  // Task-specific goal for notifications
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
  activeTaskSessionsPerRound: undefined,
};

function normalizeSettings(input?: TimerSettings): TimerSettings {
  return { ...DEFAULT_SETTINGS, ...(input ?? {}) };
}

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

export function useTimer(onComplete: (completedMode: TimerMode) => void, activeTaskInfo?: { 
  sessionCount: number; 
  sessionsPerRound: number; 
  sessionInCurrentRound?: number;
  taskId?: string;
  focusDuration?: number;
  shortBreakDuration?: number;
  longBreakDuration?: number;
}): TimerState {
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
  const timeLeftRef  = useRef(DEFAULT_SETTINGS.focus * 60);     // track current timeLeft
  const endTimeRef   = useRef<number | null>(null);           // absolute ms when session ends
  const lastCompletedAtRef   = useRef<number | null>(null);
  const lastActiveTaskIdRef  = useRef<string | undefined>(undefined); // track task changes
  const onCompleteRef = useRef(onComplete);
  const activeTaskInfoRef = useRef(activeTaskInfo);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { 
    // Track task changes and load/save timer state per task
    const prevTaskId = lastActiveTaskIdRef.current;
    const currentTaskId = activeTaskInfo?.taskId;
    
    // Debug: Log task switches
    console.debug('[useTimer] Task switch detected:', {
      prev: prevTaskId,
      current: currentTaskId,
      focusDuration: activeTaskInfo?.focusDuration,
      willSave: prevTaskId && prevTaskId !== currentTaskId,
      willLoad: currentTaskId && currentTaskId !== prevTaskId,
    });
    
    // Save previous task's timer state
    if (prevTaskId && prevTaskId !== currentTaskId) {
      try {
        const taskStates = JSON.parse(localStorage.getItem('bmo_task_timer_states') || '{}');
        taskStates[prevTaskId] = {
          mode: modeRef.current,
          timeLeft: timeLeftRef.current,  // Use ref to get current value
          isActive: false, // Always pause when switching
        };
        localStorage.setItem('bmo_task_timer_states', JSON.stringify(taskStates));
        console.debug('[useTimer] Saved state for task:', prevTaskId, taskStates[prevTaskId]);
      } catch { /* ignore */ }
    }
    
    // Load new task's timer state
    if (currentTaskId && currentTaskId !== prevTaskId) {
      try {
        const taskStates = JSON.parse(localStorage.getItem('bmo_task_timer_states') || '{}');
        const savedState = taskStates[currentTaskId];
        const focusDuration = (activeTaskInfo?.focusDuration ?? 25) * 60;
        
        if (savedState) {
          // Task has been worked on before - restore its state
          console.debug('[useTimer] Restoring saved state for task:', currentTaskId, savedState);
          setModeState(savedState.mode);
          setTimeLeft(savedState.timeLeft);
          setIsActive(false); // Always start paused when switching
        } else {
          // First time loading this task - start fresh with full focus duration
          console.debug('[useTimer] No saved state, initializing to full duration:', focusDuration, 'seconds');
          setModeState('focus');
          setTimeLeft(focusDuration);
          setIsActive(false);
        }
      } catch { /* ignore */ }
    }
    
    // Update task-specific settings
    if (activeTaskInfo?.focusDuration !== undefined) {
      const taskSettings: TimerSettings = {
        focus: activeTaskInfo.focusDuration,
        shortBreak: activeTaskInfo.shortBreakDuration ?? 5,
        longBreak: activeTaskInfo.longBreakDuration ?? 15,
        sessionsPerRound: activeTaskInfo.sessionsPerRound,
      };
      console.debug('[useTimer] Updating settings:', taskSettings);
      setSettings(taskSettings);
    }
    
    lastActiveTaskIdRef.current = currentTaskId;
    activeTaskInfoRef.current = activeTaskInfo;
  }, [
    activeTaskInfo?.taskId,
    activeTaskInfo?.focusDuration,
    activeTaskInfo?.shortBreakDuration,
    activeTaskInfo?.longBreakDuration,
    activeTaskInfo?.sessionsPerRound,
  ]);

  // ── Sync local state from a background storage snapshot ──────────────────
  const applyBgState = useCallback((s: BgTimerState) => {
    setModeState(s.mode);
    const normalized = normalizeSettings(s.settings);
    setSettings(normalized);
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
        : normalized[s.mode] * 60;
      setTimeLeft(tl);
    }
  }, []);

  // ── Load initial state & watch for external changes (extension only) ──────
  useEffect(() => {
    if (!isChromeExt) {
      // Dev mode: restore settings from localStorage
      try {
        const raw = localStorage.getItem(LEGACY_SETTINGS_KEY);
        if (raw) setSettings(normalizeSettings(JSON.parse(raw)));
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
        
        // Use task-specific session tracking if available, otherwise global
        let nextMode: TimerMode;
        if (completedMode === 'focus') {
          const taskInfo = activeTaskInfoRef.current;
          if (taskInfo) {
            // For tasks: use the task's current round position
            const currentSessionInRound = taskInfo.sessionInCurrentRound ?? 0;
            const nextSessionInRound = (currentSessionInRound + 1) % (taskInfo.sessionsPerRound);
            const sessionsPerRound = taskInfo.sessionsPerRound;
            // Long break if we just completed the last session of the round (and about to reset to 0)
            nextMode = nextSessionInRound === 0 ? 'longBreak' : 'shortBreak';
            setSessionCount(currentSessionInRound + 1);
          } else {
            // For no-task sessions: use global counter and global setting
            const sessionsPerRound = s.sessionsPerRound ?? 4;
            const currentGlobalSession = (sessionCount % sessionsPerRound);
            const nextSession = currentGlobalSession + 1;
            setSessionCount(nextSession);
            nextMode = nextSession % sessionsPerRound === 0 ? 'longBreak' : 'shortBreak';
          }
        } else {
          nextMode = 'focus';
        }

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

  // Save current task's timer state whenever it changes
  useEffect(() => {
    const taskId = activeTaskInfoRef.current?.taskId;
    if (!taskId) return;
    try {
      const taskStates = JSON.parse(localStorage.getItem('bmo_task_timer_states') || '{}');
      taskStates[taskId] = {
        mode,
        timeLeft,
        isActive,
      };
      localStorage.setItem('bmo_task_timer_states', JSON.stringify(taskStates));
    } catch { /* ignore */ }
  }, [timeLeft, mode, isActive]);

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
    const normalized = normalizeSettings(newSettings);
    setSettings(normalized);
    if (!isActiveRef.current) {
      setTimeLeft(normalized[modeRef.current] * 60);
    }
    if (isChromeExt) sendBgMessage('UPDATE_SETTINGS', { settings: normalized });
    else localStorage.setItem(LEGACY_SETTINGS_KEY, JSON.stringify(normalized));
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
