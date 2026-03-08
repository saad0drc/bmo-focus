import { useState, useCallback } from 'react';
import { Task, TaskSettings } from '../types';

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
  };
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as any[]).map(migrateTask);
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
    (title: string, settings: TaskSettings = DEFAULT_TASK_SETTINGS, dueDate?: string) => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
        completedPomodoros: 0,
        totalFocusMinutes: 0,
        settings,
        dueDate,
      };
      save([...tasks, newTask]);
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
      save(tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
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
      save(
        tasks.map(t =>
          t.id === id
            ? {
                ...t,
                completedPomodoros: t.completedPomodoros + 1,
                totalFocusMinutes: t.totalFocusMinutes + duration,
                completed: true,
              }
            : t,
        ),
      );
    },
    [tasks, save],
  );

  return { tasks, addTask, updateTask, toggleTask, deleteTask, incrementPomodoro, completeRound };
}
