import { RangeKey } from '../types';

export function formatClock(totalMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(totalMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatTotalMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) return `${Math.floor(totalMinutes)}m`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function startOfDay(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfWeek(): Date {
  const d = startOfDay();
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

export function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function rangeStartMs(range: RangeKey): number {
  if (range === 'today') return startOfDay().getTime();
  if (range === 'week') return startOfWeek().getTime();
  if (range === 'month') return startOfMonth().getTime();
  return 0;
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatRecentDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const label = isSameLocalDay(d, now)
    ? 'Today'
    : isSameLocalDay(d, y)
      ? 'Yesterday'
      : `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  const h = d.getHours();
  const m = d.getMinutes();
  return `${label} · ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
