/**
 * Utilitas Export CSV untuk Rekapitulasi Nilai Praktikum SIG
 * Format tabel ringkas tanpa pemisahan kelas (Kelas digabung 1).
 */
export function exportRecapToCsv(students, recapDataList) {
  if (!students || students.length === 0) {
    return false;
  }

  // Header CSV sesuai format spreadsheet praktikum
  const headers = [
    'No',
    'Nomor BP',
    'Nama Mahasiswa',
    'P1',
    'P2',
    'P3',
    'P4',
    'P5',
    'P6',
    'P7',
    'P8 UTS',
    'P9 PRESENTASI',
    'P10',
    'P11',
    'P12',
    'P13',
    'P14',
    'P15',
    'P16 UAS',
    'Rata-Rata'
  ];

  // Baris Data
  const rows = students.map((student, index) => {
    const recap = recapDataList[student.npm] || {
      meetingGrades: {},
      finalAverage: 0
    };

    const meetingValues = Array.from({ length: 16 }, (_, i) => {
      const score = recap.meetingGrades[i + 1];
      return score !== null && score !== undefined && score !== '' ? score : '';
    });

    const avg = recap.finalAverage ? Number(recap.finalAverage).toFixed(2).replace('.', ',') : '0,00';

    return [
      index + 1,
      `'${student.npm}`, // Prefix tanda petik agar Excel tidak menghilangkan leading zero
      `"${student.name.replace(/"/g, '""')}"`,
      ...meetingValues,
      `"${avg}"`
    ];
  });

  // Gabungkan header dan baris dengan pemisah koma
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\r\n');

  // Tambahkan UTF-8 BOM (\uFEFF) agar terbaca sempurna di Microsoft Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().slice(0, 10);
  const fileName = `Rekap_Nilai_Praktikum_SIG_${timestamp}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
