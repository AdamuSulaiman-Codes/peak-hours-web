import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  ActiveTimer,
  Category,
  LastSession,
  Session,
  Settings,
} from '../types';
import {
  CATEGORY_COLORS,
  DEFAULT_SETTINGS,
  loadAll,
  loadSettings,
  saveActiveTimer,
  saveAskedNotifications,
  saveCategories,
  saveLastSession,
  saveOnboarded,
  saveSessions,
  saveSettings,
} from '../lib/store';
import { uuid } from '../lib/time';

type AppContextValue = {
  categories: Category[];
  sessions: Session[];
  activeTimer: ActiveTimer | null;
  hasOnboarded: boolean;
  lastSession: LastSession | null;
  settings: Settings;
  activeCategories: Category[];
  allCategories: Category[];
  getCategory: (id: string) => Category | undefined;
  addCategory: (name: string) => Category;
  renameCategory: (id: string, name: string) => void;
  setArchived: (id: string, archived: boolean) => void;
  addSession: (session: Session) => void;
  completeOnboarding: () => void;
  setActiveTimer: (timer: ActiveTimer | null) => void;
  setLastSession: (last: LastSession | null) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  markAskedNotifications: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(loadAll, []);
  const [categories, setCategories] = useState<Category[]>(initial.categories);
  const [sessions, setSessions] = useState<Session[]>(initial.sessions);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(
    initial.activeTimer,
  );
  const [hasOnboarded, setHasOnboarded] = useState(initial.hasOnboarded);
  const [lastSession, setLastSession] = useState<LastSession | null>(
    initial.lastSession,
  );
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const addCategory = useCallback((name: string) => {
    const trimmed = name.trim();
    const category: Category = {
      id: uuid(),
      name: trimmed,
      color: CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
      createdAt: new Date().toISOString(),
      archived: false,
    };
    setCategories((prev) => {
      const next = [...prev, category];
      saveCategories(next);
      return next;
    });
    return category;
  }, [categories.length]);

  const renameCategory = useCallback((id: string, name: string) => {
    setCategories((prev) => {
      const next = prev.map((c) =>
        c.id === id ? { ...c, name: name.trim() } : c,
      );
      saveCategories(next);
      return next;
    });
  }, []);

  const setArchived = useCallback((id: string, archived: boolean) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, archived } : c));
      saveCategories(next);
      return next;
    });
  }, []);

  const addSession = useCallback((session: Session) => {
    setSessions((prev) => {
      const next = [...prev, session];
      saveSessions(next);
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasOnboarded(true);
    saveOnboarded(true);
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const markAskedNotifications = useCallback(() => {
    saveAskedNotifications(true);
  }, []);

  const storeActiveTimer = useCallback((timer: ActiveTimer | null) => {
    setActiveTimer(timer);
    saveActiveTimer(timer);
  }, []);

  const storeLastSession = useCallback((last: LastSession | null) => {
    setLastSession(last);
    saveLastSession(last);
  }, []);

  const getCategory = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories],
  );

  const activeCategories = useMemo(
    () =>
      categories
        .filter((c) => !c.archived)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [categories],
  );

  const allCategories = useMemo(
    () =>
      categories
        .slice()
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [categories],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      categories,
      sessions,
      activeTimer,
      hasOnboarded,
      lastSession,
      settings,
      activeCategories,
      allCategories,
      getCategory,
      addCategory,
      renameCategory,
      setArchived,
      addSession,
      completeOnboarding,
      setActiveTimer: storeActiveTimer,
      setLastSession: storeLastSession,
      updateSettings,
      markAskedNotifications,
    }),
    [
      categories,
      sessions,
      activeTimer,
      hasOnboarded,
      lastSession,
      settings,
      activeCategories,
      allCategories,
      getCategory,
      addCategory,
      renameCategory,
      setArchived,
      addSession,
      completeOnboarding,
      storeActiveTimer,
      storeLastSession,
      updateSettings,
      markAskedNotifications,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useSettings(): Settings {
  return useApp().settings;
}

export function useCategories(): Category[] {
  return useApp().activeCategories;
}
