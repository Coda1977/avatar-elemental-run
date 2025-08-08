import { useRef, useState } from "react";
import { TouchAction } from "@/types/game";

interface TouchControllerProps {
  onTouchAction: (action: TouchAction) => void;
}

export function TouchController({ onTouchAction }: TouchControllerProps) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const holdTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const currentTime = Date.now();
    
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: currentTime
    };

    // Check for double tap
    if (currentTime - lastTap < 300) {
      // Double tap detected
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
      onTouchAction('double-tap');
      setLastTap(0); // Reset to prevent triple tap issues
      return;
    }
    
    setLastTap(currentTime);

    // Start hold timer
    holdTimeoutRef.current = setTimeout(() => {
      setIsHolding(true);
      onTouchAction('tap-hold');
    }, 500); // 500ms for hold detection
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }

    if (isHolding) {
      setIsHolding(false);
      return;
    }

    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Ignore if held too long (already processed as hold)
    if (deltaTime > 400) return;

    // Calculate swipe direction
    const minSwipeDistance = 50;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absY > absX && absY > minSwipeDistance) {
      // Vertical swipe
      if (deltaY < 0) {
        onTouchAction('swipe-up');
      } else {
        onTouchAction('swipe-down');
      }
    }
    // If no clear swipe and not a double tap, it was just a tap
    // (but we already handled double tap above)

    touchStartRef.current = null;
  };

  return (
    <>
      {/* Touch area covering the entire screen */}
      <div 
        className="absolute inset-0 z-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      />

      {/* Visual feedback for controls */}
      <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          <div className="bg-card/60 backdrop-blur-sm rounded-lg p-3 border border-border/30">
            <p className="text-xs text-center text-muted-foreground mb-1">Air</p>
            <p className="text-xs text-center text-air-primary font-medium">Swipe Up</p>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-lg p-3 border border-border/30">
            <p className="text-xs text-center text-muted-foreground mb-1">Water</p>
            <p className="text-xs text-center text-water-primary font-medium">Swipe Down</p>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-lg p-3 border border-border/30">
            <p className="text-xs text-center text-muted-foreground mb-1">Earth</p>
            <p className="text-xs text-center text-earth-primary font-medium">Hold</p>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-lg p-3 border border-border/30">
            <p className="text-xs text-center text-muted-foreground mb-1">Fire</p>
            <p className="text-xs text-center text-fire-primary font-medium">Double Tap</p>
          </div>
        </div>
      </div>

      {/* Hold indicator */}
      {isHolding && (
        <div className="absolute inset-0 bg-earth-primary/20 flex items-center justify-center z-15 pointer-events-none">
          <div className="bg-earth-primary text-background px-4 py-2 rounded-full font-bold animate-pulse">
            EARTH SHIELD ACTIVE
          </div>
        </div>
      )}
    </>
  );
}