import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  AlertTriangle, 
  BookOpen, 
  RefreshCw,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassModal from '../components/GlassModal';
import Icon3D from '../components/Icon3D';
import { 
  getStudents, 
  addStudent, 
  updateStudent, 
  deleteStudent, 
  clearAllStudentData, 
  bulkImportStudents,
  getScores
} from '../utils/storage.js';
import { isSupabaseConfigured, fetchStudentsFromSupabase } from '../utils/supabase.js';
import { playClick, playError, playAlert, playSuccess, playDelete, playPop } from '../utils/sound.js';
import { useToast } from '../context/ToastContext';

/**
 * Halaman Kelola Praktikan Real (CRUD Mahasiswa & Impor Cepat Dinamis)
 */
export default function Students() {
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isCloudActive, setIsCloudActive] = useState(isSupabaseConfigured());
  const toast = useToast();

  // State Modal Tambah / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentEditingNpm, setCurrentEditingNpm] = useState(null);
  const [formData, setFormData] = useState({
    npm: '',
    name: ''
  });

  // State Modal Konfirmasi Hapus
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State Modal Impor Cepat
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const loadData = () => {
    const list = getStudents();
    setStudents(list);
    setScores(getScores());
    setIsCloudActive(isSupabaseConfigured());
  };

  useEffect(() => {
    loadData();

    // Jika cloud aktif, coba sinkronkan data praktikan dari Supabase
    if (isSupabaseConfigured()) {
      fetchStudentsFromSupabase().then((cloudStudents) => {
        if (cloudStudents && Array.isArray(cloudStudents) && cloudStudents.length > 0) {
          setStudents(cloudStudents);
        }
      }).catch(() => {});
    }
  }, []);

  // Filter mahasiswa berdasarkan pencarian
  const filteredStudents = students.filter((st) => {
    return (
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.npm.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Hitung jumlah pertemuan yang dinilai untuk mahasiswa
  const getGradedMeetingsCount = (npm) => {
    let count = 0;
    for (let i = 1; i <= 16; i++) {
      if (scores[i] && scores[i][npm]) {
        count += 1;
      }
    }
    return count;
  };

  // Handler Buka Modal Tambah
  const handleOpenAddModal = () => {
    playPop();
    setModalMode('add');
    setCurrentEditingNpm(null);
    setFormData({ npm: '', name: '' });
    setIsModalOpen(true);
  };

  // Handler Buka Modal Edit
  const handleOpenEditModal = (student) => {
    playClick();
    setModalMode('edit');
    setCurrentEditingNpm(student.npm);
    setFormData({
      npm: student.npm,
      name: student.name
    });
    setIsModalOpen(true);
  };

  // Handler Submit Form Tambah / Edit
  const handleSubmitForm = (e) => {
    e.preventDefault();

    if (modalMode === 'add') {
      const result = addStudent(formData);
      if (!result.success) {
        playError();
        toast.error(result.message, 'GAGAL MENAMBAHKAN');
        return;
      }
      playSuccess();
      toast.success(`Praktikan ${result.student.name} (${result.student.npm}) berhasil didaftarkan!`, 'PRAKTIKAN TERSIMPAN');
    } else {
      const result = updateStudent(currentEditingNpm, formData);
      if (!result.success) {
        playError();
        toast.error(result.message, 'GAGAL MENGUBAH DATA');
        return;
      }
      playSuccess();
      toast.success(`Data praktikan ${result.student.name} berhasil diperbarui!`, 'DATA DIPERBARUI');
    }

    setIsModalOpen(false);
    loadData();
  };

  // Handler Buka Konfirmasi Hapus
  const handleOpenDeleteModal = (student) => {
    playAlert();
    setDeleteTarget(student);
    setIsDeleteModalOpen(true);
  };

  // Handler Eksekusi Hapus Mahasiswa
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    playDelete();
    const result = deleteStudent(deleteTarget.npm);
    if (result.success) {
      toast.info(`Data mahasiswa ${deleteTarget.name} (${deleteTarget.npm}) telah dihapus.`, 'DATA DIHAPUS');
    } else {
      playError();
      toast.error('Gagal menghapus praktikan.', 'ERROR');
    }
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
    loadData();
  };

  // Handler Kosongkan Seluruh Data Praktikan
  const handleClearAll = () => {
    playAlert();
    if (window.confirm('Apakah Anda yakin ingin MENGOSONGKAN SELURUH DATA MAHASISWA? Semua mahasiswa dan riwayat nilainya akan dihapus dan lembar kerja bersih kembali.')) {
      playDelete();
      clearAllStudentData();
      loadData();
      toast.info('Seluruh data mahasiswa berhasil dikosongkan.', 'LEMBAR KERJA BERSIH');
    }
  };

  // Handler Impor Cepat (Paste CSV/Teks)
  const handleProcessImport = () => {
    if (!importText.trim()) {
      playError();
      toast.error('Teks impor tidak boleh kosong!', 'INPUT KOSONG');
      return;
    }

    const lines = importText.split('\n');
    const parsedList = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Format: NPM, Nama Mahasiswa
      const parts = trimmed.split(/[,;\t]/).map((p) => p.trim());
      if (parts.length >= 2) {
        parsedList.push({
          npm: parts[0],
          name: parts.slice(1).join(' ').trim()
        });
      }
    });

    if (parsedList.length === 0) {
      playError();
      toast.error('Format teks tidak valid. Gunakan format: NPM, Nama Mahasiswa (1 per baris)', 'FORMAT SALAH');
      return;
    }

    const result = bulkImportStudents(parsedList);
    if (result.success) {
      playSuccess();
      toast.success(`Berhasil mengimpor ${result.count} praktikan baru!`, 'IMPOR SUKSES');
      setIsImportModalOpen(false);
      setImportText('');
      loadData();
    } else {
      playError();
      toast.error(result.message, 'IMPOR DENGAN CATATAN');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2 border border-emerald-200 dark:border-emerald-800 font-mono">
            <Icon3D name="database" size={16} />
            <span>Master Data &bull; Input Data Praktikan Dinamis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Icon3D name="users" size={32} />
            <span>Kelola Data Praktikan</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Kelola data mahasiswa real untuk penilaian praktikum SIG di seluruh 16 sesi pertemuan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Kosongkan jika ada data */}
          {students.length > 0 && (
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              icon={RefreshCw}
              className="text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 text-xs"
              title="Kosongkan seluruh data mahasiswa"
            >
              Kosongkan Data
            </GlassButton>
          )}

          {/* Tombol Impor Cepat */}
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => {
              playClick();
              setIsImportModalOpen(true);
            }}
            icon={Upload}
            className="text-xs font-semibold"
          >
            Impor Cepat
          </GlassButton>

          {/* Tombol Tambah Mahasiswa */}
          <GlassButton
            variant="emerald"
            size="sm"
            onClick={handleOpenAddModal}
            icon={UserPlus}
            className="font-bold shadow-hud-emerald text-xs"
          >
            + Tambah Praktikan
          </GlassButton>
        </div>
      </div>

      {/* Master Data Single Menu Explanation Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex-shrink-0">
            <Icon3D name="users" size={32} />
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight text-slate-900 dark:text-white font-mono flex items-center gap-2">
              Satu Menu Master Dinamis untuk Seluruh 16 Pertemuan
              {isCloudActive && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Cloud className="w-3 h-3" /> Supabase Aktif
                </span>
              )}
            </p>
            <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed font-sans">
              Setiap praktikan yang Anda daftarkan di sini <strong>otomatis tersambung di seluruh 16 sesi praktikum SIG</strong>. Anda cukup menginput data satu kali saja!
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Stat Cards dengan Ikon 3D Online */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <GlassCard className="p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1 font-mono">
            <span>Total Praktikan Real</span>
            <Icon3D name="users" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {students.length} <span className="text-xs text-slate-400 font-normal">Mahasiswa</span>
          </p>
        </GlassCard>

        <GlassCard className="p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1 font-mono">
            <span>Sesi Praktikum SIG</span>
            <Icon3D name="gis" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            16 <span className="text-xs text-slate-400 font-normal">Pertemuan</span>
          </p>
        </GlassCard>

        <GlassCard className="col-span-2 lg:col-span-1 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1 font-mono">
            <span>Penyimpanan Data</span>
            <Icon3D name="cloud" size={24} />
          </div>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 font-mono mt-1 flex items-center gap-1.5">
            {isCloudActive ? '🟢 Supabase Cloud Terkoneksi' : '🟡 Offline LocalStorage'}
          </p>
        </GlassCard>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari NPM atau Nama Praktikan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl clear-input placeholder-slate-400 font-mono"
          />
        </div>
      </div>

      {/* Table Daftar Mahasiswa Real */}
      <GlassCard className="overflow-hidden" hoverEffect={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-mono select-none">
                <th className="py-3 px-4 font-semibold w-12 text-center">No</th>
                <th className="py-3 px-4 font-semibold w-36">Nomor BP / NPM</th>
                <th className="py-3 px-4 font-semibold">Nama Lengkap Praktikan</th>
                <th className="py-3 px-4 font-semibold w-40 text-center">Sesi Dinilai</th>
                <th className="py-3 px-4 font-semibold w-32 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st, idx) => {
                  const gradedCount = getGradedMeetingsCount(st.npm);

                  return (
                    <tr 
                      key={st.npm}
                      className="group hover:bg-emerald-50/20 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-xs text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs sm:text-sm">
                        {st.npm}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <Icon3D name="user" size={18} hoverAnimate={false} />
                        <span>{st.name}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs">
                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          gradedCount > 0
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {gradedCount} / 16 Sesi
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(st)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                            title="Edit Data Mahasiswa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(st)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Hapus Mahasiswa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 font-mono">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <Icon3D name="users" size={48} />
                      </div>
                      <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                        {students.length === 0 ? 'Belum Ada Praktikan Terdaftar' : 'Tidak Ditemukan Praktikan yang Sesuai'}
                      </p>
                      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                        {students.length === 0
                          ? 'Aplikasi siap digunakan secara murni dinamis. Tambahkan praktikan pertama atau gunakan fitur Impor Cepat.'
                          : 'Coba ubah kata kunci pencarian Anda.'}
                      </p>
                      {students.length === 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <GlassButton
                            variant="emerald"
                            size="sm"
                            onClick={handleOpenAddModal}
                            icon={UserPlus}
                            className="font-semibold shadow-hud-emerald"
                          >
                            + Tambah Praktikan Baru
                          </GlassButton>
                          <GlassButton
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsImportModalOpen(true)}
                            icon={Upload}
                            className="text-xs"
                          >
                            Impor Cepat
                          </GlassButton>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* MODAL TAMBAH / EDIT MAHASISWA */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Tambah Praktikan Real Baru' : 'Edit Data Praktikan'}
        subtitle="Masukkan identitas praktikan untuk dicatat dalam lembar penilaian"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1.5">
              NPM (Nomor Pokok Mahasiswa) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 2110031802..."
              value={formData.npm}
              onChange={(e) => setFormData((prev) => ({ ...prev, npm: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl clear-input text-sm font-mono placeholder-slate-400"
            />
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Harus unik dan tidak boleh sama dengan mahasiswa lain.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1.5">
              Nama Lengkap Mahasiswa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Masukkan nama lengkap praktikan"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl clear-input text-sm placeholder-slate-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <GlassButton
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </GlassButton>
            <GlassButton
              type="submit"
              variant="emerald"
              size="md"
              className="font-semibold shadow-hud-emerald/30"
            >
              {modalMode === 'add' ? 'Simpan Praktikan' : 'Perbarui Data'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* MODAL KONFIRMASI HAPUS */}
      <GlassModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Praktikan"
        subtitle="Tindakan ini permanen dan menghapus seluruh nilai praktikan"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
            <p className="leading-relaxed">
              Anda akan menghapus praktikan <strong>{deleteTarget?.name}</strong> ({deleteTarget?.npm}). Seluruh riwayat nilai praktikan ini di seluruh 16 pertemuan juga akan dibersihkan secara otomatis.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <GlassButton
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Batal
            </GlassButton>
            <GlassButton
              type="button"
              variant="danger"
              size="md"
              onClick={handleConfirmDelete}
              className="font-semibold"
            >
              Ya, Hapus Data
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* MODAL IMPOR CEPAT TEKS / CSV */}
      <GlassModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Impor Cepat Praktikan (Format Teks / CSV)"
        subtitle="Paste daftar nama dan NPM praktikan langsung dari Excel atau dokumen"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1.5">
              Format Input: NPM, Nama Lengkap (1 baris per mahasiswa)
            </label>
            <textarea
              rows={6}
              placeholder="Contoh:&#10;2110031802001, Ahmad Fauzi&#10;2110031802002, Siti Rahma&#10;2110031802003, Doni Wahyudi"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full p-3 rounded-xl clear-input text-xs font-mono placeholder-slate-400 leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Pemisah kolom dapat menggunakan tanda koma (,), titik koma (;), atau tab dari Excel.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <GlassButton
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsImportModalOpen(false)}
            >
              Batal
            </GlassButton>
            <GlassButton
              type="submit"
              variant="emerald"
              size="md"
              onClick={handleProcessImport}
              icon={Upload}
              className="font-semibold shadow-hud-emerald"
            >
              Proses Impor
            </GlassButton>
          </div>
        </div>
      </GlassModal>

    </div>
  );
}
