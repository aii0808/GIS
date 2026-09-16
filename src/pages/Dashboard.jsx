import React, { useState, useEffect } from 'react';
import { 
  getMeetings, 
  updateMeeting, 
  resetMeetingsToDefault,
  getMeetingProgress, 
  getStudents 
} from '../utils/storage';
import { playClick, playSuccess, playAlert } from '../utils/sound';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/GlassCard';
import GlassBadge from '../components/GlassBadge';
import GlassButton from '../components/GlassButton';
import Icon3D from '../components/Icon3D';
import { 
  Calendar, 
  ArrowUpRight, 
  Users, 
  Award,
  BookOpen,
  UserPlus,
  Edit3,
  Save,
  RotateCcw,
  X,
  Database,
  MapPin
} from 'lucide-react';

/**
 * Halaman Dashboard: Grid 16 Pertemuan SIG Bersih dengan Fitur Edit Judul & Topik Pertemuan (CRUD)
 */
export default function Dashboard({ onSelectMeeting, onNavigate, onOpenDatabaseModal }) {
  const [meetings, setMeetings] = useState([]);
  const [students, setStudents] = useState([]);
  const [meetingStats, setMeetingStats] = useState({});
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', title: '', week: '' });
  const toast = useToast();

  const loadData = () => {
    const loadedStudents = getStudents();
    const loadedMeetings = getMeetings();
    setStudents(loadedStudents);
    setMeetings(loadedMeetings);

    const statsMap = {};
    loadedMeetings.forEach((m) => {
      statsMap[m.id] = getMeetingProgress(m.id);
    });
    setMeetingStats(statsMap);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalGradedCount = Object.values(meetingStats).reduce(
    (acc, curr) => acc + (curr?.graded || 0),
    0
  );
  const totalPossible = (meetings.length || 16) * (students.length || 1);
  const overallPercentage = Math.round((totalGradedCount / totalPossible) * 100) || 0;

  const handleCardClick = (meeting) => {
    playClick();
    onSelectMeeting(meeting);
  };

  const handleOpenEdit = (e, meeting) => {
    e.stopPropagation();
    playClick();
    setEditingMeeting(meeting);
    setEditFormData({
      name: meeting.name,
      title: meeting.title,
      week: meeting.week
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editFormData.title.trim()) {
      playAlert();
      toast.error('Judul materi pertemuan tidak boleh kosong!', 'VALIDASI GAGAL');
      return;
    }

    const updated = updateMeeting(editingMeeting.id, {
      name: editFormData.name.trim(),
      title: editFormData.title.trim(),
      week: editFormData.week.trim()
    });

    if (updated) {
      playSuccess();
      toast.success(`Materi ${updated.name} berhasil diperbarui!`, 'DATA TERSIMPAN');
      setEditingMeeting(null);
      loadData();
    }
  };

  const handleResetMeetings = () => {
    playAlert();
    if (window.confirm('Reset semua judul 16 pertemuan ke kurikulum standar Sistem Informasi Geografis (SIG)?')) {
      resetMeetingsToDefault();
      playSuccess();
      toast.success('Judul 16 pertemuan SIG dikembalikan ke standar kurikulum.', 'RESET BERHASIL');
      loadData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Empty State Banner if no students exist */}
      {students.length === 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Icon3D name="users" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                Lembar Data Praktikan Kosong (Data Real)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                Belum ada mahasiswa SIG terdaftar. Silakan masukkan data mahasiswa real Anda melalui menu Praktikan.
              </p>
            </div>
          </div>
          <GlassButton
            variant="amber"
            size="sm"
            onClick={() => onNavigate && onNavigate('students')}
            icon={UserPlus}
            className="font-semibold text-xs flex-shrink-0"
          >
            + Input Mahasiswa Real
          </GlassButton>
        </div>
      )}

      {/* Top Hero Section */}
      <div className="relative rounded-2xl p-5 sm:p-7 overflow-hidden clear-panel border border-slate-200 dark:border-slate-800/80 shadow-hud-emerald/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2 border border-emerald-200 dark:border-emerald-800 font-mono">
              <MapPin className="w-3.5 h-3.5" />
              <span>Sistem Informasi Geografis (SIG) &bull; Praktikum Reguler</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Modul Penilaian Praktikum SIG
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Kelola dan nilai 16 sesi praktikum Sistem Informasi Geografis secara cepat per kriteria (Kartografi BIG, Penguasaan Software QGIS/ArcGIS, Analisis Spasial, dan Penjelasan Ilmiah). Judul pertemuan dapat disesuaikan.
            </p>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                onClick={handleResetMeetings}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono transition-colors"
                title="Reset nama & judul 16 pertemuan ke silabus standar SIG"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Silabus SIG</span>
              </button>

              {onOpenDatabaseModal && (
                <button
                  onClick={() => {
                    playClick();
                    onOpenDatabaseModal();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-mono transition-colors"
                  title="Buka status database cloud & sinkronisasi Supabase"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Cloud Database & Sinkron</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-0.5 font-mono">
                <span>Pertemuan</span>
                <Icon3D name="gis" size={18} />
              </div>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono">
                16 <span className="text-xs text-slate-400 font-normal">Sesi</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-0.5 font-mono">
                <span>Praktikan</span>
                <Icon3D name="users" size={18} />
              </div>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono">
                {students.length} <span className="text-xs text-slate-400 font-normal">Mhs</span>
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-0.5 font-mono">
                <span>Progress</span>
                <Icon3D name="chart" size={18} />
              </div>
              <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {overallPercentage}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 16 Pertemuan Bersih */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Daftar Sesi Praktikum SIG</span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 font-mono">
              P1 - P16
            </span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-mono">
            Klik kartu untuk menilai &bull; Ikon pensil untuk ubah judul materi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {meetings.map((meeting) => {
            const stats = meetingStats[meeting.id] || { total: students.length, graded: 0, percentage: 0, isComplete: false };
            const isCompleted = stats.isComplete;
            const isPartiallyDone = stats.graded > 0 && !isCompleted;

            return (
              <GlassCard
                key={meeting.id}
                onClick={() => handleCardClick(meeting)}
                className="p-4 flex flex-col justify-between group cursor-pointer border border-slate-200 dark:border-slate-800/90 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 transition-all hover:shadow-hud-emerald/20 relative"
              >
                <div>
                  {/* Top Badge, Week & Edit Button */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                        {meeting.week}
                      </span>
                      <button
                        onClick={(e) => handleOpenEdit(e, meeting)}
                        className="p-1 rounded text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                        title="Edit judul dan topik sesi ini"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isCompleted ? (
                      <GlassBadge variant="emerald" size="sm">
                        Selesai
                      </GlassBadge>
                    ) : isPartiallyDone ? (
                      <GlassBadge variant="amber" size="sm">
                        {stats.graded}/{stats.total}
                      </GlassBadge>
                    ) : (
                      <GlassBadge variant="slate" size="sm" showDot={false}>
                        Belum
                      </GlassBadge>
                    )}
                  </div>

                  {/* Meeting Title & Number */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                        {isCompleted ? (
                          <Icon3D name="check" size={16} hoverAnimate={false} />
                        ) : (
                          <Icon3D name="map" size={16} hoverAnimate={false} />
                        )}
                        <span>{meeting.name}</span>
                      </h3>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed font-mono text-[11.5px]">
                      {meeting.title}
                    </p>
                  </div>
                </div>

                {/* Progress Bar & Footer */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 mt-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium font-mono">
                    <span>Dinilai</span>
                    <span className={isCompleted ? 'text-emerald-500 font-bold' : isPartiallyDone ? 'text-amber-500 font-bold' : 'text-slate-400'}>
                      {stats.graded} / {stats.total} Praktikan
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                          : isPartiallyDone
                          ? 'bg-amber-500 shadow-[0_0_6px_#f59e0b]'
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Modal Edit Judul Pertemuan Praktikum (CRUD) */}
      {editingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Materi {editingMeeting.name}
                  </h3>
                  <span className="text-[11px] text-slate-500">Kustomisasi judul praktikum SIG</span>
                </div>
              </div>
              <button
                onClick={() => setEditingMeeting(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Nama Sesi (Pertemuan)
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  placeholder="Contoh: Pertemuan 1"
                  className="w-full px-3 py-2 rounded-xl clear-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Periode / Minggu
                </label>
                <input
                  type="text"
                  value={editFormData.week}
                  onChange={(e) => setEditFormData({ ...editFormData, week: e.target.value })}
                  placeholder="Contoh: Minggu 1"
                  className="w-full px-3 py-2 rounded-xl clear-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Topik & Judul Materi Praktikum SIG
                </label>
                <textarea
                  rows={3}
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  required
                  placeholder="Contoh: Pengenalan SIG, Georeferencing, dan Registrasi Koordinat"
                  className="w-full px-3 py-2 rounded-xl clear-input text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <GlassButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingMeeting(null)}
                >
                  Batal
                </GlassButton>
                <GlassButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={Save}
                  className="font-semibold shadow-hud-emerald"
                >
                  Simpan Perubahan
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
