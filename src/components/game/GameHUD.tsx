import { Player, GameStats, Element } from "@/types/game";
import { Heart, Coins, Flame, Droplets, Mountain, Wind } from "lucide-react";

interface GameHUDProps {
  player: Player;
  stats: GameStats;
  currentElement: Element;
}

const elementIcons = {
  air: Wind,
  water: Droplets,
  earth: Mountain,
  fire: Flame
};

const elementColors = {
  air: 'text-air-primary',
  water: 'text-water-primary',
  earth: 'text-earth-primary',
  fire: 'text-fire-primary'
};

export function GameHUD({ player, stats, currentElement }: GameHUDProps) {
  const ElementIcon = elementIcons[currentElement];
  
  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-2 sm:p-4">
      {/* Top row - Player info and health */}
      <div className="flex justify-between items-start mb-2 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 bg-card/80 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-border/50">
          <img 
            src={player.portrait} 
            alt={player.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-primary"
          />
          <div className="hidden sm:block">
            <p className="font-semibold text-sm text-foreground">{player.name}</p>
            <p className="text-xs text-muted-foreground">Distance: {Math.floor(stats.distance)}m</p>
          </div>
        </div>
        
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <Heart 
              key={i}
              className={`w-6 h-6 sm:w-8 sm:h-8 ${
                i < stats.health 
                  ? 'text-health-full fill-health-full' 
                  : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mobile player info (shown only on small screens) */}
      <div className="flex justify-center mb-2 sm:hidden">
        <div className="bg-card/80 backdrop-blur-sm rounded-lg px-3 py-1 border border-border/50">
          <p className="text-xs font-medium text-foreground">{player.name} - {Math.floor(stats.distance)}m</p>
        </div>
      </div>

      {/* Current element indicator */}
      <div className="flex justify-center mb-2 sm:mb-4">
        <div className={`flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 border border-border/50 ${
          stats.avatarStateActive ? 'animate-pulse-glow bg-gradient-to-r from-air-primary/20 to-fire-primary/20' : ''
        }`}>
          <ElementIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${elementColors[currentElement]}`} />
          <span className="text-xs sm:text-sm font-medium text-foreground capitalize">
            {currentElement} Zone
          </span>
          {stats.avatarStateActive && (
            <span className="text-xs bg-fire-primary text-background px-2 py-1 rounded-full font-bold animate-pulse">
              AVATAR
            </span>
          )}
        </div>
      </div>

      {/* Stats bar - responsive layout */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 bg-card/80 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-border/50">
        {/* Mobile: Stack layout */}
        <div className="flex justify-between items-center w-full sm:w-auto sm:flex-col">
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-foreground">{stats.coins}</span>
          </div>
          
          <div className="flex gap-2 sm:gap-4">
            <TokenDisplay element="air" count={stats.airTokens} />
            <TokenDisplay element="water" count={stats.waterTokens} />
            <TokenDisplay element="earth" count={stats.earthTokens} />
            <TokenDisplay element="fire" count={stats.fireTokens} />
          </div>
          
          <div className="text-right">
            <p className="text-xs text-muted-foreground hidden sm:block">Score</p>
            <p className="text-sm font-bold text-foreground">{stats.score}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenDisplay({ element, count }: { element: Element, count: number }) {
  const ElementIcon = elementIcons[element];
  const colorClass = elementColors[element];
  
  return (
    <div className="flex items-center gap-1">
      <ElementIcon className={`w-4 h-4 ${colorClass}`} />
      <span className="text-xs font-medium text-foreground">{count}</span>
    </div>
  );
}