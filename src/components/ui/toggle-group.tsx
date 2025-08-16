import React from 'react';
import { cn } from '../../lib/utils';

interface ToggleGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface ToggleGroupItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function ToggleGroup({ value, onValueChange, children, className }: ToggleGroupProps) {
  return (
    <div className={cn("inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            pressed: child.props.value === value,
            onPressedChange: () => onValueChange?.(child.props.value),
          } as any);
        }
        return child;
      })}
    </div>
  );
}

export function ToggleGroupItem({ value, children, className }: ToggleGroupItemProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
        className
      )}
      data-state="off"
    >
      {children}
    </button>
  );
}
