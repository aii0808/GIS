import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { playClick, playHover } from '../utils/sound';

/**
 * Komponen GlassButton Bersih & Responsif Suara (Cyber Tech Tactical)
 */
export default function GlassButton({
  children,
  variant = 'emerald', // 'emerald' | 'primary' | 'amber' | 'purple' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  icon: Icon,
  disabled = false,
  onClick,
  onMouseEnter,
  type = 'button',
  playSound = true,
  ...props
}) {
  const handleClick = (e) => {
    if (playSound && !disabled) {
      playClick();
    }
    if (onClick) {
      onClick(e);
    }
  };

  const handleMouseEnter = (e) => {
    if (playSound && !disabled) {
      playHover();
    }
    if (onMouseEnter) {
      onMouseEnter(e);
    }
  };

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white',
    cyan: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white',
    emerald: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white',
    amber: 'bg-amber-600 text-white hover:bg-amber-500 shadow-sm dark:bg-amber-600 dark:hover:bg-amber-500 dark:text-white',
    purple: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white',
    ghost: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:text-white',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm dark:bg-rose-600 dark:hover:bg-rose-500 dark:text-white',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={twMerge(
        clsx(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant] || variantStyles.primary,
          className
        )
      )}
      {...props}
    >
      {Icon && <Icon className={clsx(size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4')} />}
      <span>{children}</span>
    </button>
  );
}

