import { useState, useEffect, useRef } from "react";
import { Player, Element, GameStats, TouchAction } from "@/types/game";
import { GameHUD } from "./GameHUD";
import { ScrollingBackground } from "./ScrollingBackground";
import { SubwaySurfersMovement } from "./SubwaySurfersMovement";
import { SubwaySurfersObstacles } from "./SubwaySurfersObstacles";
import { GameInstructions } from "./GameInstructions";
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
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerLane, setPlayerLane] = useState<'left' | 'center' | 'right'>('center');
  const [playerState, setPlayerState] = useState<'running' | 'jumping' | 'rolling' | 'sliding'>('running');
  const gameLoopRef = useRef<number>();
  const lastElementSwitch = useRef(Date.now());
  const avatarStateTimeoutRef = useRef<NodeJS.Timeout>();

  const handleStartGame = () => {
    setShowInstructions(false);
    setGameStarted(true);
  };

  // Game loop
  useEffect(() => {
    if (!gameStarted) return;
    
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
  }, [currentElement, gameSpeed, toast, gameStarted]);

  const handleTouchAction = (action: TouchAction) => {
    setLastAction(action);
    
    // Update player state based on action
    switch (action) {
      case 'swipe-up':
        setPlayerState('jumping');
        setTimeout(() => setPlayerState('running'), 800);
        break;
      case 'swipe-down':
        setPlayerState('rolling');
        setTimeout(() => setPlayerState('running'), 600);
        break;
      case 'tap-hold':
        setPlayerState('sliding');
        setTimeout(() => setPlayerState('running'), 1000);
        break;
      case 'double-tap':
        // Fire blast effect
        break;
    }
    
    // Play action sound
    playActionSound(action, currentElement);
    
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
    <div className="relative h-screen w-full overflow-hidden bg-gray-900">
      {/* Scrolling Background */}
      <ScrollingBackground element={currentElement} gameSpeed={gameSpeed} />
      
      {/* Game HUD */}
      <GameHUD 
        player={player} 
        stats={gameStats} 
        currentElement={currentElement}
      />
      
      {gameStarted && (
        <>
          {/* Subway Surfers Style Movement System */}
          <SubwaySurfersMovement
            player={player}
            currentElement={currentElement}
            avatarStateActive={gameStats.avatarStateActive}
            onTouchAction={handleTouchAction}
            lastAction={lastAction}
            onLaneChange={setPlayerLane}
            onStateChange={setPlayerState}
          />
          
          {/* Obstacles and Collectibles */}
          <SubwaySurfersObstacles
            currentElement={currentElement}
            gameSpeed={gameSpeed}
            avatarStateActive={gameStats.avatarStateActive}
            onObstacleHit={takeDamage}
            onTokenCollected={collectToken}
            onCoinCollected={collectCoin}
            playerLane={playerLane}
            playerState={playerState}
          />
        </>
      )}

      {/* Avatar State Full Screen Effect */}
      {gameStats.avatarStateActive && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-air-primary/10 via-water-primary/10 to-fire-primary/10 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-6xl sm:text-8xl font-bold bg-gradient-to-r from-air-primary via-water-primary to-fire-primary bg-clip-text text-transparent animate-pulse-glow text-center">
              AVATAR STATE
            </div>
            <div className="text-center text-white mt-4 text-xl animate-bounce">
              INVINCIBLE!
            </div>
          </div>
        </div>
      )}

      {/* Game Instructions Overlay */}
      {showInstructions && (
        <GameInstructions onClose={handleStartGame} />
      )}

      {/* Speed indicator */}
      {gameStarted && (
        <div className="absolute top-20 right-4 z-30 bg-black/50 text-white px-3 py-1 rounded text-sm">
          Speed: {gameSpeed.toFixed(1)}x
        </div>
      )}
    </div>
  );
}