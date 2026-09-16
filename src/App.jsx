import React, { useState, useEffect } from 'react';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Recap from './pages/Recap';
import Students from './pages/Students';
import MainLayout from './layouts/MainLayout';
import DatabaseModal from './components/DatabaseModal';
import UsersModal from './components/UsersModal';
import InstallPromptModal from './components/InstallPromptModal';
import Icon3D from './components/Icon3D';
import GlassButton from './components/GlassButton';
import { playClick } from './utils/sound.js';
import { ToastProvider } from './context/ToastContext';
import { isSupabaseConfigured, checkSupabaseTablesStatus } from './utils/supabase.js';

const AUTH_STORAGE_KEY = 'portal_sig_auth_session';
const THEME_STORAGE_KEY = 'portal_sig_theme';
const THEME_STYLE_KEY = 'portal_sig_theme_style';

/**
 * Komponen Induk App.jsx
 * Mengelola tema, autentikasi multi-user (Admin & Dosen),
 * integrasi Supabase Cloud, navigasi mobile HP, dan banner status tabel.
 */
export default function App() {
  const [currentView, setCurrentView] = useState('splash');
  const [user, setUser] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [tablesNeedSetup, setTablesNeedSetup] = useState(false);

  // Inisialisasi Tema: default Dark Mode untuk pengalaman Cyber Tech yang "mantap"
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('portal_spk_theme');
    if (saved) return saved === 'dark';
    return true;
  });

  // Inisialisasi Gaya Tema (tech | siber | modern-3d)
  const [currentAccent, setCurrentAccent] = useState(() => {
    return localStorage.getItem(THEME_STYLE_KEY) || localStorage.getItem('portal_spk_theme_style') || 'tech';
  });

  // Terapkan class .dark ke tag <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDarkMode]);

  // Terapkan class tema visual ke <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-tech', 'theme-siber', 'theme-modern-3d');
    root.classList.add(`theme-${currentAccent}`);
    localStorage.setItem(THEME_STYLE_KEY, currentAccent);
  }, [currentAccent]);

  // Cek keberadaan tabel-tabel di Supabase
  const verifyTables = async () => {
    if (isSupabaseConfigured()) {
      try {
        const res = await checkSupabaseTablesStatus();
        setTablesNeedSetup(!res.hasAllTables);
      } catch {
        setTablesNeedSetup(false);
      }
    } else {
      setTablesNeedSetup(false);
    }
  };

  useEffect(() => {
    verifyTables();
  }, [currentView]);

  const handleToggleTheme = () => {
    playClick();
    setIsDarkMode((prev) => !prev);
  };

  const handleSelectAccent = (themeId) => {
    setCurrentAccent(themeId);
  };

  // Periksa sesi login yang tersimpan
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        setUser(parsed);
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  // Handler setelah Splash screen selesai
  const handleSplashComplete = () => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('login');
    }
  };

  // Handler login sukses
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    setCurrentView('dashboard');
    verifyTables();
  };

  // Handler logout
  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setSelectedMeeting(null);
    setCurrentView('login');
  };

  // Navigasi memilih pertemuan praktikum
  const handleSelectMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setCurrentView('assessment');
  };

  // Navigasi umum antar tab
  const handleNavigate = (view) => {
    playClick();
    if (view === 'dashboard') {
      setSelectedMeeting(null);
    }
    setCurrentView(view);
  };

  return (
    <ToastProvider>
      {/* 1. Splash Screen */}
      {currentView === 'splash' && (
        <Splash onComplete={handleSplashComplete} accent={currentAccent} />
      )}

      {/* 2. Halaman Login jika belum login */}
      {currentView !== 'splash' && (!user || currentView === 'login') && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          currentAccent={currentAccent}
          onSelectAccent={handleSelectAccent}
        />
      )}

      {/* 3. Render halaman dalam MainLayout */}
      {currentView !== 'splash' && user && currentView !== 'login' && (
        <MainLayout
          currentView={currentView}
          onNavigate={handleNavigate}
          selectedMeeting={selectedMeeting}
          user={user}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          currentAccent={currentAccent}
          onSelectAccent={handleSelectAccent}
          onOpenDatabaseModal={() => setIsDbModalOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onOpenUsersModal={() => setIsUsersModalOpen(true)}
        >
          {/* Banner Peringatan jika Tabel Supabase Belum Dibuat di PostgreSQL */}
          {tablesNeedSetup && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 flex-shrink-0">
                  <Icon3D name="database" size={24} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
                    Tabel Database Supabase Belum Dibuat di Cloud
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed font-sans">
                    Agar data mahasiswa real, nilai praktikum, dan akun dosen tersimpan di Supabase, jalankan kode skema SQL di menu <strong>SQL Editor</strong> dashboard Supabase Anda.
                  </p>
                </div>
              </div>
              <GlassButton
                variant="amber"
                size="sm"
                onClick={() => setIsDbModalOpen(true)}
                className="font-bold flex-shrink-0 text-xs shadow-sm"
              >
                Buka & Salin Skema SQL
              </GlassButton>
            </div>
          )}

          {/* Dashboard Pemilihan Pertemuan 1 - 16 */}
          {currentView === 'dashboard' && (
            <Dashboard 
              onSelectMeeting={handleSelectMeeting} 
              currentAccent={currentAccent} 
              onNavigate={handleNavigate}
              onOpenDatabaseModal={() => setIsDbModalOpen(true)}
            />
          )}

          {/* Assessment Lembar Penilaian */}
          {currentView === 'assessment' && selectedMeeting && (
            <Assessment
              meeting={selectedMeeting}
              onBackToDashboard={() => {
                playClick();
                setCurrentView('dashboard');
              }}
              onNavigateToRecap={() => {
                playClick();
                setCurrentView('recap');
              }}
              onNavigateToStudents={() => {
                playClick();
                setCurrentView('students');
              }}
              currentAccent={currentAccent}
            />
          )}

          {/* Rekapitulasi Akhir Seluruh Nilai (P1 - P16) */}
          {currentView === 'recap' && (
            <Recap onSelectMeeting={handleSelectMeeting} currentAccent={currentAccent} />
          )}

          {/* Kelola Praktikan Real (CRUD Mahasiswa) */}
          {currentView === 'students' && (
            <Students onSelectMeeting={handleSelectMeeting} currentAccent={currentAccent} />
          )}
        </MainLayout>
      )}

      {/* Cloud Supabase & Database Sync Modal */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => {
          setIsDbModalOpen(false);
          verifyTables();
        }}
        currentAccent={currentAccent}
      />

      {/* Modal Kelola Pengguna & Dosen */}
      <UsersModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        currentUser={user}
      />

      {/* PWA & Mobile Shortcut Screen Modal */}
      <InstallPromptModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </ToastProvider>
  );
}
