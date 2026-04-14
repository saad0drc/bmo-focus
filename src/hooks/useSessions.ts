import { useState, useCallback } from 'react';
import { Session } from '../types';
import { toDateStr, todayStr } from '../utils/date';

const STORAGE_KEY = 'bmo_sessions';

function loadSessions(): Session[] {
  try {
    // Try localStorage first (primary storage)
    let raw = localStorage.getItem(STORAGE_KEY);
    
    // If empty, try Chrome storage backup
    if (!raw && typeof chrome !== 'undefined' && chrome.storage?.local) {
      try {
        const result = chrome.storage.local.get(STORAGE_KEY);
        if (result && result[STORAGE_KEY]) {
          raw = JSON.stringify(result[STORAGE_KEY]);
          // Restore to localStorage
          localStorage.setItem(STORAGE_KEY, raw);
          console.log('[BMO] Recovered sessions from Chrome storage backup');
        }
      } catch (e) {
        console.warn('[BMO] Chrome storage backup unavailable');
      }
    }
    
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
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
    sessions.filter(s => s.completed).map(s => s.date),
  );
  let streak = 0;
  const today = new Date();
  // Start from today (i=0) to include today's sessions in the streak count
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
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

  const clearAllSessions = useCallback(() => {
    setSessions([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }, []);

  return { sessions, addSession, clearAllSessions };
}
