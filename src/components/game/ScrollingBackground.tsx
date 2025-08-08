import { useEffect, useState } from "react";
import { Element } from "@/types/game";

interface ScrollingBackgroundProps {
  element: Element;
  gameSpeed: number;
}

export function ScrollingBackground({ element, gameSpeed }: ScrollingBackgroundProps) {
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollOffset(prev => (prev + gameSpeed * 2) % 100);
    }, 16); // 60fps

    return () => clearInterval(interval);
  }, [gameSpeed]);

  const getBackgroundElements = () => {
    switch (element) {
      case 'air':
        return (
          <>
            {/* Floating temples and clouds */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`air-${i}`}
                className="absolute bg-air-secondary/20 rounded-full blur-xl animate-float"
                style={{
                  width: `${60 + Math.random() * 100}px`,
                  height: `${30 + Math.random() * 50}px`,
                  left: `${20 + i * 20}%`,
                  top: `${10 + (i * 15) % 60}%`,
                  transform: `translateY(${(scrollOffset + i * 20) % 100}px)`
                }}
              />
            ))}
            {/* Wind streaks */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`wind-${i}`}
                className="absolute h-0.5 bg-air-primary/30"
                style={{
                  width: `${50 + Math.random() * 100}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `translateY(${(scrollOffset * 1.5 + i * 30) % 120}px) rotate(-15deg)`
                }}
              />
            ))}
          </>
        );
      case 'water':
        return (
          <>
            {/* Ice crystals and waves */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`ice-${i}`}
                className="absolute bg-water-accent/60 rotate-45"
                style={{
                  width: `${15 + Math.random() * 20}px`,
                  height: `${15 + Math.random() * 20}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `translateY(${(scrollOffset * 2 + i * 40) % 120}px) rotate(45deg)`,
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                }}
              />
            ))}
            {/* Water waves at bottom */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-water-primary/30 to-transparent"
              style={{ transform: `translateY(${Math.sin(scrollOffset / 10) * 10}px)` }}
            />
          </>
        );
      case 'earth':
        return (
          <>
            {/* Mountain silhouettes */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-30">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`mountain-${i}`}
                  className={`absolute bottom-0 bg-earth-secondary/60`}
                  style={{
                    width: `${100 + Math.random() * 100}px`,
                    height: `${100 + Math.random() * 150}px`,
                    left: `${i * 25}%`,
                    transform: `translateY(${(scrollOffset * 0.5) % 50}px)`,
                    clipPath: `polygon(0% 100%, ${30 + Math.random() * 40}% 0%, 100% 100%)`
                  }}
                />
              ))}
            </div>
            {/* Floating rocks */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`rock-${i}`}
                className="absolute bg-earth-primary/50 rounded"
                style={{
                  width: `${10 + Math.random() * 20}px`,
                  height: `${10 + Math.random() * 20}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `translateY(${(scrollOffset + i * 25) % 110}px) rotate(${i * 45}deg)`,
                  borderRadius: `${Math.random() * 50}%`
                }}
              />
            ))}
          </>
        );
      case 'fire':
        return (
          <>
            {/* Volcanic peaks */}
            <div className="absolute bottom-0 left-0 w-full h-1/2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`volcano-${i}`}
                  className="absolute bottom-0 bg-fire-primary/40 opacity-20"
                  style={{
                    width: `${120 + Math.random() * 80}px`,
                    height: `${150 + Math.random() * 100}px`,
                    left: `${i * 30 + 10}%`,
                    transform: `translateY(${(scrollOffset * 0.3) % 30}px)`,
                    clipPath: 'polygon(0% 100%, 20% 0%, 80% 0%, 100% 100%)'
                  }}
                />
              ))}
            </div>
            {/* Fire sparks */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`spark-${i}`}
                className="absolute w-1 h-1 bg-fire-accent rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `translateY(${(scrollOffset * 3 + i * 20) % 120}px)`,
                  opacity: Math.random() * 0.8 + 0.2
                }}
              />
            ))}
            {/* Lava glow at bottom */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-fire-secondary/40 to-transparent animate-pulse-glow"
            />
          </>
        );
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main background gradient */}
      <div 
        className={`absolute inset-0 ${
          element === 'air' ? 'bg-gradient-to-b from-air-primary/30 to-air-secondary/10' :
          element === 'water' ? 'bg-gradient-to-b from-water-primary/30 to-water-secondary/10' :
          element === 'earth' ? 'bg-gradient-to-b from-earth-primary/30 to-earth-secondary/10' :
          'bg-gradient-to-b from-fire-primary/30 to-fire-secondary/10'
        }`}
      />

      {/* Animated background elements */}
      {getBackgroundElements()}

      {/* Railway tracks effect */}
      <div className="absolute bottom-0 left-0 right-0">
        {/* Track ties */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`tie-${i}`}
            className="absolute w-full h-2 bg-gray-600/30"
            style={{
              bottom: `${i * 30 - (scrollOffset * 5) % 30}px`,
              opacity: Math.max(0, 1 - i / 20)
            }}
          />
        ))}
        
        {/* Rails */}
        <div className="absolute left-1/3 bottom-0 top-1/2 w-1 bg-gray-400/40" />
        <div className="absolute left-2/3 bottom-0 top-1/2 w-1 bg-gray-400/40" />
      </div>

      {/* Speed lines for fast movement effect */}
      {gameSpeed > 2 && (
        <div className="absolute inset-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`speed-line-${i}`}
              className="absolute w-0.5 h-20 bg-white/20"
              style={{
                left: `${10 + i * 10}%`,
                top: `${Math.random() * 100}%`,
                transform: `translateY(${(scrollOffset * 8) % 140}px)`,
                opacity: (gameSpeed - 2) / 2
              }}
            />
          ))}
        </div>
      )}

      {/* Particle effects */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className={`absolute w-1 h-1 rounded-full ${
              element === 'air' ? 'bg-air-accent' :
              element === 'water' ? 'bg-water-accent' :
              element === 'earth' ? 'bg-earth-accent' :
              'bg-fire-accent'
            } opacity-60`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `translateY(${(scrollOffset * 4 + i * 15) % 130}px) scale(${0.5 + Math.random()})`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}