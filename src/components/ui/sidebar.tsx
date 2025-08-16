import React from 'react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

interface SidebarHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface SidebarContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SidebarFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <div className={cn("flex flex-col h-full border-r bg-background", className)}>
      {children}
    </div>
  );
}

export function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return (
    <div className={cn("flex h-16 items-center border-b px-6", className)}>
      {children}
    </div>
  );
}

export function SidebarContent({ children, className }: SidebarContentProps) {
  return (
    <div className={cn("flex-1 overflow-auto", className)}>
      {children}
    </div>
  );
}

export function SidebarFooter({ children, className }: SidebarFooterProps) {
  return (
    <div className={cn("flex h-16 items-center border-t px-6", className)}>
      {children}
    </div>
  );
}
