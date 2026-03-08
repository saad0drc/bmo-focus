// Canonical data model. All components and hooks import from here.

export interface TaskSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsPerRound: number;
}

export interface Task {
  id: string;
  title: string;
  completedPomodoros: number;
  totalFocusMinutes: number;
  createdAt: string; // ISO string
  completed: boolean;
  settings: TaskSettings;
  dueDate?: string;
  pinned?: boolean;
  repeatDaily?: boolean;
  lastCompletedDate?: string; // YYYY-MM-DD, used to auto-reset daily tasks
  dailyStreak?: number;       // consecutive days this mission has been completed
}

export interface Session {
  id: string;
  taskId: string | null;
  duration: number; // minutes
  completed: boolean;
  date: string; // YYYY-MM-DD
}
