import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  GraduationCap, 
  User, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import GlassModal from './GlassModal';
import GlassButton from './GlassButton';
import Icon3D from './Icon3D';
import { getUsers, addUser, deleteUser } from '../utils/storage.js';
import { isSupabaseConfigured, getDatabaseSchemaSql } from '../utils/supabase.js';
import { playClick, playSuccess, playError, playDelete, playPop } from '../utils/sound.js';
import { useToast } from '../context/ToastContext';

/**
 * Modal Kelola Pengguna & Akun Dosen
 */
export default function UsersModal({ isOpen, onClose, currentUser }) {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'dosen'
  });
  const [copiedSql, setCopiedSql] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const toast = useToast();

  const loadUsers = () => {
    setUsers(getUsers());
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setShowAddForm(false);
    }
  }, [isOpen]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    playClick();

    const res = await addUser(formData);
    if (!res.success) {
      playError();
      toast.error(res.message, 'GAGAL MENAMBAHKAN');
      return;
    }

    playSuccess();
    if (res.tableMissing) {
      toast.warning(res.message, 'PERHATIAN CLOUD');
    } else {
      toast.success(`Akun ${res.user.name} (${res.user.role}) berhasil ditambahkan!`, 'PENGGUNA DITAMBAHKAN');
    }

    setFormData({ username: '', password: '', name: '', role: 'dosen' });
    setShowAddForm(false);
    loadUsers();
  };

  const handleDeleteUser = async (username) => {
    playClick();
    if (window.confirm(`Hapus akun pengguna "${username}"?`)) {
      playDelete();
      const res = await deleteUser(username);
      if (res.success) {
        toast.info(`Akun "${username}" telah dihapus.`, 'AKUN DIHAPUS');
        loadUsers();
      } else {
        playError();
        toast.error(res.message, 'GAGAL HAPUS');
      }
    }
  };

  const handleCopySql = () => {
    playClick();
    const sql = getDatabaseSchemaSql();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    toast.success('Skrip SQL berhasil disalin! Jalankan di SQL Editor Supabase untuk membuat tabel sig_users.', 'SQL DISALIN');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Pengguna, Dosen & Asisten Lab"
      subtitle="Atur akun otentikasi dosen pengampu dan asisten praktikum SIG"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        
        {/* Header Summary & Add Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
              <Icon3D name="security" size={28} />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                Total Akun Terdaftar: {users.length} Pengguna
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {isSupabaseConfigured() ? '🟢 Tersinkronisasi dengan Supabase Cloud' : '🟡 Mode Offline LocalStorage'}
              </p>
            </div>
          </div>

          <GlassButton
            variant="emerald"
            size="sm"
            onClick={() => {
              playPop();
              setShowAddForm((prev) => !prev);
            }}
            icon={UserPlus}
            className="font-bold text-xs shadow-hud-emerald"
          >
            {showAddForm ? 'Tutup Form' : '+ Tambah Dosen / User'}
          </GlassButton>
        </div>

        {/* Add User Form */}
        {showAddForm && (
          <form onSubmit={handleCreateUser} className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-emerald-500/40 space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-emerald-500" />
                Tambah Akun Pengguna Baru
              </span>
              <span className="text-[10px] font-mono text-emerald-500 uppercase font-semibold">
                Baru
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: dosen_sig atau hendra"
                  value={formData.username}
                  onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl clear-input text-xs font-mono placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan password akun"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl clear-input text-xs font-mono placeholder-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1">
                  Nama Lengkap Dosen / Pengguna <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dr. Ir. Hendra, M.Sc."
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl clear-input text-xs placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1">
                  Peran / Hak Akses (Role)
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl clear-input text-xs font-mono"
                >
                  <option value="dosen">Dosen Pengampu SIG</option>
                  <option value="asisten">Asisten Lab SIG</option>
                  <option value="admin">Administrator Sistem</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <GlassButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Batal
              </GlassButton>
              <GlassButton
                type="submit"
                variant="emerald"
                size="sm"
                className="font-semibold shadow-hud-emerald text-xs"
              >
                Simpan Akun Pengguna
              </GlassButton>
            </div>
          </form>
        )}

        {/* User Table List */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-mono text-slate-500">
                <th className="py-2.5 px-3.5">Pengguna</th>
                <th className="py-2.5 px-3.5">Username</th>
                <th className="py-2.5 px-3.5">Peran</th>
                <th className="py-2.5 px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {users.map((u) => {
                const isCurrent = currentUser?.username === u.username;
                const isAdmin = u.role === 'admin';
                const isDosen = u.role === 'dosen';

                return (
                  <tr key={u.username} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        {isDosen ? <GraduationCap className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <span>{u.name}</span>
                        {isCurrent && (
                          <span className="ml-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                            (Akun Anda)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-600 dark:text-slate-300 font-bold">
                      {u.username}
                    </td>
                    <td className="py-3 px-3.5 font-mono">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isAdmin 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' 
                          : isDosen
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}>
                        {u.role === 'admin' ? 'Administrator' : u.role === 'dosen' ? 'Dosen Pengampu' : 'Asisten Lab'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      {u.username.toLowerCase() !== 'admin' ? (
                        <button
                          onClick={() => handleDeleteUser(u.username)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">Utama</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Info Supabase SQL Schema Sync */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Skema Tabel sig_users di Supabase
            </span>
            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-semibold text-[11px] transition-colors cursor-pointer"
            >
              {copiedSql ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Tersalin!' : 'Salin Kode SQL'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            Supabase memerlukan tabel <code>sig_users</code> agar akun dosen tersimpan permanen di cloud. Salin kode SQL dan jalankan di menu <strong>SQL Editor</strong> dashboard Supabase Anda.
          </p>
        </div>

      </div>
    </GlassModal>
  );
}
