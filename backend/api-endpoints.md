# API Endpoints Documentation - Lentera

Base URL: `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`

## Authentication

### POST /login
**Body:**
```json
{
  "username": "guru1",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJ1c2VySWQiOiJ1c2VyMSIsInJvbGUiOiJndXJ1IiwiZXhwIjoxNzA2MjQ4ODAwMDAwfQ==",
  "user": {
    "id": "user1",
    "role": "guru",
    "nama": "Ibu Sari Wijaya",
    "email": "sari.wijaya@sekolah.sch.id",
    "username": "guru1",
    "kelas_id": "",
    "aktif": true
  }
}
```

### POST /logout
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true
}
```

### GET /me
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user1",
    "role": "guru",
    "nama": "Ibu Sari Wijaya",
    "email": "sari.wijaya@sekolah.sch.id",
    "username": "guru1",
    "kelas_id": "",
    "aktif": true,
    "created_at": "2024-01-15T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z"
  }
}
```

## Kelas Management (Guru Only)

### GET /kelas
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "kelas1",
      "nama_kelas": "VIII A",
      "wali_guru_id": "user1",
      "created_at": "2024-01-15T00:00:00Z",
      "updated_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### POST /kelas
**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nama_kelas": "VIII C"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "kelas3",
    "nama_kelas": "VIII C",
    "wali_guru_id": "user1",
    "created_at": "2024-01-22T10:00:00Z",
    "updated_at": "2024-01-22T10:00:00Z"
  }
}
```

### PUT /kelas/{id}
**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nama_kelas": "VIII A (Updated)"
}
```

### DELETE /kelas/{id}
**Headers:**
```
Authorization: Bearer <token>
```

## Siswa Management (Guru Only)

### GET /siswa?kelas_id={kelas_id}
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user2",
      "role": "siswa",
      "nama": "Ahmad Rizki",
      "email": "ahmad.rizki@student.sch.id",
      "username": "siswa1",
      "kelas_id": "kelas1",
      "aktif": true,
      "created_at": "2024-01-15T00:00:00Z",
      "updated_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### POST /siswa
**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nama": "Maya Sari",
  "email": "maya.sari@student.sch.id",
  "username": "siswa7",
  "kelas_id": "kelas1"
}
```

### PUT /siswa/{id}
**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nama": "Ahmad Rizki (Updated)",
  "email": "ahmad.rizki.new@student.sch.id"
}
```

### POST /siswa/{id}/reset-password
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true
}
```

### PATCH /siswa/{id}/aktif
**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "aktif": false
}
```

## Aktivitas Management

### GET /aktivitas?status=&kelas_id=&q=&from=&to=
**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Menunggu, Disetujui, Ditolak
- `kelas_id`: Filter by class
- `q`: Search query (title, author)
- `from`: Start date (YYYY-MM-DD)
- `to`: End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "akt1",
      "siswa_id": "user2",
      "kelas_id": "kelas1",
      "judul_bacaan": "Laskar Pelangi",
      "jenis_bacaan": "buku",
      "penulis_sumber": "Andrea Hirata",
      "tanggal_baca": "2024-01-20",
      "durasi_menit": 45,
      "ringkasan": "Buku ini bercerita tentang...",
      "refleksi": "Saya sangat terkesan...",
      "bukti_url": "",
      "status": "Disetujui",
      "catatan_verifikasi": "",
      "verifikator_id": "user1",
      "verifikasi_at": "2024-01-21T00:00:00Z",
      "poin": 45,
      "created_at": "2024-01-20T00:00:00Z",
      "updated_at": "2024-01-21T00:00:00Z",
      "siswa_nama": "Ahmad Rizki"
    }
  ]
}
```

### POST /aktivitas (Siswa Only)
**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "judul_bacaan": "Harry Potter",
  "jenis_bacaan": "buku",
  "penulis_sumber": "J.K. Rowling",
  "tanggal_baca": "2024-01-22",
  "durasi_menit": 90,
  "ringkasan": "Cerita tentang seorang anak penyihir yang belajar di Hogwarts. Harry menghadapi berbagai petualangan dan tantangan.",
  "refleksi": "Buku ini mengajarkan tentang persahabatan dan keberanian.",
  "bukti_url": "https://example.com/foto-buku.jpg",
  "kelas_id": "kelas1"
}
```

### PUT /aktivitas/{id}/verify (Guru Only)
**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "status": "Disetujui",
  "catatan": "Ringkasan dan refleksi sudah baik"
}
```

**Or for rejection:**
```json
{
  "status": "Ditolak",
  "catatan": "Ringkasan terlalu singkat, mohon diperbaiki"
}
```

## Level Management

### GET /level
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "level1",
      "nama_level": "Level 1",
      "min_poin": 0,
      "max_poin": 99,
      "deskripsi": "Pembaca Pemula"
    }
  ]
}
```

### POST /level (Guru Only)
**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nama_level": "Level 5",
  "min_poin": 500,
  "max_poin": 699,
  "deskripsi": "Pembaca Expert"
}
```

### PUT /level/{id} (Guru Only)
### DELETE /level/{id} (Guru Only)

## Reports & Analytics

### GET /leaderboard?kelas_id={kelas_id}
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "posisi": 1,
      "siswa_id": "user3",
      "nama": "Siti Nurhaliza",
      "total_poin": 72,
      "level": {
        "id": "level1",
        "nama_level": "Level 1",
        "min_poin": 0,
        "max_poin": 99
      },
      "total_durasi": 60,
      "jumlah_aktivitas": 1
    }
  ]
}
```

### GET /stats-dashboard-guru?kelas_id=
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_kelas": 2,
    "total_siswa": 5,
    "aktivitas_menunggu": 1,
    "aktivitas_disetujui_bulan_ini": 2
  }
}
```

### GET /stats-dashboard-siswa
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_poin": 45,
    "level_saat_ini": {
      "id": "level1",
      "nama_level": "Level 1",
      "min_poin": 0,
      "max_poin": 99
    },
    "aktivitas_disetujui": 1,
    "aktivitas_menunggu": 0,
    "aktivitas_ditolak": 0
  }
}
```

### GET /rekap?kelas_id=&from=&to=&status= (Guru Only)
**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Same as GET /aktivitas

## Error Responses

**Authentication Error:**
```json
{
  "success": false,
  "message": "Token tidak valid"
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "Semua field harus diisi"
}
```

**Not Found Error:**
```json
{
  "success": false,
  "message": "Data tidak ditemukan"
}
```

**Access Denied:**
```json
{
  "success": false,
  "message": "Akses ditolak"
}
```

## Setup Instructions

1. Copy kode Apps Script ke project baru
2. Ganti `SPREADSHEET_ID` dengan ID spreadsheet Anda
3. Deploy sebagai Web App dengan akses "Anyone"
4. Copy URL deployment
5. Update `API_BASE_URL` di frontend dengan URL tersebut
6. Test endpoints menggunakan Postman atau frontend aplikasi

## Security Notes

- Token berlaku 24 jam
- Password di-hash menggunakan SHA-256
- CORS headers sudah dikonfigurasi
- Input validation dilakukan di setiap endpoint
- Rate limiting bisa ditambahkan jika diperlukan