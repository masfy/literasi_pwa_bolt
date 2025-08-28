import React, { useState } from 'react';
import { Save, BookOpen, Calendar, Clock, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { aktivitasService } from '../../services/aktivitasService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';
import { getCurrentDateMakassar, isDateInFuture } from '../../utils/dateUtils';
import { validateRingkasan, validateRefleksi, validateDurasi, countSentences } from '../../utils/validationUtils';

const TambahAktivitas: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    judul_bacaan: '',
    jenis_bacaan: 'buku',
    penulis_sumber: '',
    tanggal_baca: getCurrentDateMakassar(),
    durasi_menit: '',
    ringkasan: '',
    refleksi: '',
    bukti_url: ''
  });
  const [loading, setLoading] = useState(false);

  const jenisOptions = [
    { value: 'buku', label: 'Buku' },
    { value: 'artikel', label: 'Artikel' },
    { value: 'komik', label: 'Komik' },
    { value: 'pdf', label: 'PDF' },
    { value: 'tautan', label: 'Tautan Web' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.judul_bacaan.trim() || !formData.penulis_sumber.trim() || 
        !formData.durasi_menit || !formData.ringkasan.trim() || !formData.refleksi.trim()) {
      showNotification('error', 'Semua field wajib harus diisi');
      return;
    }

    const durasi = parseInt(formData.durasi_menit);
    if (!validateDurasi(durasi)) {
      showNotification('error', 'Durasi harus berupa angka positif');
      return;
    }

    if (isDateInFuture(formData.tanggal_baca)) {
      showNotification('error', 'Tanggal baca tidak boleh di masa depan');
      return;
    }

    if (!validateRingkasan(formData.ringkasan)) {
      showNotification('error', 'Ringkasan minimal 2 kalimat');
      return;
    }

    if (!validateRefleksi(formData.refleksi)) {
      showNotification('error', 'Refleksi minimal 1 kalimat');
      return;
    }

    if (formData.bukti_url && !isValidUrl(formData.bukti_url)) {
      showNotification('error', 'Format URL bukti tidak valid');
      return;
    }

    setLoading(true);
    try {
      const aktivitasData = {
        siswa_id: user!.id,
        kelas_id: user!.kelas_id!,
        judul_bacaan: formData.judul_bacaan.trim(),
        jenis_bacaan: formData.jenis_bacaan as any,
        penulis_sumber: formData.penulis_sumber.trim(),
        tanggal_baca: formData.tanggal_baca,
        durasi_menit: durasi,
        ringkasan: formData.ringkasan.trim(),
        refleksi: formData.refleksi.trim(),
        bukti_url: formData.bukti_url.trim() || undefined,
        siswa_nama: user?.nama || '',
        catatan_verifikasi: '',
        verifikator_id: '',
        verifikasi_at: ''
      };

      const response = await aktivitasService.create(aktivitasData);

      if (response.success) {
        showNotification('success', 'Aktivitas berhasil ditambahkan dan sedang menunggu verifikasi');
        // Reset form
        setFormData({
          judul_bacaan: '',
          jenis_bacaan: 'buku',
          penulis_sumber: '',
          tanggal_baca: getCurrentDateMakassar(),
          durasi_menit: '',
          ringkasan: '',
          refleksi: '',
          bukti_url: ''
        });
      } else {
        showNotification('error', response.message || 'Gagal menambahkan aktivitas');
      }
    } catch (error) {
      showNotification('error', 'Terjadi kesalahan saat menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const ringkasanSentenceCount = countSentences(formData.ringkasan);
  const refleksiSentenceCount = countSentences(formData.refleksi);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Aktivitas Literasi</h1>
        <p className="text-gray-600">Catat aktivitas membaca Anda untuk mendapatkan poin</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input
                label="Judul Bacaan"
                value={formData.judul_bacaan}
                onChange={(e) => setFormData({ ...formData, judul_bacaan: e.target.value })}
                placeholder="Masukkan judul buku, artikel, atau bacaan"
                required
              />

              <Select
                label="Jenis Bacaan"
                value={formData.jenis_bacaan}
                onChange={(e) => setFormData({ ...formData, jenis_bacaan: e.target.value })}
                options={jenisOptions}
                required
              />

              <Input
                label="Penulis/Sumber"
                value={formData.penulis_sumber}
                onChange={(e) => setFormData({ ...formData, penulis_sumber: e.target.value })}
                placeholder="Nama penulis atau sumber bacaan"
                required
              />

              <Input
                label="Tanggal Baca"
                type="date"
                value={formData.tanggal_baca}
                onChange={(e) => setFormData({ ...formData, tanggal_baca: e.target.value })}
                max={getCurrentDateMakassar()}
                required
              />

              <Input
                label="Durasi Membaca (Menit)"
                type="number"
                value={formData.durasi_menit}
                onChange={(e) => setFormData({ ...formData, durasi_menit: e.target.value })}
                placeholder="Berapa menit Anda membaca?"
                min="1"
                helper="Durasi akan menjadi poin dasar Anda"
                required
              />

              <Input
                label="Bukti/Link (Opsional)"
                type="url"
                value={formData.bukti_url}
                onChange={(e) => setFormData({ ...formData, bukti_url: e.target.value })}
                placeholder="https://example.com/foto-bukti"
                helper="Link foto, dokumen, atau website bacaan"
              />
            </div>

            <div className="space-y-4">
              <Textarea
                label="Ringkasan Bacaan"
                value={formData.ringkasan}
                onChange={(e) => setFormData({ ...formData, ringkasan: e.target.value })}
                placeholder="Tulis ringkasan bacaan dengan kata-kata Anda sendiri (minimal 2 kalimat)..."
                rows={6}
                helper={`${ringkasanSentenceCount} kalimat (minimal 2 kalimat)`}
                className={ringkasanSentenceCount < 2 ? 'border-amber-300' : ''}
                required
              />

              <Textarea
                label="Refleksi Personal"
                value={formData.refleksi}
                onChange={(e) => setFormData({ ...formData, refleksi: e.target.value })}
                placeholder="Apa yang Anda pelajari atau rasakan dari bacaan ini? (minimal 1 kalimat)"
                rows={4}
                helper={`${refleksiSentenceCount} kalimat (minimal 1 kalimat)`}
                className={refleksiSentenceCount < 1 ? 'border-amber-300' : ''}
                required
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 Tips Menulis</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ringkasan: ceritakan isi bacaan dengan bahasa sendiri</li>
                  <li>• Refleksi: bagikan pendapat, perasaan, atau pelajaran yang didapat</li>
                  <li>• Tulis dengan jujur dan detail untuk mendapat poin maksimal</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => window.history.back()}
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan Aktivitas
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Preview Poin */}
      {formData.durasi_menit && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Estimasi Poin
          </h3>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-indigo-800">
              <span className="font-bold">{formData.durasi_menit} poin</span> akan Anda dapatkan jika aktivitas ini disetujui
              {formData.ringkasan.split(/\s+/).length >= 50 && (
                <span className="block text-sm mt-1">
                  + Bonus 20% karena ringkasan detail (≥50 kata)
                </span>
              )}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TambahAktivitas;