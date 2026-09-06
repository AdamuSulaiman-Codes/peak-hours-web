import React, { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { Card, Segmented } from '../components/ui';
import { formatRecentDate, formatTotalMinutes, rangeStartMs } from '../lib/time';
import { RangeKey, Session } from '../types';

type Row = {
  categoryId: string;
  name: string;
  color: string;
  minutes: number;
  count: number;
};

function build(sessions: Session[], range: RangeKey, nameOf: (id: string) => { name: string; color: string }): Row[] {
  const start = rangeStartMs(range);
  const map = new Map<string, Row>();
  for (const s of sessions) {
    if (new Date(s.completedAt).getTime() < start) continue;
    const meta = nameOf(s.categoryId);
    const cur = map.get(s.categoryId);
    if (cur) {
      cur.minutes += s.durationMinutes;
      cur.count += 1;
    } else {
      map.set(s.categoryId, {
        categoryId: s.categoryId,
        name: meta.name,
        color: meta.color,
        minutes: s.durationMinutes,
        count: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.minutes - a.minutes);
}

export function Reports() {
  const { sessions, getCategory } = useApp();
  const [range, setRange] = useState<RangeKey>('today');
  const rows = useMemo(() => {
    const nameOf = (id: string) => {
      const cat = getCategory(id);
      return cat ? { name: cat.name, color: cat.color } : { name: 'Unknown', color: '#A9BDAE' };
    };
    return build(sessions, range, nameOf);
  }, [sessions, range, getCategory]);

  const totalMinutes = rows.reduce((sum, r) => sum + r.minutes, 0);
  const totalCount = rows.reduce((sum, r) => sum + r.count, 0);
  const max = rows.length ? rows[0].minutes : 0;

  const recent = useMemo(() => {
    const start = rangeStartMs(range);
    const metaOf = (id: string) => {
      const cat = getCategory(id);
      return cat ? { name: cat.name, color: cat.color } : { name: 'Unknown', color: '#A9BDAE' };
    };
    return sessions
      .filter((s) => new Date(s.completedAt).getTime() >= start)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
      .slice(0, 6)
      .map((s) => ({ id: s.id, ...metaOf(s.categoryId), completedAt: s.completedAt, minutes: s.durationMinutes }));
  }, [sessions, range, getCategory]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-bold">Reports</h1>
      <Segmented
        options={[
          { key: 'today' as const, label: 'Today' },
          { key: 'week' as const, label: 'Week' },
          { key: 'month' as const, label: 'Month' },
          { key: 'all' as const, label: 'All time' },
        ]}
        value={range}
        onChange={setRange}
      />

      {rows.length === 0 ? (
        <div className="mt-10 text-center">
          <div className="font-display text-xl font-bold">Nothing here yet</div>
          <p className="mt-2 text-sm text-muted">
            Complete a focus session and it will show up here.
          </p>
        </div>
      ) : (
        <>
          <Card className="text-center">
            <div className="text-xs uppercase tracking-[2px] text-muted">Total focus time</div>
            <div className="mt-1 font-display text-3xl font-bold">
              {formatTotalMinutes(totalMinutes)}
            </div>
            <div className="text-sm text-muted">
              {totalCount} session{totalCount === 1 ? '' : 's'}
            </div>
          </Card>

          <section>
            <h2 className="mb-3 font-display text-lg font-bold">By project</h2>
            <Card>
              <div className="flex flex-col gap-4">
                {rows.map((row) => (
                  <div key={row.categoryId}>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium">{row.name}</span>
                      <span className="text-sm text-muted">{formatTotalMinutes(row.minutes)}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded bg-bg">
                      <div
                        className="h-full rounded"
                        style={{ width: `${max ? (row.minutes / max) * 100 : 0}%`, backgroundColor: row.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-bold">Breakdown</h2>
            <Card>
              <div className="flex flex-col gap-3">
                {rows.map((row) => (
                  <div key={row.categoryId} className="flex items-center gap-3">
                    <span className="h-3 w-3 shrink-0" style={{ backgroundColor: row.color }} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{row.name}</div>
                      <div className="text-xs text-muted">
                        {row.count} session{row.count === 1 ? '' : 's'}
                      </div>
                    </div>
                    <span className="font-mono text-lg">{formatTotalMinutes(row.minutes)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {recent.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-bold">Latest sessions</h2>
              <Card>
                <div className="flex flex-col gap-3">
                  {recent.map((s) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="h-3 w-3 shrink-0" style={{ backgroundColor: s.color }} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-xs text-muted">{formatRecentDate(s.completedAt)}</div>
                      </div>
                      <span className="font-mono">{formatTotalMinutes(s.minutes)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          )}
        </>
      )}
    </div>
  );
}
