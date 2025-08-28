import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, Calendar, Book } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { aktivitasService } from '../../services/aktivitasService';
import { kelasService } from '../../services/kelasService';
import { Aktivitas, Kelas } from '../../types';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Modal from '../../components/UI/Modal';
import Badge from '../../components/UI/Badge';
import Textarea from '../../components/UI/Textarea';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

const VerifikasiAktivitas: React.FC = () => {
  const [aktivitas, setAktivitas] = useState<Aktivitas[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [filteredAktivitas, setFilteredAktivitas] = useState<Aktivitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Menunggu');
  const [kelasFilter, setkelasFilter] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedAktivitas, setSelectedAktivitas] = useState<Aktivitas | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<'Disetujui' | 'Ditolak'>('Disetujui');
  const [catatan, setCatatan] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadKelas();
    loadAktivitas();
  }, []);

  useEffect(() => {
    loadAktivitas();
  }, [statusFilter, kelasFilter]);

  useEffect(() => {
    const filtered = aktivitas.filter(a => {
      const matchesSearch = a.judul_bacaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           a.siswa_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           a.penulis_sumber.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
    setFilteredAktivitas(filtered);
  }, [aktivitas, searchTerm]);

  const loadKelas = async () => {
    try {
      const response = await kelasService.getAll();
      if (response.success && response.data) {
        setKelas(response.data);
      }
    } catch (error) {
      showNotification('error', 'Gagal memuat data kelas');
    }
  };

  const loadAktivitas = async () => {
    setLoading(true);
    try {
      const filters = {
        status: statusFilter,
        kelas_id: kelasFilter,
      };
      
      const response = await aktivitasService.getAll(filters);
      if (response.success && response.data) {
        setAktivitas(response.data);
      }
    } catch (error) {
      showNotification('error', 'Gagal memuat data aktivitas');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedAktivitas) return;
    
    if (verifyStatus === 'Ditolak' && !catatan.trim()) {
      showNotification('error', 'Catatan penolakan harus diisi');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await aktivitasService.verify(
        selectedAktivitas.id, 
        verifyStatus, 
        verifyStatus === 'Ditolak' ? catatan : undefined
      );

      if (response.success) {
        showNotification('success', `Aktivitas berhasil ${verifyStatus.toLowerCase()}`);
        setShowVerifyModal(false);
        setSelectedAktivitas(null);
        setCatatan('');
        loadAktivitas();
      } else {
        showNotification('error', response.message || 'Gagal memverifikasi aktivitas');
      }
    } catch (error) {
      showNotification('error', 'Terjadi kesalahan saat verifikasi');
    } finally {
      setSubmitLoading(false);
    }
  };

  const openDetailModal = (aktivitas: Aktivitas) => {
    setSelectedAktivitas(aktivitas);
    setShowDetailModal(true);
  };

  const openVerifyModal = (aktivitas: Aktivitas, status: 'Disetujui' | 'Ditolak') => {
    setSelectedAktivitas(aktivitas);
    setVerifyStatus(status);
    setCatatan('');
    setShowVerifyModal(true);
  };

  const statusOptions = [
    { value: 'Menunggu', label: 'Menunggu Verifikasi' },
    { value: 'Disetujui', label: 'Disetujui' },
    { value: 'Ditolak', label: 'Ditolak' },
  ];

  const kelasOptions = kelas.map(k => ({ value: k.id, label: k.nama_kelas }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verifikasi Aktivitas</h1>
        <p className="text-gray-600">Tinjau dan verifikasi aktivitas literasi siswa</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-8" />
            <Input
              label="Cari Aktivitas"
              placeholder="Judul, siswa, penulis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
          <Select
            label="Kelas"
            value={kelasFilter}
            onChange={(e) => setkelasFilter(e.target.value)}
            options={[{ value: '', label: 'Semua Kelas' }, ...kelasOptions]}
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredAktivitas.length === 0 ? (
          <div className="text-center py-12">
            <Book className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">Tidak ada aktivitas ditemukan</p>
            <p className="text-sm text-gray-400">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Siswa</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Judul Bacaan</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Tanggal Baca</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Durasi</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAktivitas.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{item.siswa_nama}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{item.judul_bacaan}</div>
                      <div className="text-sm text-gray-500">{item.penulis_sumber}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(item.tanggal_baca)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-medium">{item.durasi_menit} menit</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge 
                        variant={
                          item.status === 'Disetujui' ? 'success' :
                          item.status === 'Ditolak' ? 'danger' : 'warning'
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openDetailModal(item)}
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {item.status === 'Menunggu' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => openVerifyModal(item, 'Disetujui')}
                              title="Setujui"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => openVerifyModal(item, 'Ditolak')}
                              title="Tolak"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Aktivitas Literasi"
        maxWidth="lg"
      >
        {selectedAktivitas && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Siswa</label>
                <p className="text-gray-900">{selectedAktivitas.siswa_nama}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Badge 
                  variant={
                    selectedAktivitas.status === 'Disetujui' ? 'success' :
                    selectedAktivitas.status === 'Ditolak' ? 'danger' : 'warning'
                  }
                >
                  {selectedAktivitas.status}
                </Badge>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Bacaan</label>
              <p className="text-gray-900">{selectedAktivitas.judul_bacaan}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Bacaan</label>
                <p className="text-gray-900 capitalize">{selectedAktivitas.jenis_bacaan}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penulis/Sumber</label>
                <p className="text-gray-900">{selectedAktivitas.penulis_sumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Baca</label>
                <p className="text-gray-900">{formatDate(selectedAktivitas.tanggal_baca)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durasi</label>
                <p className="text-gray-900">{selectedAktivitas.durasi_menit} menit</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ringkasan</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedAktivitas.ringkasan}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refleksi</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedAktivitas.refleksi}</p>
            </div>

            {selectedAktivitas.bukti_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bukti</label>
                <a 
                  href={selectedAktivitas.bukti_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 underline"
                >
                  Lihat Bukti
                </a>
              </div>
            )}

            {selectedAktivitas.catatan_verifikasi && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Verifikasi</label>
                <p className="text-gray-900 bg-red-50 p-3 rounded-lg border border-red-200">
                  {selectedAktivitas.catatan_verifikasi}
                </p>
              </div>
            )}

            {selectedAktivitas.status === 'Menunggu' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="success"
                  onClick={() => openVerifyModal(selectedAktivitas, 'Disetujui')}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Setujui
                </Button>
                <Button
                  variant="danger"
                  onClick={() => openVerifyModal(selectedAktivitas, 'Ditolak')}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Tolak
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Verify Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title={`${verifyStatus} Aktivitas`}
      >
        {selectedAktivitas && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Siswa: <span className="font-medium">{selectedAktivitas.siswa_nama}</span></p>
              <p className="text-sm text-gray-600">Judul: <span className="font-medium">{selectedAktivitas.judul_bacaan}</span></p>
            </div>

            <div className={`p-3 rounded-lg ${verifyStatus === 'Disetujui' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-medium ${verifyStatus === 'Disetujui' ? 'text-green-800' : 'text-red-800'}`}>
                {verifyStatus === 'Disetujui' 
                  ? `Aktivitas akan disetujui dan siswa mendapat ${selectedAktivitas.durasi_menit} poin`
                  : 'Aktivitas akan ditolak dan siswa tidak mendapat poin'
                }
              </p>
            </div>

            {verifyStatus === 'Ditolak' && (
              <Textarea
                label="Catatan Penolakan"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Jelaskan alasan penolakan dan saran perbaikan..."
                rows={4}
                required
              />
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowVerifyModal(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleVerify}
                loading={submitLoading}
                variant={verifyStatus === 'Disetujui' ? 'success' : 'danger'}
                className="flex-1"
              >
                {verifyStatus}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-8" />
            <Input
              label="Cari Aktivitas"
              placeholder="Judul, siswa, penulis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
          <Select
            label="Kelas"
            value={kelasFilter}
            onChange={(e) => setkelasFilter(e.target.value)}
            options={[{ value: '', label: 'Semua Kelas' }, ...kelasOptions]}
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredAktivitas.length === 0 ? (
          <div className="text-center py-12">
            <Book className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">Tidak ada aktivitas ditemukan</p>
            <p className="text-sm text-gray-400">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Siswa</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Judul Bacaan</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Tanggal</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Durasi</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAktivitas.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{item.siswa_nama}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{item.judul_bacaan}</div>
                      <div className="text-sm text-gray-500 capitalize">{item.jenis_bacaan} • {item.penulis_sumber}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(item.tanggal_baca)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-medium">{item.durasi_menit} menit</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge 
                        variant={
                          item.status === 'Disetujui' ? 'success' :
                          item.status === 'Ditolak' ? 'danger' : 'warning'
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openDetailModal(item)}
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {item.status === 'Menunggu' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => openVerifyModal(item, 'Disetujui')}
                              title="Setujui"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => openVerifyModal(item, 'Ditolak')}
                              title="Tolak"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VerifikasiAktivitas;