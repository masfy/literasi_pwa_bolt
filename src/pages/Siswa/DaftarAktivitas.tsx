import React, { useState, useEffect } from 'react';
import { Eye, Search, BookOpen, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { aktivitasService } from '../../services/aktivitasService';
import { Aktivitas } from '../../types';
import Card from '../../components/UI/Card';
import Input from '../../components/UI/Input';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatDate } from '../../utils/dateUtils';

const DaftarAktivitas: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [aktivitas, setAktivitas] = useState<Aktivitas[]>([]);
  const [filteredAktivitas, setFilteredAktivitas] = useState<Aktivitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Disetujui' | 'Menunggu' | 'Ditolak'>('Disetujui');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAktivitas, setSelectedAktivitas] = useState<Aktivitas | null>(null);

  useEffect(() => {
    loadAktivitas();
  }, []);

  useEffect(() => {
    filterAktivitas();
  }, [aktivitas, activeTab, searchTerm]);

  const loadAktivitas = async () => {
    if (!user) return;
    
    try {
      const response = await aktivitasService.getAll({
        // Assuming API filters by current user automatically
      });
      if (response.success && response.data) {
        setAktivitas(response.data);
      }
    } catch (error) {
      showNotification('error', 'Gagal memuat data aktivitas');
    } finally {
      setLoading(false);
    }
  };

  const filterAktivitas = () => {
    let filtered = aktivitas.filter(a => a.status === activeTab);
    
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.judul_bacaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.penulis_sumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredAktivitas(filtered);
  };

  const openDetailModal = (aktivitas: Aktivitas) => {
    setSelectedAktivitas(aktivitas);
    setShowDetailModal(true);
  };

  const getTabCount = (status: string) => {
    return aktivitas.filter(a => a.status === status).length;
  };

  const getTabIcon = (status: string) => {
    switch (status) {
      case 'Disetujui': return CheckCircle;
      case 'Menunggu': return Clock;
      case 'Ditolak': return XCircle;
      default: return BookOpen;
    }
  };

  const tabs = [
    { key: 'Disetujui', label: 'Disetujui', color: 'text-green-600 border-green-600' },
    { key: 'Menunggu', label: 'Menunggu', color: 'text-amber-600 border-amber-600' },
    { key: 'Ditolak', label: 'Ditolak', color: 'text-red-600 border-red-600' },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Daftar Aktivitas Literasi</h1>
        <p className="text-gray-600">Lihat semua aktivitas membaca yang telah Anda submit</p>
      </div>

      <Card>
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = getTabIcon(tab.key);
              const isActive = activeTab === tab.key;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                    ${isActive 
                      ? `${tab.color} bg-opacity-5` 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`
                    ml-2 py-0.5 px-2 text-xs font-medium rounded-full
                    ${isActive ? 'bg-current bg-opacity-20 text-current' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {getTabCount(tab.key)}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          <Input
            placeholder="Cari judul bacaan atau penulis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content */}
        {filteredAktivitas.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">
              {searchTerm ? 'Tidak ada aktivitas yang ditemukan' : `Belum ada aktivitas yang ${activeTab.toLowerCase()}`}
            </p>
            <p className="text-sm text-gray-400">
              {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Mulai tambah aktivitas literasi Anda'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAktivitas.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openDetailModal(item)}
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge 
                    variant={
                      item.status === 'Disetujui' ? 'success' :
                      item.status === 'Ditolak' ? 'danger' : 'warning'
                    }
                    size="sm"
                  >
                    {item.status}
                  </Badge>
                  <span className="text-sm text-gray-500">{formatDate(item.tanggal_baca)}</span>
                </div>

                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.judul_bacaan}
                </h4>
                
                <p className="text-sm text-gray-600 mb-2">
                  <span className="capitalize">{item.jenis_bacaan}</span> • {item.penulis_sumber}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {item.durasi_menit} menit
                  </span>
                  {item.status === 'Disetujui' && (
                    <span className="font-medium text-indigo-600">
                      +{item.poin} poin
                    </span>
                  )}
                </div>

                {item.status === 'Ditolak' && item.catatan_verifikasi && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    <p className="font-medium">Catatan:</p>
                    <p>{item.catatan_verifikasi}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Aktivitas"
        maxWidth="lg"
      >
        {selectedAktivitas && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge 
                variant={
                  selectedAktivitas.status === 'Disetujui' ? 'success' :
                  selectedAktivitas.status === 'Ditolak' ? 'danger' : 'warning'
                }
              >
                {selectedAktivitas.status}
              </Badge>
              {selectedAktivitas.status === 'Disetujui' && (
                <span className="font-bold text-indigo-600">+{selectedAktivitas.poin} poin</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Bacaan</label>
              <p className="text-gray-900">{selectedAktivitas.judul_bacaan}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan {selectedAktivitas.status === 'Ditolak' ? 'Penolakan' : 'Verifikasi'}
                </label>
                <p className={`p-3 rounded-lg border ${
                  selectedAktivitas.status === 'Ditolak' 
                    ? 'bg-red-50 border-red-200 text-red-800' 
                    : 'bg-green-50 border-green-200 text-green-800'
                }`}>
                  {selectedAktivitas.catatan_verifikasi}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DaftarAktivitas;