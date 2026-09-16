import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  UploadCloud, 
  DownloadCloud,
  ShieldCheck, 
  RefreshCw
} from 'lucide-react';
import GlassModal from './GlassModal';
import GlassButton from './GlassButton';
import Icon3D from './Icon3D';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  testSupabaseConnection, 
  getDatabaseSchemaSql, 
  syncLocalToSupabase,
  fetchStudentsFromSupabase,
  fetchScoresFromSupabase,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_KEY
} from '../utils/supabase.js';
import { getStudents, getMeetings, getScores, setStudents } from '../utils/storage.js';
import { playClick, playSuccess, playError, playCloudSync } from '../utils/sound.js';
import { useToast } from '../context/ToastContext';

/**
 * Modal Konfigurasi Database Cloud (Supabase Sync & SQL Generator)
 */
export default function DatabaseModal({ isOpen, onClose }) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [status, setStatus] = useState({ isConnected: false, testing: false, hasTables: false, message: '' });
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      const initialUrl = cfg.url || DEFAULT_SUPABASE_URL;
      const initialKey = cfg.anonKey || DEFAULT_SUPABASE_KEY;

      setUrl(initialUrl);
      setAnonKey(initialKey);

      if (initialUrl && initialKey) {
        handleTest(initialUrl, initialKey, true);
      } else {
        setStatus({ isConnected: false, testing: false, hasTables: false, message: 'Mode Offline: Menggunakan LocalStorage internal laptop.' });
      }
    }
  }, [isOpen]);

  const handleTest = async (testUrl = url, testKey = anonKey, silent = false) => {
    setStatus((prev) => ({ ...prev, testing: true, message: 'Menguji koneksi ke Supabase Cloud...' }));
    const result = await testSupabaseConnection(testUrl, testKey);
    setStatus({
      isConnected: result.success,
      testing: false,
      hasTables: Boolean(result.hasTables),
      message: result.message
    });

    if (!silent) {
      if (result.success) {
        playCloudSync();
        toast.success(result.message, 'KONEKSI CLOUD BERHASIL');
      } else {
        playError();
        toast.error(result.message, 'KONEKSI GAGAL');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    playClick();
    const saved = saveSupabaseConfig(url, anonKey);
    if (saved.isConfigured) {
      await handleTest(saved.url, saved.anonKey);
      playCloudSync();
      toast.success('Konfigurasi Supabase berhasil disimpan!', 'TERSIMPAN');
    } else {
      clearSupabaseConfig();
      setStatus({ isConnected: false, testing: false, hasTables: false, message: 'Kembali ke Mode Offline (LocalStorage).' });
      toast.info('Kembali ke mode penyimpanan lokal.', 'MODE OFFLINE');
    }
  };

  const handleDisconnect = () => {
    playClick();
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setStatus({ isConnected: false, testing: false, hasTables: false, message: 'Mode Offline aktif. Data tersimpan di browser komputer.' });
    toast.info('Koneksi Supabase diputus. Menggunakan LocalStorage.', 'OFFLINE');
  };

  const handleCopySql = () => {
    playClick();
    const sql = getDatabaseSchemaSql();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    toast.success('Skrip SQL berhasil disalin ke clipboard! Tempelkan di menu SQL Editor Supabase lalu klik Run.', 'SQL DISALIN');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSyncToCloud = async () => {
    playClick();
    setSyncing(true);
    const students = getStudents();
    const meetings = getMeetings();
    const scores = getScores();

    const res = await syncLocalToSupabase(students, meetings, scores);
    setSyncing(false);
    if (res.success) {
      playCloudSync();
      toast.success(res.message, 'SINKRONISASI BERHASIL');
    } else {
      playError();
      toast.error(res.message, 'GAGAL SINKRONISASI');
    }
  };

  const handlePullFromCloud = async () => {
    playClick();
    setSyncing(true);
    try {
      const cloudStudents = await fetchStudentsFromSupabase();
      const cloudScores = await fetchScoresFromSupabase();
      setSyncing(false);

      if (cloudStudents && cloudStudents.length > 0) {
        setStudents(cloudStudents);
        if (cloudScores) {
          localStorage.setItem('portal_sig_scores_data', JSON.stringify(cloudScores));
        }
        playCloudSync();
        toast.success(`Berhasil menarik ${cloudStudents.length} mahasiswa dari Supabase Cloud!`, 'TARIK CLOUD SUKSES');
      } else {
        toast.info('Belum ada data praktikan tersimpan di Supabase Cloud.', 'CLOUD KOSONG');
      }
    } catch (e) {
      setSyncing(false);
      playError();
      toast.error('Gagal mengambil data dari Supabase Cloud: ' + e.message, 'ERROR CLOUD');
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Database Cloud (Supabase)"
      subtitle="Koneksi real-time untuk sinkronisasi otomatis nilai dan praktikan SIG"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        
        {/* Connection Status Card dengan Icon3D */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-colors ${
          status.isConnected
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            : 'bg-slate-900/80 border-slate-800 text-slate-300'
        }`}>
          <div className="p-1 rounded-xl bg-white/5 mt-0.5 flex-shrink-0">
            {status.isConnected ? (
              <Icon3D name="cloud" size={32} />
            ) : (
              <Icon3D name="database" size={32} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Status Penyimpanan:
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold ${
                status.isConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {status.isConnected ? '🟢 Online (Supabase Cloud)' : '🟡 Offline (LocalStorage)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1.5 leading-relaxed">
              {status.message || 'Data disimpan di penyimpanan lokal browser laptop Anda.'}
            </p>
          </div>
        </div>

        {/* Supabase Credentials Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1.5 flex items-center justify-between">
              <span>Supabase Project URL</span>
              <span className="text-[10px] text-emerald-500 font-normal lowercase">https://[id].supabase.co</span>
            </label>
            <input
              type="url"
              placeholder="Contoh: https://iqxwmjihohiypethbmqe.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl clear-input text-xs font-mono placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1.5 flex items-center justify-between">
              <span>Supabase Anon Public API Key</span>
              <span className="text-[10px] text-slate-400 font-normal">Publishable Key</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: sb_publishable_... atau eyJhbGci..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl clear-input text-xs font-mono placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <GlassButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleTest()}
                disabled={status.testing || !url || !anonKey}
                icon={RefreshCw}
                className="text-xs"
              >
                {status.testing ? 'Menguji...' : 'Tes Koneksi'}
              </GlassButton>

              {status.isConnected && (
                <GlassButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Putuskan
                </GlassButton>
              )}
            </div>

            <GlassButton
              type="submit"
              variant="emerald"
              size="sm"
              className="font-semibold text-xs shadow-hud-emerald"
            >
              Simpan Konfigurasi
            </GlassButton>
          </div>
        </form>

        {/* Step-by-Step Guidance & SQL Schema */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icon3D name="database" size={18} />
              Skema Tabel SQL Supabase Otomatis
            </span>
            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-semibold text-[11px] transition-colors cursor-pointer"
            >
              {copiedSql ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Tersalin!' : 'Salin Kode SQL'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            1. Buka <strong>supabase.com</strong> &bull; 2. Pilih menu <strong>SQL Editor</strong> &bull; 3. Paste kode yang disalin lalu tekan <strong>Run</strong> untuk membuat tabel praktikan, pertemuan, dan nilai SIG secara instan.
          </p>

          {/* Sync Buttons if Connected */}
          {status.isConnected && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">Sinkronisasi Cloud Dua Arah:</span>
              <div className="flex items-center gap-2">
                <GlassButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePullFromCloud}
                  disabled={syncing}
                  icon={DownloadCloud}
                  className="text-xs font-semibold"
                >
                  Tarik dari Cloud
                </GlassButton>
                <GlassButton
                  type="button"
                  variant="emerald"
                  size="sm"
                  onClick={handleSyncToCloud}
                  disabled={syncing}
                  icon={UploadCloud}
                  className="text-xs font-semibold shadow-hud-emerald"
                >
                  {syncing ? 'Mengunggah...' : 'Upload ke Cloud'}
                </GlassButton>
              </div>
            </div>
          )}
        </div>

      </div>
    </GlassModal>
  );
}
