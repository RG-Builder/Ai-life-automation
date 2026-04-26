import { useCallback, useRef } from 'react';

type SoundType = 'tap' | 'success' | 'toggle';

const SOUND_MAP: Record<SoundType, { freq: number; duration: number; gain: number }> = {
  tap: { freq: 420, duration: 0.05, gain: 0.016 },
  toggle: { freq: 540, duration: 0.06, gain: 0.018 },
  success: { freq: 720, duration: 0.08, gain: 0.02 },
};

export const useUISounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const play = useCallback((type: SoundType) => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }

    const ctx = audioContextRef.current;
    const sound = SOUND_MAP[type];
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(sound.freq, now);
    oscillator.frequency.exponentialRampToValueAtTime(sound.freq * 0.85, now + sound.duration);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(sound.gain, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + sound.duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + sound.duration + 0.01);
  }, []);

  return { play };
};
