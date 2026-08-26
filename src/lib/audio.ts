// Global sound alert utility for Admin with localStorage persistence

const SOUND_STORAGE_KEY = "aroma_admin_sound_enabled";

export function getAdminSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SOUND_STORAGE_KEY);
  return stored === null ? true : stored === "true";
}

export function setAdminSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
  window.dispatchEvent(new Event("aroma_sound_toggle"));
}

export function playOrderChime(): void {
  if (!getAdminSoundEnabled()) return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      const startTime = now + index * 0.08;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  } catch (err) {
    console.warn("Could not play audio alert:", err);
  }
}
