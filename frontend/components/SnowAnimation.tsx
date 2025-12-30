"use client";

import { useEffect, useState } from "react";

interface SnowFlake {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
}

export function SnowAnimation() {
  const [snowflakes, setSnowflakes] = useState<SnowFlake[]>([]);

  useEffect(() => {
    // Generate 50 snowflakes with faster animations
    const flakes: SnowFlake[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 3 + Math.random() * 3, // 3-6 seconds (faster)
      animationDelay: Math.random() * 2,
      size: 4 + Math.random() * 4, // 4-8px
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute top-0 text-white opacity-80 select-none"
          style={{
            left: `${flake.left}%`,
            animation: `snowfall ${flake.animationDuration}s linear ${flake.animationDelay}s infinite`,
            fontSize: `${flake.size}px`,
            filter: "blur(0.5px)",
            willChange: "transform, opacity",
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}

