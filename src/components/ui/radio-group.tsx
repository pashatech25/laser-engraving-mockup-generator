import React from 'react';
import { cn } from '../../lib/utils';

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface RadioGroupItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroup({ value, onValueChange, children, className }: RadioGroupProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onCheckedChange: () => onValueChange?.(child.props.value),
          } as any);
        }
        return child;
      })}
    </div>
  );
}

export function RadioGroupItem({ value, children, className }: RadioGroupItemProps) {
  return (
    <label className={cn("flex items-center space-x-2 cursor-pointer", className)}>
      <input
        type="radio"
        value={value}
        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
      />
      <span className="text-sm font-medium">{children}</span>
    </label>
  );
}
