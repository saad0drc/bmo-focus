import { useState, useCallback } from 'react';
import { Task, TaskSettings } from '../types';
import { toDateStr, todayStr } from '../utils/date';

export type { Task, TaskSettings };

const DEFAULT_TASK_SETTINGS: TaskSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsPerRound: 4,
};

const STORAGE_KEY = 'bmo_tasks';

/** Migrate old task shapes from previous localStorage formats */
function migrateTask(t: any): Task {
  const settings = t.settings ?? DEFAULT_TASK_SETTINGS;
  const completedPomodoros = t.completedPomodoros ?? t.sessionsCompleted ?? 0;
  // Calculate session position in current round based on completed pomodoros
  const sessionInCurrentRound = completedPomodoros % (settings.sessionsPerRound ?? 4);
  
  // Convert createdAt to local YYYY-MM-DD format
  let createdAt: string;
  if (t.createdAt) {
    if (typeof t.createdAt === 'number') {
      createdAt = toDateStr(new Date(t.createdAt));
    } else if (typeof t.createdAt === 'string' && t.createdAt.includes('T')) {
      // ISO format: extract date part
      createdAt = t.createdAt.split('T')[0];
    } else {
      // Already in YYYY-MM-DD format
      createdAt = t.createdAt;
    }
  } else {
    createdAt = todayStr();
  }
  
  return {
    id: t.id ?? crypto.randomUUID(),
    title: t.title ?? t.text ?? '',
    completed: t.completed ?? false,
    createdAt,
    completedPomodoros,
    totalFocusMinutes: t.totalFocusMinutes ?? 0,
    settings,
    dueDate: t.dueDate,
    pinned: t.pinned ?? false,
    repeatDaily: t.repeatDaily ?? false,
    lastCompletedDate: t.lastCompletedDate,
    dailyStreak: t.dailyStreak ?? 0,
    sessionInCurrentRound: t.sessionInCurrentRound ?? sessionInCurrentRound,
    color: t.color,
    allowedDomains: t.allowedDomains ?? [],
  };
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateStr(d);
}

function loadTasks(): Task[] {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    
    // If empty, try Chrome storage backup
    if (!raw && typeof chrome !== 'undefined' && chrome.storage?.local) {
      try {
        const result = chrome.storage.local.get(STORAGE_KEY);
        if (result && result[STORAGE_KEY]) {
          raw = JSON.stringify(result[STORAGE_KEY]);
          // Restore to localStorage
          localStorage.setItem(STORAGE_KEY, raw);
          console.log('[BMO] Recovered tasks from Chrome storage backup');
        }
      } catch (e) {
        console.warn('[BMO] Chrome storage backup unavailable');
      }
    }
    
    if (!raw) return [];
    const today = todayStr();
    const yesterday = yesterdayStr();
    const parsed = JSON.parse(raw) as any[];
    let needsSave = false;
    const resettedTaskIds: string[] = [];
    
    const result = parsed.map(t => {
      const task = migrateTask(t);
      
      // Check if task needs reset: has pomodoros from a previous day
      // Use lastCompletedDate if available, fallback to createdAt for old tasks
      const taskDateStr = task.lastCompletedDate || task.createdAt;
      const needsReset = taskDateStr && taskDateStr !== today && task.completedPomodoros > 0;
      
      if (needsReset) {
        needsSave = true;
        resettedTaskIds.push(task.id);
        if (task.repeatDaily) {
          // Streak breaks ONLY if:
          // 1. Last completion was NOT yesterday, AND
          // 2. We're certain it's been 2+ days (lastCompletedDate is old)
          const lastCompleteDateObj = task.lastCompletedDate ? new Date(task.lastCompletedDate + 'T00:00:00') : null;
          const yesterdayObj = new Date();
          yesterdayObj.setDate(yesterdayObj.getDate() - 1);
          const yesterdayStr = toDateStr(yesterdayObj);
          
          // Only break if it was completed more than 1 day ago
          const streakBroken = task.lastCompletedDate && task.lastCompletedDate !== yesterdayStr;
          
          return {
            ...task,
            completed: false,
            completedPomodoros: 0,
            sessionInCurrentRound: 0,
            // Keep lastCompletedDate - UI only checks completedPomodoros for "today" status
            dailyStreak: streakBroken ? 0 : (task.dailyStreak ?? 0),
          };
        } else {
          return {
            ...task,
            completedPomodoros: 0,
            sessionInCurrentRound: 0,
          };
        }
      }
      
      return task;
    });
    
    // IMPORTANT: Save the reset data back to localStorage immediately
    if (needsSave) {
      const resetCheck = result.map(t => ({ id: t.id, title: t.title, domains: t.allowedDomains }));
      console.log('[BMO] Reset tasks with domains:', resetCheck);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      
      // CRITICAL: Clear active task selection if it was one of the reset tasks
      // This prevents the timer from being "stuck" on yesterday's task
      const activeTaskId = localStorage.getItem('bmo_activeTaskId');
      if (activeTaskId && resettedTaskIds.includes(activeTaskId)) {
        localStorage.removeItem('bmo_activeTaskId');
        console.log(`[BMO] Cleared active task ${activeTaskId} (was reset for new day)`);
      }
    }
    
    return result;
  } catch (err) {
    console.error('[BMO] loadTasks error:', err);
    return [];
  }
}

function persist(tasks: Task[]) {
  const tasksJson = JSON.stringify(tasks);
  localStorage.setItem(STORAGE_KEY, tasksJson);
  
  // Also sync to Chrome storage for background service worker (Allowed World blocker)
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      // Log domains before sync
      const domainsCheck = tasks.map(t => ({ id: t.id, title: t.title, domains: t.allowedDomains }));
      console.log('[BMO] Persisting tasks with domains:', domainsCheck);
      chrome.storage.local.set({ [STORAGE_KEY]: tasksJson });
    } catch (e) {
      console.warn('[BMO] Chrome storage sync failed for tasks');
    }
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  const save = useCallback((next: Task[]) => {
    setTasks(next);
    persist(next);
  }, []);

  const addTask = useCallback(
    (title: string, settings: TaskSettings = DEFAULT_TASK_SETTINGS, dueDate?: string, pinned?: boolean, repeatDaily?: boolean, color?: string, allowedDomains?: string[]) => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: todayStr(),
        completedPomodoros: 0,
        totalFocusMinutes: 0,
        settings,
        dueDate,
        pinned: pinned ?? false,
        repeatDaily: repeatDaily ?? false,
        sessionInCurrentRound: 0,
        color,
        allowedDomains,
      };
      save([newTask, ...tasks]); // prepend — newest missions appear first
    },
    [tasks, save],
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      save(tasks.map(t => (t.id === id ? { ...t, ...updates } : t)));
    },
    [tasks, save],
  );

  const toggleTask = useCallback(
    (id: string) => {
      const today = todayStr();
      save(tasks.map(t => {
        if (t.id !== id) return t;
        const nowCompleted = !t.completed;
        if (!t.repeatDaily) {
          return { ...t, completed: nowCompleted, lastCompletedDate: nowCompleted ? today : t.lastCompletedDate };
        }
        // Daily mission: track streak
        if (nowCompleted) {
          return {
            ...t,
            completed: true,
            lastCompletedDate: today,
            dailyStreak: (t.dailyStreak ?? 0) + 1,
          };
        } else {
          // Un-completing: only roll back streak if it was completed today
          const wasToday = t.lastCompletedDate === today;
          return {
            ...t,
            completed: false,
            dailyStreak: wasToday ? Math.max(0, (t.dailyStreak ?? 1) - 1) : (t.dailyStreak ?? 0),
          };
        }
      }));
    },
    [tasks, save],
  );

  const deleteTask = useCallback(
    (id: string) => {
      save(tasks.filter(t => t.id !== id));
    },
    [tasks, save],
  );

  /** Called when a focus pomodoro completes for this task */
  const incrementPomodoro = useCallback(
    (id: string, duration: number) => {
      const today = todayStr();
      save(
        tasks.map(t => {
          if (t.id !== id) return t;
          const newCompleted = t.completedPomodoros + 1;
          const sessionsPerRound = t.settings.sessionsPerRound ?? 4;
          // sessionInCurrentRound tracks 0-indexed position AFTER this completion
          // Pomo 1 of 4 completes → sessionInCurrentRound = 0 (position of pomo just done)
          // Pomo 2 of 4 completes → sessionInCurrentRound = 1
          // Pomo 3 of 4 completes → sessionInCurrentRound = 2
          // Pomo 4 of 4 completes → sessionInCurrentRound = 3 (triggers long break)
          const newSessionInRound = (newCompleted - 1) % sessionsPerRound;
          return {
            ...t,
            completedPomodoros: newCompleted,
            totalFocusMinutes: t.totalFocusMinutes + duration,
            sessionInCurrentRound: newSessionInRound,
            lastCompletedDate: today,
          };
        }),
      );
    },
    [tasks, save],
  );

  /** Called when the final pomodoro of the round completes — increments AND marks done atomically */
  const completeRound = useCallback(
    (id: string, duration: number) => {
      const today = todayStr();
      save(
        tasks.map(t => {
          if (t.id !== id) return t;
          const newCompleted = t.completedPomodoros + 1;
          const sessionsPerRound = t.settings.sessionsPerRound ?? 4;
          // Keep sessionInCurrentRound at the last session's position (sessionsPerRound - 1)
          // so background knows this was the final session when calculating break type
          const finalSessionInRound = sessionsPerRound - 1;
          return {
            ...t,
            completedPomodoros: newCompleted,
            totalFocusMinutes: t.totalFocusMinutes + duration,
            completed: true,
            lastCompletedDate: today,
            dailyStreak: t.repeatDaily ? (t.dailyStreak ?? 0) + 1 : (t.dailyStreak ?? 0),
            sessionInCurrentRound: finalSessionInRound,
          };
        }),
      );
    },
    [tasks, save],
  );

  const clearAllTasks = useCallback(() => {
    save([]);
  }, [save]);

  return { tasks, addTask, updateTask, toggleTask, deleteTask, incrementPomodoro, completeRound, clearAllTasks };
}
