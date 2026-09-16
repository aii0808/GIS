import React from 'react';
import Navbar from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import TechBackground from '../components/TechBackground';
import { Terminal } from 'lucide-react';

/**
 * MainLayout Cyber-Tech Mendukung Light & Dark Mode, Interactive Tech Background,
 * serta Mobile Bottom Navigation Bar untuk pengalaman aplikasi HP native yang mulus.
 */
export default function MainLayout({
  children,
  currentView,
  onNavigate,
  selectedMeeting,
  user,
  onLogout,
  isDarkMode,
  onToggleTheme,
  currentAccent = 'emerald',
  onSelectAccent,
  onOpenDatabaseModal,
  onOpenInstallModal,
  onOpenUsersModal
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a12] text-slate-900 dark:text-slate-100 relative flex flex-col transition-colors duration-200 overflow-x-hidden">
      
      {/* Interactive 60fps Canvas Tech Animated Background */}
      <TechBackground isDarkMode={isDarkMode} accent={currentAccent} />

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={onNavigate}
        selectedMeeting={selectedMeeting}
        user={user}
        onLogout={onLogout}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
        currentAccent={currentAccent}
        onSelectAccent={onSelectAccent}
        onOpenDatabaseModal={onOpenDatabaseModal}
        onOpenInstallModal={onOpenInstallModal}
        onOpenUsersModal={onOpenUsersModal}
      />

      {/* Main Content Area: Berikan padding bawah pb-24 di mobile agar tidak tertutup Bottom Bar */}
      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Footer Cyber HUD Style (Diberi margin bawah di mobile agar tidak tertimpa bottom bar) */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800/80 bg-white/75 dark:bg-[#0a0f1a]/85 backdrop-blur-md py-4 sm:py-5 mt-6 sm:mt-10 mb-14 md:mb-0 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-mono">
            <Terminal className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
            <span>LAB_SIG &bull; Sistem Informasi Geografis Edition</span>
          </div>
          <p className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
            SIG Cyber-Tech HUD &bull; Spatial Analysis &bull; PWA Mobile Ready
          </p>
        </div>
      </footer>

      {/* Fixed Bottom Navigation Bar Khusus Layar HP / Mobile (< md) */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={onNavigate}
        selectedMeeting={selectedMeeting}
        onOpenUsersModal={onOpenUsersModal}
        onOpenDatabaseModal={onOpenDatabaseModal}
      />

    </div>
  );
}

