import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

interface DrawerContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DrawerHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DrawerTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DrawerDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function Drawer({ open, onOpenChange, children, side = 'right', className }: DrawerProps) {
  if (!open) return null;

  const sideClasses = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full'
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className={cn(
        "fixed bg-background shadow-lg",
        sideClasses[side],
        className
      )}>
        {children}
      </div>
    </div>
  );
}

export function DrawerContent({ children, className }: DrawerContentProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {children}
    </div>
  );
}

export function DrawerHeader({ children, className }: DrawerHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  );
}

export function DrawerTitle({ children, className }: DrawerTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
      {children}
    </h2>
  );
}

export function DrawerDescription({ children, className }: DrawerDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}
