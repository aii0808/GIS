/**
 * Utilitas Export Excel Berformat Tabel (.xls HTML/XML Spreadsheet)
 * Menghasilkan file Excel asli lengkap dengan garis tabel (border),
 * perataan teks, format angka, dan header yang sesuai format rekapitulasi nilai praktikum.
 */
import { getMeetings } from './storage';

export function exportRecapToExcelTable(students, recapDataMap) {
  if (!students || students.length === 0) {
    return false;
  }

  const meetings = getMeetings();

  // Susun judul kolom P1 s/d P16
  // Sesuai format spreadsheet lab: P8 UTS, P9 PRESENTASI, P16 UAS
  const meetingHeaders = Array.from({ length: 16 }, (_, i) => {
    const num = i + 1;
    if (num === 8) return 'P8 UTS';
    if (num === 9) return 'P9 PRESENTASI';
    if (num === 16) return 'P16 UAS';
    return `P${num}`;
  });

  // Susun baris HTML data mahasiswa
  const tableRowsHtml = students.map((student, index) => {
    const recap = recapDataMap[student.npm] || {
      meetingGrades: {},
      finalAverage: 0
    };

    // Ambil nilai setiap sesi
    const scoreCells = Array.from({ length: 16 }, (_, i) => {
      const score = recap.meetingGrades[i + 1];
      const val = score !== null && score !== undefined && score !== '' ? score : '';
      return `<td class="score">${val}</td>`;
    }).join('');

    // Rata-rata dengan format desimal koma (misal: 87,86) seperti di Microsoft Excel Indonesia
    const avgFormatted = recap.finalAverage ? Number(recap.finalAverage).toFixed(2).replace('.', ',') : '0,00';

    return `
      <tr>
        <td class="center">${index + 1}</td>
        <td class="bp-num">${student.npm}</td>
        <td class="name-left">${escapeHtml(student.name)}</td>
        ${scoreCells}
        <td class="avg-right">${avgFormatted}</td>
      </tr>
    `;
  }).join('');

  // Susun header kolom tabel
  const headerColsHtml = `
    <tr>
      <th style="width: 45px;">No</th>
      <th style="width: 120px;">Nomor BP</th>
      <th style="width: 250px;">Nama Mahasiswa</th>
      ${meetingHeaders.map(h => `<th style="width: 55px;">${h}</th>`).join('')}
      <th style="width: 90px;">Rata-Rata</th>
    </tr>
  `;

  // Template XML/HTML Spreadsheet yang terbaca sempurna di Microsoft Excel dengan Gridlines & Borders
  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:x="urn:schemas-microsoft-com:office:excel" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Rekapitulasi Nilai SIG</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
                <x:Print>
                  <x:ValidPrinterInfo/>
                </x:Print>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table {
          border-collapse: collapse;
          font-family: 'Calibri', 'Arial', sans-serif;
          font-size: 11pt;
          color: #000000;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
          border: 1px solid #000000;
          text-align: center;
          vertical-align: middle;
          padding: 6px 8px;
        }
        td {
          border: 1px solid #000000;
          vertical-align: middle;
          padding: 5px 8px;
        }
        .center {
          text-align: center;
        }
        .bp-num {
          mso-number-format: "\\@"; /* Format Text agar angka 0 di depan nomor BP tidak hilang */
          text-align: left;
        }
        .name-left {
          text-align: left;
          white-space: nowrap;
        }
        .score {
          text-align: center;
          mso-number-format: "0";
        }
        .avg-right {
          text-align: right;
          font-weight: bold;
          background-color: #fafffa;
          mso-number-format: "0\\.00";
        }
      </style>
    </head>
    <body>
      <table>
        <thead>
          ${headerColsHtml}
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `;

  // Download sebagai file .xls yang langsung terbuka sebagai tabel Microsoft Excel
  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().slice(0, 10);
  const fileName = `Rekap_Nilai_Praktikum_SIG_${timestamp}.xls`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
