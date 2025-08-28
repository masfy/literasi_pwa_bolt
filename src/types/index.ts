export interface User {
  id: string;
  role: 'guru' | 'siswa';
  nama: string;
  email: string;
  username: string;
  kelas_id?: string;
  aktif: boolean;
  created_at: string;
  updated_at: string;
}

export interface Kelas {
  id: string;
  nama_kelas: string;
  wali_guru_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Aktivitas {
  id: string;
  siswa_id: string;
  kelas_id: string;
  judul_bacaan: string;
  jenis_bacaan: 'buku' | 'artikel' | 'komik' | 'pdf' | 'tautan';
  penulis_sumber: string;
  tanggal_baca: string;
  durasi_menit: number;
  ringkasan: string;
  refleksi: string;
  bukti_url?: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  catatan_verifikasi?: string;
  verifikator_id?: string;
  verifikasi_at?: string;
  poin: number;
  created_at: string;
  updated_at: string;
  siswa_nama?: string;
}

export interface Level {
  id: string;
  nama_level: string;
  min_poin: number;
  max_poin: number;
  deskripsi?: string;
}

export interface DashboardStats {
  total_kelas?: number;
  total_siswa?: number;
  aktivitas_menunggu?: number;
  aktivitas_disetujui_bulan_ini?: number;
  total_poin?: number;
  level_saat_ini?: Level;
  aktivitas_disetujui?: number;
  aktivitas_ditolak?: number;
}

export interface LeaderboardEntry {
  posisi: number;
  siswa_id: string;
  nama: string;
  total_poin: number;
  level: Level;
  total_durasi: number;
  jumlah_aktivitas: number;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}