import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  Share2, 
  CheckCircle2, 
  Wifi, 
  Copy, 
  Globe, 
  ExternalLink,
  Cloud,
  Layers,
  ArrowRight
} from 'lucide-react';
import GlassModal from './GlassModal';
import GlassButton from './GlassButton';
import Icon3D from './Icon3D';
import { playClick, playSuccess } from '../utils/sound.js';
import { useToast } from '../context/ToastContext';

/**
 * Modal Panduan Penggunaan di HP (Mode Online GitHub/Vercel & Mode Wi-Fi Lokal)
 */
export default function InstallPromptModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('online'); // 'online' | 'wifi' | 'pwa'
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const toast = useToast();

  const [localIpUrl, setLocalIpUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      const port = window.location.port ? `:${window.location.port}` : '';
      const hostname = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? '192.168.43.128' // Fallback IP laptop
        : window.location.hostname;
      return `${window.location.protocol}//${hostname}${port}`;
    }
    return 'http://192.168.43.128:5173';
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success('Portal SIG berhasil diinstal ke layar utama HP!', 'APLIKASI TERPASANG');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    playClick();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      playSuccess();
      toast.success('Pemasangan shortcut layar utama disetujui!', 'SUKSES');
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleCopyUrl = (urlToCopy) => {
    playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(urlToCopy);
      setCopiedUrl(true);
      toast.success('Alamat URL berhasil disalin!', 'URL TERSALIN');
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Panduan Akses HP & Deployment Online"
      subtitle="Buka di smartphone dosen & mahasiswa tanpa localhost"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900/90 p-1 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => { playClick(); setActiveTab('online'); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'online'
                ? 'bg-emerald-600 text-white shadow-hud-emerald'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>1. Onlinekan via GitHub (Rekomendasi)</span>
          </button>

          <button
            onClick={() => { playClick(); setActiveTab('wifi'); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'wifi'
                ? 'bg-emerald-600 text-white shadow-hud-emerald'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>2. Buka di HP Sekarang (Wi-Fi)</span>
          </button>
        </div>

        {/* TAB 1: ONLINE HOSTING (GITHUB + VERCEL) */}
        {activeTab === 'online' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 flex-shrink-0">
                <Icon3D name="rocket" size={28} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                  Cara Membuat Aplikasi Online Resmi (Bisa Diakses Dosen dari Mana Saja)
                </p>
                <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Setelah di-push ke GitHub, Anda dapat meng-onlinekan aplikasi ini secara <strong>100% GRATIS</strong> melalui <strong>Vercel</strong> atau <strong>Netlify</strong> dengan alamat HTTPS resmi (contoh: <code>https://portal-sig-lab.vercel.app</code>).
                </p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Push Kode ke Repositori GitHub Anda</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-7 font-sans">
                  Jalankan perintah berikut di terminal komputer:
                </p>
                <div className="pl-7">
                  <code className="block p-2 rounded-lg bg-slate-950 text-emerald-400 text-[11px] select-all">
                    git add .<br />
                    git commit -m "feat: portal praktikum sig online"<br />
                    git push origin main
                  </code>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Deploy 1-Klik di Vercel.com (Gratis)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px] pl-7 font-sans leading-relaxed">
                  <li>Buka <strong>vercel.com</strong> lalu login dengan akun GitHub Anda.</li>
                  <li>Klik tombol <strong>"Add New..." &rarr; "Project"</strong>.</li>
                  <li>Pilih repositori <strong>portal-praktikum</strong> Anda lalu klik <strong>Deploy</strong>.</li>
                  <li>Selesai! Anda akan mendapatkan link website online resmi HTTPS.</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Buka Link dari Smartphone Dosen & Praktikan</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-7 font-sans leading-relaxed">
                  Bagikan link Vercel tersebut ke dosen pembimbing dan asisten. Dosen dapat membuka portal dari HP kapan saja tanpa tergantung koneksi laptop!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AKSES WI-FI LOKAL SEKARANG */}
        {activeTab === 'wifi' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 font-mono">
                  <Wifi className="w-4 h-4 text-emerald-500" />
                  Alamat IP Komputer untuk Browser HP:
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                  Wi-Fi yang Sama
                </span>
              </div>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Di HP tidak bisa menggunakan kata <code>localhost</code>. Hubungkan HP ke Wi-Fi / Hotspot yang sama dengan laptop, lalu ketik alamat ini di browser HP:
              </p>

              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-sm text-emerald-600 dark:text-emerald-400 truncate select-all font-bold">
                  {localIpUrl}
                </div>
                <GlassButton
                  variant="emerald"
                  size="sm"
                  onClick={() => handleCopyUrl(localIpUrl)}
                  icon={Copy}
                  className="flex-shrink-0"
                >
                  {copiedUrl ? 'Tersalin!' : 'Salin URL'}
                </GlassButton>
              </div>
            </div>

            {/* Cara Tambah ke Layar Utama di HP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  <span>Android (Chrome)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  Tap <strong>Titik Tiga (⋮)</strong> di pojok kanan atas Chrome &rarr; pilih <strong>"Tambahkan ke Layar Utama"</strong>. Aplikasi akan muncul sebagai icon di homescreen HP!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Share2 className="w-4 h-4 text-emerald-500" />
                  <span>iPhone (Safari)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  Tap tombol <strong>Share</strong> (ikon kotak panah ke atas ⎋) di Safari &rarr; pilih <strong>"Add to Home Screen" (➕)</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 flex justify-end">
          <GlassButton
            variant="ghost"
            size="md"
            onClick={onClose}
          >
            Tutup
          </GlassButton>
        </div>

      </div>
    </GlassModal>
  );
}
