import { useState, useEffect, useRef } from "react";
import { Player, Element, GameStats, TouchAction } from "@/types/game";
import { GameHUD } from "./GameHUD";
import { TouchController } from "./TouchController";
import { ElementalZone } from "./ElementalZone";
import { ObstacleSystem } from "./ObstacleSystem";
import { useToast } from "@/hooks/use-toast";
import { playZoneMusic, playActionSound, playTokenCollected, playAvatarState, playObstacleHit, playCoinCollected } from "@/lib/audio";

interface GameScreenProps {
  player: Player;
  onGameOver: (stats: GameStats) => void;
}

const elements: Element[] = ['air', 'water', 'earth', 'fire'];
const zoneNames = {
  air: 'Air Temple Peaks',
  water: 'Polar Ice Flows',
  earth: 'Stone Canyon Valley',
  fire: 'Volcanic Realm'
};

export function GameScreen({ player, onGameOver }: GameScreenProps) {
  const { toast } = useToast();
  const [gameStats, setGameStats] = useState<GameStats>({
    distance: 0,
    coins: 0,
    airTokens: 0,
    waterTokens: 0,
    earthTokens: 0,
    fireTokens: 0,
    health: 3,
    score: 0,
    avatarStateActive: false
  });
  
  const [currentElement, setCurrentElement] = useState<Element>('air');
  const [gameSpeed, setGameSpeed] = useState(1);
  const [lastAction, setLastAction] = useState<TouchAction | null>(null);
  const gameLoopRef = useRef<number>();
  const lastElementSwitch = useRef(Date.now());
  const avatarStateTimeoutRef = useRef<NodeJS.Timeout>();

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      setGameStats(prev => {
        const newDistance = prev.distance + gameSpeed;
        const newScore = prev.score + Math.floor(gameSpeed);
        
        // Switch elements every 20-30 seconds
        const now = Date.now();
        if (now - lastElementSwitch.current > 25000) {
          const currentIndex = elements.indexOf(currentElement);
          const nextElement = elements[(currentIndex + 1) % elements.length];
          setCurrentElement(nextElement);
          lastElementSwitch.current = now;
          
          toast({
            title: `Entering ${zoneNames[nextElement]}`,
            description: `Master ${nextElement} bending to survive!`,
            duration: 3000,
          });
          
          // Play zone music
          playZoneMusic(nextElement);
        }
        
        return {
          ...prev,
          distance: newDistance,
          score: newScore
        };
      });
      
      // Increase speed gradually with more dynamic progression
      setGameSpeed(prev => Math.min(prev + 0.002, 4));
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [currentElement, gameSpeed, toast]);

  const handleTouchAction = (action: TouchAction) => {
    setLastAction(action);
    console.log(`Touch action: ${action} in ${currentElement} zone`);
    
    // Play action sound
    playActionSound(action, currentElement);
    
    // Simple feedback for now
    toast({
      title: `${action.replace('-', ' ').toUpperCase()}!`,
      description: `Used ${currentElement} bending`,
      duration: 800,
    });
    
    // Clear action after a short delay
    setTimeout(() => setLastAction(null), 500);
  };

  const takeDamage = () => {
    playObstacleHit();
    setGameStats(prev => {
      const newHealth = prev.health - 1;
      if (newHealth <= 0) {
        onGameOver(prev);
      }
      return { ...prev, health: newHealth };
    });
  };

  const collectToken = (element: Element) => {
    setGameStats(prev => {
      const newStats = {
        ...prev,
        [`${element}Tokens`]: prev[`${element}Tokens` as keyof GameStats] as number + 1,
        score: prev.score + 100
      };
      
      // Check for Avatar State (all 4 tokens collected)
      if (newStats.airTokens > 0 && newStats.waterTokens > 0 && 
          newStats.earthTokens > 0 && newStats.fireTokens > 0 && 
          !newStats.avatarStateActive) {
        
        toast({
          title: "AVATAR STATE ACTIVATED!",
          description: "You are now invincible for 10 seconds!",
          duration: 5000,
        });
        
        playAvatarState();
        
        newStats.avatarStateActive = true;
        
        // Clear any existing timeout
        if (avatarStateTimeoutRef.current) {
          clearTimeout(avatarStateTimeoutRef.current);
        }
        
        // Deactivate after 10 seconds
        avatarStateTimeoutRef.current = setTimeout(() => {
          setGameStats(prev => ({ ...prev, avatarStateActive: false }));
          toast({
            title: "Avatar State Ended",
            description: "You are no longer invincible",
            duration: 2000,
          });
        }, 10000);
      }
      
      return newStats;
    });
    
    toast({
      title: `${element.toUpperCase()} Token Collected!`,
      description: `Mastery increased! +100 points`,
      duration: 1500,
    });
    
    playTokenCollected(element);
  };

  const collectCoin = () => {
    playCoinCollected();
    setGameStats(prev => ({
      ...prev,
      coins: prev.coins + 1,
      score: prev.score + 10
    }));
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (avatarStateTimeoutRef.current) {
        clearTimeout(avatarStateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ElementalZone element={currentElement} />
      
      <ObstacleSystem
        currentElement={currentElement}
        gameSpeed={gameSpeed}
        avatarStateActive={gameStats.avatarStateActive}
        onObstacleHit={takeDamage}
        onTokenCollected={collectToken}
        onCoinCollected={collectCoin}
        lastAction={lastAction}
        gameStats={gameStats}
      />
      
      <GameHUD 
        player={player} 
        stats={gameStats} 
        currentElement={currentElement}
      />
      
      <TouchController onTouchAction={handleTouchAction} />
      
      {/* Character with Avatar State glow effect and action feedback */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
        <div 
          className={`w-16 h-16 rounded-full animate-float shadow-lg transition-all duration-300 ${
            gameStats.avatarStateActive 
              ? 'bg-gradient-to-r from-air-primary via-water-primary to-fire-primary animate-pulse-glow shadow-glow-fire scale-110' 
              : lastAction 
                ? `bg-gradient-to-r ${
                    lastAction === 'swipe-up' ? 'from-air-primary to-air-secondary scale-110 -translate-y-4' :
                    lastAction === 'swipe-down' ? 'from-water-primary to-water-secondary scale-90 translate-y-2' :
                    lastAction === 'tap-hold' ? 'from-earth-primary to-earth-secondary scale-125' :
                    'from-fire-primary to-fire-secondary scale-105 animate-pulse-glow'
                  }`
                : 'bg-gradient-to-r from-air-primary to-water-primary'
          }`}
        >
          {gameStats.avatarStateActive && (
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
          )}
          
          {/* Action visual effect */}
          {lastAction && !gameStats.avatarStateActive && (
            <div className={`absolute inset-0 rounded-full animate-ping ${
              lastAction === 'swipe-up' ? 'bg-air-primary/50' :
              lastAction === 'swipe-down' ? 'bg-water-primary/50' :
              lastAction === 'tap-hold' ? 'bg-earth-primary/50' :
              'bg-fire-primary/50'
            }`} />
          )}
        </div>
      </div>

      {/* Avatar State indicator */}
      {gameStats.avatarStateActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-none">
          <div className="text-6xl font-bold bg-gradient-to-r from-air-primary via-water-primary to-fire-primary bg-clip-text text-transparent animate-pulse-glow">
            AVATAR STATE
          </div>
        </div>
      )}
    </div>
  );
}