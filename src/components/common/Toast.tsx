import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  duration = 2500,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgStyles = {
    success: 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border border-neutral-800 dark:border-neutral-200',
    info: 'bg-blue-600 text-white border border-blue-500',
    error: 'bg-rose-600 text-white border border-rose-500',
  }[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-medium transition-all transform animate-in fade-in slide-in-from-bottom-2 ${bgStyles}`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="opacity-70 hover:opacity-100 p-0.5 rounded transition-opacity"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};
