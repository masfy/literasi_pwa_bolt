import React, { useState, useEffect } from 'react';
import { Download, Calendar, Filter, FileText, TrendingUp } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { aktivitasService } from '../../services/aktivitasService';
import { kelasService } from '../../services/kelasService';
import { Aktivitas, Kelas } from '../../types';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Badge from '../../components/UI/Badge';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatDate } from '../../utils/dateUtils';

const RekapAktivitas: React.FC = () => {
  const [aktivitas, setAktivitas] = useState<Aktivitas[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    kelas_id: '',
    status: '',
    from: '',
    to: '',
    q: ''
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    loadKelas();
    loadAktivitas();
  }, []);

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
      const response = await aktivitasService.getRekap(filters);
      if (response.success && response.data) {
        setAktivitas(response.data);
      }
    } catch (error) {
      showNotification('error', 'Gagal memuat data rekap');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    loadAktivitas();
  };

  const clearFilters = () => {
    setFilters({
      kelas_id: '',
      status: '',
      from: '',
      to: '',
      q: ''
    });
  };

  const exportToCsv = () => {
    if (aktivitas.length === 0) {
      showNotification('warning', 'Tidak ada data untuk diexport');
      return;
    }

    const headers = [
      'Siswa',
      'Kelas',
      'Judul Bacaan',
      'Jenis Bacaan',
      'Penulis/Sumber',
      'Tanggal Baca',
      'Durasi (menit)',
      'Status',
      'Poin',
      'Tanggal Submit'
    ];

    const csvData = aktivitas.map(a => [
      a.siswa_nama || '',
      '', // Kelas nama (would need additional data)
      a.judul_bacaan,
      a.jenis_bacaan,
      a.penulis_sumber,
      a.tanggal_baca,
      a.durasi_menit,
      a.status,
      a.poin,
      formatDate(a.created_at)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rekap-aktivitas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showNotification('success', 'Rekap berhasil diexport');
  };

  const stats = {
    total: aktivitas.length,
    disetujui: aktivitas.filter(a => a.status === 'Disetujui').length,
    menunggu: aktivitas.filter(a => a.status === 'Menunggu').length,
    ditolak: aktivitas.filter(a => a.status === 'Ditolak').length,
    totalPoin: aktivitas.filter(a => a.status === 'Disetujui').reduce((sum, a) => sum + a.poin, 0),
    totalDurasi: aktivitas.filter(a => a.status === 'Disetujui').reduce((sum, a) => sum + a.durasi_menit, 0)
  };

  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'Menunggu', label: 'Menunggu' },
    { value: 'Disetujui', label: 'Disetujui' },
    { value: 'Ditolak', label: 'Ditolak' },
  ];

  const kelasOptions = kelas.map(k => ({ value: k.id, label: k.nama_kelas }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekap Aktivitas</h1>
          <p className="text-gray-600">Laporan komprehensif aktivitas literasi siswa</p>
        </div>
        <Button onClick={exportToCsv} disabled={aktivitas.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card padding={false} className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Aktivitas</p>
          </div>
        </Card>
        <Card padding={false} className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.disetujui}</p>
            <p className="text-sm text-gray-600">Disetujui</p>
          </div>
        </Card>
        <Card padding={false} className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.menunggu}</p>
            <p className="text-sm text-gray-600">Menunggu</p>
          </div>
        </Card>
        <Card padding={false} className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.ditolak}</p>
            <p className="text-sm text-gray-600">Ditolak</p>
          </div>
        </Card>
        <Card padding={false} className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.totalPoin}</p>
            <p className="text-sm text-gray-600">Total Poin</p>
          </div>
        </Card>
        <Card padding={false} className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{Math.round(stats.totalDurasi / 60)}</p>
            <p className="text-sm text-gray-600">Jam Baca</p>
          </div>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-600" />
          Filter & Pencarian
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <Input
            label="Kata Kunci"
            placeholder="Judul, siswa, penulis..."
            value={filters.q}
            onChange={(e) => handleFilterChange('q', e.target.value)}
          />
          <Select
            label="Kelas"
            value={filters.kelas_id}
            onChange={(e) => handleFilterChange('kelas_id', e.target.value)}
            options={[{ value: '', label: 'Semua Kelas' }, ...kelasOptions]}
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={statusOptions}
          />
          <Input
            label="Tanggal Mulai"
            type="date"
            value={filters.from}
            onChange={(e) => handleFilterChange('from', e.target.value)}
          />
          <Input
            label="Tanggal Selesai"
            type="date"
            value={filters.to}
            onChange={(e) => handleFilterChange('to', e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={applyFilters}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Terapkan Filter
          </Button>
          <Button variant="secondary" onClick={clearFilters}>
            Reset Filter
          </Button>
        </div>
      </Card>

      {/* Results Table */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Hasil Rekap ({aktivitas.length} aktivitas)
        </h3>

        {loading ? (
          <LoadingSpinner />
        ) : aktivitas.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">Tidak ada data aktivitas</p>
            <p className="text-sm text-gray-400">Coba ubah filter pencarian</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Siswa</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Judul Bacaan</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Jenis</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Tanggal Baca</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Durasi</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Poin</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {aktivitas.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{item.siswa_nama}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{item.judul_bacaan}</div>
                      <div className="text-sm text-gray-500">{item.penulis_sumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-gray-700">{item.jenis_bacaan}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(item.tanggal_baca)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-medium">{item.durasi_menit} mnt</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-indigo-600">{item.poin}</span>
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

export default RekapAktivitas;