import { useState, useEffect, useRef, useCallback } from "react";
import { Element, Obstacle, TouchAction, GameStats } from "@/types/game";

interface ObstacleSystemProps {
  currentElement: Element;
  gameSpeed: number;
  avatarStateActive: boolean;
  onObstacleHit: () => void;
  onTokenCollected: (element: Element) => void;
  onCoinCollected: () => void;
  lastAction: TouchAction | null;
  gameStats: GameStats;
}

interface Token {
  id: string;
  element: Element;
  position: { x: number; y: number };
  collected: boolean;
}

interface Coin {
  id: string;
  position: { x: number; y: number };
  collected: boolean;
}

// Obstacle configurations for each element
const obstacleConfigs = {
  air: [
    { type: 'floating-debris', correctAction: 'swipe-up', width: 80, height: 40, color: 'bg-air-primary' },
    { type: 'wind-gust', correctAction: 'swipe-up', width: 120, height: 60, color: 'bg-air-secondary' },
    { type: 'moving-platform', correctAction: 'swipe-up', width: 100, height: 30, color: 'bg-air-accent' }
  ],
  water: [
    { type: 'rolling-wave', correctAction: 'swipe-down', width: 150, height: 50, color: 'bg-water-primary' },
    { type: 'falling-icicle', correctAction: 'swipe-down', width: 20, height: 80, color: 'bg-water-secondary' },
    { type: 'ice-platform', correctAction: 'swipe-down', width: 120, height: 40, color: 'bg-water-accent' }
  ],
  earth: [
    { type: 'boulder', correctAction: 'tap-hold', width: 60, height: 60, color: 'bg-earth-primary' },
    { type: 'rock-slide', correctAction: 'tap-hold', width: 200, height: 80, color: 'bg-earth-secondary' },
    { type: 'ground-spike', correctAction: 'tap-hold', width: 40, height: 100, color: 'bg-earth-accent' }
  ],
  fire: [
    { type: 'fire-wall', correctAction: 'double-tap', width: 100, height: 120, color: 'bg-fire-primary' },
    { type: 'lava-rock', correctAction: 'double-tap', width: 50, height: 50, color: 'bg-fire-secondary' },
    { type: 'fire-trap', correctAction: 'double-tap', width: 80, height: 80, color: 'bg-fire-accent' }
  ]
};

export function ObstacleSystem({ 
  currentElement, 
  gameSpeed, 
  avatarStateActive, 
  onObstacleHit, 
  onTokenCollected, 
  onCoinCollected,
  lastAction,
  gameStats
}: ObstacleSystemProps) {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const lastSpawnTime = useRef(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Memoize obstacle config for current element to avoid recreating objects
  const currentObstacleConfigs = useCallback(() => obstacleConfigs[currentElement], [currentElement]);

  // Spawn obstacles, tokens, and coins
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastSpawn = now - lastSpawnTime.current;
      
      // Adjust spawn rate based on game speed
      const spawnRate = Math.max(800 - (gameSpeed * 100), 300);
      
      if (timeSinceLastSpawn > spawnRate) {
        // Spawn obstacle
        if (Math.random() < 0.7) { // 70% chance for obstacle
          const config = obstacleConfigs[currentElement];
          const randomConfig = config[Math.floor(Math.random() * config.length)];
          
          const newObstacle: Obstacle = {
            id: `obstacle-${now}-${Math.random()}`,
            type: randomConfig.type,
            element: currentElement,
            position: { 
              x: window.innerWidth, 
              y: Math.random() * (window.innerHeight - 200) + 100 
            },
            width: randomConfig.width,
            height: randomConfig.height
          };
          
          setObstacles(prev => [...prev, newObstacle]);
        }
        
        // Spawn token (15% chance)
        if (Math.random() < 0.15) {
          const newToken: Token = {
            id: `token-${now}-${Math.random()}`,
            element: currentElement,
            position: { 
              x: window.innerWidth, 
              y: Math.random() * (window.innerHeight - 300) + 150 
            },
            collected: false
          };
          
          setTokens(prev => [...prev, newToken]);
        }
        
        // Spawn coin (25% chance)
        if (Math.random() < 0.25) {
          const newCoin: Coin = {
            id: `coin-${now}-${Math.random()}`,
            position: { 
              x: window.innerWidth, 
              y: Math.random() * (window.innerHeight - 300) + 150 
            },
            collected: false
          };
          
          setCoins(prev => [...prev, newCoin]);
        }
        
        lastSpawnTime.current = now;
      }
    }, 100);

    return () => clearInterval(spawnInterval);
  }, [currentElement, gameSpeed]);

  // Move obstacles, tokens, and coins using requestAnimationFrame for better performance
  useEffect(() => {
    const moveObjects = () => {
      const moveSpeed = gameSpeed * 5;
      
      // Batch all state updates to avoid multiple re-renders
      setObstacles(prev => prev
        .map(obstacle => ({
          ...obstacle,
          position: { ...obstacle.position, x: obstacle.position.x - moveSpeed }
        }))
        .filter(obstacle => obstacle.position.x > -200) // Remove off-screen obstacles
      );
      
      setTokens(prev => prev
        .map(token => ({
          ...token,
          position: { ...token.position, x: token.position.x - moveSpeed }
        }))
        .filter(token => token.position.x > -100 && !token.collected)
      );
      
      setCoins(prev => prev
        .map(coin => ({
          ...coin,
          position: { ...coin.position, x: coin.position.x - moveSpeed }
        }))
        .filter(coin => coin.position.x > -100 && !coin.collected)
      );

      animationFrameRef.current = requestAnimationFrame(moveObjects);
    };

    animationFrameRef.current = requestAnimationFrame(moveObjects);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameSpeed]);

  // Collision detection
  useEffect(() => {
    if (!lastAction) return;

    const playerRect = {
      x: window.innerWidth / 2 - 32, // Player is centered
      y: window.innerHeight - 200,
      width: 64,
      height: 64
    };

    // Check obstacle collisions
    obstacles.forEach(obstacle => {
      const obstacleRect = {
        x: obstacle.position.x,
        y: obstacle.position.y,
        width: obstacle.width,
        height: obstacle.height
      };

      // Simple AABB collision detection
      if (playerRect.x < obstacleRect.x + obstacleRect.width &&
          playerRect.x + playerRect.width > obstacleRect.x &&
          playerRect.y < obstacleRect.y + obstacleRect.height &&
          playerRect.y + playerRect.height > obstacleRect.y) {
        
        const config = obstacleConfigs[currentElement].find(c => c.type === obstacle.type);
        
        if (avatarStateActive || (config && lastAction === config.correctAction)) {
          // Obstacle overcome successfully
          setObstacles(prev => prev.filter(o => o.id !== obstacle.id));
        } else {
          // Wrong action or no action - take damage
          onObstacleHit();
          setObstacles(prev => prev.filter(o => o.id !== obstacle.id));
        }
      }
    });

    // Check token collisions
    tokens.forEach(token => {
      if (token.collected) return;
      
      const tokenRect = {
        x: token.position.x,
        y: token.position.y,
        width: 40,
        height: 40
      };

      if (playerRect.x < tokenRect.x + tokenRect.width &&
          playerRect.x + playerRect.width > tokenRect.x &&
          playerRect.y < tokenRect.y + tokenRect.height &&
          playerRect.y + playerRect.height > tokenRect.y) {
        
        onTokenCollected(token.element);
        setTokens(prev => prev.map(t => 
          t.id === token.id ? { ...t, collected: true } : t
        ));
      }
    });

    // Check coin collisions
    coins.forEach(coin => {
      if (coin.collected) return;
      
      const coinRect = {
        x: coin.position.x,
        y: coin.position.y,
        width: 30,
        height: 30
      };

      if (playerRect.x < coinRect.x + coinRect.width &&
          playerRect.x + playerRect.width > coinRect.x &&
          playerRect.y < coinRect.y + coinRect.height &&
          playerRect.y + playerRect.height > coinRect.y) {
        
        onCoinCollected();
        setCoins(prev => prev.map(c => 
          c.id === coin.id ? { ...c, collected: true } : c
        ));
      }
    });
  }, [lastAction, obstacles, tokens, coins, avatarStateActive, onObstacleHit, onTokenCollected, onCoinCollected]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {/* Render obstacles */}
      {obstacles.map(obstacle => {
        const config = obstacleConfigs[obstacle.element].find(c => c.type === obstacle.type);
        return (
          <div
            key={obstacle.id}
            className={`absolute rounded-lg ${config?.color} opacity-80 animate-pulse-glow border-2 border-white/20`}
            style={{
              left: obstacle.position.x,
              top: obstacle.position.y,
              width: obstacle.width,
              height: obstacle.height,
              zIndex: 15
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/80">
              {obstacle.type.replace('-', ' ').toUpperCase()}
            </div>
          </div>
        );
      })}

      {/* Render element tokens */}
      {tokens.map(token => (
        !token.collected && (
          <div
            key={token.id}
            className={`absolute w-10 h-10 rounded-full animate-float shadow-lg border-2 border-white/50 ${
              token.element === 'air' ? 'bg-air-primary' :
              token.element === 'water' ? 'bg-water-primary' :
              token.element === 'earth' ? 'bg-earth-primary' :
              'bg-fire-primary'
            }`}
            style={{
              left: token.position.x,
              top: token.position.y,
              zIndex: 16
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
              {token.element.charAt(0).toUpperCase()}
            </div>
          </div>
        )
      ))}

      {/* Render coins */}
      {coins.map(coin => (
        !coin.collected && (
          <div
            key={coin.id}
            className="absolute w-8 h-8 bg-yellow-400 rounded-full animate-float shadow-lg border-2 border-yellow-600"
            style={{
              left: coin.position.x,
              top: coin.position.y,
              zIndex: 16
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-yellow-900">
              ¥
            </div>
          </div>
        )
      ))}
    </div>
  );
}