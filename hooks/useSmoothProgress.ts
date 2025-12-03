import { useState, useEffect, useRef } from "react";

export function useSmoothProgress(realProgress: number, isLoading: boolean) {
  const [smoothProgress, setSmoothProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Reset if not loading
    if (!isLoading && realProgress === 0) {
      setSmoothProgress(0);
      return;
    }

    const animate = () => {
      const now = Date.now();
      const dt = (now - lastTimeRef.current) / 1000; // delta time in seconds
      lastTimeRef.current = now;

      setSmoothProgress((current) => {
        let target = realProgress;

        // If we are loading but the backend reports 0 or low,
        // we still want to show some activity (fake start).
        if (isLoading && target < 20) target = 20;

        // If we are loading and stuck, we want to creep towards 98%
        // but never exceed it until realProgress hits 100.
        const creepTarget = 98;

        let next = current;

        if (isLoading) {
          if (current < target) {
            // Catch up fast
            const diff = target - current;
            next += diff * 5 * dt; // Speed factor 5
          } else {
            // Creep forward slowly if we are ahead of real progress (or stuck)
            // but only if we haven't reached the creep limit

            // Slow down significantly after 70%
            const creepTarget = 95;
            if (current < creepTarget) {
              const remaining = creepTarget - current;
              let speed = 0.05;

              if (current > 70) speed = 0.01; // Much slower after 70%

              next += remaining * speed * dt;
              // Ensure minimum movement so it doesn't look frozen
              next += 0.05 * dt;
            }
          }
        } else {
          // Not loading (completed or cancelled)
          if (realProgress >= 100) {
            // Smooth finish
            const diff = 100 - current;
            next += diff * 5 * dt; // Slower snap for smoothness
            if (diff < 0.1) next = 100;
          }
        }

        return Math.min(next, 100);
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = Date.now();
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [realProgress, isLoading]);

  return smoothProgress;
}
