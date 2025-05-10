import { useRef, useEffect, useState } from 'react';

type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeOptions {
  threshold?: number; // minimum distance to be considered a swipe
  timeout?: number;   // maximum time for a swipe gesture
}

export function useSwipe(
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
) {
  const { threshold = 50, timeout = 300 } = options;
  const [direction, setDirection] = useState<SwipeDirection>(null);
  
  // Touch start coordinates and timing
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!direction) return;
    
    // Execute the appropriate handler based on direction
    if (direction === 'left' && handlers.onSwipeLeft) {
      handlers.onSwipeLeft();
    } else if (direction === 'right' && handlers.onSwipeRight) {
      handlers.onSwipeRight();
    } else if (direction === 'up' && handlers.onSwipeUp) {
      handlers.onSwipeUp();
    } else if (direction === 'down' && handlers.onSwipeDown) {
      handlers.onSwipeDown();
    }
    
    // Reset direction after handling
    setDirection(null);
  }, [direction, handlers]);

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    startTimeRef.current = Date.now();
  };

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (
      startXRef.current === null ||
      startYRef.current === null ||
      startTimeRef.current === null
    ) {
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startXRef.current;
    const deltaY = touch.clientY - startYRef.current;
    const elapsed = Date.now() - startTimeRef.current;

    // Check if the swipe was fast enough
    if (elapsed > timeout) return;

    // Determine horizontal or vertical swipe based on which has larger movement
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        setDirection(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        setDirection(deltaY > 0 ? 'down' : 'up');
      }
    }

    // Reset refs
    startXRef.current = null;
    startYRef.current = null;
    startTimeRef.current = null;
  };

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd
    },
    direction
  };
}