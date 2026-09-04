import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { CATEGORY_COLORS } from '../lib/store';
import { Button, inputCls, Option } from '../components/ui';
import { requestNotifications } from '../lib/sys';

type Step = 'intro' | 'how' | 'setup';

export function Onboarding() {
  const { categories, addCategory, completeOnboarding, markAskedNotifications } = useApp();
  const [step, setStep] = useState<Step>('intro');
  const [names, setNames] = useState<string[]>([]);
  const [draft, setDraft] = useState('');

  const offset = categories.length;

  function addDraft() {
    const t = draft.trim();
    if (!t) return;
    if (names.some((n) => n.toLowerCase() === t.toLowerCase())) return;
    setNames((prev) => [...prev, t]);
    setDraft('');
  }

  function finish() {
    for (const n of names) addCategory(n);
    requestNotifications();
    markAskedNotifications();
    completeOnboarding();
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 py-10">
      {step === 'intro' && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 h-32 w-32 rounded-lg border border-line bg-surface p-5">
            <div className="flex h-full items-center justify-center font-mono text-3xl font-bold text-amber">
              25:00
            </div>
          </div>
          <h1 className="font-display text-5xl font-bold text-amber">Peak Hours</h1>
          <p className="mt-3 max-w-xs text-sm text-muted">
            A focus timer that shows you where your minutes actually went.
          </p>
          <div className="mt-10 flex w-full flex-col gap-3">
            <Button label="Get started" onClick={() => setStep('how')} />
            <Button label="Skip the tour" variant="secondary" onClick={() => setStep('setup')} />
          </div>
        </div>
      )}

      {step === 'how' && (
        <div>
          <h2 className="font-display text-2xl font-bold">Three things to love</h2>
          <div className="mt-6 flex flex-col gap-4">
            {[
              ['◎', 'Set a session', 'Pick a project and a length — that is all it takes to start.'],
              ['▤', 'See where time goes', 'Sessions stack into reports for today, the week, and all time.'],
              ['↻', 'Rerun in one tap', 'Repeat your last focus session instantly.'],
            ].map(([ico, t, d]) => (
              <div key={t} className="flex gap-4 rounded-lg border border-line bg-surface p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded border border-line text-amber">
                  {ico}
                </div>
                <div>
                  <div className="font-bold">{t}</div>
                  <div className="text-sm text-muted">{d}</div>
                </div>
              </div>
            ))}
          </div>
          <Button label="Set up my projects" onClick={() => setStep('setup')} className="mt-8" />
        </div>
      )}

      {step === 'setup' && (
        <div>
          <h2 className="font-display text-2xl font-bold">Add your projects</h2>
          <p className="mt-1 text-sm text-muted">
            These are the things you will run focus sessions against.
          </p>
          <div className="mt-6 flex gap-2">
            <input
              className={inputCls}
              placeholder="e.g. Deep work"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addDraft()}
            />
            <Button label="Add" onClick={addDraft} className="shrink-0 px-4" />
          </div>
          <div className="mt-5 flex flex-col gap-2">
            {names.map((name, i) => (
              <div
                key={name}
                className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-3"
              >
                <span
                  className="h-3 w-3"
                  style={{
                    backgroundColor: CATEGORY_COLORS[(offset + i) % CATEGORY_COLORS.length],
                  }}
                />
                <span className="flex-1">{name}</span>
                <button
                  onClick={() => setNames(names.filter((_, idx) => idx !== i))}
                  className="text-muted hover:text-bad2"
                >
                  remove
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted">
            {names.length === 0
              ? 'Add at least one project to continue.'
              : `${names.length} project${names.length === 1 ? '' : 's'} ready`}
          </div>
          <Button
            label="Start focusing"
            onClick={finish}
            disabled={names.length === 0}
            className="mt-6"
          />
        </div>
      )}
    </div>
  );
}
