import React from 'react';
import { User, Award, BookOpen, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import { formatDate } from '../../utils/dateUtils';

const ProfilSiswa: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-gray-600">Informasi profil dan pencapaian literasi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card>
          <div className="text-center">
            <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-indigo-600">
                {user?.nama?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{user?.nama}</h3>
            <p className="text-gray-500 capitalize">{user?.role}</p>
            <Badge variant="success" className="mt-2">Aktif</Badge>
          </div>
        </Card>

        {/* Account Details */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Informasi Akun</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <p className="text-gray-900">{user?.nama}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <p className="text-gray-900">{user?.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Badge variant={user?.aktif ? 'success' : 'danger'}>
                    {user?.aktif ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Bergabung</label>
                <p className="text-gray-900">
                  {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Achievement Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          Ringkasan Pencapaian
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <BookOpen className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-600">0</p>
            <p className="text-sm text-gray-600">Total Aktivitas</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-600">Total Poin</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-600">Jam Baca</p>
          </div>
        </div>
      </Card>

      {/* Tips Section */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Tips Literasi</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• Baca minimal 15 menit setiap hari untuk membangun kebiasaan yang konsisten</p>
          <p>• Tulis ringkasan dengan kata-kata sendiri untuk meningkatkan pemahaman</p>
          <p>• Variasikan jenis bacaan: buku, artikel, komik, untuk pengalaman yang beragam</p>
          <p>• Refleksikan apa yang dipelajari untuk memperdalam wawasan</p>
        </div>
      </Card>
    </div>
  );
};

export default ProfilSiswa;