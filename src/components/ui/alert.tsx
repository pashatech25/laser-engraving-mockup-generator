import React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  variant?: 'default' | 'destructive' | 'success' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const alertVariants = {
  default: {
    container: "bg-background text-foreground",
    icon: Info,
    iconClass: "text-foreground"
  },
  destructive: {
    container: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
    icon: XCircle,
    iconClass: "text-destructive"
  },
  success: {
    container: "border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-500",
    icon: CheckCircle,
    iconClass: "text-green-500"
  },
  info: {
    container: "border-blue-500/50 text-blue-700 dark:border-blue-500 [&>svg]:text-blue-500",
    icon: Info,
    iconClass: "text-blue-500"
  }
};

export function Alert({ variant = 'default', title, children, className }: AlertProps) {
  const variantConfig = alertVariants[variant];
  const Icon = variantConfig.icon;

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border p-4 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
        variantConfig.container,
        className
      )}
    >
      <Icon className={cn("h-4 w-4", variantConfig.iconClass)} />
      {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
      <div className="text-sm [&_p]:leading-relaxed">{children}</div>
    </div>
  );
}
