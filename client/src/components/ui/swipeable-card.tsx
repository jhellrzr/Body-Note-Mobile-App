import { useRef, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useSwipe } from '@/hooks/use-swipe';
import { useIsMobile } from '@/hooks/use-mobile';
import { lightHapticFeedback, mediumHapticFeedback } from '@/lib/haptics';

interface SwipeAction {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  action: () => void;
}

interface SwipeableCardProps {
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function SwipeableCard({
  leftAction,
  rightAction,
  children,
  className,
  header,
  footer
}: SwipeableCardProps) {
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startXRef = useRef(0);
  const isMobile = useIsMobile();
  
  // Threshold for triggering actions (in pixels)
  const actionThreshold = 100;
  
  // Don't enable swipe actions on desktop
  const isSwipeable = isMobile && (leftAction || rightAction);
  
  const { handlers } = useSwipe({
    onSwipeLeft: () => {
      if (rightAction) {
        mediumHapticFeedback();
        rightAction.action();
        resetPosition();
      }
    },
    onSwipeRight: () => {
      if (leftAction) {
        mediumHapticFeedback();
        leftAction.action();
        resetPosition();
      }
    }
  }, { threshold: actionThreshold });
  
  const resetPosition = () => {
    setSwiping(false);
    setOffset(0);
  };
  
  // Touch event handlers for smooth dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isSwipeable) return;
    
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    setSwiping(true);
    
    // Call the swipe hook's touch start handler
    handlers.onTouchStart(e);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping || !isSwipeable) return;
    
    const touch = e.touches[0];
    const diff = touch.clientX - startXRef.current;
    
    // Restrict movement based on available actions
    if ((diff > 0 && !leftAction) || (diff < 0 && !rightAction)) {
      return;
    }
    
    // Apply resistance as the card is dragged further
    const resistance = Math.abs(diff) > 100 ? 0.2 : 0.8;
    setOffset(diff * resistance);
    
    // Provide light haptic feedback at certain thresholds
    const thresholds = [30, 60, 90];
    const absOffset = Math.abs(diff);
    
    if (thresholds.some(threshold => absOffset >= threshold && absOffset < threshold + 5)) {
      lightHapticFeedback();
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!swiping || !isSwipeable) return;
    
    // Handle swipe action if dragged far enough
    if (Math.abs(offset) >= actionThreshold) {
      // The swipe hook will handle the actual action
    } else {
      // Reset position with animation if not swiped far enough
      resetPosition();
    }
    
    // Call the swipe hook's touch end handler
    handlers.onTouchEnd(e);
  };
  
  return (
    <div className="relative overflow-hidden">
      {/* Left action indicator */}
      {leftAction && (
        <div 
          className="absolute inset-y-0 left-0 flex items-center justify-center px-4"
          style={{
            opacity: offset > 0 ? Math.min(offset / actionThreshold, 1) : 0,
            backgroundColor: leftAction.bgColor
          }}
        >
          <div className={cn("text-white", leftAction.color)}>
            {leftAction.icon}
          </div>
        </div>
      )}
      
      {/* Right action indicator */}
      {rightAction && (
        <div 
          className="absolute inset-y-0 right-0 flex items-center justify-center px-4"
          style={{
            opacity: offset < 0 ? Math.min(Math.abs(offset) / actionThreshold, 1) : 0,
            backgroundColor: rightAction.bgColor
          }}
        >
          <div className={cn("text-white", rightAction.color)}>
            {rightAction.icon}
          </div>
        </div>
      )}
      
      {/* Card with swipe behavior */}
      <Card
        className={cn("relative transition-transform", className)}
        style={{
          transform: `translateX(${offset}px)`,
          transition: swiping ? 'none' : 'transform 0.3s ease'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {header && <CardHeader>{header}</CardHeader>}
        <CardContent>{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </div>
  );
}