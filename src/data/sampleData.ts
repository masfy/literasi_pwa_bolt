// Sample data untuk demo dan testing
export const sampleUsers = [
  {
    id: '1',
    role: 'guru',
    nama: 'Ibu Sari Wijaya',
    email: 'sari.wijaya@sekolah.sch.id',
    username: 'guru1',
    password_hash: 'password123',
    kelas_id: '',
    aktif: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    role: 'siswa',
    nama: 'Ahmad Rizki',
    email: 'ahmad.rizki@student.sch.id',
    username: 'siswa1',
    password_hash: 'password123',
    kelas_id: 'kelas1',
    aktif: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    role: 'siswa',
    nama: 'Siti Nurhaliza',
    email: 'siti.nurhaliza@student.sch.id',
    username: 'siswa2',
    password_hash: 'password123',
    kelas_id: 'kelas1',
    aktif: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '4',
    role: 'siswa',
    nama: 'Budi Santoso',
    email: 'budi.santoso@student.sch.id',
    username: 'siswa3',
    password_hash: 'password123',
    kelas_id: 'kelas1',
    aktif: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '5',
    role: 'siswa',
    nama: 'Dewi Kartika',
    email: 'dewi.kartika@student.sch.id',
    username: 'siswa4',
    password_hash: 'password123',
    kelas_id: 'kelas2',
    aktif: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '6',
    role: 'siswa',
    nama: 'Raka Pratama',
    email: 'raka.pratama@student.sch.id',
    username: 'siswa5',
    password_hash: 'password123',
    kelas_id: 'kelas2',
    aktif: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '7',
    role: 'siswa',
    nama: 'Maya Sari',
    email: 'maya.sari@student.sch.id',
    username: 'siswa6',
    password_hash: 'password123',
    kelas_id: 'kelas2',
    aktif: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];

export const sampleKelas = [
  {
    id: 'kelas1',
    nama_kelas: 'VIII A',
    wali_guru_id: '1',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'kelas2',
    nama_kelas: 'VIII B',
    wali_guru_id: '1',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];

export const sampleLevels = [
  {
    id: 'level1',
    nama_level: 'Level 1',
    min_poin: 0,
    max_poin: 99,
    deskripsi: 'Pembaca Pemula - Mulai membangun kebiasaan literasi'
  },
  {
    id: 'level2',
    nama_level: 'Level 2',
    min_poin: 100,
    max_poin: 199,
    deskripsi: 'Pembaca Aktif - Konsisten dalam kegiatan literasi'
  },
  {
    id: 'level3',
    nama_level: 'Level 3',
    min_poin: 200,
    max_poin: 349,
    deskripsi: 'Pembaca Berpengalaman - Memiliki wawasan literasi yang luas'
  },
  {
    id: 'level4',
    nama_level: 'Level 4',
    min_poin: 350,
    max_poin: -1,
    deskripsi: 'Master Literasi - Teladan dalam kegiatan literasi'
  }
];

export const sampleAktivitas = [
  {
    id: 'aktivitas1',
    siswa_id: '2',
    kelas_id: 'kelas1',
    judul_bacaan: 'Laskar Pelangi',
    jenis_bacaan: 'buku',
    penulis_sumber: 'Andrea Hirata',
    tanggal_baca: '2024-01-20',
    durasi_menit: 45,
    ringkasan: 'Buku ini bercerita tentang sepuluh anak dari keluarga miskin di Belitung yang berjuang menempuh pendidikan. Mereka menghadapi berbagai tantangan namun tetap semangat belajar di sekolah Muhammadiyah.',
    refleksi: 'Saya sangat terkesan dengan semangat anak-anak Laskar Pelangi yang tidak mudah menyerah meskipun hidup dalam keterbatasan.',
    bukti_url: '',
    status: 'Disetujui',
    catatan_verifikasi: '',
    verifikator_id: '1',
    verifikasi_at: '2024-01-21T00:00:00Z',
    poin: 45,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-21T00:00:00Z',
    siswa_nama: 'Ahmad Rizki'
  },
  {
    id: 'aktivitas2',
    siswa_id: '3',
    kelas_id: 'kelas1',
    judul_bacaan: 'Sang Pemimpi',
    jenis_bacaan: 'buku',
    penulis_sumber: 'Andrea Hirata',
    tanggal_baca: '2024-01-19',
    durasi_menit: 60,
    ringkasan: 'Kelanjutan dari Laskar Pelangi yang menceritakan perjalanan Ikal, Arai, dan Jimbron mengejar mimpi mereka untuk kuliah di luar negeri.',
    refleksi: 'Buku ini mengajarkan pentingnya memiliki mimpi besar dan bekerja keras untuk mencapainya.',
    bukti_url: '',
    status: 'Disetujui',
    catatan_verifikasi: '',
    verifikator_id: '1',
    verifikasi_at: '2024-01-20T00:00:00Z',
    poin: 72,
    created_at: '2024-01-19T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    siswa_nama: 'Siti Nurhaliza'
  },
  {
    id: 'aktivitas3',
    siswa_id: '4',
    kelas_id: 'kelas1',
    judul_bacaan: 'Artikel Manfaat Membaca',
    jenis_bacaan: 'artikel',
    penulis_sumber: 'Kompas.com',
    tanggal_baca: '2024-01-22',
    durasi_menit: 15,
    ringkasan: 'Artikel menjelaskan berbagai manfaat membaca untuk kesehatan otak dan peningkatan kemampuan kognitif.',
    refleksi: 'Setelah membaca artikel ini, saya jadi lebih termotivasi untuk rutin membaca setiap hari.',
    bukti_url: '',
    status: 'Menunggu',
    catatan_verifikasi: '',
    verifikator_id: '',
    verifikasi_at: '',
    poin: 0,
    created_at: '2024-01-22T00:00:00Z',
    updated_at: '2024-01-22T00:00:00Z',
    siswa_nama: 'Budi Santoso'
  }
];