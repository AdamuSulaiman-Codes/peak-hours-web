import React, { useEffect } from 'react';
import { useTimer } from '../state/TimerContext';
import { useApp } from '../state/AppContext';
import { useNav } from '../state/nav';
import { Button } from '../components/ui';
import { startSustainedVibrate, stopSustainedVibrate } from '../lib/sys';

export function Complete() {
  const { lastCompleted, clearLastCompleted, start } = useTimer();
  const { settings } = useApp();
  const nav = useNav();

  useEffect(() => {
    if (!lastCompleted) {
      nav.closeOverlay();
      return;
    }
    if (settings.vibrateOnComplete) {
      startSustainedVibrate();
      return () => stopSustainedVibrate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCompleted]);

  if (!lastCompleted) return null;
  const meta = lastCompleted;

  function leave() {
    stopSustainedVibrate();
    clearLastCompleted();
    nav.closeOverlay();
  }

  async function another() {
    stopSustainedVibrate();
    await start({
      categoryId: meta.categoryId,
      categoryName: meta.categoryName,
      categoryColor: meta.categoryColor,
      durationMinutes: meta.durationMinutes,
    });
    clearLastCompleted();
    nav.openTimer();
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg px-5 py-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ok text-4xl text-bg">
          ✓
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">Session complete</h1>
        <p className="mt-2">
          {meta.durationMinutes} min · {meta.categoryName}
        </p>
        <p className="mt-1 text-sm text-muted">Logged to Reports.</p>
      </div>
      <div className="flex flex-col gap-3">
        <Button label={`Start another ${meta.durationMinutes} min`} onClick={another} />
        <Button label="Done" variant="secondary" onClick={leave} />
      </div>
    </div>
  );
}
