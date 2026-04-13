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
    const parsed = JSON.parse(raw) as any[];
    let needsSave = false;
    const resettedTaskIds: string[] = [];
    
    const result = parsed.map(t => {
      const task = migrateTask(t);
      
      // Check if task needs reset: has pomodoros from a previous day
      // Use lastCompletedDate if available, fallback to createdAt for old tasks
      const taskDateStr = task.lastCompletedDate || (task.createdAt ? task.createdAt.split('T')[0] : null);
      const needsReset = taskDateStr && taskDateStr !== today && task.completedPomodoros > 0;
      
      if (needsReset) {
        needsSave = true;
        resettedTaskIds.push(task.id);
        if (task.repeatDaily) {
          // Check if streak should break: if task wasn't completed yesterday
          const streakBroken = task.lastCompletedDate !== yesterday;
          
          return {
            ...task,
            completed: false,
            completedPomodoros: 0,
            sessionInCurrentRound: 0,
            lastCompletedDate: undefined,
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
      
      // For repeatDaily tasks: also check if streak should break (even with 0 pomodoros)
      if (task.repeatDaily && task.completedPomodoros === 0 && taskDateStr && taskDateStr !== today) {
        // Use same fallback logic as above: lastCompletedDate or createdAt date
        if (taskDateStr !== yesterday) {
          needsSave = true;
          return {
            ...task,
            dailyStreak: 0,
          };
        }
      }
      
      return task;
    });
    
    // IMPORTANT: Save the reset data back to localStorage immediately
    if (needsSave) {
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
        sessionInCurrentRound: 0,
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
          const newSessionInRound = newCompleted % (t.settings.sessionsPerRound ?? 4);
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
          return {
            ...t,
            completedPomodoros: newCompleted,
            totalFocusMinutes: t.totalFocusMinutes + duration,
            completed: true,
            lastCompletedDate: today,
            dailyStreak: t.repeatDaily ? (t.dailyStreak ?? 0) + 1 : (t.dailyStreak ?? 0),
            sessionInCurrentRound: 0,
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
