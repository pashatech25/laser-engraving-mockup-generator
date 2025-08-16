import React from 'react';
import { cn } from '../../lib/utils';

interface AspectRatioProps {
  ratio?: number;
  children: React.ReactNode;
  className?: string;
}

export function AspectRatio({ ratio = 16 / 9, children, className }: AspectRatioProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <div
        className="absolute inset-0"
        style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
      />
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}
