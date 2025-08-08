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
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 ${particleStyle} rounded-full opacity-60`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Overlay gradient for better UI visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/30" />
      
      {/* Zone-specific effects */}
      {element === 'air' && (
        <div className="absolute inset-0 animate-float">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-air-accent/20 rounded-full blur-xl animate-pulse-glow" />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-air-primary/30 rounded-full blur-lg animate-float" />
        </div>
      )}
      
      {element === 'water' && (
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-water-primary/30 to-transparent animate-pulse-glow" />
        </div>
      )}
      
      {element === 'earth' && (
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-earth-primary/40 to-transparent" />
        </div>
      )}
      
      {element === 'fire' && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-fire-accent/10 animate-pulse-glow" />
          <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-fire-primary/50 rounded-full blur-lg animate-float" />
        </div>
      )}
    </div>
  );
}