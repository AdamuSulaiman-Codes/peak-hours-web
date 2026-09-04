let audioCtx: AudioContext | null = null;

export function ensureAudio(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function tone(ctx: AudioContext, freq: number, start: number, dur: number, vol: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'square';
  o.frequency.value = freq;
  const t0 = ctx.currentTime + start;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

export function playChime() {
  const ctx = ensureAudio();
  if (!ctx) return;
  tone(ctx, 660, 0, 0.5, 0.06);
  tone(ctx, 990, 0.12, 0.7, 0.05);
}

export function playTick() {
  const ctx = ensureAudio();
  if (!ctx) return;
  tone(ctx, 1500, 0, 0.04, 0.02);
}

export function hasNotificationPermission() {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted';
}

export function requestNotifications(): boolean | undefined {
  if (typeof Notification === 'undefined') return undefined;
  if (Notification.permission === 'default') {
    void Notification.requestPermission();
    return undefined;
  }
  return Notification.permission === 'granted';
}

export function notify(title: string, body: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body });
  } catch {
    // ignore
  }
}

const vibrateInterval = { id: 0 as number | null };
export function startSustainedVibrate() {
  stopSustainedVibrate();
  if (!('vibrate' in navigator)) return;
  try {
    navigator.vibrate([600, 350]);
    vibrateInterval.id = window.setInterval(() => {
      navigator.vibrate([600, 350]);
    }, 1000);
  } catch {
    // ignore
  }
}
export function stopSustainedVibrate() {
  if (vibrateInterval.id !== null) {
    clearInterval(vibrateInterval.id);
    vibrateInterval.id = null;
  }
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(0);
    } catch {
      // ignore
    }
  }
}
