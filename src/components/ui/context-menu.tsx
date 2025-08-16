import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface ContextMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

interface ContextMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ContextMenu({ trigger, children, className }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div onContextMenu={handleContextMenu}>
      {trigger}
      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            "fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
            className
          )}
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function ContextMenuItem({ children, onClick, className }: ContextMenuItemProps) {
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
