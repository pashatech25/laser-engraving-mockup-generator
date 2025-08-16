import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface NavigationMenuProps {
  children: React.ReactNode;
  className?: string;
}

interface NavigationMenuItemProps {
  children: React.ReactNode;
  className?: string;
}

interface NavigationMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface NavigationMenuContentProps {
  children: React.ReactNode;
  className?: string;
}

interface NavigationMenuLinkProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export function NavigationMenu({ children, className }: NavigationMenuProps) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {children}
    </nav>
  );
}

export function NavigationMenuItem({ children, className }: NavigationMenuItemProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
    </div>
  );
}

export function NavigationMenuTrigger({ children, className }: NavigationMenuTriggerProps) {
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
          "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
          className
        )}
        data-state={isOpen ? 'open' : 'closed'}
      >
        {children}
        <ChevronDown className="ml-1 h-4 w-4 transition duration-200 group-data-[state=open]:rotate-180" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          {children}
        </div>
      )}
    </div>
  );
}

export function NavigationMenuContent({ children, className }: NavigationMenuContentProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}

export function NavigationMenuLink({ children, href, className }: NavigationMenuLinkProps) {
  if (href) {
    return (
      <a
        href={href}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
      >
        {children}
      </a>
    );
  }

  return (
    <div
      className={cn(
        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}
