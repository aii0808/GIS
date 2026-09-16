-- =========================================================================
-- SKEMA DATABASE PORTAL PENILAIAN PRAKTIKUM SISTEM INFORMASI GEOGRAFIS (SIG)
-- Salin seluruh kode ini dan jalankan di menu "SQL Editor" pada dashboard Supabase
-- Dashboard URL: https://supabase.com/dashboard/project/iqxwmjihohiypethbmqe/sql
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
