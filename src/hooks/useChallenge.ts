import { useState, useCallback, useMemo } from 'react';
import { Challenge } from '../types';
import { todayStr } from '../utils/date';

const KEY = 'bmo_challenges';

function load(): Challenge[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Challenge[]) : [];
  } catch { return []; }
}

function persist(challenges: Challenge[]) {
  localStorage.setItem(KEY, JSON.stringify(challenges));
}

export function useChallenge() {
  const [challenges, setChallenges] = useState<Challenge[]>(load);

  const activeChallenge = useMemo(
    () => challenges.find(c => c.date === todayStr() && !c.completed && !c.abandoned) ?? null,
    [challenges],
  );

  const todayCompleted = useMemo(
    () => challenges.find(c => c.date === todayStr() && c.completed) ?? null,
    [challenges],
  );

  const completedCount = useMemo(
    () => challenges.filter(c => c.completed).length,
    [challenges],
  );

  const createChallenge = useCallback((goalMinutes: number, focusDuration: number) => {
    const dayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const pomodorosNeeded = Math.max(1, Math.ceil(goalMinutes / focusDuration));
    const c: Challenge = {
      id: crypto.randomUUID(),
      date: todayStr(),
      dayLabel,
      goalMinutes,
      pomodorosNeeded,
      pomodorosCompleted: 0,
      focusMinutesLogged: 0,
      completed: false,
    };
    setChallenges(prev => {
      const next = [...prev, c];
      persist(next);
      return next;
    });
  }, []);

  const logPomodoro = useCallback((focusDurationMinutes: number) => {
    setChallenges(prev => {
      const idx = prev.findIndex(c => c.date === todayStr() && !c.completed && !c.abandoned);
      if (idx === -1) return prev;
      const c = prev[idx];
      const newCount = c.pomodorosCompleted + 1;
      const newMinutes = c.focusMinutesLogged + focusDurationMinutes;
      const isDone = newCount >= c.pomodorosNeeded;
      const next = [...prev];
      next[idx] = {
        ...c,
        pomodorosCompleted: newCount,
        focusMinutesLogged: newMinutes,
        completed: isDone,
        completedAt: isDone ? new Date().toISOString() : undefined,
      };
      persist(next);
      return next;
    });
  }, []);

  const abandonChallenge = useCallback(() => {
    setChallenges(prev => {
      const idx = prev.findIndex(c => c.date === todayStr() && !c.completed && !c.abandoned);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], abandoned: true };
      persist(next);
      return next;
    });
  }, []);

  const clearAllChallenges = useCallback(() => {
    setChallenges([]);
    localStorage.removeItem(KEY);
  }, []);

  return {
    challenges,
    activeChallenge,
    todayCompleted,
    completedCount,
    createChallenge,
    logPomodoro,
    abandonChallenge,
    clearAllChallenges,
  };
}
