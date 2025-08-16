import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: React.ReactNode[];
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

export function Carousel({ children, className, autoPlay = false, interval = 3000 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % children.length);
  };

  const previous = () => {
    setCurrentIndex((prev) => (prev - 1 + children.length) % children.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  React.useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      next();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval]);

  if (!children || children.length === 0) return null;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {children.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {child}
          </div>
        ))}
      </div>

      <button
        onClick={previous}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full",
              index === currentIndex ? "bg-white" : "bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
