import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, RotateCcw, UserX, UserCheck, GraduationCap } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { siswaService } from '../../services/siswaService';
import { kelasService } from '../../services/kelasService';
import { User, Kelas } from '../../types';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Modal from '../../components/UI/Modal';
import Badge from '../../components/UI/Badge';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { validateEmail, validateUsername } from '../../utils/validationUtils';

const SiswaManagement: React.FC = () => {
  const [siswa, setSiswa] = useState<User[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [filteredSiswa, setFilteredSiswa] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelasFilter, setSelectedKelasFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    username: '',
    kelas_id: '',
    aktif: true
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadKelas();
  }, []);

  useEffect(() => {
    if (selectedKelasFilter) {
      loadSiswa();
    }
  }, [selectedKelasFilter]);

  useEffect(() => {
    const filtered = siswa.filter(s => {
      const matchesSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.username.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
    setFilteredSiswa(filtered);
  }, [siswa, searchTerm]);

  const loadKelas = async () => {
    try {
      const response = await kelasService.getAll();
      if (response.success && response.data) {
        setKelas(response.data);
        if (response.data.length > 0) {
          setSelectedKelasFilter(response.data[0].id);
        }
      }
    } catch (error) {
      showNotification('error', 'Gagal memuat data kelas');
    } finally {
      setLoading(false);
    }
  };

  const loadSiswa = async () => {
    if (!selectedKelasFilter) return;
    
    try {
      const response = await siswaService.getByKelas(selectedKelasFilter);
      if (response.success && response.data) {
        setSiswa(response.data);
      }
    } catch (error) {
      showNotification('error', 'Gagal memuat data siswa');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama.trim() || !formData.email.trim() || !formData.username.trim()) {
      showNotification('error', 'Semua field harus diisi');
      return;
    }

    if (!validateEmail(formData.email)) {
      showNotification('error', 'Format email tidak valid');
      return;
    }

    if (!validateUsername(formData.username)) {
      showNotification('error', 'Username minimal 3 karakter, hanya huruf, angka, dan underscore');
      return;
    }

    setSubmitLoading(true);
    try {
      let response;
      if (editingSiswa) {
        response = await siswaService.update(editingSiswa.id, formData);
      } else {
        const newSiswa = {
          ...formData,
          role: 'siswa' as const,
          password_hash: 'password123', // Default password
        };
        response = await siswaService.create(newSiswa);
      }

      if (response.success) {
        showNotification('success', `Siswa berhasil ${editingSiswa ? 'diperbarui' : 'ditambahkan'}`);
        if (!editingSiswa) {
          showNotification('info', 'Password default: password123 (harap siswa mengganti)');
        }
        setShowModal(false);
        setEditingSiswa(null);
        setFormData({ nama: '', email: '', username: '', kelas_id: '', aktif: true });
        loadSiswa();
      } else {
        showNotification('error', response.message || 'Gagal menyimpan siswa');
      }
    } catch (error) {
      showNotification('error', 'Terjadi kesalahan saat menyimpan');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (siswa: User) => {
    setEditingSiswa(siswa);
    setFormData({
      nama: siswa.nama,
      email: siswa.email,
      username: siswa.username,
      kelas_id: siswa.kelas_id || '',
      aktif: siswa.aktif
    });
    setShowModal(true);
  };

  const handleResetPassword = async (siswa: User) => {
    if (!confirm(`Reset password untuk ${siswa.nama}?`)) return;

    try {
      const response = await siswaService.resetPassword(siswa.id);
      if (response.success) {
        showNotification('success', 'Password berhasil direset ke "password123"');
      } else {
        showNotification('error', response.message || 'Gagal reset password');
      }
    } catch (error) {
      showNotification('error', 'Terjadi kesalahan saat reset password');
    }
  };

  const handleToggleActive = async (siswa: User) => {
    try {
      const newStatus = !siswa.aktif;
      const response = await siswaService.toggleActive(siswa.id, newStatus);
      if (response.success) {
        showNotification('success', `Status siswa berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
        loadSiswa();
      } else {
        showNotification('error', response.message || 'Gagal mengubah status');
      }
    } catch (error) {
      showNotification('error', 'Terjadi kesalahan saat mengubah status');
    }
  };

  const openAddModal = () => {
    setEditingSiswa(null);
    setFormData({ nama: '', email: '', username: '', kelas_id: selectedKelasFilter, aktif: true });
    setShowModal(true);
  };

  const kelasOptions = kelas.map(k => ({ value: k.id, label: k.nama_kelas }));

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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Siswa</h1>
          <p className="text-gray-600">Kelola data siswa per kelas</p>
        </div>
        <Button onClick={openAddModal} disabled={!selectedKelasFilter}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Siswa
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-64">
            <Select
              label="Pilih Kelas"
              value={selectedKelasFilter}
              onChange={(e) => setSelectedKelasFilter(e.target.value)}
              options={[{ value: '', label: 'Pilih Kelas' }, ...kelasOptions]}
            />
          </div>
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-8" />
            <Input
              label="Cari Siswa"
              placeholder="Nama atau username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {!selectedKelasFilter ? (
          <div className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Pilih kelas untuk melihat daftar siswa</p>
          </div>
        ) : filteredSiswa.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">
              {searchTerm ? 'Tidak ada siswa yang ditemukan' : 'Belum ada siswa di kelas ini'}
            </p>
            <p className="text-sm text-gray-400">
              {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Tambahkan siswa ke kelas ini'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Nama</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Username</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSiswa.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{item.nama}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{item.username}</td>
                    <td className="py-3 px-4 text-gray-600">{item.email}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={item.aktif ? 'success' : 'danger'}>
                        {item.aktif ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleResetPassword(item)}
                          title="Reset Password"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={item.aktif ? 'danger' : 'success'}
                          size="sm"
                          onClick={() => handleToggleActive(item)}
                          title={item.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {item.aktif ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
        title={editingSiswa ? 'Edit Siswa' : 'Tambah Siswa Baru'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            placeholder="Nama lengkap siswa"
            required
          />
          
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Username untuk login"
            helper="Minimal 3 karakter, hanya huruf, angka, dan underscore"
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
            required
          />

          <Select
            label="Kelas"
            value={formData.kelas_id}
            onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
            options={[{ value: '', label: 'Pilih Kelas' }, ...kelasOptions]}
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
              {editingSiswa ? 'Perbarui' : 'Tambah'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SiswaManagement;