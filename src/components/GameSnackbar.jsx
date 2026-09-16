import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ShieldAlert, 
  Info,
  Terminal
} from 'lucide-react';
import { playClick } from '../utils/sound';

/**
 * Komponen Game HUD-Style Snackbar
 * Menampilkan alert bergaya Sci-Fi Tactical Gaming dengan timer cooldown animasi dan border bracket.
 */
export default function GameSnackbar({ toast, onDismiss }) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 4000;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [toast.id, duration, onDismiss]);

  const handleClose = () => {
    playClick();
    onDismiss(toast.id);
  };

  const getStyleConfig = () => {
    switch (toast.type) {
      case 'error':
        return {
          border: 'border-rose-500/80 dark:border-rose-500/90',
          bg: 'bg-slate-900/95 dark:bg-[#0d0a10]/95',
          headerBg: 'bg-rose-500/20 text-rose-400',
          title: toast.title || 'CRITICAL SYSTEM ERROR',
          icon: <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />,
          barBg: 'bg-rose-500',
          glow: 'shadow-[0_0_20px_rgba(244,63,94,0.35)]',
          bracketColor: 'text-rose-500'
        };
      case 'alert':
      case 'warning':
        return {
          border: 'border-amber-500/80 dark:border-amber-500/90',
          bg: 'bg-slate-900/95 dark:bg-[#121008]/95',
          headerBg: 'bg-amber-500/20 text-amber-400',
          title: toast.title || 'TACTICAL NOTICE',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />,
          barBg: 'bg-amber-500',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]',
          bracketColor: 'text-amber-500'
        };
      case 'info':
        return {
          border: 'border-cyan-500/80 dark:border-cyan-500/90',
          bg: 'bg-slate-900/95 dark:bg-[#071318]/95',
          headerBg: 'bg-cyan-500/20 text-cyan-400',
          title: toast.title || 'SYSTEM TELEMETRY',
          icon: <Info className="w-5 h-5 text-cyan-400" />,
          barBg: 'bg-cyan-500',
          glow: 'shadow-[0_0_20px_rgba(6,182,212,0.35)]',
          bracketColor: 'text-cyan-500'
        };
      case 'success':
      default:
        return {
          border: 'border-emerald-500/80 dark:border-emerald-500/90',
          bg: 'bg-slate-900/95 dark:bg-[#07140f]/95',
          headerBg: 'bg-emerald-500/20 text-emerald-400',
          title: toast.title || 'OPERATION COMPLETED',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          barBg: 'bg-emerald-500',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
          bracketColor: 'text-emerald-500'
        };
    }
  };

  const cfg = getStyleConfig();

  return (
    <div
      className={`relative w-full max-w-sm sm:max-w-md backdrop-blur-md rounded-lg border-2 ${cfg.border} ${cfg.bg} ${cfg.glow} text-slate-100 overflow-hidden select-none transition-all duration-300 animate-in slide-in-from-top-4 sm:slide-in-from-right-4 fade-in`}
      role="alert"
    >
      {/* Sci-Fi Bracket Accents (Top-Left & Top-Right) */}
      <div className="absolute top-1 left-1.5 text-[9px] font-mono opacity-60 pointer-events-none">
        <span className={cfg.bracketColor}>[SYS_ID:</span> {toast.id.toString().slice(-4)}<span className={cfg.bracketColor}>]</span>
      </div>
      <div className="absolute top-1 right-8 text-[9px] font-mono opacity-60 pointer-events-none uppercase">
        <span className="animate-pulse text-emerald-400 font-bold">&bull; ONLINE</span>
      </div>

      <div className="p-3.5 sm:p-4 pt-5">
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div className="flex-shrink-0 mt-0.5 p-1.5 rounded bg-white/5 border border-white/10">
            {cfg.icon}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${cfg.headerBg}`}>
                {cfg.title}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm font-medium text-slate-200 leading-relaxed break-words">
              {toast.message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 -mt-1 -mr-1 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors focus:outline-none"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Ability Cooldown Progress Bar */}
      <div className="w-full h-1 bg-black/40 overflow-hidden">
        <div
          className={`h-full ${cfg.barBg} transition-all duration-75 ease-linear shadow-[0_0_8px_currentColor]`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
