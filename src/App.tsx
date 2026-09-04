import React, { useEffect } from 'react';
import { useApp } from './state/AppContext';
import { useTimer } from './state/TimerContext';
import { useNav, Tab } from './state/nav';
import { Onboarding } from './views/Onboarding';
import { Home } from './views/Home';
import { Reports } from './views/Reports';
import { Projects } from './views/Projects';
import { Settings } from './views/Settings';
import { TimerView } from './views/TimerView';
import { Complete } from './views/Complete';
import { notify, hasNotificationPermission } from './lib/sys';

const TABS: { key: Tab; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'reports', label: 'Reports' },
  { key: 'projects', label: 'Projects' },
  { key: 'settings', label: 'Settings' },
];

function msUntil(hour: number, minute: number): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

export default function App() {
  const { hasOnboarded, settings } = useApp();
  const timer = useTimer();
  const nav = useNav();

  // auto-open the completion screen when a session finishes anywhere
  useEffect(() => {
    if (timer.lastCompleted) nav.openComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.lastCompleted]);

  // daily reminder (works while the tab is open)
  useEffect(() => {
    if (!hasOnboarded || !settings.reminderEnabled) return;
    let id = 0;
    const arm = () => {
      id = window.setTimeout(() => {
        if (hasNotificationPermission()) {
          notify('Peak Hours', 'A reminder to run a focus session today.');
        }
        arm();
      }, msUntil(settings.reminderHour, settings.reminderMinute));
    };
    arm();
    return () => clearTimeout(id);
  }, [hasOnboarded, settings.reminderEnabled, settings.reminderHour, settings.reminderMinute]);

  if (!hasOnboarded) {
    return (
      <div className="min-h-full bg-bg">
        <Onboarding />
      </div>
    );
  }

  const view =
    nav.tab === 'home' ? (
      <Home />
    ) : nav.tab === 'reports' ? (
      <Reports />
    ) : nav.tab === 'projects' ? (
      <Projects />
    ) : (
      <Settings />
    );

  return (
    <div className="min-h-full bg-bg">
      <main className="mx-auto w-full max-w-md px-5 pb-24 pt-6">{view}</main>

      <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 border-t border-line bg-bg2 px-2">
        {TABS.map((t) => {
          const active = nav.tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => nav.setTab(t.key)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-[1px] transition ${
                active ? 'text-amber' : 'text-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      {nav.overlay === 'timer' && <TimerView />}
      {nav.overlay === 'complete' && <Complete />}
    </div>
  );
}
