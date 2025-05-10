import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { lightHapticFeedback, successHapticFeedback } from '@/lib/haptics';
import { useIsMobile } from '@/hooks/use-mobile';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isMobile = useIsMobile();
  
  // Only apply pull-to-refresh on mobile devices
  if (!isMobile) {
    return <>{children}</>;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull to refresh when at the top of the page
    if (window.scrollY <= 0) {
      setIsPulling(true);
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;
    
    // Only allow pulling down, not up
    if (deltaY <= 0) {
      setPullProgress(0);
      return;
    }

    // Calculate a pull distance with diminishing returns for a natural feel
    const pullDistance = Math.min(Math.sqrt(deltaY) * 5, 80);
    
    // Convert pull distance to a percentage (0-100)
    const progress = Math.min((pullDistance / 80) * 100, 100);
    setPullProgress(progress);
    
    // Give some haptic feedback at 25%, 50%, and 75% thresholds
    if ((progress >= 25 && pullProgress < 25) || 
        (progress >= 50 && pullProgress < 50) ||
        (progress >= 75 && pullProgress < 75)) {
      lightHapticFeedback();
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    // If pulled past the threshold, trigger refresh
    if (pullProgress >= 70) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
        // Success feedback
        successHapticFeedback();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setPullProgress(0);
      }
    } else {
      // Reset progress if not pulled far enough
      setPullProgress(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div 
        className="absolute left-0 right-0 top-0 flex justify-center transition-transform"
        style={{ 
          transform: `translateY(${isPulling || isRefreshing ? `${Math.max(pullProgress * 0.8, isRefreshing ? 40 : 0)}px` : '-50px'})`,
          opacity: isPulling || isRefreshing ? 1 : 0,
          transition: isPulling ? 'none' : 'all 0.3s ease'
        }}
      >
        <div className="bg-primary/10 rounded-full p-2 flex items-center justify-center">
          {isRefreshing ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <svg 
              className="h-6 w-6 text-primary transition-transform"
              style={{ transform: `rotate(${Math.min(pullProgress * 1.8, 180)}deg)` }}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <polyline points="7 13 12 18 17 13" />
              <polyline points="7 6 12 11 17 6" />
            </svg>
          )}
        </div>
      </div>
      
      {/* Content wrapper */}
      <div 
        style={{ 
          transform: `translateY(${isPulling ? `${pullProgress * 0.5}px` : '0'})`,
          transition: isPulling ? 'none' : 'transform 0.3s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
}