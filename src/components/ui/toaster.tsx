import React from 'react';
import { Toast, ToastTitle, ToastDescription } from './toast';

interface ToasterProps {
  toasts: Array<{
    id: string;
    title?: string;
    description?: string;
    action?: React.ReactNode;
  }>;
  onDismiss: (id: string) => void;
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} onDismiss={() => onDismiss(toast.id)}>
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          {toast.action}
        </Toast>
      ))}
    </div>
  );
}
