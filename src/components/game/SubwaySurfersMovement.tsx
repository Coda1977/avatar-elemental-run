import { useState, useEffect, useRef, useCallback } from "react";
import { Element, TouchAction, Player } from "@/types/game";

interface SubwaySurfersMovementProps {
  player: Player;
  currentElement: Element;
  avatarStateActive: boolean;
  onTouchAction: (action: TouchAction) => void;
  lastAction: TouchAction | null;
  onLaneChange: (lane: 'left' | 'center' | 'right') => void;
  onStateChange: (state: 'running' | 'jumping' | 'rolling' | 'sliding') => void;
}

type Lane = 'left' | 'center' | 'right';
type PlayerState = 'running' | 'jumping' | 'rolling' | 'sliding';

export function SubwaySurfersMovement({ 
  player, 
  currentElement, 
  avatarStateActive, 
  onTouchAction, 
  lastAction,
  onLaneChange,
  onStateChange
}: SubwaySurfersMovementProps) {
  const [currentLane, setCurrentLane] = useState<Lane>('center');
  const [playerState, setPlayerState] = useState<PlayerState>('running');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [lastTap, setLastTap] = useState(0);

  // Lane positions (percentage from left)
  const lanePositions = {
    left: '25%',
    center: '50%',
    right: '75%'
  };

  // Handle touch gestures for Subway Surfers style movement
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const currentTime = Date.now();
    
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: currentTime
    };

    // Check for double tap (fire bending)
    if (currentTime - lastTap < 300) {
      onTouchAction('double-tap');
      setLastTap(0);
      return;
    }
    setLastTap(currentTime);
  }, [lastTap, onTouchAction]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    const minSwipeDistance = 50;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (deltaTime < 200 && (absX < minSwipeDistance && absY < minSwipeDistance)) {
      // Quick tap - could be hold start
      return;
    }

    if (absY > absX && absY > minSwipeDistance) {
      // Vertical swipe
      if (deltaY < 0) {
        // Swipe up - JUMP
        setPlayerState('jumping');
        onStateChange('jumping');
        onTouchAction('swipe-up');
        setTimeout(() => {
          setPlayerState('running');
          onStateChange('running');
        }, 800);
      } else {
        // Swipe down - SLIDE/ROLL  
        setPlayerState('rolling');
        onStateChange('rolling');
        onTouchAction('swipe-down');
        setTimeout(() => {
          setPlayerState('running');
          onStateChange('running');
        }, 600);
      }
    } else if (absX > absY && absX > minSwipeDistance) {
      // Horizontal swipe - CHANGE LANES
      if (deltaX < 0 && currentLane !== 'left') {
        // Swipe left
        const newLane = currentLane === 'right' ? 'center' : 'left';
        changeLane(newLane);
      } else if (deltaX > 0 && currentLane !== 'right') {
        // Swipe right  
        const newLane = currentLane === 'left' ? 'center' : 'right';
        changeLane(newLane);
      }
    }

    touchStartRef.current = null;
  }, [currentLane, onTouchAction]);

  const changeLane = useCallback((newLane: Lane) => {
    if (isTransitioning || currentLane === newLane) return;
    
    setIsTransitioning(true);
    setCurrentLane(newLane);
    onLaneChange(newLane);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [currentLane, isTransitioning, onLaneChange]);

  // Handle tap and hold for earth bending
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
  }, []);

  // Long press detection for earth shields
  useEffect(() => {
    if (!touchStartRef.current) return;

    const holdTimeout = setTimeout(() => {
      if (touchStartRef.current) {
        onTouchAction('tap-hold');
      }
    }, 500);

    return () => clearTimeout(holdTimeout);
  }, [onTouchAction]);

  const getPlayerTransform = () => {
    let transform = '';
    
    // Lane position
    transform += `translateX(-50%)`;
    
    // Player state animations
    switch (playerState) {
      case 'jumping':
        transform += ' translateY(-60px) scale(1.1)';
        break;
      case 'rolling':
        transform += ' translateY(20px) scaleY(0.7)';
        break;
      case 'sliding':
        transform += ' translateY(15px) scaleX(1.2)';
        break;
      default:
        transform += ' translateY(0px)';
    }

    return transform;
  };

  const getElementGradient = () => {
    if (avatarStateActive) {
      return 'bg-gradient-to-r from-air-primary via-water-primary to-fire-primary';
    }
    
    switch (currentElement) {
      case 'air': return 'bg-gradient-to-r from-air-primary to-air-secondary';
      case 'water': return 'bg-gradient-to-r from-water-primary to-water-secondary';
      case 'earth': return 'bg-gradient-to-r from-earth-primary to-earth-secondary';
      case 'fire': return 'bg-gradient-to-r from-fire-primary to-fire-secondary';
      default: return 'bg-gradient-to-r from-air-primary to-water-primary';
    }
  };

  return (
    <div className="absolute inset-0 z-10">
      {/* Touch area for gestures */}
      <div 
        className="absolute inset-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      />

      {/* Lane guides (visible for debugging) */}
      <div className="absolute inset-0 pointer-events-none">
        {(['left', 'center', 'right'] as Lane[]).map((lane) => (
          <div 
            key={lane}
            className="absolute top-0 bottom-0 w-1 bg-white/10"
            style={{ left: lanePositions[lane] }}
          />
        ))}
      </div>

      {/* Player character */}
      <div 
        className="absolute bottom-40 transition-all duration-300 ease-out z-20"
        style={{ 
          left: lanePositions[currentLane],
          transform: getPlayerTransform()
        }}
      >
        {/* Player shadow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black/20 rounded-full blur-sm" />
        
        {/* Player avatar */}
        <div 
          className={`w-16 h-20 rounded-lg shadow-lg transition-all duration-200 ${getElementGradient()} ${
            avatarStateActive ? 'animate-pulse-glow shadow-glow-fire scale-110' : ''
          } ${isTransitioning ? 'scale-110' : ''}`}
        >
          {/* Player portrait */}
          <div className="absolute inset-2 rounded-md overflow-hidden">
            <img 
              src={player.portrait} 
              alt={player.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Element indicator */}
          <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-2 border-white ${
            currentElement === 'air' ? 'bg-air-primary' :
            currentElement === 'water' ? 'bg-water-primary' :
            currentElement === 'earth' ? 'bg-earth-primary' :
            'bg-fire-primary'
          } flex items-center justify-center text-xs`}>
            {currentElement === 'air' ? '💨' : 
             currentElement === 'water' ? '💧' :
             currentElement === 'earth' ? '🗿' : '🔥'}
          </div>

          {/* Action feedback */}
          {lastAction && (
            <div className={`absolute inset-0 rounded-lg animate-ping ${
              lastAction === 'swipe-up' ? 'bg-air-primary/30' :
              lastAction === 'swipe-down' ? 'bg-water-primary/30' :
              lastAction === 'tap-hold' ? 'bg-earth-primary/30' :
              'bg-fire-primary/30'
            }`} />
          )}

          {/* Avatar State glow */}
          {avatarStateActive && (
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-air-primary/20 via-water-primary/20 to-fire-primary/20 animate-pulse" />
          )}
        </div>

        {/* Player state indicator */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
          {playerState.toUpperCase()} • {currentLane.toUpperCase()}
        </div>
      </div>

      {/* Movement instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-30 pointer-events-none">
        <div className="bg-black/70 text-white text-xs px-4 py-2 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>← → Swipe to change lanes</div>
            <div>↕ Swipe to jump/slide</div>
          </div>
        </div>
      </div>
    </div>
  );
}