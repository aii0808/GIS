import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  AlertCircle, 
  ArrowRight, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX,
  Palette,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import TechBackground from '../components/TechBackground';
import Icon3D from '../components/Icon3D';
import { authenticateUser } from '../utils/storage.js';
import { playSuccess, playError, isSoundMuted, toggleSoundMuted, playClick, playPop } from '../utils/sound';
import { useToast } from '../context/ToastContext';

/**
 * Halaman Login Cyber-Tech Tactical dengan Keamanan Bersih, Audio FX Modern & Ikon 3D Online
 */
export default function Login({ 
  onLoginSuccess, 
  isDarkMode, 
  onToggleTheme,
  currentAccent = 'emerald',
  onSelectAccent 
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundMuted, setSoundMuted] = useState(isSoundMuted());
  const [showAccentPicker, setShowAccentPicker] = useState(false);
  const toast = useToast();

  const handleToggleSound = () => {
    const next = toggleSoundMuted();
    setSoundMuted(next);
  };

  const accents = [
    { id: 'emerald', label: 'Cyber Emerald', dot: 'bg-emerald-500' },
    { id: 'amber', label: 'Titanium Amber', dot: 'bg-amber-500' },
    { id: 'violet', label: 'Valkyrie Violet', dot: 'bg-purple-500' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const authRes = await authenticateUser(username, password);

      if (authRes.success) {
        playSuccess();
        toast.success(`Otentikasi berhasil. Selamat datang kembali, ${authRes.user.name}!`, 'AKSES DITERIMA');
        onLoginSuccess(authRes.user);
      } else {
        playError();
        const errText = authRes.message || 'Username atau password tidak sesuai. Silakan periksa kembali kredensial akun Anda.';
        setError(errText);
        toast.error(errText, 'AKSES DITOLAK');
        setIsLoading(false);
      }
    } catch {
      playError();
      setError('Terjadi kendala autentikasi. Silakan coba kembali.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-slate-50 dark:bg-[#070a12] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
      
      {/* 60fps Dynamic Interactive Tech Background */}
      <TechBackground isDarkMode={isDarkMode} accent={currentAccent} />

      {/* Top Floating Controls (Theme Accent, Sound & Mode) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        
        {/* Theme Accent Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              playClick();
              setShowAccentPicker((prev) => !prev);
            }}
            className="p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-xs backdrop-blur-sm transition-colors cursor-pointer"
            title="Pilih Aksen Tema"
          >
            <Palette className="w-4 h-4 text-emerald-500" />
          </button>

          {showAccentPicker && (
            <div 
              className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-in fade-in"
              onMouseLeave={() => setShowAccentPicker(false)}
            >
              <div className="px-2 py-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                Pilih Aksen
              </div>
              {accents.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    playClick();
                    if (onSelectAccent) onSelectAccent(acc.id);
                    setShowAccentPicker(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentAccent === acc.id
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${acc.dot}`} />
                  <span>{acc.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-xs backdrop-blur-sm transition-colors cursor-pointer"
          title={soundMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
        >
          {soundMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
        </button>

        {/* Segmented Light / Dark Toggle */}
        <div className="flex items-center bg-white/90 dark:bg-slate-900/90 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 select-none shadow-xs backdrop-blur-sm">
          <button
            onClick={() => {
              if (isDarkMode) onToggleTheme();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              !isDarkMode
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Aktifkan Mode Terang (Light)"
          >
            <Sun className={`w-3.5 h-3.5 ${!isDarkMode ? 'text-amber-500' : ''}`} />
            <span>Light</span>
          </button>
          <button
            onClick={() => {
              if (!isDarkMode) onToggleTheme();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            title="Aktifkan Mode Gelap (Dark)"
          >
            <Moon className={`w-3.5 h-3.5 ${isDarkMode ? 'text-emerald-400' : ''}`} />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Main Tactical Login Card */}
      <GlassCard 
        className="w-full max-w-md p-7 sm:p-9 relative z-10 shadow-2xl border border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-xl"
        hoverEffect={false}
      >
        {/* Sci-Fi Decorative Header Tag */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-5 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            SECURE ACCESS GATEWAY
          </span>
          <span className="text-emerald-500 font-semibold uppercase tracking-wider">&bull; ENCRYPTED</span>
        </div>

        {/* Header dengan Ikon 3D Online */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-hud-emerald backdrop-blur-md">
              <Icon3D name="security" size={48} className="drop-shadow-lg" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 rounded-full p-1 shadow-md">
              <Icon3D name="gis" size={20} hoverAnimate={false} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Portal Penilaian Praktikum
          </h2>
          <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mt-1 font-mono font-medium">
            Laboratorium Sistem Informasi Geografis (SIG)
          </p>
        </div>

        {/* Error Notification Inline */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Login Bersih & Aman Tanpa Bocoran Kredensial */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Masukkan username asisten"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl clear-input text-sm placeholder-slate-400 font-mono"
              />
            </div>
          </div>

          {/* Input Password dengan Toggle Lihat Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl clear-input text-sm placeholder-slate-400 font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setShowPassword(!showPassword);
                }}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tombol Submit */}
          <GlassButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="w-full mt-3 font-semibold shadow-hud-emerald"
          >
            {isLoading ? 'Mengautentikasi Sistem...' : 'Masuk ke Portal'}
            <ArrowRight className="w-4 h-4 ml-1" />
          </GlassButton>
        </form>

        {/* Footer info keamanan tanpa bocoran kredensial */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400 font-mono flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Kredensial akses dilindungi oleh sistem otentikasi internal Lab SIG.
          </p>
        </div>

      </GlassCard>
    </div>
  );
}
