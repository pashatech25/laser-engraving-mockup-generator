import React from 'react';
import { cn } from '../../lib/utils';

interface SonnerProps {
  children: React.ReactNode;
  className?: string;
}

export function Sonner({ children, className }: SonnerProps) {
  return (
    <div className={cn("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className)}>
      {children}
    </div>
  );
}
