import React, { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { Button, inputCls, Modal } from '../components/ui';
import { formatTotalMinutes } from '../lib/time';
import { Category } from '../types';

export function Projects() {
  const {
    sessions,
    activeCategories,
    allCategories,
    renameCategory,
    setArchived,
    addCategory,
  } = useApp();
  const archived = useMemo(() => allCategories.filter((c) => c.archived), [allCategories]);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<Category | null>(null);

  function stats(id: string) {
    let m = 0;
    let n = 0;
    for (const s of sessions) {
      if (s.categoryId === id) {
        m += s.durationMinutes;
        n += 1;
      }
    }
    return { m, n };
  }

  function add() {
    const t = name.trim();
    if (!t) return;
    addCategory(t);
    setName('');
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-bold">Projects</h1>
      <div className="flex gap-2">
        <input
          className={inputCls}
          placeholder="New project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <Button label="Add" onClick={add} className="shrink-0 px-4" />
      </div>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-[1.4px] text-muted">Active</h2>
        <div className="flex flex-col gap-2">
          {activeCategories.map((cat) =>
            editing?.id === cat.id ? (
              <div key={cat.id} className="flex gap-2">
                <input
                  className={inputCls}
                  autoFocus
                  value={editing.value}
                  onChange={(e) => setEditing({ id: cat.id, value: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      renameCategory(cat.id, editing.value);
                      setEditing(null);
                    }
                    if (e.key === 'Escape') setEditing(null);
                  }}
                />
                <Button label="Save" onClick={() => {
                  renameCategory(cat.id, editing.value);
                  setEditing(null);
                }} className="shrink-0 px-4" />
              </div>
            ) : (
              <div key={cat.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-3">
                <span className="h-3 w-3 shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="flex-1">
                  <div className="truncate text-[15px] font-medium">{cat.name}</div>
                  <div className="text-xs text-muted">
                    {stats(cat.id).n === 0
                      ? 'No sessions yet'
                      : `${formatTotalMinutes(stats(cat.id).m)} · ${stats(cat.id).n} session${stats(cat.id).n === 1 ? '' : 's'}`}
                  </div>
                </div>
                <button
                  className="rounded border border-line px-2 py-1 text-xs hover:border-amber"
                  onClick={() => setEditing({ id: cat.id, value: cat.name })}
                >
                  rename
                </button>
                <button
                  className="rounded border border-line px-2 py-1 text-xs text-bad2 hover:border-bad2"
                  onClick={() => setConfirmArchive(cat)}
                >
                  archive
                </button>
              </div>
            ),
          )}
        </div>
      </section>

      {archived.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-[1.4px] text-muted">Archived</h2>
          <div className="flex flex-col gap-2">
            {archived.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-3 opacity-60">
                <span className="h-3 w-3 shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="flex-1">
                  <div className="truncate text-[15px] line-through">{cat.name}</div>
                  <div className="text-xs text-muted">History kept in Reports</div>
                </div>
                <button
                  className="rounded border border-line px-2 py-1 text-xs hover:border-amber"
                  onClick={() => setArchived(cat.id, false)}
                >
                  restore
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <Modal
        open={confirmArchive !== null}
        title={confirmArchive ? `Archive "${confirmArchive.name}"?` : ''}
        message="The project is hidden from new sessions. Past sessions stay in your reports."
        onClose={() => setConfirmArchive(null)}
        actions={[
          { label: 'Keep', variant: 'secondary', onClick: () => setConfirmArchive(null) },
          {
            label: 'Archive',
            variant: 'danger',
            onClick: () => {
              if (confirmArchive) setArchived(confirmArchive.id, true);
              setConfirmArchive(null);
            },
          },
        ]}
      />
    </div>
  );
}
