import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { playAlert } from '../utils/sound';

/**
 * Modal Pop-up Bersih (Clear Crystal) untuk Light & Dark Mode
 */
export default function GlassModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
}) {
  useEffect(() => {
    if (isOpen) {
      playAlert();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Konten Kotak Dialog */}
      <div
        className={`relative w-full ${maxWidth} rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800/80 p-6 sm:p-7 shadow-2xl z-10`}
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80 mb-5">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span>{title}</span>
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div>{children}</div>
      </div>
    </div>
  );
}
