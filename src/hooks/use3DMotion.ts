import { useEffect, useMemo, useState } from 'react';

type MotionState = {
  rotateX: number;
  rotateY: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const use3DMotion = (enabled: boolean) => {
  const [motionState, setMotionState] = useState<MotionState>({ rotateX: 0, rotateY: 0 });
  const [hasDeviceSensor, setHasDeviceSensor] = useState(false);

  const requestSensorPermission = async () => {
    if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
      return false;
    }

    const orientationWithPermission = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof orientationWithPermission.requestPermission === 'function') {
      try {
        const result = await orientationWithPermission.requestPermission();
        if (result === 'granted') {
          setHasDeviceSensor(true);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }

    setHasDeviceSensor('DeviceOrientationEvent' in window);
    return true;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!enabled) {
      setMotionState({ rotateX: 0, rotateY: 0 });
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      setMotionState({
        rotateX: clamp(-y * 6, -6, 6),
        rotateY: clamp(x * 6, -6, 6),
      });
    };

    const handlePointerLeave = () => {
      setMotionState({ rotateX: 0, rotateY: 0 });
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (typeof event.beta !== 'number' || typeof event.gamma !== 'number') return;
      setHasDeviceSensor(true);
      const rotateX = clamp((event.beta - 45) / 10, -7, 7);
      const rotateY = clamp(event.gamma / 6, -7, 7);
      setMotionState({ rotateX, rotateY });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerLeave, { passive: true });
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerLeave);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [enabled]);

  const shellStyle = useMemo(
    () => ({
      transform: enabled
        ? `perspective(1300px) rotateX(${motionState.rotateX}deg) rotateY(${motionState.rotateY}deg)`
        : undefined,
      transition: enabled ? 'transform 120ms ease-out' : undefined,
      transformStyle: enabled ? ('preserve-3d' as const) : undefined,
    }),
    [enabled, motionState.rotateX, motionState.rotateY],
  );

  return { shellStyle, requestSensorPermission, hasDeviceSensor };
};
