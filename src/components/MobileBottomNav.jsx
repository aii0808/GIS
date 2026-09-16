import React from 'react';
import Icon3D from './Icon3D';
import { playClick } from '../utils/sound';

/**
 * Mobile Bottom Navigation Bar (Fixed Bottom Navigation khusus layar HP)
 * Memberikan navigasi intuitif ala aplikasi mobile native Android / iOS
 */
export default function MobileBottomNav({ 
  currentView, 
  onNavigate, 
  selectedMeeting,
  onOpenUsersModal,
  onOpenDatabaseModal
}) {
  const handleTabClick = (view) => {
    playClick();
    onNavigate(view);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      iconName: 'map',
      isActive: currentView === 'dashboard',
      onClick: () => handleTabClick('dashboard')
    },
    {
      id: 'assessment',
      label: selectedMeeting ? `P${selectedMeeting.id}` : 'Penilaian',
      iconName: 'compass',
      isActive: currentView === 'assessment',
      onClick: () => {
        if (selectedMeeting) {
          handleTabClick('assessment');
        } else {
          handleTabClick('dashboard');
        }
      }
    },
    {
      id: 'students',
      label: 'Praktikan',
      iconName: 'users',
      isActive: currentView === 'students',
      onClick: () => handleTabClick('students')
    },
    {
      id: 'recap',
      label: 'Rekap',
      iconName: 'chart',
      isActive: currentView === 'recap',
      onClick: () => handleTabClick('recap')
    },
    {
      id: 'users',
      label: 'Dosen',
      iconName: 'user',
      isActive: false,
      onClick: () => {
        playClick();
        if (onOpenUsersModal) onOpenUsersModal();
      }
    }
  ];

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#090e18]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] transition-colors duration-200 px-1 py-1.5 pb-safe"
      aria-label="Mobile Navigation Bar"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = item.isActive;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                active 
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {/* Active Ambient Glow Background */}
              {active && (
                <span className="absolute inset-x-1 inset-y-0.5 rounded-xl bg-emerald-500/15 dark:bg-emerald-400/15 -z-10 animate-in fade-in zoom-in-95 duration-150" />
              )}

              {/* 3D Icon Container */}
              <div className="relative">
                <Icon3D name={item.iconName} size={20} hoverAnimate={false} />
              </div>

              {/* Label */}
              <span className="text-[10px] sm:text-[11px] font-sans tracking-tight mt-0.5 truncate max-w-[64px]">
                {item.label}
              </span>

              {/* Active Bottom Bar Indicator */}
              {active && (
                <span className="w-3.5 h-0.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-0.5 shadow-[0_0_8px_#10b981]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
