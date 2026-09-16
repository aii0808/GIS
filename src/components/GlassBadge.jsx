import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Badge Status Bersih (Clean) untuk Light & Dark Mode
 */
export default function GlassBadge({
  children,
  variant = 'emerald', // 'emerald' | 'amber' | 'cyan' | 'purple' | 'slate' | 'rose'
  size = 'md', // 'sm' | 'md'
  showDot = true,
  className = '',
}) {
  const variantStyles = {
    emerald: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
      dot: 'bg-emerald-500',
    },
    amber: {
      badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
      dot: 'bg-amber-500',
    },
    cyan: {
      badge: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
      dot: 'bg-teal-500',
    },
    purple: {
      badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
      dot: 'bg-purple-500',
    },
    rose: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
      dot: 'bg-rose-500',
    },
    slate: {
      badge: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      dot: 'bg-slate-400',
    },
  };

  const current = variantStyles[variant] || variantStyles.slate;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 font-medium border rounded-full select-none transition-colors',
          size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
          current.badge,
          className
        )
      )}
    >
      {showDot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full inline-block', current.dot)} />
      )}
      <span>{children}</span>
    </span>
  );
}
