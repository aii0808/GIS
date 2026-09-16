import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Komponen GlassCard Bersih (Clear Crystal) yang mendukung Light & Dark Mode
 */
export default function GlassCard({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'clear-card relative',
          hoverEffect && 'hover:-translate-y-0.5',
          onClick && 'cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
