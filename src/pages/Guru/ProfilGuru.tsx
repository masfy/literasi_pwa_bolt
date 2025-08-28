import React, { useState } from 'react';
import { User, Camera, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { validateEmail } from '../../utils/validationUtils';

const ProfilGuru: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
    sekolah: '',
    foto_url: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama.trim() || !formData.email.trim()) {
      showNotification('error', 'Nama dan email harus diisi');
      return;
    }

    if (!validateEmail(formData.email)) {
      showNotification('error', 'Format email tidak valid');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('success', 'Profil berhasil diperbarui');
    } catch (error) {
      showNotification('error', 'Terjadi kesalahan saat menyimpan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Guru</h1>
        <p className="text-gray-600">Kelola informasi profil Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo Section */}
        <Card>
          <div className="text-center">
            <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {formData.foto_url ? (
                <img 
                  src={formData.foto_url} 
                  alt="Foto profil"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="w-16 h-16 text-indigo-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{user?.nama}</h3>
            <p className="text-gray-500 capitalize">{user?.role}</p>
            
            <Button variant="secondary" size="sm" className="mt-4">
              <Camera className="w-4 h-4 mr-2" />
              Ubah Foto
            </Button>
          </div>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Informasi Profil</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Nama Lengkap"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Nama lengkap Anda"
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

              <Input
                label="Username"
                value={user?.username || ''}
                disabled
                helper="Username tidak dapat diubah"
              />

              <Input
                label="Sekolah/Institusi"
                value={formData.sekolah}
                onChange={(e) => setFormData({ ...formData, sekolah: e.target.value })}
                placeholder="Nama sekolah atau institusi"
              />

              <Input
                label="URL Foto Profil"
                value={formData.foto_url}
                onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
                placeholder="https://example.com/foto.jpg"
                helper="URL gambar untuk foto profil (opsional)"
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" loading={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Account Info */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Akun</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Akun</label>
            <p className="text-green-600 font-medium">Aktif</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Bergabung</label>
            <p className="text-gray-900">{user?.created_at ? formatDate(user.created_at) : 'N/A'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilGuru;