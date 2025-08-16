import React from 'react';
import { cn } from '../../lib/utils';

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export function ScrollArea({ children, className, maxHeight = '400px' }: ScrollAreaProps) {
  return (
    <div
      className={cn(
        "relative overflow-auto",
        className
      )}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}
