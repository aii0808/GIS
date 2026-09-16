import React, { useState } from 'react';
import { 
  Layers, 
  BarChart3, 
  LogOut, 
  GraduationCap,
  ChevronRight,
  Sun, 
  Moon, 
  Volume2, 
  VolumeX,
  Palette,
  Users,
  Database,
  Smartphone
} from 'lucide-react';
import GlassButton from './GlassButton';
import Icon3D from './Icon3D';
import { isSoundMuted, toggleSoundMuted, playClick, playPop } from '../utils/sound';
import { isSupabaseConfigured } from '../utils/supabase';

/**
 * Navbar Cyber-Tech Tactical dengan Segmented Dark/Light Mode, Audio FX, dan 3 Pilihan Tema Mantap
 */
export default function Navbar({
  currentView,
  onNavigate,
  selectedMeeting,
  user,
  onLogout,
  isDarkMode,
  onToggleTheme,
  currentAccent = 'tech',
  onSelectAccent,
  onOpenDatabaseModal,
  onOpenInstallModal,
  onOpenUsersModal
}) {
  const [soundMuted, setSoundMuted] = useState(isSoundMuted());
  const [showAccentPicker, setShowAccentPicker] = useState(false);
  const isCloudDb = isSupabaseConfigured();

  const handleToggleSound = () => {
    const nextState = toggleSoundMuted();
    setSoundMuted(nextState);
  };

  const themes = [
    { id: 'tech', label: 'Tech (Matrix)', desc: 'Cyber Emerald Tactical HUD', dot: 'bg-emerald-500' },
    { id: 'siber', label: 'Siber (Cyberpunk)', desc: 'Titanium Gold Industrial', dot: 'bg-amber-500' },
    { id: 'modern-3d', label: 'Modern 3D', desc: 'Hologram Violet & 3D Depth', dot: 'bg-purple-500' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full clear-panel border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Breadcrumb */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shadow-hud-emerald transition-transform group-hover:scale-105">
              <Icon3D name="gis" size={24} />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                PORTAL SIG <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold">LAB</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block -mt-0.5 font-mono">
                Sistem Informasi Geografis
              </span>
            </div>
          </div>

          {/* Breadcrumb if inside Assessment */}
          {currentView === 'assessment' && selectedMeeting && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <span>Pertemuan</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 font-mono">
                P{selectedMeeting.id}
              </span>
              <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px] font-medium">
                {selectedMeeting.title}
              </span>
            </div>
          )}
        </div>

        {/* Nav Links Desktop Only: Dashboard, Praktikan (Mahasiswa), Rekapitulasi */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentView === 'dashboard'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/80 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon3D name="map" size={16} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('students')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentView === 'students'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/80 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon3D name="users" size={16} />
            <span>Praktikan</span>
          </button>

          <button
            onClick={() => onNavigate('recap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentView === 'recap'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/80 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon3D name="chart" size={16} />
            <span>Rekapitulasi</span>
          </button>
        </nav>

        {/* Controls: Shortcut HP, Database, Theme, Sound, Dark/Light, Logout */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* Tombol Shortcut HP & PWA Install */}
          <button
            onClick={() => {
              playClick();
              if (onOpenInstallModal) onOpenInstallModal();
            }}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 shadow-xs"
            title="Buka di HP & Buat Shortcut Layar Utama"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden lg:inline font-semibold">Shortcut HP</span>
          </button>

          {/* Cloud Database Config Modal Button */}
          <button
            onClick={() => {
              playClick();
              if (onOpenDatabaseModal) onOpenDatabaseModal();
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Konfigurasi Database Cloud & Sinkronisasi Data"
          >
            <Icon3D name="cloud" size={16} />
            <span className="hidden sm:inline font-medium">Cloud DB</span>
            <span 
              className={`w-2 h-2 rounded-full ${isCloudDb ? 'bg-emerald-500 shadow-hud-emerald' : 'bg-amber-400 animate-pulse'}`} 
              title={isCloudDb ? 'Terhubung ke Supabase Cloud' : 'Mode Offline LocalStorage'}
            />
          </button>

          {/* User & Dosen Management Modal Button */}
          <button
            onClick={() => {
              playClick();
              if (onOpenUsersModal) onOpenUsersModal();
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Kelola Akun Dosen & Pengguna Sistem"
          >
            <Icon3D name="user" size={16} />
            <span className="hidden sm:inline font-medium">User Dosen</span>
          </button>

          {/* Theme Switcher Modal / Dropdown: Tech, Siber, Modern 3D */}
          <div className="relative">
            <button
              onClick={() => {
                playClick();
                setShowAccentPicker((prev) => !prev);
              }}
              className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none flex items-center gap-1"
              title="Ganti Tema: Tech, Siber, Modern 3D"
              aria-label="Theme Selector"
            >
              <Palette className="w-4 h-4 text-emerald-500" />
            </button>

            {showAccentPicker && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setShowAccentPicker(false)}
              >
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800 mb-1">
                  Pilih Tema Visual
                </div>
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      playClick();
                      if (onSelectAccent) onSelectAccent(t.id);
                      setShowAccentPicker(false);
                    }}
                    className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                      currentAccent === t.id
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${t.dot}`} />
                    <div className="text-left">
                      <div className="font-semibold">{t.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sound Mute/Unmute Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            title={soundMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
            aria-label="Toggle Sound"
          >
            {soundMuted ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
          </button>

          {/* Theme Dark/Light Mode Segmented Switch */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 select-none">
            <button
              onClick={() => {
                if (isDarkMode) onToggleTheme();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                !isDarkMode
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Aktifkan Mode Terang (Light)"
            >
              <Sun className={`w-3.5 h-3.5 ${!isDarkMode ? 'text-amber-500' : ''}`} />
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              onClick={() => {
                if (!isDarkMode) onToggleTheme();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isDarkMode
                  ? 'bg-slate-900 text-white shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Aktifkan Mode Gelap (Dark)"
            >
              <Moon className={`w-3.5 h-3.5 ${isDarkMode ? 'text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Dark</span>
            </button>
          </div>

          {/* User Badge */}
          <div className="hidden lg:flex items-center gap-2 pl-2.5 pr-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {user?.name || 'Asisten Dosen'}
            </span>
          </div>

          {/* Logout Button */}
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={onLogout}
            icon={LogOut}
            className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900 px-2 sm:px-3"
            title="Keluar dari Portal Lab SIG"
          >
            <span className="hidden sm:inline">Keluar</span>
          </GlassButton>
        </div>

      </div>
    </header>
  );
}
