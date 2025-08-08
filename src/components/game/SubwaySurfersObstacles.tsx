import { useState, useEffect, useRef } from "react";
import { Element, GameStats } from "@/types/game";

interface SubwaySurfersObstaclesProps {
  currentElement: Element;
  gameSpeed: number;
  avatarStateActive: boolean;
  onObstacleHit: () => void;
  onTokenCollected: (element: Element) => void;
  onCoinCollected: () => void;
  playerLane: 'left' | 'center' | 'right';
  playerState: 'running' | 'jumping' | 'rolling' | 'sliding';
}

type Lane = 'left' | 'center' | 'right';

interface SubwayObstacle {
  id: string;
  type: 'train' | 'barrier' | 'low-barrier' | 'tunnel';
  lane: Lane;
  position: number; // Distance from bottom of screen
  width: number;
  height: number;
  canJump: boolean; // Can be jumped over
  canSlide: boolean; // Can be slid under
  element: Element;
}

interface Collectible {
  id: string;
  type: 'coin' | 'token' | 'powerup';
  lane: Lane;
  position: number;
  element?: Element;
  collected: boolean;
}

export function SubwaySurfersObstacles({
  currentElement,
  gameSpeed,
  avatarStateActive,
  onObstacleHit,
  onTokenCollected,
  onCoinCollected,
  playerLane,
  playerState
}: SubwaySurfersObstaclesProps) {
  const [obstacles, setObstacles] = useState<SubwayObstacle[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  
  const spawnTimerRef = useRef<NodeJS.Timeout>();
  const moveTimerRef = useRef<NodeJS.Timeout>();
  const collisionTimerRef = useRef<NodeJS.Timeout>();

  const lanes: Lane[] = ['left', 'center', 'right'];
  const lanePositions = {
    left: 25,
    center: 50,
    right: 75
  };

  // Subway Surfers style obstacle types
  const obstacleTypes = {
    train: { width: 80, height: 100, canJump: false, canSlide: false }, // Must change lanes
    barrier: { width: 60, height: 60, canJump: true, canSlide: false }, // Can jump over
    'low-barrier': { width: 60, height: 40, canJump: false, canSlide: true }, // Can slide under
    tunnel: { width: 80, height: 80, canJump: false, canSlide: true } // Can slide under
  };

  // Spawn obstacles and collectibles
  useEffect(() => {
    const spawnItems = () => {
      const now = Date.now();
      
      // DEBUG: Always spawn obstacles for immediate testing
      if (true) {
        const obstacleType = Math.random() < 0.4 ? 'train' : 
                           Math.random() < 0.6 ? 'barrier' : 
                           Math.random() < 0.8 ? 'low-barrier' : 'tunnel';
        
        const config = obstacleTypes[obstacleType as keyof typeof obstacleTypes];
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];

        const newObstacle: SubwayObstacle = {
          id: `obstacle-${now}-${Math.random()}`,
          type: obstacleType as 'train' | 'barrier' | 'low-barrier' | 'tunnel',
          lane: randomLane,
          position: 0, // Start at top of screen
          width: config.width,
          height: config.height,
          canJump: config.canJump,
          canSlide: config.canSlide,
          element: currentElement
        };

        setObstacles(prev => {
          console.log('Spawning obstacle:', newObstacle.type, 'in lane:', newObstacle.lane, 'at position:', newObstacle.position);
          return [...prev, newObstacle];
        });
      }

      // Spawn collectibles more frequently
      if (Math.random() < 0.6) {
        const collectibleType = Math.random() < 0.7 ? 'coin' : 'token';
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];

        const newCollectible: Collectible = {
          id: `collectible-${now}-${Math.random()}`,
          type: collectibleType,
          lane: randomLane,
          position: 0,
          element: collectibleType === 'token' ? currentElement : undefined,
          collected: false
        };

        setCollectibles(prev => [...prev, newCollectible]);
      }
    };

    spawnTimerRef.current = setInterval(spawnItems, Math.max(500 - gameSpeed * 20, 200));

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [currentElement, gameSpeed]);

  // Move obstacles and collectibles
  useEffect(() => {
    const moveItems = () => {
      const moveSpeed = gameSpeed * 8;

      setObstacles(prev => prev
        .map(obstacle => ({
          ...obstacle,
          position: obstacle.position + moveSpeed
        }))
        .filter(obstacle => obstacle.position < window.innerHeight + 200 && obstacle.position > -200)
      );

      setCollectibles(prev => prev
        .map(collectible => ({
          ...collectible,
          position: collectible.position + moveSpeed
        }))
        .filter(collectible => collectible.position < window.innerHeight + 100 && !collectible.collected)
      );
    };

    moveTimerRef.current = setInterval(moveItems, 16); // 60fps

    return () => {
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    };
  }, [gameSpeed]);

  // Collision detection
  useEffect(() => {
    const checkCollisions = () => {
      const playerY = window.innerHeight - 160; // Player's Y position (bottom-40 = 160px from bottom)
      const playerWidth = 64;
      const playerHeight = 80;

      // Check obstacle collisions
      obstacles.forEach(obstacle => {
        const obstacleY = obstacle.position;
        
        // Check if obstacle is in player's lane and collision range
        if (obstacle.lane === playerLane && 
            obstacleY + obstacle.height > playerY && 
            obstacleY < playerY + playerHeight) {
          
          let collision = true;

          // Check if player can avoid obstacle
          if (obstacle.canJump && playerState === 'jumping') {
            collision = false; // Jumped over
          } else if (obstacle.canSlide && (playerState === 'rolling' || playerState === 'sliding')) {
            collision = false; // Slid under
          } else if (avatarStateActive) {
            collision = false; // Avatar state invincibility
          }

          if (collision) {
            onObstacleHit();
            setObstacles(prev => prev.filter(o => o.id !== obstacle.id));
          } else if (!avatarStateActive) {
            // Successful avoidance - remove obstacle and give bonus
            setObstacles(prev => prev.filter(o => o.id !== obstacle.id));
            onCoinCollected(); // Reward for skill
          }
        }
      });

      // Check collectible collisions
      collectibles.forEach(collectible => {
        const collectibleY = collectible.position;
        
        if (collectible.lane === playerLane && 
            !collectible.collected &&
            collectibleY + 40 > playerY && 
            collectibleY < playerY + playerHeight) {
          
          if (collectible.type === 'coin') {
            onCoinCollected();
          } else if (collectible.type === 'token' && collectible.element) {
            onTokenCollected(collectible.element);
          }

          setCollectibles(prev => prev.map(c => 
            c.id === collectible.id ? { ...c, collected: true } : c
          ));
        }
      });
    };

    collisionTimerRef.current = setInterval(checkCollisions, 16);

    return () => {
      if (collisionTimerRef.current) clearInterval(collisionTimerRef.current);
    };
  }, [obstacles, collectibles, playerLane, playerState, avatarStateActive, onObstacleHit, onTokenCollected, onCoinCollected]);

  const getObstacleColor = (obstacle: SubwayObstacle) => {
    switch (obstacle.element) {
      case 'air': return 'bg-air-primary';
      case 'water': return 'bg-water-primary';
      case 'earth': return 'bg-earth-primary';
      case 'fire': return 'bg-fire-primary';
    }
  };

  const getActionHint = (obstacle: SubwayObstacle) => {
    if (obstacle.canJump && obstacle.canSlide) return '↕️';
    if (obstacle.canJump) return '⬆️ JUMP';
    if (obstacle.canSlide) return '⬇️ SLIDE';
    return '← → DODGE';
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* DEBUG: Test obstacle that should always be visible */}
      <div
        className="absolute bg-red-500 rounded-lg border-4 border-white shadow-lg animate-pulse"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          top: '100px',
          width: '80px',
          height: '80px',
          zIndex: 50
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
          TEST
        </div>
      </div>

      {/* Render obstacles */}
      {obstacles.map(obstacle => (
        <div
          key={obstacle.id}
          className={`absolute ${getObstacleColor(obstacle)} rounded-lg border-4 border-white/30 shadow-lg`}
          style={{
            left: `${lanePositions[obstacle.lane]}%`,
            transform: 'translateX(-50%)',
            top: `${obstacle.position}px`,
            width: `${obstacle.width}px`,
            height: `${obstacle.height}px`,
            zIndex: 15
          }}
        >
          {/* Obstacle type indicator */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold text-xs">
            <div className="text-2xl mb-1">
              {obstacle.type === 'train' ? '🚂' :
               obstacle.type === 'barrier' ? '🚧' :
               obstacle.type === 'low-barrier' ? '⬜' : '🕳️'}
            </div>
            <div className="bg-black/50 px-2 py-1 rounded text-yellow-300">
              {getActionHint(obstacle)}
            </div>
          </div>
        </div>
      ))}

      {/* Render collectibles */}
      {collectibles.map(collectible => (
        !collectible.collected && (
          <div
            key={collectible.id}
            className={`absolute animate-spin ${
              collectible.type === 'coin' ? 'w-8 h-8 bg-yellow-400 rounded-full' :
              collectible.type === 'token' ? `w-10 h-10 rounded-full ${
                collectible.element === 'air' ? 'bg-air-primary' :
                collectible.element === 'water' ? 'bg-water-primary' :
                collectible.element === 'earth' ? 'bg-earth-primary' :
                'bg-fire-primary'
              }` : 'w-12 h-12 bg-purple-500 rounded'
            } shadow-lg border-2 border-white/50`}
            style={{
              left: `${lanePositions[collectible.lane]}%`,
              transform: 'translateX(-50%)',
              top: `${collectible.position}px`,
              zIndex: 16
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
              {collectible.type === 'coin' ? '💰' :
               collectible.type === 'token' ? (
                 collectible.element === 'air' ? '💨' : 
                 collectible.element === 'water' ? '💧' :
                 collectible.element === 'earth' ? '🗿' : '🔥'
               ) : '⭐'}
            </div>
          </div>
        )
      ))}

      {/* DEBUG: Show obstacle count */}
      <div className="absolute top-4 left-4 bg-black/80 text-white p-2 rounded text-sm z-50">
        Active Obstacles: {obstacles.length}<br/>
        Active Collectibles: {collectibles.length}<br/>
        Player Lane: {playerLane}<br/>
        Player State: {playerState}
      </div>

      {/* Lane dividers for visual clarity */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-white/20" />
        <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-white/20" />
      </div>
    </div>
  );
}