'use client';

import { useToast, type ToastVariant } from '@/components/providers/toast-provider';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

function getToastStyles(variant: ToastVariant) {
  const baseStyles = 'px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium shadow-lg';

  const variantStyles = {
    success: 'bg-green-600 text-white border border-green-700',
    error: 'bg-red-600 text-white border border-red-700',
    warning: 'bg-yellow-600 text-white border border-yellow-700',
    info: 'bg-blue-600 text-white border border-blue-700',
  };

  return `${baseStyles} ${variantStyles[variant]}`;
}

function getIconColor(variant: ToastVariant) {
  const colors = {
    success: 'text-white',
    error: 'text-white',
    warning: 'text-white',
    info: 'text-white',
  };
  return colors[variant];
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  switch (variant) {
    case 'success':
      return (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'info':
      return (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
}

export function Toaster() {
  const { toasts, removeToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center pt-8 pointer-events-none z-50">
      <div className="flex flex-col gap-3 max-w-md w-full px-4 sm:px-6 pointer-events-auto">
        {toasts.map((toast) => (
          <div key={toast.id} className={getToastStyles(toast.variant)}>
            <ToastIcon variant={toast.variant} />
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
              aria-label="Cerrar notificación"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
