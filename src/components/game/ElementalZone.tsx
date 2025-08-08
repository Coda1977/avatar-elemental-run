import { Element } from "@/types/game";
import airZoneBg from "@/assets/air-zone-bg.jpg";

interface ElementalZoneProps {
  element: Element;
}

const zoneStyles: Record<Element, { background: string; backgroundImage?: string }> = {
  air: {
    background: `linear-gradient(to bottom, hsl(var(--air-primary)), hsl(var(--air-secondary)))`,
    backgroundImage: `url(${airZoneBg})`,
  },
  water: {
    background: `linear-gradient(to bottom, hsl(var(--water-primary)), hsl(var(--water-secondary)))`,
  },
  earth: {
    background: `linear-gradient(to bottom, hsl(var(--earth-primary)), hsl(var(--earth-secondary)))`,
  },
  fire: {
    background: `linear-gradient(to bottom, hsl(var(--fire-primary)), hsl(var(--fire-secondary)))`,
  }
};

const particleStyles = {
  air: 'bg-air-accent',
  water: 'bg-water-accent',
  earth: 'bg-earth-accent',
  fire: 'bg-fire-accent'
};

const elementAnimations = {
  air: 'animate-float',
  water: 'animate-pulse-glow',
  earth: 'animate-bounce',
  fire: 'animate-pulse-glow'
};

export function ElementalZone({ element }: ElementalZoneProps) {
  const style = zoneStyles[element];
  const particleStyle = particleStyles[element];

  return (
    <div 
      className="absolute inset-0 transition-all duration-1000 ease-in-out"
      style={{
        background: style.background,
        ...(style.backgroundImage && {
          backgroundImage: style.backgroundImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        })
      }}
    >
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 ${particleStyle} rounded-full opacity-60 ${elementAnimations[element]}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              transform: `scale(${0.5 + Math.random() * 1.5})`
            }}
          />
        ))}
      </div>

      {/* Overlay gradient for better UI visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/30" />
      
      {/* Zone-specific effects */}
      {element === 'air' && (
        <div className="absolute inset-0">
          {/* Floating clouds */}
          <div className="absolute top-1/4 left-1/4 w-40 h-20 bg-air-secondary/30 rounded-full blur-xl animate-float" />
          <div className="absolute top-1/2 right-1/3 w-32 h-16 bg-air-primary/20 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 left-1/2 w-24 h-12 bg-air-accent/25 rounded-full blur-md animate-float" style={{ animationDelay: '2s' }} />
          {/* Wind streaks */}
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="absolute h-px bg-air-primary/40 animate-slide-in"
              style={{
                width: `${50 + Math.random() * 100}px`,
                top: `${20 + Math.random() * 60}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )}
      
      {element === 'water' && (
        <div className="absolute inset-0">
          {/* Water waves */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-water-primary/40 to-transparent animate-pulse-glow" />
          <div className="absolute bottom-1/4 left-0 right-0 h-1/4 bg-gradient-to-t from-water-secondary/30 to-transparent animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
          {/* Ice crystals */}
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-4 h-4 bg-water-accent/60 transform rotate-45 animate-float"
              style={{
                top: `${10 + Math.random() * 80}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
              }}
            />
          ))}
        </div>
      )}
      
      {element === 'earth' && (
        <div className="absolute inset-0">
          {/* Ground layer */}
          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-earth-primary/50 to-transparent" />
          {/* Mountain silhouettes */}
          <div className="absolute bottom-1/4 left-0 w-full h-1/3 opacity-30">
            <div className="absolute bottom-0 left-0 w-1/4 h-full bg-earth-secondary/60" style={{ clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)' }} />
            <div className="absolute bottom-0 left-1/5 w-1/3 h-3/4 bg-earth-primary/50" style={{ clipPath: 'polygon(0% 100%, 40% 20%, 100% 100%)' }} />
            <div className="absolute bottom-0 right-0 w-1/4 h-full bg-earth-accent/40" style={{ clipPath: 'polygon(0% 100%, 60% 10%, 100% 100%)' }} />
          </div>
          {/* Rock debris */}
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-earth-secondary/50 animate-bounce"
              style={{
                width: `${8 + Math.random() * 12}px`,
                height: `${8 + Math.random() * 12}px`,
                top: `${20 + Math.random() * 60}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                borderRadius: `${Math.random() * 50}%`
              }}
            />
          ))}
        </div>
      )}
      
      {element === 'fire' && (
        <div className="absolute inset-0">
          {/* Fire glow */}
          <div className="absolute inset-0 bg-fire-primary/5 animate-pulse-glow" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-fire-secondary/30 to-transparent animate-pulse-glow" />
          {/* Lava pools */}
          <div className="absolute bottom-1/4 left-1/4 w-20 h-8 bg-fire-primary/60 rounded-full blur-sm animate-pulse-glow" />
          <div className="absolute bottom-1/3 right-1/3 w-16 h-6 bg-fire-accent/50 rounded-full blur-sm animate-pulse-glow" style={{ animationDelay: '1s' }} />
          {/* Fire sparks */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-fire-accent rounded-full animate-float"
              style={{
                top: `${30 + Math.random() * 60}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.8 + 0.2
              }}
            />
          ))}
          {/* Volcanic peaks */}
          <div className="absolute bottom-0 left-1/5 w-32 h-48 opacity-20 bg-fire-primary/40" style={{ clipPath: 'polygon(0% 100%, 20% 0%, 80% 0%, 100% 100%)' }} />
          <div className="absolute bottom-0 right-1/4 w-28 h-40 opacity-15 bg-fire-secondary/30" style={{ clipPath: 'polygon(0% 100%, 30% 10%, 70% 10%, 100% 100%)' }} />
        </div>
      )}
    </div>
  );
}