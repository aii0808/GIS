import React, { useEffect, useState } from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';
import Icon3D from '../components/Icon3D';
import { playSuccess } from '../utils/sound';
import TechBackground from '../components/TechBackground';

/**
 * Splash Screen Cyber-Tech Beranimasi Halus (2.5 Detik) dengan Canvas Tech Particles
 */
export default function Splash({ onComplete, accent = 'emerald' }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2400;
    const intervalTime = 25;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(100, prev + step);
      });
    }, intervalTime);

    const finishTimeout = setTimeout(() => {
      playSuccess();
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(finishTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070a12] text-slate-100 overflow-hidden select-none transition-colors duration-200">
      
      {/* 60fps Dynamic Interactive Tech Background */}
      <TechBackground isDarkMode={true} accent={accent} />

      {/* Center Tactical HUD Card */}
      <div className="relative z-10 flex flex-col items-center p-8 sm:p-10 max-w-sm w-full mx-4 rounded-3xl bg-[#0c1320]/90 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.18)] animate-in zoom-in-95 duration-200">
        
        {/* Glowing Tactical Corners */}
        <div className="absolute top-2 left-2 text-[9px] font-mono text-emerald-500/60">[SYS_BOOT]</div>
        <div className="absolute top-2 right-2 text-[9px] font-mono text-emerald-500/60">[v2.4.0]</div>

        {/* Logo 3D */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shadow-hud-emerald mb-5 transform transition-transform hover:scale-105 backdrop-blur-md">
          <Icon3D name="gis" size={48} />
        </div>

        {/* Title & Tagline */}
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-center text-white flex items-center gap-2">
          PORTAL SIG <span className="text-xs px-2 py-0.5 rounded font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 font-semibold">LAB</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 text-center mt-1 font-mono">
          Laboratorium Sistem Informasi Geografis
        </p>

        {/* Progress Bar Container */}
        <div className="w-full mt-7">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-mono">
            <span className="flex items-center gap-1 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-spin" /> Inisialisasi Modul...
            </span>
            <span className="text-emerald-400 font-bold font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/40">
            <div
              className="h-full bg-emerald-500 transition-all duration-75 ease-out rounded-full shadow-[0_0_10px_#10b981]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tactical Footer Tag */}
        <div className="flex items-center gap-1.5 mt-6 text-[11px] text-slate-400 tracking-wider font-mono">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>CYBER TACTICAL HUD &bull; STANDALONE</span>
        </div>
      </div>
    </div>
  );
}
