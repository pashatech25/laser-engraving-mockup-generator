import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  value?: Date;
  onValueChange?: (date: Date) => void;
  className?: string;
}

export function Calendar({ value = new Date(), onValueChange, className }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(value);

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {dayNames.map(day => (
          <div key={day} className="p-2 font-medium text-gray-500">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={cn(
              "p-2 hover:bg-gray-100 rounded cursor-pointer",
              day === null && "invisible",
              day === value.getDate() && currentDate.getMonth() === value.getMonth() && currentDate.getFullYear() === value.getFullYear() && "bg-blue-500 text-white hover:bg-blue-600"
            )}
            onClick={() => day && onValueChange?.(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
