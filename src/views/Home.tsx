import React, { useEffect, useState } from 'react';
import { useApp } from '../state/AppContext';
import { useTimer } from '../state/TimerContext';
import { useNav } from '../state/nav';
import { Button, Chip, inputCls, Option } from '../components/ui';
import { computeStreak } from '../lib/streak';
import { formatClock, formatTotalMinutes } from '../lib/time';
import { useMemo } from 'react';

const DURATIONS = [15, 20, 25, 30, 45, 60];

export function Home() {
  const { activeCategories, addCategory, sessions, lastSession } = useApp();
  const timer = useTimer();
  const nav = useNav();
  const [preset, setPreset] = useState(25);
  const [custom, setCustom] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const streak = useMemo(() => computeStreak(sessions), [sessions]);

  const customVal = custom.trim() ? parseInt(custom, 10) : NaN;
  const minutes = Number.isNaN(customVal) ? preset : Math.min(1440, Math.max(1, customVal));
  const category = activeCategories.find((c) => c.id === selectedId) ?? activeCategories[0] ?? null;
  const repeatCategory =
    lastSession && !timer.timer
      ? activeCategories.find((c) => c.id === lastSession.categoryId) ?? null
      : null;

  function addNow() {
    const t = draft.trim();
    if (!t) return;
    if (activeCategories.some((c) => c.name.toLowerCase() === t.toLowerCase())) {
      setDraft('');
      return;
    }
    const created = addCategory(t);
    setSelectedId(created.id);
    setDraft('');
    setAdding(false);
  }

  async function run(durationMinutes: number, cat: NonNullable<typeof category>) {
    if (timer.timer) return;
    await timer.start({
      categoryId: cat.id,
      categoryName: cat.name,
      categoryColor: cat.color,
      durationMinutes,
    });
    nav.openTimer();
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Start a session</h1>
        <p className="text-sm text-muted">Pick a length and what you're working on.</p>
      </header>

      <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded border border-line bg-surface2 font-mono text-amber">
          {streak.current}
        </div>
        <div>
          <div className="font-semibold">
            {streak.current > 0 ? `${streak.current}-day streak` : 'No streak yet'}
          </div>
          <div className="text-sm text-muted">
            {streak.best > 0
              ? `Best: ${streak.best} day${streak.best === 1 ? '' : 's'} in a row`
              : 'Run a session today to start one.'}
          </div>
        </div>
      </div>

      {timer.timer ? (
        <div className="flex items-center gap-3 rounded-lg border border-amber bg-surface p-3">
          <span className="h-3 w-3 shrink-0" style={{ backgroundColor: timer.timer.categoryColor }} />
          <div className="flex-1">
            <div className="font-semibold">{timer.timer.categoryName}</div>
            <div className="text-sm text-muted">
              {timer.isPaused ? 'Paused' : 'Running'} ·{' '}
              {formatTotalMinutes(timer.timer.durationMinutes)} · {formatClock(timer.remainingMs)}
            </div>
          </div>
          <Button label="Open" variant="secondary" onClick={nav.openTimer} className="min-h-[40px] px-4" />
        </div>
      ) : null}

      {repeatCategory && lastSession ? (
        <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3">
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-[1.2px] text-amber">
              Quick start
            </div>
            <div className="font-semibold">
              {lastSession.durationMinutes} min · {repeatCategory.name}
            </div>
          </div>
          <Button
            label="Start again"
            onClick={() => run(lastSession.durationMinutes, repeatCategory)}
            className="min-h-[40px] px-4"
          />
        </div>
      ) : null}

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold">Length</h2>
          <span className="text-xs text-muted">{minutes} minutes</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <Chip
              key={d}
              label={`${d} min`}
              selected={!custom.trim() && preset === d}
              onClick={() => {
                setPreset(d);
                setCustom('');
              }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm text-muted">Custom</span>
          <input
            inputMode="numeric"
            className={`${inputCls} w-28 text-center`}
            placeholder="minutes"
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold">Project</h2>
          <span className="text-xs text-muted">{activeCategories.length} active</span>
        </div>
        <div className="flex flex-col gap-2">
          {activeCategories.map((c) => (
            <Option
              key={c.id}
              name={c.name}
              color={c.color}
              selected={category?.id === c.id}
              onClick={() => setSelectedId(c.id)}
            />
          ))}
        </div>
        {adding && (
          <div className="mt-3 flex gap-2">
            <input
              className={inputCls}
              placeholder="Project name"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNow()}
            />
            <Button label="Add" onClick={addNow} className="shrink-0 px-4" />
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => {
                setAdding(false);
                setDraft('');
              }}
              className="shrink-0 px-4"
            />
          </div>
        )}
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="mt-3 w-fit rounded border border-amber px-3 py-2 text-sm font-semibold hover:bg-surface"
          >
            + New project
          </button>
        )}
      </section>

      <Button
        label={timer.timer ? 'Finish current session first' : `Start ${minutes} min`}
        onClick={() => category && run(minutes, category)}
        disabled={!category || !!timer.timer}
        className="mt-2"
      />
    </div>
  );
}
