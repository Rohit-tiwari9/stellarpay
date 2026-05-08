/**
 * StarField.jsx — Animated star background for atmosphere
 * Creates randomly positioned, twinkling star elements
 */

import { useMemo } from 'react';

export default function StarField() {
  // Generate star data once (memoized to avoid re-computation)
  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 0.5,  // 0.5–2.5px
      duration: `${Math.random() * 4 + 2}s`,  // 2–6s twinkle
      delay: `${Math.random() * 4}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            '--duration': star.duration,
            '--delay': star.delay,
          }}
        />
      ))}
    </div>
  );
}
