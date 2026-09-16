/**
 * Utilitas Penyimpanan Lokal & Logika CRUD Mahasiswa, Pertemuan, Penilaian, & Pengguna (Dosen/Admin)
 * Laboratorium Sistem Informasi Geografis (SIG / GIS)
 * Murni dinamis: Tanpa data dummy, mendukung multi-user (Admin, Dosen, Asisten),
 * dan sinkronisasi otomatis ke Supabase Cloud.
 */

import { 
  isSupabaseConfigured, 
  saveStudentToSupabase, 
  deleteStudentFromSupabase, 
  saveScoreToSupabase,
  saveUserToSupabase,
  deleteUserFromSupabase,
  fetchUsersFromSupabase
} from './supabase.js';

// Kunci penyimpanan LocalStorage
const STORAGE_KEYS = {
  AUTH: 'portal_sig_auth_session',
  SCORES: 'portal_sig_scores_data',
  STUDENTS: 'portal_sig_students_data',
  MEETINGS: 'portal_sig_meetings_data',
  USERS: 'portal_sig_users_data',
  CLEANED_DUMMY_V2: 'portal_sig_cleaned_dummy_v2',
};

// =============================================================================
// MANAJEMEN PENGGUNA (ADMIN, DOSEN PENGAMPU & ASISTEN LAB)
// =============================================================================

export const DEFAULT_USERS = [
  { 
    id: 1, 
    username: 'admin', 
    password: 'admin', 
    name: 'Administrator Lab SIG', 
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

/**
 * Mengambil daftar pengguna sistem (Admin, Dosen, Asisten)
 */
export function getUsers() {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  const rawData = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!rawData) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

/**
 * Menyimpan array pengguna ke LocalStorage
 */
export function setUsers(usersList) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersList));
}

/**
 * Tambah Pengguna Baru (Dosen / Asisten / Admin)
 */
export async function addUser({ username, password, name, role = 'dosen' }) {
  const cleanUsername = String(username || '').trim();
  const cleanPassword = String(password || '').trim();
  const cleanName = String(name || '').trim();
  const cleanRole = String(role || 'dosen').trim();

  if (!cleanUsername) return { success: false, message: 'Username wajib diisi!' };
  if (!cleanPassword) return { success: false, message: 'Password wajib diisi!' };
  if (!cleanName) return { success: false, message: 'Nama lengkap wajib diisi!' };

  const currentUsers = getUsers();
  const isDuplicate = currentUsers.some(
    (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
  );

  if (isDuplicate) {
    return { success: false, message: `Username "${cleanUsername}" sudah digunakan!` };
  }

  const newUser = {
    id: Date.now(),
    username: cleanUsername,
    password: cleanPassword,
    name: cleanName,
    role: cleanRole,
    createdAt: new Date().toISOString()
  };

  const updated = [...currentUsers, newUser];
  setUsers(updated);

  // Simpan ke Supabase Cloud jika aktif
  let cloudResult = null;
  if (isSupabaseConfigured()) {
    cloudResult = await saveUserToSupabase(newUser);
  }

  return { 
    success: true, 
    user: newUser,
    tableMissing: cloudResult?.tableMissing || false,
    message: cloudResult?.tableMissing 
      ? 'Akun disimpan di lokal, tetapi tabel sig_users belum dibuat di Supabase SQL Editor!' 
      : 'Akun berhasil ditambahkan!' 
  };
}

/**
 * Update Data Pengguna
 */
export async function updateUser(oldUsername, { username, password, name, role }) {
  const cleanOldUsername = String(oldUsername).trim();
  const cleanUsername = String(username || '').trim();
  const cleanName = String(name || '').trim();

  const currentUsers = getUsers();
  const userIdx = currentUsers.findIndex((u) => u.username === cleanOldUsername);
  if (userIdx === -1) {
    return { success: false, message: 'Pengguna tidak ditemukan!' };
  }

  // Cek duplikasi jika username berganti
  if (cleanUsername !== cleanOldUsername) {
    const isDup = currentUsers.some(
      (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (isDup) {
      return { success: false, message: `Username "${cleanUsername}" sudah digunakan!` };
    }
    if (isSupabaseConfigured()) {
      deleteUserFromSupabase(cleanOldUsername).catch(() => {});
    }
  }

  currentUsers[userIdx] = {
    ...currentUsers[userIdx],
    username: cleanUsername,
    password: password ? String(password).trim() : currentUsers[userIdx].password,
    name: cleanName || currentUsers[userIdx].name,
    role: role || currentUsers[userIdx].role,
    updatedAt: new Date().toISOString()
  };

  setUsers(currentUsers);

  if (isSupabaseConfigured()) {
    saveUserToSupabase(currentUsers[userIdx]).catch(() => {});
  }

  return { success: true, user: currentUsers[userIdx] };
}

/**
 * Hapus Pengguna (Dosen / Asisten)
 */
export async function deleteUser(username) {
  const cleanUsername = String(username).trim();
  const currentUsers = getUsers();

  if (cleanUsername.toLowerCase() === 'admin') {
    return { success: false, message: 'Akun administrator utama tidak dapat dihapus!' };
  }

  const filtered = currentUsers.filter((u) => u.username !== cleanUsername);
  if (filtered.length === currentUsers.length) {
    return { success: false, message: 'Pengguna tidak ditemukan!' };
  }

  setUsers(filtered);

  if (isSupabaseConfigured()) {
    deleteUserFromSupabase(cleanUsername).catch(() => {});
  }

  return { success: true };
}

/**
 * Otentikasi Pengguna (Cek kredensial ke memori lokal & Supabase Cloud)
 */
export async function authenticateUser(username, password) {
  const cleanU = String(username || '').trim();
  const cleanP = String(password || '').trim();

  // 1. Cek di daftar pengguna lokal
  const localUsers = getUsers();
  const matched = localUsers.find(
    (u) => u.username.toLowerCase() === cleanU.toLowerCase() && u.password === cleanP
  );

  if (matched) {
    return {
      success: true,
      user: {
        username: matched.username,
        name: matched.name,
        role: matched.role || 'dosen',
        loginAt: new Date().toISOString()
      }
    };
  }

  // 2. Jika tidak ada di lokal, coba cari di Supabase Cloud jika online
  if (isSupabaseConfigured()) {
    try {
      const cloudUsers = await fetchUsersFromSupabase();
      if (cloudUsers && Array.isArray(cloudUsers)) {
        // Update memori lokal
        setUsers(cloudUsers);
        const cloudMatched = cloudUsers.find(
          (u) => u.username.toLowerCase() === cleanU.toLowerCase() && u.password === cleanP
        );
        if (cloudMatched) {
          return {
            success: true,
            user: {
              username: cloudMatched.username,
              name: cloudMatched.name,
              role: cloudMatched.role || 'dosen',
              loginAt: new Date().toISOString()
            }
          };
        }
      }
    } catch {
      // Gagal kontak cloud
    }
  }

  return { success: false, message: 'Username atau kata sandi tidak valid!' };
}

// =============================================================================
// DATA MASTER 16 PERTEMUAN PRAKTIKUM SISTEM INFORMASI GEOGRAFIS (SIG)
// =============================================================================

export const DEFAULT_SIG_MEETINGS = [
  { 
    id: 1, 
    name: 'Pertemuan 1', 
    title: 'Pengenalan SIG, Data Spasial & Software QGIS / ArcGIS', 
    week: 'Minggu 1',
    desc: 'Konsep dasar data spasial vektor & raster, antarmuka perangkat lunak QGIS, dan instalasi plugin geodesi.'
  },
  { 
    id: 2, 
    name: 'Pertemuan 2', 
    title: 'Sistem Koordinat, Datum Geodesi & Proyeksi Peta (WGS 84 & UTM)', 
    week: 'Minggu 2',
    desc: 'Pemahaman sistem koordinat geografis vs UTM, transformasi proyeksi spasial, dan penentuan zona UTM Indonesia.'
  },
  { 
    id: 3, 
    name: 'Pertemuan 3', 
    title: 'Rektifikasi Citra Satelit & Georeferencing Peta Raster', 
    week: 'Minggu 3',
    desc: 'Penetapan Titik Kontrol Tanah (GCP), koreksi geometrik peta cetak analog, dan evaluasi Root Mean Square Error (RMSE).'
  },
  { 
    id: 4, 
    name: 'Pertemuan 4', 
    title: 'Digitasi Peta Vektor (Titik, Garis, Poligon) & Topology Snapping', 
    week: 'Minggu 4',
    desc: 'Pembuatan shapefile baru (SHP/GeoPackage), teknik on-screen digitizing, snapping rules, dan pencegahan overlap poligon.'
  },
  { 
    id: 5, 
    name: 'Pertemuan 5', 
    title: 'Manajemen Tabel Atribut Spasial & Field Calculator', 
    week: 'Minggu 5',
    desc: 'Pengisian data atribut spasial, kalkulasi luas area ($area) dan panjang ($length), serta query SQL kondisional.'
  },
  { 
    id: 6, 
    name: 'Pertemuan 6', 
    title: 'Sumber Data Terbuka (OpenStreetMap, DEMNAS & Citra Satelit)', 
    week: 'Minggu 6',
    desc: 'Akuisisi data geospasial terbuka Indonesia (Tanah Air Indonesia / Ina-Geoportal), DEMNAS, dan citra Landsat/Sentinel.'
  },
  { 
    id: 7, 
    name: 'Pertemuan 7', 
    title: 'Geoprocessing Vektor I: Dissolve, Clip, Merge & Intersect', 
    week: 'Minggu 7',
    desc: 'Operasi geoprocessing dasar untuk memotong batas administrasi, menggabungkan layer, dan ekstraksi fitur irisan.'
  },
  { 
    id: 8, 
    name: 'Pertemuan 8', 
    title: 'Evaluasi Tengah Praktikum (Review UTS - Analisis Vektor Dasar)', 
    week: 'Minggu 8',
    desc: 'Evaluasi keterampilan mandiri mahasiswa dalam georeferencing, digitasi, dan pemotongan area kajian wilayah.'
  },
  { 
    id: 9, 
    name: 'Pertemuan 9', 
    title: 'Geoprocessing Vektor II: Buffer Spasial & Analisis Jangkauan', 
    week: 'Minggu 9',
    desc: 'Pembuatan zona penyangga (buffer) multi-ring untuk analisis sempadan sungai, radius fasilitas umum, dan mitigasi bahaya.'
  },
  { 
    id: 10, 
    name: 'Pertemuan 10', 
    title: 'Analisis Raster, Digital Elevation Model (DEM) & Kemiringan Lereng (Slope)', 
    week: 'Minggu 10',
    desc: 'Ekstraksi kontur, kalkulasi slope/kemiringan lereng persen dan derajat, hillshade, serta analisis aspek topografi.'
  },
  { 
    id: 11, 
    name: 'Pertemuan 11', 
    title: 'Analisis Spasial Multi-Kriteria (Weighted Overlay / Zonasi Rawan)', 
    week: 'Minggu 11',
    desc: 'Skoring dan pembobotan kriteria spasial raster untuk penentuan zonasi rawan bencana alam atau kesesuaian lahan.'
  },
  { 
    id: 12, 
    name: 'Pertemuan 12', 
    title: 'Interpolasi Spasial (IDW & Kriging) & Sebaran Spasial Titik', 
    week: 'Minggu 12',
    desc: 'Interpolasi data titik stasiun cuaca/curah hujan menjadi permukaan raster menggunakan metode Inverse Distance Weighting.'
  },
  { 
    id: 13, 
    name: 'Pertemuan 13', 
    title: 'Simbologi Lanjut, Klasifikasi Data & Desain Kartografi Tematik', 
    week: 'Minggu 13',
    desc: 'Penerapan kaidah kartografi modern: klasifikasi Natural Breaks/Equal Interval, gradasi warna tematik, dan simbologi visual.'
  },
  { 
    id: 14, 
    name: 'Pertemuan 14', 
    title: 'Layout Peta Tematik Standar Badan Informasi Geospasial (BIG)', 
    week: 'Minggu 14',
    desc: 'Penyusunan tata letak peta cetak formal: grid koordinat UTM, legenda resmi, skala grafis & numerik, petunjuk arah utara, dan inset peta.'
  },
  { 
    id: 15, 
    name: 'Pertemuan 15', 
    title: 'Pengenalan WebGIS, Leaflet / Mapbox & Publikasi Geoserver', 
    week: 'Minggu 15',
    desc: 'Konversi data geospasial ke GeoJSON, pembuatan peta interaktif berbasis web dengan Leaflet.js, dan sharing peta online.'
  },
  { 
    id: 16, 
    name: 'Pertemuan 16', 
    title: 'Ujian Komprehensif & Presentasi Proyek Akhir Peta SIG', 
    week: 'Minggu 16',
    desc: 'Evaluasi akhir dan presentasi hasil analisis spasial mandiri serta produk peta tematik siap cetak berstandar kartografi.'
  },
];

export const MEETINGS = DEFAULT_SIG_MEETINGS;

/**
 * Mengambil daftar 16 pertemuan dari LocalStorage
 */
export function getMeetings() {
  if (typeof window === 'undefined') return DEFAULT_SIG_MEETINGS;
  const data = localStorage.getItem(STORAGE_KEYS.MEETINGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(DEFAULT_SIG_MEETINGS));
    return DEFAULT_SIG_MEETINGS;
  }
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_SIG_MEETINGS;
  } catch {
    return DEFAULT_SIG_MEETINGS;
  }
}

/**
 * Mengambil data satu pertemuan berdasarkan ID
 */
export function getMeetingById(meetingId) {
  const list = getMeetings();
  return list.find((m) => m.id === Number(meetingId)) || DEFAULT_SIG_MEETINGS.find((m) => m.id === Number(meetingId)) || null;
}

/**
 * UPDATE: Mengubah nama, judul, minggu, atau deskripsi sesi pertemuan praktikum
 */
export function updateMeeting(meetingId, { name, title, week, desc }) {
  const meetings = getMeetings();
  const index = meetings.findIndex((m) => m.id === Number(meetingId));
  if (index === -1) {
    return { success: false, message: 'Pertemuan tidak ditemukan!' };
  }

  meetings[index] = {
    ...meetings[index],
    name: name ? name.trim() : meetings[index].name,
    title: title ? title.trim() : meetings[index].title,
    week: week ? week.trim() : meetings[index].week,
    desc: desc ? desc.trim() : meetings[index].desc,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  return { success: true, meeting: meetings[index] };
}

/**
 * Mereset judul seluruh 16 pertemuan ke silabus SIG default
 */
export function resetMeetingsToDefault() {
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(DEFAULT_SIG_MEETINGS));
  return DEFAULT_SIG_MEETINGS;
}

// =============================================================================
// OPERASI CRUD DATA MAHASISWA REAL (DINAMIS MURNI TANPA DUMMY)
// =============================================================================

const LEGACY_DUMMY_NPMS = new Set(['2108101001', '2108101002', '2108101003', '2108101004', '2108101005']);

/**
 * Mengambil daftar praktikan dari localStorage
 */
export function getStudents() {
  if (typeof window === 'undefined') return [];

  const hasCleaned = localStorage.getItem(STORAGE_KEYS.CLEANED_DUMMY_V2);
  const rawData = localStorage.getItem(STORAGE_KEYS.STUDENTS);

  if (!hasCleaned && rawData) {
    try {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) {
        const realOnly = parsed.filter((s) => !LEGACY_DUMMY_NPMS.has(String(s.npm)));
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(realOnly));
        localStorage.setItem(STORAGE_KEYS.CLEANED_DUMMY_V2, 'true');
        return realOnly;
      }
    } catch {
      // Abaikan error parse
    }
  }

  if (!hasCleaned) {
    localStorage.setItem(STORAGE_KEYS.CLEANED_DUMMY_V2, 'true');
  }

  if (!rawData) return [];

  try {
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error membaca data praktikan:', err);
    return [];
  }
}

/**
 * Menyimpan array mahasiswa ke LocalStorage
 */
export function setStudents(studentsList) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(studentsList));
}

/**
 * CREATE: Menambahkan mahasiswa baru ke sistem & sinkron ke Supabase Cloud
 */
export function addStudent({ npm, name, classGroup = 'SIG-A' }) {
  const cleanNpm = String(npm || '').trim();
  const cleanName = String(name || '').trim();
  const cleanClass = String(classGroup || 'SIG-A').trim();

  if (!cleanNpm) return { success: false, message: 'NPM wajib diisi!' };
  if (!cleanName) return { success: false, message: 'Nama lengkap wajib diisi!' };

  const currentStudents = getStudents();

  const isDuplicate = currentStudents.some(
    (st) => st.npm.toLowerCase() === cleanNpm.toLowerCase()
  );
  if (isDuplicate) {
    return { success: false, message: `NPM "${cleanNpm}" sudah terdaftar di sistem!` };
  }

  const newStudent = {
    id: Date.now(),
    npm: cleanNpm,
    name: cleanName,
    classGroup: cleanClass,
    createdAt: new Date().toISOString()
  };

  const updated = [newStudent, ...currentStudents];
  setStudents(updated);

  // Kirim ke Supabase Cloud secara non-blocking di latar belakang
  if (isSupabaseConfigured()) {
    saveStudentToSupabase(newStudent).catch((err) => {
      console.warn('Gagal sinkronisasi praktikan ke Supabase:', err);
    });
  }

  return { 
    success: true, 
    student: newStudent,
    message: 'Praktikan berhasil ditambahkan!' 
  };
}

/**
 * UPDATE: Mengubah data mahasiswa yang sudah ada & sinkron ke Supabase Cloud
 */
export function updateStudent(oldNpm, { npm, name, classGroup }) {
  const cleanOldNpm = String(oldNpm).trim();
  const cleanNewNpm = String(npm || '').trim();
  const cleanName = String(name || '').trim();
  const cleanClass = String(classGroup || 'SIG-A').trim();

  if (!cleanNewNpm || !cleanName) {
    return { success: false, message: 'NPM dan Nama tidak boleh kosong!' };
  }

  const currentStudents = getStudents();
  const studentIndex = currentStudents.findIndex((st) => st.npm === cleanOldNpm);
  if (studentIndex === -1) {
    return { success: false, message: 'Data mahasiswa tidak ditemukan!' };
  }

  if (cleanNewNpm !== cleanOldNpm) {
    const duplicate = currentStudents.some(
      (st) => st.npm.toLowerCase() === cleanNewNpm.toLowerCase()
    );
    if (duplicate) {
      return { success: false, message: `NPM "${cleanNewNpm}" sudah dipakai oleh mahasiswa lain!` };
    }

    const scores = getScores();
    let scoresMigrated = false;
    Object.keys(scores).forEach((meetingId) => {
      if (scores[meetingId] && scores[meetingId][cleanOldNpm]) {
        scores[meetingId][cleanNewNpm] = scores[meetingId][cleanOldNpm];
        delete scores[meetingId][cleanOldNpm];
        scoresMigrated = true;
      }
    });
    if (scoresMigrated) {
      localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
    }

    if (isSupabaseConfigured()) {
      deleteStudentFromSupabase(cleanOldNpm).catch(() => {});
    }
  }

  currentStudents[studentIndex] = {
    ...currentStudents[studentIndex],
    npm: cleanNewNpm,
    name: cleanName,
    classGroup: cleanClass,
    updatedAt: new Date().toISOString()
  };

  setStudents(currentStudents);

  if (isSupabaseConfigured()) {
    saveStudentToSupabase(currentStudents[studentIndex]).catch(() => {});
  }

  return { success: true, student: currentStudents[studentIndex] };
}

/**
 * DELETE: Menghapus data mahasiswa dan riwayat nilainya (Cascade)
 */
export function deleteStudent(npm) {
  const cleanNpm = String(npm).trim();
  const currentStudents = getStudents();
  const filtered = currentStudents.filter((st) => st.npm !== cleanNpm);

  if (filtered.length === currentStudents.length) {
    return { success: false, message: 'Mahasiswa tidak ditemukan!' };
  }

  setStudents(filtered);

  const scores = getScores();
  let changed = false;
  Object.keys(scores).forEach((meetingId) => {
    if (scores[meetingId] && scores[meetingId][cleanNpm]) {
      delete scores[meetingId][cleanNpm];
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
  }

  if (isSupabaseConfigured()) {
    deleteStudentFromSupabase(cleanNpm).catch(() => {});
  }

  return { success: true };
}

/**
 * Mengosongkan seluruh lembar kerja data mahasiswa & nilai
 */
export function clearAllStudentData() {
  localStorage.setItem(STORAGE_KEYS.CLEANED_DUMMY_V2, 'true');
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify({}));
  return { success: true };
}

export const clearAllDummyData = clearAllStudentData;

/**
 * Impor cepat banyak mahasiswa sekaligus dari array objek
 */
export function bulkImportStudents(studentsList) {
  if (!Array.isArray(studentsList) || studentsList.length === 0) {
    return { success: false, count: 0, message: 'Daftar mahasiswa kosong!' };
  }

  const existing = getStudents();
  const existingNpmSet = new Set(existing.map((s) => s.npm.toLowerCase()));
  const newStudents = [];

  studentsList.forEach((item) => {
    const npm = String(item.npm || '').trim();
    const name = String(item.name || '').trim();
    const classGroup = String(item.classGroup || 'SIG-A').trim();

    if (npm && name && !existingNpmSet.has(npm.toLowerCase())) {
      existingNpmSet.add(npm.toLowerCase());
      const studentObj = {
        id: Date.now() + Math.random(),
        npm,
        name,
        classGroup,
        createdAt: new Date().toISOString()
      };
      newStudents.push(studentObj);

      if (isSupabaseConfigured()) {
        saveStudentToSupabase(studentObj).catch(() => {});
      }
    }
  });

  if (newStudents.length === 0) {
    return { success: false, count: 0, message: 'Semua NPM pada daftar sudah terdaftar sebelumnya!' };
  }

  const updated = [...existing, ...newStudents];
  setStudents(updated);
  return { success: true, count: newStudents.length };
}

// =============================================================================
// OPERASI PENILAIAN PRAKTIKUM SISTEM INFORMASI GEOGRAFIS (SIG)
// =============================================================================

export function getScores() {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(STORAGE_KEYS.SCORES);
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error('Error membaca data nilai:', err);
    return {};
  }
}

export function getStudentMeetingScore(meetingId, studentNpm) {
  const scores = getScores();
  if (scores[meetingId] && scores[meetingId][studentNpm]) {
    return scores[meetingId][studentNpm];
  }
  return null;
}

export function saveStudentScore(meetingId, studentNpm, scorePayload) {
  const currentScores = getScores();
  
  const c1 = Number(scorePayload.kartografi ?? scorePayload.desain ?? 0);
  const c2 = Number(scorePayload.software ?? scorePayload.kelancaran ?? 0);
  const c3 = Number(scorePayload.analisis ?? scorePayload.mengerti ?? 0);
  const c4 = Number(scorePayload.penjelasan ?? 0);

  const average = Number(((c1 + c2 + c3 + c4) / 4).toFixed(2));

  if (!currentScores[meetingId]) {
    currentScores[meetingId] = {};
  }

  const scoreObj = {
    kartografi: c1,
    desain: c1,
    software: c2,
    kelancaran: c2,
    analisis: c3,
    mengerti: c3,
    penjelasan: c4,
    average: average,
    updatedAt: new Date().toISOString(),
  };

  currentScores[meetingId][studentNpm] = scoreObj;
  localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(currentScores));

  if (isSupabaseConfigured()) {
    saveScoreToSupabase(meetingId, studentNpm, scoreObj).catch(() => {});
  }

  return scoreObj;
}

export function getMeetingProgress(meetingId) {
  const students = getStudents();
  const total = students.length;
  if (total === 0) return { total: 0, graded: 0, percentage: 0, isComplete: false };

  const scores = getScores();
  const meetingScores = scores[meetingId] || {};
  
  let graded = 0;
  students.forEach((st) => {
    if (meetingScores[st.npm]) {
      graded += 1;
    }
  });

  const percentage = Math.round((graded / total) * 100);
  return {
    total,
    graded,
    percentage,
    isComplete: graded === total && total > 0,
  };
}

export function calculateStudentRecap(studentNpm) {
  const scores = getScores();
  const meetingGrades = {};
  let totalScoreSum = 0;
  let filledMeetingsCount = 0;

  for (let i = 1; i <= 16; i++) {
    const meetingScore = scores[i] && scores[i][studentNpm];
    if (meetingScore) {
      meetingGrades[i] = meetingScore.average;
      totalScoreSum += meetingScore.average;
      filledMeetingsCount += 1;
    } else {
      meetingGrades[i] = null;
    }
  }

  const finalAverage = filledMeetingsCount > 0 
    ? Number((totalScoreSum / filledMeetingsCount).toFixed(2)) 
    : 0;

  let gradeLetter = '-';
  let statusBadge = 'Belum Ada Nilai';
  if (filledMeetingsCount > 0) {
    if (finalAverage >= 85) { gradeLetter = 'A'; statusBadge = 'Sangat Memuaskan'; }
    else if (finalAverage >= 75) { gradeLetter = 'B'; statusBadge = 'Memuaskan'; }
    else if (finalAverage >= 65) { gradeLetter = 'C'; statusBadge = 'Cukup'; }
    else if (finalAverage >= 50) { gradeLetter = 'D'; statusBadge = 'Kurang'; }
    else { gradeLetter = 'E'; statusBadge = 'Tidak Lulus'; }
  }

  return {
    meetingGrades,
    filledMeetingsCount,
    finalAverage,
    gradeLetter,
    statusBadge,
  };
}

export function exportDatabaseJson() {
  const data = {
    app: 'Portal Penilaian Praktikum Laboratorium Sistem Informasi Geografis (SIG)',
    version: '3.1.0',
    exportedAt: new Date().toISOString(),
    meetings: getMeetings(),
    students: getStudents(),
    scores: getScores(),
    users: getUsers(),
  };
  return JSON.stringify(data, null, 2);
}

export function importDatabaseJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.meetings && Array.isArray(parsed.meetings)) {
      localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(parsed.meetings));
    }
    if (parsed.students && Array.isArray(parsed.students)) {
      setStudents(parsed.students);
    }
    if (parsed.scores && typeof parsed.scores === 'object') {
      localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(parsed.scores));
    }
    if (parsed.users && Array.isArray(parsed.users)) {
      setUsers(parsed.users);
    }
    return { success: true };
  } catch {
    return { success: false, message: 'Format file JSON cadangan tidak valid!' };
  }
}

export function resetDataToDefault() {
  clearAllStudentData();
  resetMeetingsToDefault();
}
