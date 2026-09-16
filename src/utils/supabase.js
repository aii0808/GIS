/**
 * Utilitas Klien Hybrid Supabase Cloud untuk Portal Praktikum SIG
 * Menggunakan pure native fetch ke Supabase REST & Auth API.
 * Mendukung penyimpanan lokal jika offline, dan otomatis sinkron ke Cloud saat dikonfigurasi.
 * Mengelola tabel: sig_students, sig_meetings, sig_scores, dan sig_users (Admin & Dosen).
 */

const SUPABASE_STORAGE_KEYS = {
  URL: 'portal_sig_supabase_url',
  ANON_KEY: 'portal_sig_supabase_key',
};

// Kredensial Default Supabase Cloud Proyek
export const DEFAULT_SUPABASE_URL = 'https://iqxwmjihohiypethbmqe.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_FvqvIwB8eXUudnDIvIzJEg__tb8fu2T';

/**
 * Membersihkan dan menormalisasi URL Supabase
 */
export function normalizeSupabaseUrl(rawUrl) {
  if (!rawUrl) return '';
  return String(rawUrl)
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/rest\/v1\/?$/, '');
}

/**
 * Mengambil konfigurasi Supabase (URL dan Anon Key)
 */
export function getSupabaseConfig() {
  if (typeof window === 'undefined') {
    return { 
      url: DEFAULT_SUPABASE_URL, 
      anonKey: DEFAULT_SUPABASE_KEY, 
      isConfigured: true 
    };
  }
  
  const savedUrl = localStorage.getItem(SUPABASE_STORAGE_KEYS.URL) 
    || import.meta.env?.VITE_SUPABASE_URL 
    || DEFAULT_SUPABASE_URL;

  const savedKey = localStorage.getItem(SUPABASE_STORAGE_KEYS.ANON_KEY) 
    || import.meta.env?.VITE_SUPABASE_ANON_KEY 
    || DEFAULT_SUPABASE_KEY;

  const cleanUrl = normalizeSupabaseUrl(savedUrl);
  const cleanKey = String(savedKey || '').trim();

  return {
    url: cleanUrl,
    anonKey: cleanKey,
    isConfigured: Boolean(cleanUrl && cleanKey),
  };
}

/**
 * Mengecek apakah Supabase Cloud sudah dikonfigurasi
 */
export function isSupabaseConfigured() {
  return getSupabaseConfig().isConfigured;
}

/**
 * Menyimpan konfigurasi Supabase ke LocalStorage
 */
export function saveSupabaseConfig(url, anonKey) {
  if (typeof window === 'undefined') return;
  const cleanUrl = normalizeSupabaseUrl(url);
  const cleanKey = String(anonKey || '').trim();

  if (cleanUrl) {
    localStorage.setItem(SUPABASE_STORAGE_KEYS.URL, cleanUrl);
  } else {
    localStorage.removeItem(SUPABASE_STORAGE_KEYS.URL);
  }

  if (cleanKey) {
    localStorage.setItem(SUPABASE_STORAGE_KEYS.ANON_KEY, cleanKey);
  } else {
    localStorage.removeItem(SUPABASE_STORAGE_KEYS.ANON_KEY);
  }

  return { url: cleanUrl, anonKey: cleanKey, isConfigured: Boolean(cleanUrl && cleanKey) };
}

/**
 * Menghapus konfigurasi Supabase (kembali ke Offline LocalStorage)
 */
export function clearSupabaseConfig() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SUPABASE_STORAGE_KEYS.URL);
  localStorage.removeItem(SUPABASE_STORAGE_KEYS.ANON_KEY);
}

/**
 * Helper Header Otorisasi Supabase
 */
function getSupabaseHeaders(anonKey, extra = {}) {
  return {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

/**
 * Memeriksa status tabel-tabel di Supabase
 */
export async function checkSupabaseTablesStatus() {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) {
    return { isConfigured: false, hasAllTables: false, tables: {} };
  }

  const tableList = ['sig_students', 'sig_meetings', 'sig_scores', 'sig_users'];
  const tableStatus = {};
  let existingCount = 0;

  for (const t of tableList) {
    try {
      const res = await fetch(`${cfg.url}/rest/v1/${t}?limit=1`, {
        method: 'GET',
        headers: getSupabaseHeaders(cfg.anonKey),
      });
      const exists = res.ok || res.status === 200;
      tableStatus[t] = exists;
      if (exists) existingCount++;
    } catch {
      tableStatus[t] = false;
    }
  }

  return {
    isConfigured: true,
    hasAllTables: existingCount === tableList.length,
    hasAnyTable: existingCount > 0,
    existingCount,
    totalTables: tableList.length,
    tables: tableStatus
  };
}

/**
 * Menguji koneksi ke Supabase Cloud
 */
export async function testSupabaseConnection(overrideUrl, overrideKey) {
  const cfg = overrideUrl && overrideKey 
    ? { url: normalizeSupabaseUrl(overrideUrl), anonKey: overrideKey.trim() }
    : getSupabaseConfig();

  if (!cfg.url || !cfg.anonKey) {
    return { success: false, message: 'URL Supabase atau Anon Key masih kosong!' };
  }

  try {
    // 1. Tes Auth Settings endpoint Supabase (Respon 200 OK untuk Anon Key valid)
    const authEndpoint = `${cfg.url}/auth/v1/settings`;
    const authRes = await fetch(authEndpoint, {
      method: 'GET',
      headers: {
        'apikey': cfg.anonKey,
        'Authorization': `Bearer ${cfg.anonKey}`,
      },
    });

    if (authRes.ok || authRes.status === 200) {
      // 2. Cek apakah tabel sig_students sudah dibuat di PostgreSQL
      const tableCheck = await fetch(`${cfg.url}/rest/v1/sig_students?limit=1`, {
        method: 'GET',
        headers: {
          'apikey': cfg.anonKey,
          'Authorization': `Bearer ${cfg.anonKey}`,
        },
      });

      if (tableCheck.ok || tableCheck.status === 200) {
        return { 
          success: true, 
          hasTables: true,
          message: 'Koneksi ke Supabase Cloud terhubung & tabel database aktif!' 
        };
      }

      if (tableCheck.status === 404) {
        return { 
          success: true, 
          hasTables: false,
          message: 'Terhubung ke Supabase Cloud! Skema SQL perlu dijalankan di menu SQL Editor agar tabel mahasiswa & dosen dibuat.' 
        };
      }

      return { 
        success: true, 
        hasTables: true,
        message: 'Koneksi ke Supabase Cloud berhasil terhubung!' 
      };
    }

    return { 
      success: false, 
      message: `Supabase merespons dengan status ${authRes.status}: ${authRes.statusText}` 
    };
  } catch (err) {
    return { 
      success: false, 
      message: `Gagal menghubungi server Supabase (${err.message}). Periksa koneksi internet Anda.` 
    };
  }
}

/**
 * Menyediakan skrip SQL otomatis lengkap untuk pembuatan tabel di Supabase SQL Editor
 */
export function getDatabaseSchemaSql() {
  return `-- =========================================================================
-- SKEMA DATABASE PORTAL PENILAIAN PRAKTIKUM SISTEM INFORMASI GEOGRAFIS (SIG)
-- Salin seluruh kode ini dan jalankan di menu "SQL Editor" pada dashboard Supabase
-- Link: https://supabase.com/dashboard/project/iqxwmjihohiypethbmqe/sql
-- =========================================================================

-- 1. Tabel Praktikan / Mahasiswa SIG Real
CREATE TABLE IF NOT EXISTS sig_students (
  id BIGINT PRIMARY KEY,
  npm VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  class_group VARCHAR(50) DEFAULT 'SIG-A',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Pertemuan Praktikum SIG (Judul & Topik Dinamis P1 - P16)
CREATE TABLE IF NOT EXISTS sig_meetings (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  week VARCHAR(50),
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Nilai Praktikum SIG (4 Kriteria: Kartografi, Software, Analisis, Penjelasan)
CREATE TABLE IF NOT EXISTS sig_scores (
  id BIGSERIAL PRIMARY KEY,
  meeting_id INT NOT NULL,
  student_npm VARCHAR(50) NOT NULL,
  kartografi NUMERIC(5,2) DEFAULT 0,
  software NUMERIC(5,2) DEFAULT 0,
  analisis NUMERIC(5,2) DEFAULT 0,
  penjelasan NUMERIC(5,2) DEFAULT 0,
  average NUMERIC(5,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (meeting_id, student_npm)
);

-- 4. Tabel Pengguna Sistem (Admin, Dosen Pengampu & Asisten Lab)
CREATE TABLE IF NOT EXISTS sig_users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'dosen',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buka Hak Akses Publik (Row Level Security untuk Asisten & Dosen)
ALTER TABLE sig_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sig_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sig_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sig_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access students" ON sig_students;
DROP POLICY IF EXISTS "Public full access meetings" ON sig_meetings;
DROP POLICY IF EXISTS "Public full access scores" ON sig_scores;
DROP POLICY IF EXISTS "Public full access users" ON sig_users;

CREATE POLICY "Public full access students" ON sig_students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access meetings" ON sig_meetings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access scores" ON sig_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access users" ON sig_users FOR ALL USING (true) WITH CHECK (true);

-- Akun Default Administrator
INSERT INTO sig_users (username, password, name, role) 
VALUES ('admin', 'admin', 'Administrator Lab SIG', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Indeks Pencarian Cepat
CREATE INDEX IF NOT EXISTS idx_students_npm ON sig_students (npm);
CREATE INDEX IF NOT EXISTS idx_scores_meeting ON sig_scores (meeting_id, student_npm);
CREATE INDEX IF NOT EXISTS idx_users_username ON sig_users (username);
`;
}

// =============================================================================
// OPERASI DOKUMEN MAHASISWA (SIG_STUDENTS)
// =============================================================================

/**
 * Tarik Data Mahasiswa dari Supabase Cloud
 */
export async function fetchStudentsFromSupabase() {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) return null;

  try {
    const res = await fetch(`${cfg.url}/rest/v1/sig_students?select=*&order=npm.asc`, {
      method: 'GET',
      headers: getSupabaseHeaders(cfg.anonKey),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.map((d) => ({
      id: d.id,
      npm: d.npm,
      name: d.name,
      classGroup: d.class_group || 'SIG-A',
      createdAt: d.created_at || new Date().toISOString(),
    }));
  } catch (e) {
    console.warn('Supabase fetchStudents error:', e.message);
    return null;
  }
}

/**
 * Simpan / Update Mahasiswa ke Supabase Cloud
 */
export async function saveStudentToSupabase(student) {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) return { success: false, reason: 'unconfigured' };

  try {
    const payload = {
      id: student.id || Date.now(),
      npm: student.npm,
      name: student.name,
      class_group: student.classGroup || 'SIG-A',
    };

    const res = await fetch(`${cfg.url}/rest/v1/sig_students?on_conflict=npm`, {
      method: 'POST',
      headers: getSupabaseHeaders(cfg.anonKey, {
        'Prefer': 'resolution=merge-duplicates',
      }),
      body: JSON.stringify(payload),
    });

    if (res.status === 404) {
      return { success: false, tableMissing: true, message: 'Tabel sig_students belum dibuat di Supabase SQL Editor!' };
    }

    return { success: res.ok };
  } catch (e) {
    console.warn('Gagal simpan mahasiswa ke Supabase:', e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Hapus Mahasiswa dari Supabase Cloud
 */
export async function deleteStudentFromSupabase(npm) {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) return false;

  try {
    await fetch(`${cfg.url}/rest/v1/sig_scores?student_npm=eq.${encodeURIComponent(npm)}`, {
      method: 'DELETE',
      headers: getSupabaseHeaders(cfg.anonKey),
    });

    const res = await fetch(`${cfg.url}/rest/v1/sig_students?npm=eq.${encodeURIComponent(npm)}`, {
      method: 'DELETE',
      headers: getSupabaseHeaders(cfg.anonKey),
    });

    return res.ok;
  } catch (e) {
    console.warn('Gagal hapus mahasiswa dari Supabase:', e.message);
    return false;
  }
}

// =============================================================================
// OPERASI PENGGUNA & DOSEN (SIG_USERS)
// =============================================================================

/**
 * Tarik Data Pengguna & Dosen dari Supabase Cloud
 */
export async function fetchUsersFromSupabase() {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) return null;

  try {
    const res = await fetch(`${cfg.url}/rest/v1/sig_users?select=*&order=id.asc`, {
      method: 'GET',
      headers: getSupabaseHeaders(cfg.anonKey),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.map((u) => ({
      id: u.id,
      username: u.username,
      password: u.password,
      name: u.name,
      role: u.role || 'dosen',
      createdAt: u.created_at || new Date().toISOString()
    }));
  } catch (e) {
    console.warn('Supabase fetchUsers error:', e.message);
    return null;
  }
}

/**
 * Simpan / Tambah Pengguna Baru ke Supabase Cloud
 */
export async function saveUserToSupabase(user) {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) return { success: false, reason: 'unconfigured' };

  try {
    const payload = {
      username: user.username.trim(),
      password: user.password.trim(),
      name: user.name.trim(),
      role: user.role || 'dosen',
    };

    const res = await fetch(`${cfg.url}/rest/v1/sig_users?on_conflict=username`, {
      method: 'POST',
      headers: getSupabaseHeaders(cfg.anonKey, {
        'Prefer': 'resolution=merge-duplicates',
      }),
      body: JSON.stringify(payload),
    });

    if (res.status === 404) {
      return { success: false, tableMissing: true, message: 'Tabel sig_users belum dibuat di Supabase SQL Editor!' };
    }

    return { success: res.ok };
  } catch (e) {
    console.warn('Gagal simpan user ke Supabase:', e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Hapus Pengguna dari Supabase Cloud
 */
export async function deleteUserFromSupabase(username) {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) return false;

  try {
    const res = await fetch(`${cfg.url}/rest/v1/sig_users?username=eq.${encodeURIComponent(username)}`, {
      method: 'DELETE',
      headers: getSupabaseHeaders(cfg.anonKey),
    });

    return res.ok;
  } catch (e) {
    console.warn('Gagal hapus user dari Supabase:', e.message);
    return false;
  }
}

// =============================================================================
// OPERASI NILAI (SIG_SCORES)
// =============================================================================

/**
 * Tarik Data Nilai dari Supabase Cloud
 */
export async function fetchScoresFromSupabase() {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) return null;

  try {
    const res = await fetch(`${cfg.url}/rest/v1/sig_scores?select=*`, {
      method: 'GET',
      headers: getSupabaseHeaders(cfg.anonKey),
    });

    if (!res.ok) return null;
    const data = await res.json();
    
    const result = {};
    data.forEach((row) => {
      const mId = String(row.meeting_id);
      if (!result[mId]) result[mId] = {};
      result[mId][row.student_npm] = {
        kartografi: Number(row.kartografi || 0),
        desain: Number(row.kartografi || 0),
        software: Number(row.software || 0),
        kelancaran: Number(row.software || 0),
        analisis: Number(row.analisis || 0),
        mengerti: Number(row.analisis || 0),
        penjelasan: Number(row.penjelasan || 0),
        average: Number(row.average || 0),
        updatedAt: row.updated_at || new Date().toISOString(),
      };
    });
    return result;
  } catch (e) {
    console.warn('Supabase fetchScores error:', e.message);
    return null;
  }
}

/**
 * Simpan / Update Nilai Praktikum ke Supabase Cloud
 */
export async function saveScoreToSupabase(meetingId, studentNpm, sc) {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) return false;

  try {
    const payload = {
      meeting_id: Number(meetingId),
      student_npm: studentNpm,
      kartografi: Number(sc.kartografi ?? sc.desain ?? 0),
      software: Number(sc.software ?? sc.kelancaran ?? 0),
      analisis: Number(sc.analisis ?? sc.mengerti ?? 0),
      penjelasan: Number(sc.penjelasan ?? 0),
      average: Number(sc.average || 0),
      updated_at: new Date().toISOString(),
    };

    const res = await fetch(`${cfg.url}/rest/v1/sig_scores?on_conflict=meeting_id,student_npm`, {
      method: 'POST',
      headers: getSupabaseHeaders(cfg.anonKey, {
        'Prefer': 'resolution=merge-duplicates',
      }),
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (e) {
    console.warn('Gagal simpan nilai ke Supabase:', e.message);
    return false;
  }
}

// =============================================================================
// OPERASI PERTEMUAN (SIG_MEETINGS)
// =============================================================================

/**
 * Tarik Data Pertemuan dari Supabase Cloud
 */
export async function fetchMeetingsFromSupabase() {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) return null;

  try {
    const res = await fetch(`${cfg.url}/rest/v1/sig_meetings?select=*&order=id.asc`, {
      method: 'GET',
      headers: getSupabaseHeaders(cfg.anonKey),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((m) => ({
        id: m.id,
        name: m.name,
        title: m.title,
        week: m.week,
        desc: m.description || '',
      }));
    }
    return null;
  } catch (e) {
    console.warn('Supabase fetchMeetings error:', e.message);
    return null;
  }
}

/**
 * Sinkronisasi data lokal ke Supabase Cloud (Push)
 */
export async function syncLocalToSupabase(students, meetings, scores, users) {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) {
    return { success: false, message: 'Supabase Cloud belum dikonfigurasi!' };
  }

  try {
    const headers = getSupabaseHeaders(cfg.anonKey, {
      'Prefer': 'resolution=merge-duplicates',
    });

    // 1. Upload Mahasiswa
    if (students && students.length > 0) {
      const studentPayload = students.map((s) => ({
        id: s.id || Date.now() + Math.floor(Math.random() * 1000),
        npm: s.npm,
        name: s.name,
        class_group: s.classGroup || 'SIG-A',
      }));

      const resSt = await fetch(`${cfg.url}/rest/v1/sig_students?on_conflict=npm`, {
        method: 'POST',
        headers,
        body: JSON.stringify(studentPayload),
      });

      if (resSt.status === 404) {
        return { 
          success: false, 
          tableMissing: true, 
          message: 'Tabel belum ada di Supabase! Harap jalankan kode SQL di menu SQL Editor Supabase terlebih dahulu.' 
        };
      }
    }

    // 2. Upload Pertemuan SIG
    if (meetings && meetings.length > 0) {
      const meetingPayload = meetings.map((m) => ({
        id: m.id,
        name: m.name,
        title: m.title,
        week: m.week,
        description: m.desc || '',
      }));

      await fetch(`${cfg.url}/rest/v1/sig_meetings?on_conflict=id`, {
        method: 'POST',
        headers,
        body: JSON.stringify(meetingPayload),
      });
    }

    // 3. Upload Nilai Praktikum SIG
    if (scores && typeof scores === 'object') {
      const scoreRows = [];
      Object.entries(scores).forEach(([meetingId, meetingScores]) => {
        if (meetingScores && typeof meetingScores === 'object') {
          Object.entries(meetingScores).forEach(([studentNpm, sc]) => {
            if (sc) {
              scoreRows.push({
                meeting_id: Number(meetingId),
                student_npm: studentNpm,
                kartografi: Number(sc.kartografi ?? sc.desain ?? 0),
                software: Number(sc.software ?? sc.kelancaran ?? 0),
                analisis: Number(sc.analisis ?? sc.mengerti ?? 0),
                penjelasan: Number(sc.penjelasan ?? 0),
                average: Number(sc.average || 0),
              });
            }
          });
        }
      });

      if (scoreRows.length > 0) {
        await fetch(`${cfg.url}/rest/v1/sig_scores?on_conflict=meeting_id,student_npm`, {
          method: 'POST',
          headers,
          body: JSON.stringify(scoreRows),
        });
      }
    }

    // 4. Upload Pengguna / Dosen
    if (users && Array.isArray(users) && users.length > 0) {
      const userPayload = users.map((u) => ({
        username: u.username,
        password: u.password,
        name: u.name,
        role: u.role || 'dosen',
      }));

      await fetch(`${cfg.url}/rest/v1/sig_users?on_conflict=username`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userPayload),
      });
    }

    return { 
      success: true, 
      message: 'Data mahasiswa, pertemuan, nilai, dan akun dosen berhasil disinkronkan ke Supabase Cloud!' 
    };
  } catch (err) {
    return { 
      success: false, 
      message: `Gagal sinkronisasi data: ${err.message}` 
    };
  }
}

