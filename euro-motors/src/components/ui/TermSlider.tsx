// components/ui/TermSlider.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

const monthOptions = [12, 24, 36, 48, 60];

interface TermSliderProps {
  termMonths: number;
  setTermMonths: (months: number) => void;
}

const TermSlider: React.FC<TermSliderProps> = ({ termMonths, setTermMonths }) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getSliderPosition = useCallback((): number => {
    const index = monthOptions.indexOf(termMonths);
    return index !== -1 ? (index / (monthOptions.length - 1)) * 100 : 0;
  }, [termMonths]);

  const getClosestMonth = useCallback((position: number): number => {
    const index = Math.round((position / 100) * (monthOptions.length - 1));
    return monthOptions[Math.max(0, Math.min(monthOptions.length - 1, index))];
  }, []);

  const calculatePositionFromEvent = useCallback((clientX: number): number => {
    if (!sliderRef.current) return 0;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const position = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(0, Math.min(100, position));
  }, []);

  const handleTermChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(e.target.value);
    const newTerm = getClosestMonth(value);
    setTermMonths(newTerm);
  }, [getClosestMonth, setTermMonths]);

  const handleSliderMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    // For touch events, handle the initial position
    if ('touches' in e) {
      const position = calculatePositionFromEvent(e.touches[0].clientX);
      const newTerm = getClosestMonth(position);
      setTermMonths(newTerm);
    } else {
      const position = calculatePositionFromEvent(e.clientX);
      const newTerm = getClosestMonth(position);
      setTermMonths(newTerm);
    }
    
    // Set focus to the input for keyboard accessibility
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [calculatePositionFromEvent, getClosestMonth, setTermMonths]);

  const handleSliderMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    let clientX: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const position = calculatePositionFromEvent(clientX);
    const newTerm = getClosestMonth(position);
    setTermMonths(newTerm);
  }, [isDragging, calculatePositionFromEvent, getClosestMonth, setTermMonths]);

  useEffect(() => {
    // Add event listeners for mouse/touch movements while dragging
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleSliderMouseUp);
    document.addEventListener('touchend', handleSliderMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('mouseup', handleSliderMouseUp);
      document.removeEventListener('touchend', handleSliderMouseUp);
    };
  }, [isDragging, handleMouseMove, handleSliderMouseUp]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="font-medium text-black">Term:</div>
        <div className="font-semibold text-black">{termMonths} Months</div>
      </div>

      <div 
        ref={sliderRef}
        className="relative w-full h-32 cursor-pointer select-none px-4"
        onMouseDown={handleSliderMouseDown}
        onTouchStart={handleSliderMouseDown}
      >
        {/* Track background - entire area is clickable */}
        <div className="absolute w-full h-12 top-0 bg-transparent left-0"></div>
        
        {/* Visible track - positioned at top */}
        <div className="absolute w-full h-1.5 bg-gray-400 rounded-full top-6 left-0"></div>

        {/* Month markers and labels - markers on track, labels below */}
        {monthOptions.map((month, index) => {
          const isFirst = index === 0;
          const isLast = index === monthOptions.length - 1;
          
          // Adjust positions for first and last
          let position = (index / (monthOptions.length - 1)) * 100;
          if (isFirst) {
            position = 2; // Move first indicator to 2% (from left edge)
          } else if (isLast) {
            position = 98; // Move last indicator to 98% (from left edge)
          }
          
          return (
            <div
              key={index}
              className="absolute"
              style={{ left: `${position}%` }}
            >
              {/* Marker line - positioned right on the track */}
              <div className="w-0.5 h-3 bg-gray-400 absolute top-6"></div>
              
              {/* Month label - positioned well below the track and markers */}
              <div 
                className="text-sm font-medium absolute top-20 text-black whitespace-nowrap"
                style={{ 
                  transform: isFirst ? 'translateX(0)' : 
                             isLast ? 'translateX(-100%)' : 
                             'translateX(-50%)',
                }}
              >
                {month}
              </div>
              
              {/* Clickable area for each month */}
              <button
                className="absolute w-12 h-12 opacity-0 top-2"
                style={{ transform: 'translateX(-50%)' }}
                onClick={() => setTermMonths(month)}
                aria-label={`Set term to ${month} months`}
              />
            </div>
          );
        })}

        {/* Slider handle with larger touch target - positioned on the track */}
        <div
          className={`absolute w-12 h-12 flex items-center justify-center top-6 -translate-x-1/2 pointer-events-none ${
            isDragging ? 'scale-110' : ''
          }`}
          style={{ 
            left: `${
              termMonths === 12 ? 2 : 
              termMonths === 60 ? 98 :
              getSliderPosition()
            }%` 
          }}
        >
          <div className="w-7 h-7 bg-red-600 rounded-full shadow-md transition-all"></div>
        </div>

        {/* Hidden input for accessibility */}
        <input
          ref={inputRef}
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={getSliderPosition()}
          onChange={handleTermChange}
          className="absolute opacity-0 w-full left-0"
          aria-label="Select term in months"
        />
      </div>
    </div>
  );
};

export default TermSlider;