import {
  ActiveTimer,
  Category,
  LastSession,
  Session,
  Settings,
} from '../types';

export const CATEGORY_COLORS = [
  '#FFB000',
  '#FF6B57',
  '#4FB7A8',
  '#C792EA',
  '#8BC34A',
  '#5B9BD5',
  '#FF8A65',
  '#FFD54F',
];

const DEFAULTS = {
  categories: [] as Category[],
  sessions: [] as Session[],
  activeTimer: null as ActiveTimer | null,
  hasOnboarded: false,
  lastSession: null as LastSession | null,
  askedNotifications: false,
};

export const DEFAULT_SETTINGS: Settings = {
  completionChime: true,
  tickSound: false,
  vibrateOnComplete: true,
  notifications: true,
  reminderEnabled: false,
  reminderHour: 20,
  reminderMinute: 0,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / private mode
  }
}

function key(name: keyof typeof DEFAULTS) {
  return `peakHours.${name}`;
}

export function loadAll() {
  return {
    categories: read<Category[]>(key('categories'), DEFAULTS.categories),
    sessions: read<Session[]>(key('sessions'), DEFAULTS.sessions),
    activeTimer: read<ActiveTimer | null>(key('activeTimer'), DEFAULTS.activeTimer),
    hasOnboarded: read<boolean>(key('hasOnboarded'), DEFAULTS.hasOnboarded),
    lastSession: read<LastSession | null>(key('lastSession'), DEFAULTS.lastSession),
    askedNotifications: read<boolean>(
      key('askedNotifications'),
      DEFAULTS.askedNotifications,
    ),
  };
}

export function saveCategories(categories: Category[]) {
  write(key('categories'), categories);
}
export function saveSessions(sessions: Session[]) {
  write(key('sessions'), sessions);
}
export function saveActiveTimer(timer: ActiveTimer | null) {
  write(key('activeTimer'), timer);
}
export function saveOnboarded(value: boolean) {
  write(key('hasOnboarded'), value);
}
export function saveLastSession(last: LastSession | null) {
  write(key('lastSession'), last);
}
export function saveAskedNotifications(value: boolean) {
  write(key('askedNotifications'), value);
}

const settingsKey = 'peakHours.settings';
export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(settingsKey, {}) };
}
export function saveSettings(settings: Settings) {
  write(settingsKey, settings);
}
