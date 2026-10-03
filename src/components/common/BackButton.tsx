import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onBack?: () => void;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onBack,
  label = 'Back',
  className = '',
}) => {
  const handleClick = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1 && window.location.hash) {
      window.history.back();
    } else {
      window.location.hash = '';
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Go back to previous page"
      className={`inline-flex items-center gap-2 py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors cursor-pointer touch-manipulation min-h-[40px] shadow-2xs ${className}`}
    >
      <ArrowLeft className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
};
