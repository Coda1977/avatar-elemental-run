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
      const spawnRate = Math.max(1500 - (gameSpeed * 200), 800);
      
      if (timeSinceLastSpawn > spawnRate) {
        // Spawn obstacle
        if (Math.random() < 0.8) { // 80% chance for obstacle
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
        
        // Spawn token (20% chance)
        if (Math.random() < 0.2) {
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
        
        // Spawn coin (30% chance)
        if (Math.random() < 0.3) {
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

  // Continuous collision detection - runs every frame
  useEffect(() => {
    const checkCollisions = () => {
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
          
          if (avatarStateActive) {
            // Avatar state: automatically destroy obstacle
            setObstacles(prev => prev.filter(o => o.id !== obstacle.id));
          } else if (config && lastAction === config.correctAction) {
            // Correct action: destroy obstacle successfully
            setObstacles(prev => prev.filter(o => o.id !== obstacle.id));
            // Add score bonus for successful obstacle avoidance
            onCoinCollected(); // Give a coin as reward
          } else {
            // Wrong action or no action: take damage and remove obstacle
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
    };

    // Run collision detection continuously
    const collisionInterval = setInterval(checkCollisions, 16); // ~60fps

    return () => clearInterval(collisionInterval);
  }, [obstacles, tokens, coins, avatarStateActive, lastAction, onObstacleHit, onTokenCollected, onCoinCollected]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {/* Render obstacles */}
      {obstacles.map(obstacle => {
        const config = obstacleConfigs[obstacle.element].find(c => c.type === obstacle.type);
        const actionIcons = {
          'swipe-up': '↑ SWIPE UP',
          'swipe-down': '↓ SWIPE DOWN', 
          'tap-hold': '⏺ HOLD',
          'double-tap': '⚡ DOUBLE TAP'
        };
        
        return (
          <div
            key={obstacle.id}
            className={`absolute rounded-lg ${config?.color} opacity-90 animate-pulse-glow border-4 border-white/40 shadow-lg`}
            style={{
              left: obstacle.position.x,
              top: obstacle.position.y,
              width: obstacle.width,
              height: obstacle.height,
              zIndex: 15
            }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center text-xs font-bold text-white bg-black/20 rounded">
              <div className="text-yellow-300 mb-1">
                {actionIcons[config?.correctAction as keyof typeof actionIcons] || 'ACTION'}
              </div>
              <div className="text-white/90">
                {obstacle.type.replace('-', ' ').toUpperCase()}
              </div>
            </div>
          </div>
        );
      })}

      {/* Render element tokens */}
      {tokens.map(token => (
        !token.collected && (
          <div
            key={token.id}
            className={`absolute w-12 h-12 rounded-full animate-float shadow-lg border-4 border-white/70 ${
              token.element === 'air' ? 'bg-air-primary shadow-glow-air' :
              token.element === 'water' ? 'bg-water-primary shadow-glow-water' :
              token.element === 'earth' ? 'bg-earth-primary shadow-glow-earth' :
              'bg-fire-primary shadow-glow-fire'
            }`}
            style={{
              left: token.position.x,
              top: token.position.y,
              zIndex: 16
            }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center text-xs font-bold text-white">
              <div className="text-lg">
                {token.element === 'air' ? '💨' : 
                 token.element === 'water' ? '💧' :
                 token.element === 'earth' ? '🗿' : '🔥'}
              </div>
              <div className="text-xs">
                {token.element.toUpperCase()}
              </div>
            </div>
          </div>
        )
      ))}

      {/* Render coins */}
      {coins.map(coin => (
        !coin.collected && (
          <div
            key={coin.id}
            className="absolute w-10 h-10 bg-yellow-400 rounded-full animate-float shadow-lg border-4 border-yellow-600"
            style={{
              left: coin.position.x,
              top: coin.position.y,
              zIndex: 16
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-yellow-900">
              💰
            </div>
          </div>
        )
      ))}
    </div>
  );
}