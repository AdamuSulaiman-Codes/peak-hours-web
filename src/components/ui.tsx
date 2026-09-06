import React, { useState } from 'react';

export const inputCls =
  'w-full rounded-md border border-line bg-bg2 px-3 py-2.5 outline-none focus:border-amber';

export function Button({
  label,
  onClick,
  variant = 'primary',
  disabled,
  className = '',
}: {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}) {
  const styles =
    variant === 'primary'
      ? 'bg-amber text-[#151a0f] hover:bg-amber2'
      : variant === 'danger'
        ? 'bg-bad text-white hover:opacity-90'
        : 'bg-surface text-ink border border-line2 hover:border-amber hover:text-amber';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[48px] rounded-lg px-5 font-mono text-[15px] font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none ${styles} ${className}`}
    >
      {label}
    </button>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-line bg-surface p-4 ${className}`}>
      {children}
    </div>
  );
}

export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-3 py-2 text-sm font-semibold transition ${
        selected
          ? 'bg-amber text-[#151a0f]'
          : 'bg-surface text-ink border border-line hover:border-amber'
      }`}
    >
      {label}
    </button>
  );
}

export function Option({
  name,
  color,
  selected,
  onClick,
  archived,
}: {
  name: string;
  color: string;
  selected?: boolean;
  onClick: () => void;
  archived?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg border bg-surface px-3 py-3 text-left transition ${
        selected ? 'border-amber' : 'border-line'
      } hover:border-amber ${archived ? 'opacity-50 line-through' : ''}`}
    >
      <span className="h-3 w-3 shrink-0" style={{ backgroundColor: color }} />
      <span className="truncate text-[15px]">{name}</span>
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-line bg-surface p-1">
      {options.map((opt) => {
        const selected = opt.key === value;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`flex-1 rounded px-2 py-2 text-sm font-semibold transition ${
              selected
                ? 'bg-amber text-[#151a0f]'
                : 'text-muted hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Modal({
  open,
  title,
  message,
  actions,
  onClose,
}: {
  open: boolean;
  title: string;
  message?: string;
  actions: { label: string; variant?: 'primary' | 'secondary' | 'danger'; onClick: () => void }[];
  onClose?: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-lg border border-line2 bg-surface2 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 font-display text-lg font-bold">{title}</h3>
        {message ? (
          <p className="mb-6 text-sm text-muted">{message}</p>
        ) : null}
        <div className="flex flex-col gap-3">
          {actions.map((a) => (
            <Button
              key={a.label}
              label={a.label}
              variant={a.variant ?? 'primary'}
              onClick={a.onClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-[1.4px] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Toggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted">{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
          checked ? 'bg-amber border-amber' : 'bg-bg2 border-line'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            checked ? 'left-[26px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export function TimeInputs({
  hour,
  minute,
  onChange,
}: {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
}) {
  const num = (s: string, max: number) => {
    const v = parseInt(s.replace(/[^0-9]/g, '').slice(0, 2), 10);
    if (Number.isNaN(v)) return null;
    return Math.min(max, v);
  };
  return (
    <div className="flex items-center gap-2">
      <input
        inputMode="numeric"
        value={String(hour).padStart(2, '0')}
        onChange={(e) => {
          const v = num(e.target.value, 23);
          if (v !== null) onChange(v, minute);
        }}
        className="w-16 rounded-md border border-line bg-bg2 px-3 py-2 text-center outline-none focus:border-amber"
      />
      <span>:</span>
      <input
        inputMode="numeric"
        value={String(minute).padStart(2, '0')}
        onChange={(e) => {
          const v = num(e.target.value, 59);
          if (v !== null) onChange(hour, v);
        }}
        className="w-16 rounded-md border border-line bg-bg2 px-3 py-2 text-center outline-none focus:border-amber"
      />
      <span className="ml-2 text-xs text-muted">24h</span>
    </div>
  );
}
