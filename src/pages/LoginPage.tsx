import React, { useState } from 'react';
import { BookOpen, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      showNotification('error', 'Username dan password harus diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await login(formData.username, formData.password);
      if (!response.success) {
        showNotification('error', response.message || 'Login gagal');
      }
    } catch (error) {
      showNotification('error', 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Selamat Datang di Lentera</h2>
          <p className="mt-2 text-gray-600">Masuk ke akun Anda untuk melanjutkan</p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                label="Username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Masukkan username Anda"
                required
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Masukkan password Anda"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              <User className="w-5 h-5 mr-2" />
              Masuk
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>Demo Akun:</strong></p>
              <p><strong>Guru:</strong> guru1 / password123</p>
              <p><strong>Siswa:</strong> siswa1 / password123</p>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>© 2025 Lentera. Aplikasi Manajemen Aktivitas Literasi</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;