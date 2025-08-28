import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { kelasService } from '../../services/kelasService';
import { Kelas } from '../../types';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Modal from '../../components/UI/Modal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatDateTime } from '../../utils/dateUtils';

const KelasManagement: React.FC = () => {
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [filteredKelas, setFilteredKelas] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [formData, setFormData] = useState({ nama_kelas: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadKelas();
  }, []);

  useEffect(() => {
    const filtered = kelas.filter(k => 
      k.nama_kelas.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredKelas(filtered);
  }, [kelas, searchTerm]);

  const loadKelas = async () => {
    try {
      const response = await kelasService.getAll();
      if (response.success && response.data) {
        setKelas(response.data);
      }
    } catch (error) {
      showNotification('error', 'Gagal memuat data kelas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_kelas.trim()) {
      showNotification('error', 'Nama kelas harus diisi');
      return;
    }

    setSubmitLoading(true);
    try {
      let response;
      if (editingKelas) {
        response = await kelasService.update(editingKelas.id, formData);
      } else {
        response = await kelasService.create(formData);
      }

      if (response.success) {
        showNotification('success', `Kelas berhasil ${editingKelas ? 'diperbarui' : 'ditambahkan'}`);
        setShowModal(false);
        setEditingKelas(null);
        setFormData({ nama_kelas: '' });
        loadKelas();
      } else {
        showNotification('error', response.message || 'Gagal menyimpan kelas');
      }
    } catch (error) {
      showNotification('error', 'Terjadi kesalahan saat menyimpan');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (kelas: Kelas) => {
    setEditingKelas(kelas);
    setFormData({ nama_kelas: kelas.nama_kelas });
    setShowModal(true);
  };

  const handleDelete = async (kelas: Kelas) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kelas "${kelas.nama_kelas}"?`)) {
      return;
    }

    try {
      const response = await kelasService.delete(kelas.id);
      if (response.success) {
        showNotification('success', 'Kelas berhasil dihapus');
        loadKelas();
      } else {
        showNotification('error', response.message || 'Gagal menghapus kelas');
      }
    } catch (error) {
      showNotification('error', 'Terjadi kesalahan saat menghapus');
    }
  };

  const openAddModal = () => {
    setEditingKelas(null);
    setFormData({ nama_kelas: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Kelas</h1>
          <p className="text-gray-600">Kelola data kelas dan organisasi siswa</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kelas
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <Input
              placeholder="Cari nama kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredKelas.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">
              {searchTerm ? 'Tidak ada kelas yang ditemukan' : 'Belum ada kelas'}
            </p>
            <p className="text-sm text-gray-400">
              {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Tambahkan kelas pertama Anda'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Nama Kelas</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Dibuat</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredKelas.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{item.nama_kelas}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDateTime(item.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingKelas ? 'Edit Kelas' : 'Tambah Kelas Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Kelas"
            value={formData.nama_kelas}
            onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
            placeholder="Contoh: VIII A"
            required
          />
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={submitLoading}
              className="flex-1"
            >
              {editingKelas ? 'Perbarui' : 'Tambah'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default KelasManagement;