import React, { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle, Clock, XCircle, TrendingUp, Target, Lightbulb, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { dashboardService } from '../../services/dashboardService';
import { DashboardStats } from '../../types';
import StatsCard from './StatsCard';
import Card from '../UI/Card';
import Badge from '../UI/Badge';
import ProgressBar from '../UI/ProgressBar';
import LoadingSpinner from '../UI/LoadingSpinner';
import { calculateProgressToNextLevel } from '../../utils/levelUtils';

const SiswaDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      const response = await dashboardService.getSiswaStats(user.id);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      showNotification('error', 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const levelProgress = stats?.level_saat_ini && stats?.total_poin 
    ? calculateProgressToNextLevel(stats.total_poin, stats.level_saat_ini, null) 
    : 0;

  const literacyTips = [
    "Baca minimal 15 menit setiap hari untuk membangun kebiasaan literasi yang kuat.",
    "Tulis ringkasan dengan kata-kata sendiri untuk meningkatkan pemahaman.",
    "Diskusikan bacaan dengan teman atau keluarga untuk memperdalam wawasan.",
    "Pilih bacaan yang sesuai minat untuk meningkatkan motivasi membaca.",
    "Catat kata-kata baru yang ditemukan saat membaca untuk memperkaya kosakata."
  ];

  const randomTip = literacyTips[Math.floor(Math.random() * literacyTips.length)];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Siswa</h1>
        <p className="text-gray-600">Selamat datang kembali, {user?.nama}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Poin"
          value={stats?.total_poin || 0}
          icon={Award}
          subtitle="Poin terkumpul"
        />
        <StatsCard
          title="Aktivitas Disetujui"
          value={stats?.aktivitas_disetujui || 0}
          icon={CheckCircle}
          subtitle="Aktivitas terverifikasi"
        />
        <StatsCard
          title="Menunggu Verifikasi"
          value={stats?.aktivitas_menunggu || 0}
          icon={Clock}
          subtitle="Sedang diproses"
        />
        <StatsCard
          title="Aktivitas Ditolak"
          value={stats?.aktivitas_ditolak || 0}
          icon={XCircle}
          subtitle="Perlu diperbaiki"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Progress */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Level & Progress
          </h3>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">
                  {stats?.level_saat_ini?.nama_level?.replace('Level ', 'Lv.') || 'Lv.1'}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900">
                {stats?.level_saat_ini?.nama_level || 'Level 1'}
              </h4>
              <p className="text-sm text-gray-500">
                {stats?.total_poin || 0} poin terkumpul
              </p>
            </div>

            <ProgressBar
              value={stats?.total_poin || 0}
              max={stats?.level_saat_ini?.max_poin === -1 ? (stats?.total_poin || 0) + 100 : stats?.level_saat_ini?.max_poin || 100}
              label="Progress ke level berikutnya"
              color="indigo"
            />

            <div className="text-center">
              <button 
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                onClick={() => window.location.href = '/aktivitas/tambah'}
              >
                Tambah Aktivitas Baru →
              </button>
            </div>
          </div>
        </Card>

        {/* Tips & Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Tips Literasi Hari Ini
          </h3>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-amber-800 text-sm leading-relaxed">
              💡 {randomTip}
            </p>
          </div>

          <div className="space-y-3">
            <button 
              className="w-full p-3 text-left bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors group"
              onClick={() => window.location.href = '/aktivitas/tambah'}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span className="font-medium text-gray-900 group-hover:text-indigo-700">
                  Tambah Aktivitas Baru
                </span>
              </div>
            </button>

            <button 
              className="w-full p-3 text-left bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors group"
              onClick={() => window.location.href = '/aktivitas'}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900 group-hover:text-green-700">
                  Lihat Daftar Aktivitas
                </span>
              </div>
            </button>

            <button 
              className="w-full p-3 text-left bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors group"
              onClick={() => window.location.href = '/leaderboard'}
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900 group-hover:text-purple-700">
                  Lihat Leaderboard
                </span>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SiswaDashboard;