# Struktur Database Google Spreadsheet - Lentera

## Setup Database

1. Buat Google Spreadsheet baru dengan nama "Lentera Database"
2. Buat 5 sheet dengan nama dan struktur berikut:

## Sheet 1: Users
**Header (Baris 1):**
```
id | role | nama | email | username | password_hash | kelas_id | aktif | created_at | updated_at
```

**Contoh Data:**
```
user1 | guru | Ibu Sari Wijaya | sari.wijaya@sekolah.sch.id | guru1 | password123 |  | TRUE | 2024-01-15T00:00:00Z | 2024-01-15T00:00:00Z
user2 | siswa | Ahmad Rizki | ahmad.rizki@student.sch.id | siswa1 | password123 | kelas1 | TRUE | 2024-01-15T00:00:00Z | 2024-01-15T00:00:00Z
user3 | siswa | Siti Nurhaliza | siti.nurhaliza@student.sch.id | siswa2 | password123 | kelas1 | TRUE | 2024-01-15T00:00:00Z | 2024-01-15T00:00:00Z
user4 | siswa | Budi Santoso | budi.santoso@student.sch.id | siswa3 | password123 | kelas1 | TRUE | 2024-01-15T00:00:00Z | 2024-01-15T00:00:00Z
user5 | siswa | Dewi Kartika | dewi.kartika@student.sch.id | siswa4 | password123 | kelas2 | TRUE | 2024-01-15T00:00:00Z | 2024-01-15T00:00:00Z
user6 | siswa | Raka Pratama | raka.pratama@student.sch.id | siswa5 | password123 | kelas2 | TRUE | 2024-01-15T00:00:00Z | 2024-01-15T00:00:00Z
```

## Sheet 2: Kelas
**Header (Baris 1):**
```
id | nama_kelas | wali_guru_id | created_at | updated_at
```

**Contoh Data:**
```
kelas1 | VIII A | user1 | 2024-01-15T00:00:00Z | 2024-01-15T00:00:00Z
kelas2 | VIII B | user1 | 2024-01-15T00:00:00Z | 2024-01-15T00:00:00Z
```

## Sheet 3: Aktivitas
**Header (Baris 1):**
```
id | siswa_id | kelas_id | judul_bacaan | jenis_bacaan | penulis_sumber | tanggal_baca | durasi_menit | ringkasan | refleksi | bukti_url | status | catatan_verifikasi | verifikator_id | verifikasi_at | poin | created_at | updated_at
```

**Contoh Data:**
```
akt1 | user2 | kelas1 | Laskar Pelangi | buku | Andrea Hirata | 2024-01-20 | 45 | Buku ini bercerita tentang sepuluh anak dari keluarga miskin di Belitung yang berjuang menempuh pendidikan. Mereka menghadapi berbagai tantangan namun tetap semangat belajar di sekolah Muhammadiyah. | Saya sangat terkesan dengan semangat anak-anak Laskar Pelangi yang tidak mudah menyerah meskipun hidup dalam keterbatasan. |  | Disetujui |  | user1 | 2024-01-21T00:00:00Z | 45 | 2024-01-20T00:00:00Z | 2024-01-21T00:00:00Z
akt2 | user3 | kelas1 | Sang Pemimpi | buku | Andrea Hirata | 2024-01-19 | 60 | Kelanjutan dari Laskar Pelangi yang menceritakan perjalanan Ikal, Arai, dan Jimbron mengejar mimpi mereka untuk kuliah di luar negeri. Buku ini penuh dengan perjuangan dan harapan. | Buku ini mengajarkan pentingnya memiliki mimpi besar dan bekerja keras untuk mencapainya. |  | Disetujui |  | user1 | 2024-01-20T00:00:00Z | 72 | 2024-01-19T00:00:00Z | 2024-01-20T00:00:00Z
akt3 | user4 | kelas1 | Artikel Manfaat Membaca | artikel | Kompas.com | 2024-01-22 | 15 | Artikel menjelaskan berbagai manfaat membaca untuk kesehatan otak dan peningkatan kemampuan kognitif. | Setelah membaca artikel ini, saya jadi lebih termotivasi untuk rutin membaca setiap hari. |  | Menunggu |  |  |  | 0 | 2024-01-22T00:00:00Z | 2024-01-22T00:00:00Z
```

## Sheet 4: Level
**Header (Baris 1):**
```
id | nama_level | min_poin | max_poin | deskripsi
```

**Contoh Data:**
```
level1 | Level 1 | 0 | 99 | Pembaca Pemula - Mulai membangun kebiasaan literasi
level2 | Level 2 | 100 | 199 | Pembaca Aktif - Konsisten dalam kegiatan literasi
level3 | Level 3 | 200 | 349 | Pembaca Berpengalaman - Memiliki wawasan literasi yang luas
level4 | Level 4 | 350 | -1 | Master Literasi - Teladan dalam kegiatan literasi
```

## Sheet 5: Log
**Header (Baris 1):**
```
id | user_id | aksi | detail | created_at
```

**Contoh Data:**
```
log1 | user1 | LOGIN | User guru1 login | 2024-01-22T08:00:00Z
log2 | user2 | LOGIN | User siswa1 login | 2024-01-22T08:15:00Z
log3 | user2 | CREATE | Membuat aktivitas Laskar Pelangi | 2024-01-22T08:30:00Z
log4 | user1 | VERIFY | Disetujui aktivitas Laskar Pelangi | 2024-01-22T09:00:00Z
```

## Catatan Penting:

1. **Password Default**: Untuk demo, gunakan password plain "password123". Di production, gunakan hash yang aman.

2. **ID Format**: Gunakan format yang konsisten untuk ID (contoh: user1, kelas1, akt1, level1, log1).

3. **Tanggal Format**: Gunakan format ISO 8601 (YYYY-MM-DDTHH:mm:ssZ) untuk konsistensi.

4. **Status Aktivitas**: Hanya gunakan "Menunggu", "Disetujui", atau "Ditolak".

5. **Jenis Bacaan**: Hanya gunakan "buku", "artikel", "komik", "pdf", atau "tautan".

6. **Role**: Hanya gunakan "guru" atau "siswa".

7. **Boolean Values**: Gunakan TRUE/FALSE untuk field aktif.

8. **Max Poin**: Gunakan -1 untuk unlimited (level tertinggi).

## Setup Apps Script:

1. Buka Google Apps Script (script.google.com)
2. Buat project baru
3. Copy kode dari Code.gs
4. Ganti SPREADSHEET_ID dengan ID spreadsheet Anda
5. Deploy sebagai Web App:
   - Execute as: Me
   - Who has access: Anyone
6. Copy URL deployment untuk digunakan di frontend