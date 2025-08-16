import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface MenubarProps {
  children: React.ReactNode;
  className?: string;
}

interface MenubarTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface MenubarContentProps {
  children: React.ReactNode;
  className?: string;
}

interface MenubarItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Menubar({ children, className }: MenubarProps) {
  return (
    <div className={cn("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", className)}>
      {children}
    </div>
  );
}

export function MenubarTrigger({ children, className }: MenubarTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={triggerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
        data-state={isOpen ? 'open' : 'closed'}
      >
        {children}
        <ChevronDown className="ml-auto h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          {children}
        </div>
      )}
    </div>
  );
}

export function MenubarContent({ children, className }: MenubarContentProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}

export function MenubarItem({ children, onClick, className }: MenubarItemProps) {
  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
