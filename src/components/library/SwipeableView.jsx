import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * A component that supports swipe gestures with configurable directions
 * Particularly useful for manga reading on touch devices
 */
const SwipeableView = ({
                         children,
                         onSwipeLeft,
                         onSwipeRight,
                         onSwipeUp,
                         onSwipeDown,
                         onTap,
                         swipeThreshold = 50,
                         className,
                         disableSwipe = false,
                         tapZones = false, // Whether to use tap zones (left/center/right)
                         tapZonesRatio = [1/3, 1/3, 1/3], // What ratio of the screen each zone takes
                         tapZonesDirection = 'horizontal', // 'horizontal' or 'vertical'
                         ...props
                       }) => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  const elRef = useRef(null);

  // Calculate distance between touch points
  const distance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  // Handle the start of a touch
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
    setIsSwiping(false);
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });

    // Check if we're definitely swiping (moved beyond a minimum threshold)
    if (distance(touchStart, { x: touch.clientX, y: touch.clientY }) > 10) {
      setIsSwiping(true);
    }
  };

  // Handle the end of a touch
  const handleTouchEnd = (e) => {
    // Calculate swipe distance
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // If we're not swiping, this was a tap
    if (!isSwiping) {
      handleTap(e);
      return;
    }

    // Don't process if swipe is disabled
    if (disableSwipe) return;

    // Determine swipe direction based on largest movement axis
    if (absDx > absDy && absDx > swipeThreshold) {
      // Horizontal swipe
      if (dx > 0) {
        onSwipeRight && onSwipeRight();
      } else {
        onSwipeLeft && onSwipeLeft();
      }
    } else if (absDy > swipeThreshold) {
      // Vertical swipe
      if (dy > 0) {
        onSwipeDown && onSwipeDown();
      } else {
        onSwipeUp && onSwipeUp();
      }
    }
  };

  // Handle tap with optional tap zones
  const handleTap = (e) => {
    if (!tapZones || !elRef.current) {
      // Simple tap without zones
      onTap && onTap();
      return;
    }

    // Get the position of the tap
    const rect = elRef.current.getBoundingClientRect();
    const x = touchEnd.x - rect.left;
    const y = touchEnd.y - rect.top;

    // Calculate relative position (0-1)
    const relX = x / rect.width;
    const relY = y / rect.height;

    // Determine which zone was tapped
    let zone;
    if (tapZonesDirection === 'horizontal') {
      // Calculate cumulative ratios
      const leftZoneEnd = tapZonesRatio[0];
      const centerZoneEnd = leftZoneEnd + tapZonesRatio[1];

      if (relX < leftZoneEnd) {
        zone = 'left';
      } else if (relX < centerZoneEnd) {
        zone = 'center';
      } else {
        zone = 'right';
      }
    } else {
      // Vertical zones
      const topZoneEnd = tapZonesRatio[0];
      const middleZoneEnd = topZoneEnd + tapZonesRatio[1];

      if (relY < topZoneEnd) {
        zone = 'top';
      } else if (relY < middleZoneEnd) {
        zone = 'middle';
      } else {
        zone = 'bottom';
      }
    }

    onTap && onTap(zone);
  };

  // Create styles for tap zone visualization (for debugging)
  const tapZoneStyles = () => {
    if (!tapZones) return null;

    if (tapZonesDirection === 'horizontal') {
      return (
        <>
          <div className="absolute top-0 bottom-0 left-0 opacity-5 bg-red-500 hover:opacity-10 pointer-events-none"
               style={{ width: `${tapZonesRatio[0] * 100}%` }} />
          <div className="absolute top-0 bottom-0 opacity-5 bg-green-500 hover:opacity-10 pointer-events-none"
               style={{ left: `${tapZonesRatio[0] * 100}%`, width: `${tapZonesRatio[1] * 100}%` }} />
          <div className="absolute top-0 bottom-0 right-0 opacity-5 bg-blue-500 hover:opacity-10 pointer-events-none"
               style={{ width: `${tapZonesRatio[2] * 100}%` }} />
        </>
      );
    } else {
      return (
        <>
          <div className="absolute top-0 left-0 right-0 opacity-5 bg-red-500 hover:opacity-10 pointer-events-none"
               style={{ height: `${tapZonesRatio[0] * 100}%` }} />
          <div className="absolute left-0 right-0 opacity-5 bg-green-500 hover:opacity-10 pointer-events-none"
               style={{ top: `${tapZonesRatio[0] * 100}%`, height: `${tapZonesRatio[1] * 100}%` }} />
          <div className="absolute bottom-0 left-0 right-0 opacity-5 bg-blue-500 hover:opacity-10 pointer-events-none"
               style={{ height: `${tapZonesRatio[2] * 100}%` }} />
        </>
      );
    }
  };

  return (
    <div
      ref={elRef}
      className={cn("relative", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {children}
      {/* Render tap zones for debugging */}
      {false && tapZoneStyles()}
    </div>
  );
};

export default SwipeableView;