import React, { useEffect, useRef, useState } from 'react';
import { useTimer } from '../state/TimerContext';
import { useNav } from '../state/nav';
import { Button, Modal } from '../components/ui';
import { formatClock } from '../lib/time';

export function TimerView() {
  const { timer, remainingMs, isPaused, pause, resume, cancel } = useTimer();
  const nav = useNav();
  const [confirmEnd, setConfirmEnd] = useState(false);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const endRef = useRef(0);
  const totalRef = useRef(1);
  const pausedRemainRef = useRef(0);
  const isPausedRef = useRef(false);
  const hasTimerRef = useRef(false);

  const size = Math.min(320, window.innerWidth - 56);
  const stroke = 12;
  const r = (size - stroke) / 2 - 8;
  const c = 2 * Math.PI * r;

  // keep refs fresh for the animation loop
  useEffect(() => {
    if (timer) {
      hasTimerRef.current = true;
      endRef.current = timer.endTimestamp;
      totalRef.current = timer.durationMinutes * 60000;
      pausedRemainRef.current = timer.remainingMs;
      isPausedRef.current = timer.status === 'paused';
    } else {
      hasTimerRef.current = false;
    }
  }, [timer]);

  useEffect(() => {
    if (!timer) {
      nav.closeOverlay();
      return;
    }
    let raf = 0;
    const tick = () => {
      const el = circleRef.current;
      if (el) {
        const t = hasTimerRef.current;
        let frac = 1;
        if (t) {
          frac = isPausedRef.current
            ? pausedRemainRef.current / totalRef.current
            : Math.max(0, endRef.current - Date.now()) / totalRef.current;
        }
        el.setAttribute('stroke-dashoffset', String(c * (1 - frac)));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  useEffect(() => {
    document.title = timer ? `${formatClock(remainingMs)} · Peak Hours` : 'Peak Hours';
    return () => {
      document.title = 'Peak Hours';
    };
  }, [timer, remainingMs]);

  useEffect(() => {
    if (!timer) nav.closeOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  if (!timer) return null;

  async function endNow() {
    setConfirmEnd(false);
    cancel();
    nav.closeOverlay();
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg px-5 py-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[2px] text-muted">
          Session
        </span>
        <span className="flex items-center gap-2 rounded border border-line bg-surface px-3 py-1 text-sm">
          <span
            className={`h-2 w-2 ${isPaused ? 'bg-muted' : 'bg-amber'}`}
          />
          {isPaused ? 'Paused' : 'Running'}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="h-3 w-3" style={{ backgroundColor: timer.categoryColor }} />
          <span className="max-w-[260px] truncate">{timer.categoryName}</span>
        </div>

        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="#2E4A2E"
              strokeWidth={stroke}
            />
            <circle
              ref={circleRef}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="#FFB000"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={0}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className={`font-mono text-7xl font-bold tabular-nums ${
                isPaused ? 'text-muted' : 'text-ink'
              }`}
            >
              {formatClock(remainingMs)}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[2.5px] text-muted">
              {Math.ceil(remainingMs / 1000)} sec left
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {isPaused ? (
          <Button label="Resume" onClick={() => resume()} className="flex-[2]" />
        ) : (
          <Button label="Pause" onClick={pause} className="flex-[2]" />
        )}
        <Button label="End" variant="secondary" onClick={() => setConfirmEnd(true)} className="flex-1" />
      </div>

      <Modal
        open={confirmEnd}
        title="End this session?"
        message="This session won't be added to your reports."
        onClose={() => setConfirmEnd(false)}
        actions={[
          { label: 'Keep going', onClick: () => setConfirmEnd(false) },
          { label: 'End session', variant: 'danger', onClick: endNow },
        ]}
      />
    </div>
  );
}
