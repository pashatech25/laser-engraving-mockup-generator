import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

interface PaginationItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <PaginationItem
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </PaginationItem>

      {getVisiblePages().map((page, index) => (
        <PaginationItem
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          isActive={page === currentPage}
          isDisabled={page === '...'}
        >
          {page}
        </PaginationItem>
      ))}

      <PaginationItem
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </PaginationItem>
    </div>
  );
}

export function PaginationItem({ children, onClick, isActive, isDisabled, className }: PaginationItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "hover:bg-accent hover:text-accent-foreground",
        "h-10 px-4 py-2",
        className
      )}
    >
      {children}
    </button>
  );
}
