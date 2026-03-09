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
  return {
    id: t.id ?? crypto.randomUUID(),
    title: t.title ?? t.text ?? '',
    completed: t.completed ?? false,
    createdAt:
      t.createdAt
        ? typeof t.createdAt === 'number'
          ? new Date(t.createdAt).toISOString()
          : t.createdAt
        : new Date().toISOString(),
    completedPomodoros: t.completedPomodoros ?? t.sessionsCompleted ?? 0,
    totalFocusMinutes: t.totalFocusMinutes ?? 0,
    settings: t.settings ?? DEFAULT_TASK_SETTINGS,
    dueDate: t.dueDate,
    pinned: t.pinned ?? false,
    repeatDaily: t.repeatDaily ?? false,
    lastCompletedDate: t.lastCompletedDate,
    dailyStreak: t.dailyStreak ?? 0,
  };
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateStr(d);
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const today = todayStr();
    const yesterday = yesterdayStr();
    return (JSON.parse(raw) as any[]).map(t => {
      const task = migrateTask(t);
      // Auto-reset daily repeat missions that were completed before today
      if (task.repeatDaily && task.completed && task.lastCompletedDate !== today) {
        // Streak breaks if the user missed yesterday entirely
        const streakBroken = task.lastCompletedDate !== yesterday;
        return {
          ...task,
          completed: false,
          completedPomodoros: 0,
          dailyStreak: streakBroken ? 0 : task.dailyStreak,
        };
      }
      return task;
    });
  } catch {
    return [];
  }
}

function persist(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  const save = useCallback((next: Task[]) => {
    setTasks(next);
    persist(next);
  }, []);

  const addTask = useCallback(
    (title: string, settings: TaskSettings = DEFAULT_TASK_SETTINGS, dueDate?: string, pinned?: boolean, repeatDaily?: boolean) => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
        completedPomodoros: 0,
        totalFocusMinutes: 0,
        settings,
        dueDate,
        pinned: pinned ?? false,
        repeatDaily: repeatDaily ?? false,
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
      save(
        tasks.map(t =>
          t.id === id
            ? {
                ...t,
                completedPomodoros: t.completedPomodoros + 1,
                totalFocusMinutes: t.totalFocusMinutes + duration,
              }
            : t,
        ),
      );
    },
    [tasks, save],
  );

  /** Called when the final pomodoro of the round completes — increments AND marks done atomically */
  const completeRound = useCallback(
    (id: string, duration: number) => {
      const today = todayStr();
      save(
        tasks.map(t =>
          t.id === id
            ? {
                ...t,
                completedPomodoros: t.completedPomodoros + 1,
                totalFocusMinutes: t.totalFocusMinutes + duration,
                completed: true,
                lastCompletedDate: today,
                dailyStreak: t.repeatDaily ? (t.dailyStreak ?? 0) + 1 : (t.dailyStreak ?? 0),
              }
            : t,
        ),
      );
    },
    [tasks, save],
  );

  const clearAllTasks = useCallback(() => {
    save([]);
  }, [save]);

  return { tasks, addTask, updateTask, toggleTask, deleteTask, incrementPomodoro, completeRound, clearAllTasks };
}
