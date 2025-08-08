import { useState, useEffect, useRef } from "react";
import { Player, Element, GameStats, TouchAction } from "@/types/game";
import { GameHUD } from "./GameHUD";
import { TouchController } from "./TouchController";
import { ElementalZone } from "./ElementalZone";
import { useToast } from "@/hooks/use-toast";

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
  const [obstacles, setObstacles] = useState<any[]>([]);
  const gameLoopRef = useRef<number>();
  const lastElementSwitch = useRef(Date.now());

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
        }
        
        return {
          ...prev,
          distance: newDistance,
          score: newScore
        };
      });
      
      // Increase speed gradually
      setGameSpeed(prev => Math.min(prev + 0.001, 3));
      
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
    console.log(`Touch action: ${action} in ${currentElement} zone`);
    
    // Simple feedback for now
    toast({
      title: `${action.replace('-', ' ').toUpperCase()}!`,
      description: `Used ${currentElement} bending`,
      duration: 1000,
    });
    
    // Check for Avatar State (all 4 tokens collected)
    if (gameStats.airTokens > 0 && gameStats.waterTokens > 0 && 
        gameStats.earthTokens > 0 && gameStats.fireTokens > 0 && 
        !gameStats.avatarStateActive) {
      setGameStats(prev => ({ ...prev, avatarStateActive: true }));
      toast({
        title: "AVATAR STATE ACTIVATED!",
        description: "You are now invincible for 10 seconds!",
        duration: 5000,
      });
      
      // Deactivate after 10 seconds
      setTimeout(() => {
        setGameStats(prev => ({ ...prev, avatarStateActive: false }));
      }, 10000);
    }
  };

  const takeDamage = () => {
    setGameStats(prev => {
      const newHealth = prev.health - 1;
      if (newHealth <= 0) {
        onGameOver(prev);
      }
      return { ...prev, health: newHealth };
    });
  };

  const collectToken = (element: Element) => {
    setGameStats(prev => ({
      ...prev,
      [`${element}Tokens`]: prev[`${element}Tokens` as keyof GameStats] as number + 1,
      score: prev.score + 100
    }));
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ElementalZone element={currentElement} />
      
      <GameHUD 
        player={player} 
        stats={gameStats} 
        currentElement={currentElement}
      />
      
      <TouchController onTouchAction={handleTouchAction} />
      
      {/* Character (for now just a placeholder) */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-air-primary to-water-primary animate-float shadow-lg" />
      </div>
    </div>
  );
}