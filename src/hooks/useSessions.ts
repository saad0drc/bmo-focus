import { useState, useCallback, useEffect } from 'react';
import { Session } from '../types';
import { toDateStr, todayStr } from '../utils/date';

const STORAGE_KEY = 'bmo_sessions';
const STREAK_KEY = 'bmo_global_streak';

interface GlobalStreak {
  current: number;
  lastDate: string; // YYYY-MM-DD of last streak increment
}

function loadSessions(): Session[] {
  try {
    // Try localStorage first (primary storage)
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

function loadGlobalStreak(): GlobalStreak {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { current: 0, lastDate: '' };
    const streak = JSON.parse(raw) as GlobalStreak;
    
    // Check if streak should break (skipped a day)
    if (streak.lastDate) {
      const lastDateObj = new Date(streak.lastDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastDateStr = toDateStr(lastDateObj);
      const yesterdayStr = toDateStr(yesterday);
      
      // If last date was before yesterday, streak is broken
      if (lastDateStr < yesterdayStr) {
        console.log('[BMO] Streak broken: last date was', lastDateStr, 'but yesterday was', yesterdayStr);
        return { current: 0, lastDate: '' };
      }
    }
    
    return streak;
  } catch {
    return { current: 0, lastDate: '' };
  }
}

function persistGlobalStreak(streak: GlobalStreak) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  // Also sync to Chrome storage
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      chrome.storage.local.set({ [STREAK_KEY]: streak });
    } catch (e) {
      console.warn('[BMO] Chrome storage sync failed for global streak');
    }
  }
}

// ── Derived stat helpers ──────────────────────────────────────────────────────

export interface TodayStats {
  pomodoros: number;
  focusMinutes: number;
  tasksTouched: number;
  totalTimeMinutes?: number;
}

export interface WeekStats {
  totalPomodoros: number;
  avgPerDay: number;
  bestDay: number;
}

export interface DailyStat {
  date: string;
  dayLabel: string;
  pomodoros: number;
  focusMinutes: number;
  tasksCompleted: number;
}

export function computeTodayStats(sessions: Session[]): TodayStats {
  const today = todayStr();
  const todaySessions = sessions.filter(s => s.completed && s.date === today);
  
  // Count sessions by type
  const focusSessions = todaySessions.filter(s => s.type === 'focus' || !s.type); // default to focus for backward compat
  const breakSessions = todaySessions.filter(s => s.type === 'shortBreak' || s.type === 'longBreak');
  
  const pomodoros = focusSessions.length;
  const focusMinutes = focusSessions.reduce((sum, s) => sum + s.duration, 0);
  const breakMinutes = breakSessions.reduce((sum, s) => sum + s.duration, 0);
  const totalTimeMinutes = focusMinutes + breakMinutes;
  
  return {
    pomodoros,
    focusMinutes,
    tasksTouched: new Set(focusSessions.map(s => s.taskId).filter(Boolean)).size,
    totalTimeMinutes,
  };
}

export function computeWeekStats(sessions: Session[]): WeekStats {
  const today = new Date();
  // Build a map of pomodoro counts per day for the last 7 days
  const countsByDay: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    countsByDay[toDateStr(d)] = 0;
  }
  // Count only focus sessions, not breaks
  sessions
    .filter(s => s.completed && countsByDay[s.date] !== undefined && (s.type === 'focus' || !s.type))
    .forEach(s => { countsByDay[s.date]++; });

  const counts = Object.values(countsByDay);
  const total = counts.reduce((a, b) => a + b, 0);
  return {
    totalPomodoros: total,
    avgPerDay: Math.round((total / 7) * 10) / 10,
    bestDay: Math.max(...counts),
  };
}

export function computeStreak(sessions: Session[]): number {
  const datesWithPomodoros = new Set(
    sessions.filter(s => s.completed && (s.type === 'focus' || !s.type)).map(s => s.date),
  );
  
  if (datesWithPomodoros.size === 0) return 0;
  
  // Get the most recent date with sessions
  const sortedDates = [...datesWithPomodoros].sort();
  const mostRecentDate = sortedDates[sortedDates.length - 1];
  
  // Compute streak backwards from the most recent date (not from today)
  let streak = 0;
  const startDate = new Date(mostRecentDate + 'T00:00:00');
  for (let i = 0; i < 365; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() - i);
    if (datesWithPomodoros.has(toDateStr(d))) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/** Last 7 days — [oldest … today], each entry has date label + pomodoro count */
export function computeChartData(sessions: Session[]) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const date = toDateStr(d);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    // Count only focus sessions, not breaks
    const count = sessions.filter(s => s.completed && s.date === date && (s.type === 'focus' || !s.type)).length;
    return { date, label, count };
  });
}

/** Compute daily stats for all dates with sessions — sorted newest to oldest */
export function computeAllDailyStats(sessions: Session[]): DailyStat[] {
  const dailyMap: Record<string, DailyStat> = {};
  
  sessions
    .filter(s => s.completed)
    .forEach(s => {
      if (!dailyMap[s.date]) {
        const d = new Date(s.date + 'T00:00:00');
        dailyMap[s.date] = {
          date: s.date,
          dayLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          pomodoros: 0,
          focusMinutes: 0,
          tasksCompleted: 0,
        };
      }
      dailyMap[s.date].pomodoros++;
      dailyMap[s.date].focusMinutes += s.duration;
    });

  return Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date));
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>(loadSessions);
  const [globalStreak, setGlobalStreak] = useState<GlobalStreak>(loadGlobalStreak);

  // Initialize streak from session history if it doesn't exist yet
  useEffect(() => {
    if (!globalStreak.current && !globalStreak.lastDate && sessions.length > 0) {
      // Compute streak from sessions
      const streak = computeStreak(sessions);
      if (streak > 0) {
        // Get the most recent date with a session
        const lastDate = sessions
          .filter(s => s.completed && (s.type === 'focus' || !s.type))
          .map(s => s.date)
          .sort()
          .reverse()[0];
        
        if (lastDate) {
          const next = { current: streak, lastDate };
          persistGlobalStreak(next);
          setGlobalStreak(next);
          console.log('[BMO] Initialized global streak from history:', next);
        }
      }
    }
  }, []);

  const addSession = useCallback((session: Session) => {
    setSessions(prev => {
      const next = [...prev, session];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      
      // Also backup to Chrome storage
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        try {
          chrome.storage.local.set({ [STORAGE_KEY]: next });
        } catch (e) {
          console.warn('[BMO] Chrome storage backup failed');
        }
      }
      
      return next;
    });
  }, []);

  const incrementGlobalStreakIfFirstPomoOfDay = useCallback((today: string) => {
    setGlobalStreak(prev => {
      // Only increment if it's a new day
      if (prev.lastDate !== today) {
        const next = { current: (prev.current ?? 0) + 1, lastDate: today };
        persistGlobalStreak(next);
        console.log('[BMO] Global streak incremented to', next.current);
        return next;
      }
      return prev;
    });
  }, []);

  const clearAllSessions = useCallback(() => {
    setSessions([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    
    // Also sync to Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      try {
        chrome.storage.local.set({ [STORAGE_KEY]: [] });
      } catch (e) {
        console.warn('[BMO] Chrome storage clear failed');
      }
    }
  }, []);

  return { sessions, addSession, clearAllSessions, globalStreak, incrementGlobalStreakIfFirstPomoOfDay };
}
