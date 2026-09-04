import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActiveTimer } from '../types';
import { useApp } from './AppContext';
import { uuid } from '../lib/time';
import {
  hasNotificationPermission,
  notify,
  playChime,
  playTick,
} from '../lib/sys';

type StartParams = {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  durationMinutes: number;
};

export type CompletedMeta = {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  durationMinutes: number;
};

type TimerContextValue = {
  timer: ActiveTimer | null;
  remainingMs: number;
  isRunning: boolean;
  isPaused: boolean;
  lastCompleted: CompletedMeta | null;
  clearLastCompleted: () => void;
  start: (params: StartParams) => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  cancel: () => void;
};

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { activeTimer, addSession, settings, setActiveTimer, setLastSession } =
    useApp();
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [lastCompleted, setLastCompleted] = useState<CompletedMeta | null>(
    null,
  );
  const timerRef = useRef<ActiveTimer | null>(activeTimer);
  timerRef.current = activeTimer;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const lastTickSecondRef = useRef<number | null>(null);
  const finalizingRef = useRef(false);

  const persist = useCallback(
    (next: ActiveTimer | null) => {
      if (!next || next.status !== 'running') {
        lastTickSecondRef.current = null;
      }
      setActiveTimer(next);
    },
    [setActiveTimer],
  );

  const finalize = useCallback(
    async (t: ActiveTimer) => {
      if (finalizingRef.current) return;
      finalizingRef.current = true;
      try {
        const now = Date.now();
        const completionMs =
          t.status === 'running' ? Math.min(t.endTimestamp, now) : now;
        addSession({
          id: uuid(),
          categoryId: t.categoryId,
          durationMinutes: t.durationMinutes,
          startedAt: t.startedAt,
          completedAt: new Date(completionMs).toISOString(),
        });
        setLastCompleted({
          categoryId: t.categoryId,
          categoryName: t.categoryName,
          categoryColor: t.categoryColor,
          durationMinutes: t.durationMinutes,
        });
        persist(null);
        if (settingsRef.current.completionChime) playChime();
        if (settingsRef.current.notifications && hasNotificationPermission()) {
          notify(
            'Peak Hours',
            `${t.categoryName}: ${t.durationMinutes}-min session complete`,
          );
        }
      } finally {
        finalizingRef.current = false;
      }
    },
    [addSession, persist],
  );

  // recover sessions that finished while the page was closed
  useEffect(() => {
    const t = activeTimer;
    if (t && t.status === 'running' && t.endTimestamp <= Date.now()) {
      void finalize(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running') return;
    const id = window.setInterval(() => {
      const now = Date.now();
      const t = timerRef.current;
      if (t && t.status === 'running') {
        if (now >= t.endTimestamp) {
          void finalize(t);
          return;
        }
        if (
          settingsRef.current.tickSound &&
          document.visibilityState === 'visible'
        ) {
          const seconds = Math.floor((t.endTimestamp - now) / 1000);
          if (
            lastTickSecondRef.current !== null &&
            seconds < lastTickSecondRef.current
          ) {
            playTick();
          }
          lastTickSecondRef.current = seconds;
        }
      }
      setNowTs(now);
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTimer]);

  // re-sync when the tab becomes visible again (throttled timers while hidden)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        const t = timerRef.current;
        if (t && t.status === 'running' && Date.now() >= t.endTimestamp) {
          void finalize(t);
        }
        setNowTs(Date.now());
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [finalize]);

  const start = useCallback(
    async (params: StartParams) => {
      const endTimestamp = Date.now() + params.durationMinutes * 60 * 1000;
      const timer: ActiveTimer = {
        status: 'running',
        durationMinutes: params.durationMinutes,
        categoryId: params.categoryId,
        categoryName: params.categoryName,
        categoryColor: params.categoryColor,
        startedAt: new Date().toISOString(),
        endTimestamp,
        remainingMs: params.durationMinutes * 60 * 1000,
      };
      setLastCompleted(null);
      persist(timer);
      setLastSession({
        categoryId: params.categoryId,
        durationMinutes: params.durationMinutes,
      });
    },
    [persist, setLastSession],
  );

  const pause = useCallback(() => {
    const t = timerRef.current;
    if (!t || t.status !== 'running') return;
    persist({
      ...t,
      status: 'paused',
      remainingMs: Math.max(0, t.endTimestamp - Date.now()),
    });
  }, [persist]);

  const resume = useCallback(async () => {
    const t = timerRef.current;
    if (!t || t.status !== 'paused') return;
    persist({
      ...t,
      status: 'running',
      endTimestamp: Date.now() + t.remainingMs,
    });
  }, [persist]);

  const cancel = useCallback(() => {
    persist(null);
  }, [persist]);

  const clearLastCompleted = useCallback(() => setLastCompleted(null), []);

  const isRunning = activeTimer !== null && activeTimer.status === 'running';
  const isPaused = activeTimer !== null && activeTimer.status === 'paused';

  const remainingMs = useMemo(() => {
    if (!activeTimer) return 0;
    if (activeTimer.status === 'paused') return activeTimer.remainingMs;
    return Math.max(0, activeTimer.endTimestamp - nowTs);
  }, [activeTimer, nowTs]);

  const value = useMemo<TimerContextValue>(
    () => ({
      timer: activeTimer,
      remainingMs,
      isRunning,
      isPaused,
      lastCompleted,
      clearLastCompleted,
      start,
      pause,
      resume,
      cancel,
    }),
    [
      activeTimer,
      remainingMs,
      isRunning,
      isPaused,
      lastCompleted,
      clearLastCompleted,
      start,
      pause,
      resume,
      cancel,
    ],
  );

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}

export function useTimer(): TimerContextValue {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
}
