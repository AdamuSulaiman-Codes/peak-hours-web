import { Session } from '../types';

export type StreakStats = { current: number; best: number };

function localMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function computeStreak(sessions: Session[]): StreakStats {
  const days = new Set<number>();
  for (const s of sessions) {
    days.add(localMidnight(new Date(s.completedAt)).getTime());
  }
  const dayMs = 24 * 60 * 60 * 1000;
  const today = localMidnight(new Date()).getTime();
  let anchor = days.has(today) ? today : today - dayMs;
  let current = 0;
  while (days.has(anchor)) {
    current += 1;
    anchor -= dayMs;
  }
  const sorted = Array.from(days).sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let prev: number | undefined;
  for (const t of sorted) {
    run = prev !== undefined && t - prev === dayMs ? run + 1 : 1;
    if (run > best) best = run;
    prev = t;
  }
  return { current, best };
}
