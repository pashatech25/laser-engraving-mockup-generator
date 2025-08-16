import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  children: React.ReactNode;
  className?: string;
}

interface BreadcrumbItemProps {
  children: React.ReactNode;
  className?: string;
}

interface BreadcrumbLinkProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

interface BreadcrumbPageProps {
  children: React.ReactNode;
  className?: string;
}

interface BreadcrumbSeparatorProps {
  children?: React.ReactNode;
  className?: string;
}

export function Breadcrumb({ children, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
    >
      {children}
    </nav>
  );
}

export function BreadcrumbItem({ children, className }: BreadcrumbItemProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {children}
    </div>
  );
}

export function BreadcrumbLink({ children, href, className }: BreadcrumbLinkProps) {
  if (href) {
    return (
      <a
        href={href}
        className={cn("hover:text-foreground transition-colors", className)}
      >
        {children}
      </a>
    );
  }

  return (
    <span className={cn("", className)}>
      {children}
    </span>
  );
}

export function BreadcrumbPage({ children, className }: BreadcrumbPageProps) {
  return (
    <span className={cn("font-normal text-foreground", className)}>
      {children}
    </span>
  );
}

export function BreadcrumbSeparator({ children, className }: BreadcrumbSeparatorProps) {
  return (
    <ChevronRight className={cn("h-4 w-4", className)} />
  );
}
