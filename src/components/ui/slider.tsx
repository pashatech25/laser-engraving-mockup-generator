import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, defaultValue, value, onValueChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue || 0);
    const currentValue = value ?? internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      if (onValueChange) {
        onValueChange(newValue);
      } else {
        setInternalValue(newValue);
      }
    };

    return (
      <div className="relative flex w-full touch-none select-none items-center">
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          className={cn(
            "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
            className
          )}
          {...props}
        />
        <div
          className="absolute left-0 top-1/2 h-full w-full -translate-y-1/2 bg-primary"
          style={{
            width: `${((currentValue - min) / (max - min)) * 100}%`
          }}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
