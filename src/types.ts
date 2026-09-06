export type Category = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  archived: boolean;
};

export type Session = {
  id: string;
  categoryId: string;
  durationMinutes: number;
  startedAt: string;
  completedAt: string;
};

export type ActiveTimer = {
  status: 'running' | 'paused';
  durationMinutes: number;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  startedAt: string;
  endTimestamp: number;
  remainingMs: number;
};

export type LastSession = { categoryId: string; durationMinutes: number };

export type Settings = {
  completionChime: boolean;
  tickSound: boolean;
  vibrateOnComplete: boolean;
  notifications: boolean;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
};

export type RangeKey = 'today' | 'week' | 'month' | 'all';
