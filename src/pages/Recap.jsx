import React, { useState, useEffect } from 'react';
import { 
  getStudents, 
  calculateStudentRecap,
  resetDataToDefault,
  getMeetingById,
  getMeetings
} from '../utils/storage';
import { exportRecapToCsv } from '../utils/exportCsv';
import { exportRecapToExcelTable } from '../utils/exportExcel';
import { playSuccess, playAlert, playClick } from '../utils/sound';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/GlassCard';
import GlassBadge from '../components/GlassBadge';
import GlassButton from '../components/GlassButton';
import Icon3D from '../components/Icon3D';
import { 
  FileSpreadsheet, 
  Search, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  CheckCircle, 
  RotateCcw,
  BookOpen,
  MapPin,
  Download
} from 'lucide-react';

/**
 * Halaman Rekapitulasi Akhir Praktikum SIG
 */
export default function Recap({ onSelectMeeting }) {
  const [students, setStudents] = useState([]);
  const [recapDataMap, setRecapDataMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();
  const [stats, setStats] = useState({
    classAverage: 0,
    highestScore: 0,
    lowestScore: 0,
    passRate: 0,
    topStudentName: '-'
  });

  const loadRecap = () => {
    const studentList = getStudents();
    setStudents(studentList);

    const dataMap = {};
    let totalAverages = 0;
    let studentsWithGrades = 0;
    let highest = -1;
    let lowest = 101;
    let topName = '-';
    let passingCount = 0;

    studentList.forEach((st) => {
      const recap = calculateStudentRecap(st.npm);
      dataMap[st.npm] = recap;

      if (recap.filledMeetingsCount > 0) {
        studentsWithGrades += 1;
        totalAverages += recap.finalAverage;

        if (recap.finalAverage > highest) {
          highest = recap.finalAverage;
          topName = st.name;
        }
        if (recap.finalAverage < lowest) {
          lowest = recap.finalAverage;
        }
        if (recap.finalAverage >= 65) {
          passingCount += 1;
        }
      }
    });

    setRecapDataMap(dataMap);

    const avg = studentsWithGrades > 0 ? Number((totalAverages / studentsWithGrades).toFixed(2)) : 0;
    const rate = studentsWithGrades > 0 ? Math.round((passingCount / studentsWithGrades) * 100) : 0;

    setStats({
      classAverage: avg,
      highestScore: highest >= 0 ? highest : 0,
      lowestScore: lowest <= 100 ? lowest : 0,
      passRate: rate,
      topStudentName: topName
    });
  };

  useEffect(() => {
    loadRecap();
  }, []);

  const handleExportExcel = () => {
    playClick();
    const ok = exportRecapToExcelTable(students, recapDataMap);
    if (!ok) {
      toast.error('Tidak ada data praktikan untuk diekspor!', 'EKSPOR GAGAL');
    } else {
      playSuccess();
      toast.success('File Excel (.xls) bergaris tabel berhasil diunduh!', 'EXCEL TABEL DIEKSPOR');
    }
  };

  const handleExportCsv = () => {
    playClick();
    const ok = exportRecapToCsv(students, recapDataMap);
    if (!ok) {
      toast.error('Tidak ada data praktikan untuk diekspor!', 'EKSPOR GAGAL');
    } else {
      playSuccess();
      toast.success('Data rekapitulasi berhasil diekspor ke file CSV!', 'CSV DIEKSPOR');
    }
  };

  const handleResetData = () => {
    playAlert();
    if (window.confirm('Apakah Anda yakin ingin mereset seluruh data penilaian ke kondisi awal?')) {
      resetDataToDefault();
      loadRecap();
      toast.info('Seluruh data nilai praktikum telah direset ke kondisi awal master.', 'RESET SISTEM');
    }
  };

  const filteredStudents = students.filter(
    (st) =>
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.npm.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2 border border-emerald-200 dark:border-emerald-800 font-mono">
            <Icon3D name="gis" size={16} />
            <span>Sistem Informasi Geografis (SIG) &bull; Matriks Rekapitulasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Icon3D name="chart" size={32} />
            <span>Rekapitulasi Nilai P1 - P16</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Akumulasi nilai praktikum SIG seluruh sesi beserta rata-rata akhir dan predikat kelulusan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <GlassButton
            variant="emerald"
            size="md"
            onClick={handleExportExcel}
            icon={FileSpreadsheet}
            className="shadow-sm font-semibold text-xs sm:text-sm shadow-hud-emerald"
            title="Download file Excel (.xls) dengan format tabel bergaris nyata"
          >
            Export Excel (.xls Tabel)
          </GlassButton>

          <GlassButton
            variant="ghost"
            size="md"
            onClick={handleExportCsv}
            icon={Download}
            className="text-xs"
            title="Download data mentah format CSV"
          >
            CSV
          </GlassButton>

          <GlassButton
            variant="ghost"
            size="md"
            onClick={handleResetData}
            icon={RotateCcw}
            className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 text-xs"
            title="Reset nilai ke awal"
          >
            Reset
          </GlassButton>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <GlassCard className="p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1.5 font-mono">
            <span>Rata-Rata Kelas</span>
            <Icon3D name="chart" size={20} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {stats.classAverage}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Akumulasi pertemuan aktif</p>
        </GlassCard>

        <GlassCard className="p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1.5">
            <span>Nilai Tertinggi</span>
            <Icon3D name="check" size={20} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.highestScore}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {stats.topStudentName}
          </p>
        </GlassCard>

        <GlassCard className="p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1.5">
            <span>Nilai Terendah</span>
            <Icon3D name="clipboard" size={20} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {stats.lowestScore}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Batas evaluasi praktikan</p>
        </GlassCard>

        <GlassCard className="p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1.5">
            <span>Tingkat Kelulusan</span>
            <Icon3D name="graduation" size={20} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {stats.passRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Predikat minimal C (&ge; 65)</p>
        </GlassCard>
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari NPM atau Nama praktikan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl clear-input placeholder-slate-400"
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-mono">
          Klik header kolom <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">P1-P16</span> untuk beralih langsung ke lembar sesi praktikum.
        </p>
      </div>

      {/* Horizontal Matrix Table */}
      <GlassCard className="overflow-hidden" hoverEffect={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 select-none">
                <th className="py-3 px-3 w-10 text-center font-semibold sticky left-0 bg-slate-100 dark:bg-slate-900 z-20">
                  No
                </th>
                <th className="py-3 px-3 w-28 font-semibold sticky left-10 bg-slate-100 dark:bg-slate-900 z-20">
                  NPM
                </th>
                <th className="py-3 px-3 w-48 font-semibold sticky left-38 bg-slate-100 dark:bg-slate-900 z-20 border-r border-slate-200 dark:border-slate-800">
                  Nama Praktikan
                </th>

                {/* 16 Pertemuan Columns (P1 s.d. P16) */}
                {Array.from({ length: 16 }, (_, i) => {
                  const mNum = i + 1;
                  return (
                    <th
                      key={mNum}
                      onClick={() => {
                        playClick();
                        onSelectMeeting({ id: mNum, name: `Pertemuan ${mNum}`, title: `Sesi Praktikum ${mNum}` });
                      }}
                      className="py-3 px-2 text-center font-mono font-semibold w-14 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
                      title={`Buka lembar penilaian Pertemuan ${mNum}`}
                    >
                      P{mNum}
                    </th>
                  );
                })}

                <th className="py-3 px-4 text-center font-semibold w-32 bg-slate-50 dark:bg-slate-900/90 border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                  Rata-Rata Akhir
                </th>
                <th className="py-3 px-3 text-center font-semibold w-20 bg-slate-50 dark:bg-slate-900/90 text-slate-900 dark:text-white">
                  Grade
                </th>
                <th className="py-3 px-4 text-center font-semibold w-36 bg-slate-50 dark:bg-slate-900/90 text-slate-900 dark:text-white">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, idx) => {
                  const recap = recapDataMap[student.npm] || {
                    meetingGrades: {},
                    finalAverage: 0,
                    gradeLetter: '-',
                    statusBadge: 'Belum Ada Nilai',
                    filledMeetingsCount: 0
                  };

                  return (
                    <tr 
                      key={student.npm}
                      className="hover:bg-emerald-50/20 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center text-xs text-slate-400 font-mono sticky left-0 bg-white dark:bg-slate-900 z-10">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-xs sticky left-10 bg-white dark:bg-slate-900 z-10">
                        {student.npm}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white text-xs sm:text-sm sticky left-38 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                        {student.name}
                      </td>

                      {/* 16 Pertemuan Score Cells */}
                      {Array.from({ length: 16 }, (_, i) => {
                        const mNum = i + 1;
                        const score = recap.meetingGrades[mNum];
                        const hasScore = score !== null && score !== undefined;

                        return (
                          <td 
                            key={mNum} 
                            onClick={() => {
                              playClick();
                              onSelectMeeting({ id: mNum, name: `Pertemuan ${mNum}`, title: `Sesi Praktikum ${mNum}` });
                            }}
                            className="py-2.5 px-2 text-center font-mono text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={`Pertemuan ${mNum}: ${hasScore ? score : 'Belum dinilai'}`}
                          >
                            {hasScore ? (
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                                  score >= 85
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                    : score >= 75
                                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300'
                                    : score >= 65
                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                                }`}
                              >
                                {score}
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 text-xs">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Rata-Rata Akhir */}
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-sm bg-slate-50/70 dark:bg-slate-900/60 border-l border-slate-200 dark:border-slate-800">
                        {recap.filledMeetingsCount > 0 ? (
                          <span className="text-slate-900 dark:text-white font-extrabold">
                            {recap.finalAverage}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 text-xs">-</span>
                        )}
                      </td>

                      {/* Grade Huruf */}
                      <td className="py-2.5 px-3 text-center bg-slate-50/70 dark:bg-slate-900/60">
                        {recap.filledMeetingsCount > 0 ? (
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                              recap.gradeLetter === 'A'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : recap.gradeLetter === 'B'
                                ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                : recap.gradeLetter === 'C'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {recap.gradeLetter}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 text-xs">-</span>
                        )}
                      </td>

                      {/* Status Kelulusan */}
                      <td className="py-2.5 px-4 text-center bg-slate-50/70 dark:bg-slate-900/60 whitespace-nowrap">
                        {recap.filledMeetingsCount > 0 ? (
                          recap.finalAverage >= 65 ? (
                            <GlassBadge variant="emerald" size="sm">
                              Lulus ({recap.statusBadge})
                            </GlassBadge>
                          ) : (
                            <GlassBadge variant="rose" size="sm">
                              {recap.statusBadge}
                            </GlassBadge>
                          )
                        ) : (
                          <GlassBadge variant="slate" size="sm" showDot={false}>
                            Belum Ada Nilai
                          </GlassBadge>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={22} className="py-10 text-center text-slate-400 text-sm">
                    Tidak ditemukan data praktikan yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

    </div>
  );
}
