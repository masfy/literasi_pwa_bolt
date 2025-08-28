# Lentera - Aplikasi Manajemen Aktivitas Literasi

PWA (Progressive Web App) untuk manajemen aktivitas literasi dengan sistem poin dan level untuk guru dan siswa.

## Fitur Utama

### Untuk Guru:
- Dashboard dengan statistik komprehensif
- Manajemen kelas dan siswa (CRUD)
- Verifikasi aktivitas literasi siswa
- Sistem poin dan level otomatis
- Rekap dan laporan dengan filter
- Leaderboard per kelas

### Untuk Siswa:
- Dashboard personal dengan progress tracking
- Submit aktivitas literasi dengan validasi
- Tracking poin dan pencapaian level
- Lihat riwayat aktivitas (disetujui/menunggu/ditolak)
- Leaderboard kelas

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **PWA**: Service Worker + Web App Manifest
- **Backend**: Google Apps Script (REST API)
- **Database**: Google Spreadsheet

## Setup dan Konfigurasi

### 1. Install Dependencies
```bash
npm install
```

### 2. Konfigurasi API
Edit file `src/services/apiService.ts` dan ubah `API_BASE_URL`:
```typescript
const API_BASE_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

### 3. Mode Demo
Aplikasi saat ini berjalan dalam mode demo dengan data sampel. Untuk menggunakan data real:
1. Deploy Google Apps Script
2. Update URL di `apiService.ts`
3. Ganti import service dari `demoApiService` ke `apiService`

### 4. Akun Demo

**Guru:**
- Username: `guru1`
- Password: `password123`

**Siswa:**
- Username: `siswa1` - `siswa6`
- Password: `password123`

## Struktur Database (Google Spreadsheet)

### Sheet: Users
```
id | role | nama | email | username | password_hash | kelas_id | aktif | created_at | updated_at
```

### Sheet: Kelas
```
id | nama_kelas | wali_guru_id | created_at | updated_at
```

### Sheet: Aktivitas
```
id | siswa_id | kelas_id | judul_bacaan | jenis_bacaan | penulis_sumber | tanggal_baca | durasi_menit | ringkasan | refleksi | bukti_url | status | catatan_verifikasi | verifikator_id | verifikasi_at | poin | created_at | updated_at
```

### Sheet: Level
```
id | nama_level | min_poin | max_poin | deskripsi
```

## API Endpoints (Google Apps Script)

### Authentication
- `POST /login` - Login dengan username/password
- `POST /logout` - Logout user
- `GET /me` - Get user profile

### Kelas Management (Guru)
- `GET /kelas` - Get all classes
- `POST /kelas` - Create new class
- `PUT /kelas/:id` - Update class
- `DELETE /kelas/:id` - Delete class

### Siswa Management (Guru)
- `GET /siswa?kelas_id=...` - Get students by class
- `POST /siswa` - Create new student
- `PUT /siswa/:id` - Update student
- `POST /siswa/:id/reset-password` - Reset student password
- `PATCH /siswa/:id/aktif` - Toggle student active status

### Aktivitas
- `GET /aktivitas?status=&kelas_id=&q=&from=&to=` - Get activities with filters
- `POST /aktivitas` - Create new activity (Student)
- `PUT /aktivitas/:id/verify` - Verify activity (Teacher)

### Reports & Analytics
- `GET /rekap?kelas_id=&from=&to=&status=` - Get activity reports
- `GET /leaderboard?kelas_id=...` - Get class leaderboard
- `GET /stats-dashboard-guru?kelas_id=...` - Get teacher dashboard stats
- `GET /stats-dashboard-siswa?siswa_id=...` - Get student dashboard stats

### Level Management (Guru)
- `GET /level` - Get all levels
- `POST /level` - Create new level
- `PUT /level/:id` - Update level
- `DELETE /level/:id` - Delete level

## Sistem Poin & Level

### Perhitungan Poin
- **Poin Dasar**: Durasi membaca (menit) = poin
- **Bonus**: +20% untuk ringkasan ≥50 kata
- **Minimum**: 1 poin per aktivitas

### Sistem Level
- Level ditentukan berdasarkan total poin siswa
- Update otomatis saat aktivitas disetujui
- Progress bar menuju level berikutnya

### Leaderboard
**Urutan peringkat:**
1. Total poin (descending)
2. Total durasi baca (tie-breaker 1)
3. Jumlah aktivitas (tie-breaker 2)

## Validasi

### Aktivitas Siswa
- Tanggal baca: tidak boleh masa depan
- Durasi: integer > 0
- Ringkasan: minimal 2 kalimat
- Refleksi: minimal 1 kalimat
- URL bukti: format valid (opsional)

### Manajemen Data
- Email: format valid
- Username: minimal 3 karakter, alfanumerik + underscore
- Level: range poin tidak boleh tumpang tindih

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## PWA Features

- **Offline Support**: Cache static assets
- **Install Prompt**: Add to home screen
- **Responsive**: Optimized untuk semua ukuran layar
- **Theme Color**: Indigo (#4F46E5)

## Browser Support

- Chrome 88+
- Firefox 84+
- Safari 14+
- Edge 88+

## License

Private - Sekolah Internal Use Only