import React, { useState, useEffect, useRef } from 'react';
import { 
  getStudents, 
  getScores, 
  saveStudentScore, 
  getStudentMeetingScore,
  getMeetingById,
  updateMeeting
} from '../utils/storage.js';
import Icon3D from '../components/Icon3D';
import { 
  playSuccess, 
  playError, 
  playAlert, 
  playClick, 
  playScoreSelect 
} from '../utils/sound';
import GlassCard from '../components/GlassCard';
import GlassBadge from '../components/GlassBadge';
import GlassButton from '../components/GlassButton';
import GlassModal from '../components/GlassModal';
import { useToast } from '../context/ToastContext';
import { 
  ArrowLeft, 
  Search, 
  Edit3, 
  Save, 
  Layers,
  Filter,
  CheckCircle2, 
  Sparkles, 
  Calculator, 
  RotateCcw,
  UserPlus,
  Users,
  MapPin,
  X
} from 'lucide-react';

// Preset nilai standar praktikum SIG untuk tombol cepat
const SCORE_PRESETS = [70, 75, 80, 85, 90, 95, 100];

// 4 Kriteria SIG (Kartografi BIG, Software QGIS/ArcGIS, Analisis Spasial, Penjelasan)
const CRITERIA_DEFINITIONS = [
  {
    key: 'kartografi',
    title: '1. Desain Kartografi & Simbologi Peta (Kaidah BIG)',
    desc: 'Kerapihan layout peta, orientasi arah utara, skala grafis/numerik, simbologi tematik, grid koordinat, legenda, dan kaidah kartografi Badan Informasi Geospasial.',
    placeholder: 'Contoh: 85',
    rubrics: {
      65: 'Unsur kartografi tidak lengkap, proyeksi terdistorsi, atau tanpa legenda standar',
      75: 'Unsur layout peta standar terpenuhi dengan simbol dasar',
      80: 'Layout rapi, proporsional, dan simbologi konsisten sesuai tema',
      85: 'Desain kartografi sangat bersih, estetis, dan informatif',
      90: 'Kaidah kartografi BIG terpenuhi sempurna dengan visualisasi profesional',
      100: 'Kualitas peta tingkat publikasi ilmiah dan atlas geospasial resmi',
    }
  },
  {
    key: 'software',
    title: '2. Penguasaan Software SIG (QGIS / ArcGIS Toolsets)',
    desc: 'Kecekatan penggunaan toolbox geoprocessing, manajemen plugin, tabel atribut, penataan layer CRS, dan efisiensi workflow praktikum.',
    placeholder: 'Contoh: 85',
    rubrics: {
      65: 'Sering kebingungan navigasi software dan salah memilih tool geoprocessing',
      75: 'Mampu menjalankan alur software dasar dengan sedikit arahan asisten',
      80: 'Lancar mengoperasikan toolbox QGIS/ArcGIS sesuai instruksi modul',
      85: 'Sangat cekatan, mandiri, dan cepat memecahkan error software',
      90: 'Mahir memanfaatkan fitur advance dan shortcut software SIG',
      100: 'Expertise tingkat lanjut, eksekusi workflow kilat tanpa kendala teknis',
    }
  },
  {
    key: 'analisis',
    title: '3. Analisis Spasial & Pemrosesan Data Geospasial',
    desc: 'Ketepatan pemilihan parameter buffer, overlay interseksi/union, raster DEM hillshade/slope, atau interpolasi spasial.',
    placeholder: 'Contoh: 80',
    rubrics: {
      65: 'Salah memilih parameter analisis atau logika spasial tidak tepat',
      75: 'Mampu menyelesaikan analisis standar sesuai panduan modul',
      80: 'Logika spasial benar dan query atribut/spasial tepat',
      85: 'Analisis akurat dengan pertimbangan multikriteria spasial yang baik',
      90: 'Pemodelan spasial mendalam, kritis, dan validasi data kuat',
      100: 'Analisis geospasial mutakhir dan komprehensif tanpa celah logika',
    }
  },
  {
    key: 'penjelasan',
    title: '4. Interpretasi Peta & Respon Evaluasi Asisten',
    desc: 'Kemampuan menjelaskan temuan fenomena spasial dari peta hasil analisis serta ketepatan menjawab pertanyaan evaluasi teknis asisten.',
    placeholder: 'Contoh: 85',
    rubrics: {
      65: 'Tidak mampu membaca fenomena peta atau jawaban evaluasi keliru',
      75: 'Mampu menjelaskan inti hasil peta dengan cukup',
      80: 'Penjelasan runtut, logis, dan menguasai konteks geospasialnya',
      85: 'Menjawab pertanyaan kritis asisten dengan argumentasi ilmiah tepat',
      90: 'Artikulasi sangat meyakinkan dan berbasis data spasial valid',
      100: 'Presentasi dan analisis fenomena geospasial sempurna',
    }
  }
];

/**
 * Halaman Assessment: Tampilan Spreadsheet Bersih & Modal Input Langsung Angka SPK
 */
export default function Assessment({ 
  meeting: initialMeeting, 
  onBackToDashboard,
  onNavigateToRecap,
  onNavigateToStudents 
}) {
  const [currentMeeting, setCurrentMeeting] = useState(initialMeeting);
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [meetingTitleInput, setMeetingTitleInput] = useState(initialMeeting.title);
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'graded' | 'ungraded'

  // State Modal Penilaian SIG
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const toast = useToast();
  
  // 4 Kriteria SIG (0 - 100)
  const [scoreForm, setScoreForm] = useState({
    kartografi: 80,
    software: 80,
    analisis: 80,
    penjelasan: 80,
  });

  // Ref untuk autofocus input pertama saat modal terbuka
  const firstInputRef = useRef(null);

  // Muat data mahasiswa, pertemuan terupdate, dan data nilai saat halaman dibuka
  const loadData = () => {
    const liveMeeting = getMeetingById(initialMeeting.id) || initialMeeting;
    setCurrentMeeting(liveMeeting);
    setMeetingTitleInput(liveMeeting.title);

    const studentList = getStudents();
    setStudents(studentList);
    const scoreData = getScores();
    setScores(scoreData[liveMeeting.id] || {});
  };

  useEffect(() => {
    loadData();
  }, [initialMeeting.id]);

  // Autofocus ke input Kartografi saat modal dibuka
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
          firstInputRef.current.select();
        }
      }, 100);
    }
  }, [isModalOpen]);

  // Buka Modal untuk menilai mahasiswa
  const handleOpenGradeModal = (student) => {
    setSelectedStudent(student);
    const existing = getStudentMeetingScore(currentMeeting.id, student.npm);
    if (existing) {
      setScoreForm({
        kartografi: existing.kartografi ?? existing.desain ?? 80,
        software: existing.software ?? existing.kelancaran ?? 80,
        analisis: existing.analisis ?? existing.mengerti ?? 80,
        penjelasan: existing.penjelasan ?? 80,
      });
    } else {
      setScoreForm({
        kartografi: 80,
        software: 80,
        analisis: 80,
        penjelasan: 80,
      });
    }
    setIsModalOpen(true);
  };

  // Handler input angka langsung per kriteria
  const handleInputChange = (criteriaKey, rawValue) => {
    if (rawValue === '') {
      setScoreForm((prev) => ({ ...prev, [criteriaKey]: '' }));
      return;
    }
    const num = Number(rawValue);
    if (!isNaN(num)) {
      const clamped = Math.min(100, Math.max(0, num));
      setScoreForm((prev) => ({ ...prev, [criteriaKey]: clamped }));
    }
  };

  // Handler cepat untuk mengisi nilai preset ke kriteria tertentu
  const handleSelectPreset = (criteriaKey, value) => {
    setScoreForm((prev) => ({
      ...prev,
      [criteriaKey]: value,
    }));
    playScoreSelect(value);
  };

  // Handler cepat: Mengisi seluruh kriteria sekaligus dengan nilai tertentu
  const handleSetAllScores = (val) => {
    playClick();
    setScoreForm({
      kartografi: val,
      software: val,
      analisis: val,
      penjelasan: val,
    });
  };

  // Kalkulasi Real-Time Rata-Rata SIG 4 Parameter
  const valK = Number(scoreForm.kartografi) || 0;
  const valS = Number(scoreForm.software) || 0;
  const valA = Number(scoreForm.analisis) || 0;
  const valP = Number(scoreForm.penjelasan) || 0;
  const currentTotal = valK + valS + valA + valP;
  const currentAverage = Number((currentTotal / 4).toFixed(2));

  // Penentuan Predikat Nilai SIG
  const getGradeInfo = (avg) => {
    if (avg >= 85) return { letter: 'A', label: 'Sangat Baik (Lulus)', color: 'text-emerald-600 dark:text-emerald-400', badge: 'emerald' };
    if (avg >= 75) return { letter: 'B', label: 'Baik (Lulus)', color: 'text-teal-600 dark:text-teal-400', badge: 'cyan' };
    if (avg >= 65) return { letter: 'C', label: 'Cukup (Lulus Bersyarat)', color: 'text-amber-600 dark:text-amber-400', badge: 'amber' };
    if (avg >= 50) return { letter: 'D', label: 'Kurang (Remedial)', color: 'text-orange-600 dark:text-orange-400', badge: 'rose' };
    return { letter: 'E', label: 'Tidak Lulus', color: 'text-rose-600 dark:text-rose-400', badge: 'rose' };
  };

  // Simpan nilai ke LocalStorage
  const handleSaveScore = (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    if (valK < 0 || valK > 100 || valS < 0 || valS > 100 || valA < 0 || valA > 100 || valP < 0 || valP > 100) {
      toast.error('Semua nilai kriteria harus berada dalam rentang 0 sampai 100!', 'NILAI TIDAK VALID');
      return;
    }

    // Simpan nilai menggunakan helper storage SIG
    saveStudentScore(currentMeeting.id, selectedStudent.npm, scoreForm);

    // Tampilkan game toast konfirmasi
    toast.success(`Nilai SIG untuk ${selectedStudent.name} (Rata-rata: ${currentAverage}) tersimpan!`, 'NILAI TERSIMPAN');

    // Refresh data tabel & tutup modal
    loadData();
    setIsModalOpen(false);
  };

  // Handler simpan edit judul pertemuan langsung dari assessment
  const handleSaveMeetingTitle = (e) => {
    e.preventDefault();
    if (!meetingTitleInput.trim()) {
      toast.error('Judul materi tidak boleh kosong!', 'VALIDASI GAGAL');
      return;
    }
    const updated = updateMeeting(currentMeeting.id, { title: meetingTitleInput.trim() });
    if (updated) {
      setCurrentMeeting(updated);
      setIsEditingMeeting(false);
      playSuccess();
      toast.success(`Judul materi ${updated.name} berhasil diperbarui!`, 'DATA TERSIMPAN');
    }
  };

  // Filter Mahasiswa
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.npm.includes(searchQuery);

    const isGraded = Boolean(scores[student.npm]);
    if (statusFilter === 'graded') return matchesSearch && isGraded;
    if (statusFilter === 'ungraded') return matchesSearch && !isGraded;
    return matchesSearch;
  });

  const gradedCount = Object.keys(scores).length;
  const totalCount = students.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={onBackToDashboard}
            icon={ArrowLeft}
          >
            Dashboard
          </GlassButton>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {currentMeeting.name || `Pertemuan ${currentMeeting.id}`}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">&bull; {currentMeeting.week}</span>
            </div>

            {/* Inline Title Editor */}
            {isEditingMeeting ? (
              <form onSubmit={handleSaveMeetingTitle} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={meetingTitleInput}
                  onChange={(e) => setMeetingTitleInput(e.target.value)}
                  className="px-2.5 py-1 rounded-lg text-sm font-bold border border-emerald-500 clear-input font-mono w-72 sm:w-96"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                  title="Simpan Judul"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMeetingTitleInput(currentMeeting.title);
                    setIsEditingMeeting(false);
                  }}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-slate-200"
                  title="Batal"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {currentMeeting.title}
                </h1>
                <button
                  onClick={() => {
                    playClick();
                    setIsEditingMeeting(true);
                  }}
                  className="p-1 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded transition-colors"
                  title="Edit judul pertemuan ini"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
            <span className="text-slate-500 dark:text-slate-400">Telah Dinilai: </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">{gradedCount}</span>
            <span className="text-slate-400"> / {totalCount} Mahasiswa</span>
          </div>

          <GlassButton
            variant="purple"
            size="sm"
            onClick={onNavigateToRecap}
            icon={Layers}
            className="text-xs"
          >
            Lihat Rekap
          </GlassButton>

          <GlassButton
            variant="ghost"
            size="sm"
            onClick={onNavigateToStudents}
            icon={Users}
            className="text-xs font-semibold"
            title="Kelola master data praktikan terpusat untuk ke-16 pertemuan"
          >
            Master Praktikan
          </GlassButton>
        </div>
      </div>

      {/* Reassuring Centralized Master Data Notice Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-300 font-mono">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Master Data Terpusat:</strong> Seluruh mahasiswa praktikan otomatis dimuat di setiap pertemuan (P1 - P16).
          </span>
        </div>
        <button
          onClick={onNavigateToStudents}
          className="font-bold underline hover:text-emerald-950 dark:hover:text-emerald-100 text-left sm:text-right text-[11px]"
        >
          Kelola di Menu Praktikan &rarr;
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari NPM atau Nama Praktikan SIG..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl clear-input placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => { playClick(); setStatusFilter('all'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-emerald-600 text-white font-semibold shadow-hud-emerald/30'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Semua ({students.length})
          </button>
          <button
            onClick={() => { playClick(); setStatusFilter('graded'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'graded'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Sudah Dinilai ({gradedCount})
          </button>
          <button
            onClick={() => { playClick(); setStatusFilter('ungraded'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'ungraded'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Belum Dinilai ({totalCount - gradedCount})
          </button>
        </div>
      </div>

      {/* Spreadsheet / Table Style Penilaian SIG Bersih */}
      <GlassCard className="overflow-hidden" hoverEffect={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 select-none">
                <th className="py-3 px-3 font-semibold w-10 text-center">No</th>
                <th className="py-3 px-4 font-semibold w-32">Nomor BP / NPM</th>
                <th className="py-3 px-4 font-semibold">Nama Praktikan</th>
                <th className="py-3 px-3 font-semibold w-24 text-center text-emerald-600 dark:text-emerald-400" title="Kaidah Kartografi BIG">Kartografi</th>
                <th className="py-3 px-3 font-semibold w-24 text-center" title="Penguasaan QGIS/ArcGIS">Software SIG</th>
                <th className="py-3 px-3 font-semibold w-24 text-center" title="Analisis Buffer/Overlay/DEM">Analisis Spasial</th>
                <th className="py-3 px-3 font-semibold w-24 text-center" title="Interpretasi Peta & Pertanyaan Asisten">Penjelasan</th>
                <th className="py-3 px-4 font-semibold w-28 text-center">Nilai Akhir</th>
                <th className="py-3 px-4 font-semibold w-28 text-center">Status</th>
                <th className="py-3 px-4 font-semibold w-28 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, idx) => {
                  const studentScore = scores[student.npm];
                  const isGraded = Boolean(studentScore);

                  return (
                    <tr
                      key={student.npm}
                      onClick={() => handleOpenGradeModal(student)}
                      className="group hover:bg-emerald-50/20 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 text-center text-xs text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-xs sm:text-sm">
                        {student.npm}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                        {student.name}
                      </td>

                      {/* Kolom 4 Kriteria SIG */}
                      <td className="py-3 px-3 text-center font-mono text-xs">
                        {isGraded ? (
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {studentScore.kartografi ?? studentScore.desain ?? '-'}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-xs">
                        {isGraded ? (
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {studentScore.software ?? studentScore.kelancaran ?? '-'}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-xs">
                        {isGraded ? (
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {studentScore.analisis ?? studentScore.mengerti ?? '-'}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-xs">
                        {isGraded ? (
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {studentScore.penjelasan ?? '-'}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">-</span>
                        )}
                      </td>

                      {/* Rata-Rata Nilai Akhir */}
                      <td className="py-3 px-4 text-center font-mono">
                        {isGraded ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                            <span>{studentScore.average}</span>
                            <span className="text-[10px] opacity-75">
                              ({getGradeInfo(studentScore.average).letter})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isGraded ? (
                          <GlassBadge variant="emerald" size="sm">
                            Sudah Dinilai
                          </GlassBadge>
                        ) : (
                          <GlassBadge variant="amber" size="sm">
                            Belum Dinilai
                          </GlassBadge>
                        )}
                      </td>

                      {/* Aksi Button */}
                      <td className="py-3 px-4 text-right">
                        <GlassButton
                          variant={isGraded ? 'ghost' : 'primary'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenGradeModal(student);
                          }}
                          icon={Edit3}
                        >
                          {isGraded ? 'Edit' : 'Input Nilai'}
                        </GlassButton>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400 text-sm font-mono">
                    <div className="flex flex-col items-center justify-center gap-3 px-4 max-w-md mx-auto">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <Icon3D name="users" size={48} />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {students.length === 0 ? 'Belum Ada Praktikan Terdaftar' : 'Tidak Ditemukan Praktikan yang Sesuai'}
                        </p>
                        <p className="text-xs text-slate-500 max-w-sm">
                          {students.length === 0 
                            ? 'Daftarkan mahasiswa di menu Praktikan, dan nama mereka otomatis muncul di seluruh 16 pertemuan praktikum SIG.'
                            : 'Coba ubah kata kunci pencarian atau filter status nilai.'}
                        </p>
                      </div>
                      {students.length === 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                          <GlassButton
                            variant="emerald"
                            size="sm"
                            onClick={onNavigateToStudents}
                            icon={Users}
                            className="text-xs font-semibold shadow-hud-emerald"
                          >
                            + Buka Menu Praktikan untuk Input Data
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
        
        {/* Mobile Swipe Hint */}
        <div className="md:hidden flex items-center justify-center py-2 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 font-mono">
          <span>&larr; Geser tabel ke samping untuk melihat nilai lengkap &rarr;</span>
        </div>
      </GlassCard>

      {/* ========================================================================= */}
      {/* MODAL INPUT NILAI SIG: INPUT ANGKA LANGSUNG 4 KRITERIA GEOSPASIAL        */}
      {/* ========================================================================= */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Nilai Praktikum SIG"
        subtitle={
          selectedStudent
            ? `${selectedStudent.name} (${selectedStudent.npm}) \u2022 ${currentMeeting.name}: ${currentMeeting.title}`
            : ''
        }
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveScore} className="space-y-5">
          
          {/* Real-time Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Calculator className="w-3.5 h-3.5 text-emerald-500" />
                <span>Rata-Rata Nilai Akhir (SIG):</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
                  {currentAverage}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono ml-2">
                  (Total Poin: {currentTotal})
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                Predikat
              </span>
              <span className={`text-xl sm:text-2xl font-black ${getGradeInfo(currentAverage).color} px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono inline-block shadow-xs`}>
                Grade {getGradeInfo(currentAverage).letter}
              </span>
            </div>
          </div>

          {/* Pintasan Cepat Satu-Klik (One-Click Helper) */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pintasan Cepat:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSetAllScores(80)}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Isi semua kriteria dengan nilai 80"
              >
                Set Semua 80
              </button>
              <button
                type="button"
                onClick={() => handleSetAllScores(85)}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Isi semua kriteria dengan nilai 85"
              >
                Set Semua 85
              </button>
              <button
                type="button"
                onClick={() => handleSetAllScores(90)}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Isi semua kriteria dengan nilai 90"
              >
                Set Semua 90
              </button>
            </div>
          </div>

          {/* 4 Input Kriteria SIG (Kartografi, Software SIG, Analisis Spasial, Penjelasan) */}
          <div className="space-y-3.5 max-h-[55vh] overflow-y-auto pr-1">
            
            {CRITERIA_DEFINITIONS.map((crit, idx) => {
              const currentValue = scoreForm[crit.key];
              const numVal = Number(currentValue) || 0;
              const isFirst = idx === 0;

              return (
                <div 
                  key={crit.key} 
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  {/* Header & Direct Numeric Input */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <label 
                        htmlFor={`input-${crit.key}`}
                        className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white cursor-pointer flex items-center gap-1.5"
                      >
                        {crit.title}
                        {crit.key === 'kartografi' && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-normal">
                            Standar BIG
                          </span>
                        )}
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {crit.desc}
                      </p>
                    </div>

                    {/* Direct Number Input Box */}
                    <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nilai:</span>
                      <div className="relative flex items-center">
                        <input
                          id={`input-${crit.key}`}
                          ref={isFirst ? firstInputRef : null}
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          placeholder={crit.placeholder}
                          value={currentValue}
                          onChange={(e) => handleInputChange(crit.key, e.target.value)}
                          className="w-24 px-3 py-2 rounded-xl clear-input text-center font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <span className="text-xs text-slate-400 font-mono ml-1.5">/ 100</span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Pilihan Nilai Cepat (Chips) */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                      Pilih Cepat:
                    </span>
                    {SCORE_PRESETS.map((preset) => {
                      const isSelected = numVal === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleSelectPreset(crit.key, preset)}
                          className={`px-2 py-0.5 rounded-lg text-xs font-mono font-medium transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-bold shadow-hud-emerald scale-105'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>

                </div>
              );
            })}

          </div>

          {/* Petunjuk Navigasi Keyboard */}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between px-1 font-mono">
            <span>&bull; Gunakan tombol [Tab] untuk berpindah ke kriteria berikutnya</span>
            <span>&bull; Tekan [Enter] untuk menyimpan nilai</span>
          </p>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
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
              icon={Save}
              className="font-semibold shadow-sm"
            >
              Simpan Nilai Pertemuan
            </GlassButton>
          </div>

        </form>
      </GlassModal>

    </div>
  );
}
