import { useState, useCallback } from 'react';
import { Session } from '../types';

const STORAGE_KEY = 'bmo_sessions';

function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

function toDateStr(date: Date): string {
  // Use local date to avoid UTC-offset mismatches
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ── Derived stat helpers ──────────────────────────────────────────────────────

export interface TodayStats {
  pomodoros: number;
  focusMinutes: number;
  tasksTouched: number;
}

export interface WeekStats {
  totalPomodoros: number;
  avgPerDay: number;
  bestDay: number;
}

export function computeTodayStats(sessions: Session[]): TodayStats {
  const today = toDateStr(new Date());
  const todaySessions = sessions.filter(s => s.completed && s.date === today);
  return {
    pomodoros: todaySessions.length,
    focusMinutes: todaySessions.reduce((sum, s) => sum + s.duration, 0),
    tasksTouched: new Set(todaySessions.map(s => s.taskId).filter(Boolean)).size,
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
  sessions
    .filter(s => s.completed && countsByDay[s.date] !== undefined)
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
    const count = sessions.filter(s => s.completed && s.date === date).length;
    return { date, label, count };
  });
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>(loadSessions);

  const addSession = useCallback((session: Session) => {
    setSessions(prev => {
      const next = [...prev, session];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAllSessions = useCallback(() => {
    setSessions([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }, []);

  return { sessions, addSession, clearAllSessions };
}
