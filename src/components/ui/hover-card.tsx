import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, className, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg whitespace-nowrap",
            positionClasses[position],
            className
          )}
        >
          {content}
          <div
            className={cn(
              "absolute w-2 h-2 bg-gray-900 transform rotate-45",
              position === 'top' && 'top-full left-1/2 -translate-x-1/2',
              position === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2',
              position === 'left' && 'left-full top-1/2 -translate-y-1/2',
              position === 'right' && 'right-full top-1/2 -translate-y-1/2'
            )}
          />
        </div>
      )}
    </div>
  );
}

interface HoverCardProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

interface HoverCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverCard({ trigger, children, className, delay = 700 }: HoverCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  let timeoutId: number;

  const handleMouseEnter = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {trigger}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 w-64 p-4 bg-white border border-gray-200 rounded-lg shadow-lg",
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function HoverCardContent({ children, className }: HoverCardContentProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}
