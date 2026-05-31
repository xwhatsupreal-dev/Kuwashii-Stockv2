import React, { useEffect, useState } from 'react';

export default function Snowfall() {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number, left: number, animationDuration: number, animationDelay: number, opacity: number, scale: number }>>([]);

  useEffect(() => {
    // Generate flakes on client side to avoid hydration mismatch
    const flakes = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 10 + Math.random() * 20,
      animationDelay: -Math.random() * 25, // Start negative to simulate already falling snow covering screen
      opacity: 0.1 + Math.random() * 0.5,
      scale: 0.5 + Math.random() * 1.5,
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes snowfall {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); }
          100% { transform: translateY(110vh) translateX(20px) rotate(360deg); }
        }
      `}</style>
      {snowflakes.map(flake => (
        <div
          key={flake.id}
          className="absolute top-0 text-white select-none"
          style={{
            left: `${flake.left}%`,
            opacity: flake.opacity,
            fontSize: `${14 * flake.scale}px`,
            filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.4))',
            animation: `snowfall ${flake.animationDuration}s linear infinite`,
            animationDelay: `${flake.animationDelay}s`,
            willChange: 'transform'
          }}
        >
          ❄️
        </div>
      ))}
    </div>
  );
}
