import React from 'react';
import { useApp } from '../state/AppContext';
import { Toggle, TimeInputs } from '../components/ui';
import { hasNotificationPermission, requestNotifications } from '../lib/sys';

export function Settings() {
  const { settings, updateSettings } = useApp();
  const granted = hasNotificationPermission();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-bold">Settings</h1>

      <section>
        <h2 className="mb-1 text-xs font-bold uppercase tracking-[1.4px] text-muted">Sound & feedback</h2>
        <div className="divide-y divide-line rounded-lg border border-line bg-surface px-4">
          <Toggle
            title="Completion chime"
            description="Plays a short chime when a session finishes."
            checked={settings.completionChime}
            onChange={(v) => updateSettings({ completionChime: v })}
          />
          <Toggle
            title="Ticking"
            description="Soft tick each second while a session runs."
            checked={settings.tickSound}
            onChange={(v) => updateSettings({ tickSound: v })}
          />
          <Toggle
            title="Vibrate when done"
            description="Vibrates until you dismiss the completion screen."
            checked={settings.vibrateOnComplete}
            onChange={(v) => updateSettings({ vibrateOnComplete: v })}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-xs font-bold uppercase tracking-[1.4px] text-muted">Notifications</h2>
        <div className="divide-y divide-line rounded-lg border border-line bg-surface px-4">
          <Toggle
            title="Session notifications"
            description={
              granted
                ? 'Shows a browser notification when a session finishes.'
                : 'Notifications are not enabled in this browser.'
            }
            checked={settings.notifications && granted}
            onChange={(v) => {
              if (!granted) {
                requestNotifications();
                return;
              }
              updateSettings({ notifications: v });
            }}
          />
          <Toggle
            title="Daily reminder"
            description="A reminder to run a focus session. Works only while the tab is open in a browser."
            checked={settings.reminderEnabled}
            onChange={(v) => updateSettings({ reminderEnabled: v })}
          />
          {settings.reminderEnabled && (
            <div className="py-4">
              <TimeInputs
                hour={settings.reminderHour}
                minute={settings.reminderMinute}
                onChange={(hour, minute) => updateSettings({ reminderHour: hour, reminderMinute: minute })}
              />
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">
          Browser notifications only fire while this tab is open — background delivery on web requires
          the Android app instead.
        </p>
      </section>
    </div>
  );
}
