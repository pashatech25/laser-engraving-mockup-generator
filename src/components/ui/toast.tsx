import React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface ToastProps {
  children: React.ReactNode;
  className?: string;
  onDismiss?: () => void;
}

export function Toast({ children, className, onDismiss }: ToastProps) {
  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
        className
      )}
    >
      {children}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

interface ToastTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function ToastTitle({ children, className }: ToastTitleProps) {
  return (
    <div className={cn("text-sm font-semibold", className)}>
      {children}
    </div>
  );
}

interface ToastDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function ToastDescription({ children, className }: ToastDescriptionProps) {
  return (
    <div className={cn("text-sm opacity-90", className)}>
      {children}
    </div>
  );
}
