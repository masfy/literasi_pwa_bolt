import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Clock, CheckCircle, Trophy, TrendingUp, BookOpen } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { dashboardService } from '../../services/dashboardService';
import { kelasService } from '../../services/kelasService';
import { leaderboardService } from '../../services/leaderboardService';
import { DashboardStats, Kelas, LeaderboardEntry } from '../../types';
import StatsCard from './StatsCard';
import Card from '../UI/Card';
import Select from '../UI/Select';
import Badge from '../UI/Badge';
import LoadingSpinner from '../UI/LoadingSpinner';

const GuruDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadDashboardData();
    loadKelas();
  }, []);

  useEffect(() => {
    if (selectedKelas) {
      loadLeaderboard();
    }
  }, [selectedKelas]);

  const loadDashboardData = async () => {
    try {
      const response = await dashboardService.getGuruStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      showNotification('error', 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadKelas = async () => {
    try {
      const response = await kelasService.getAll();
      if (response.success && response.data) {
        setKelas(response.data);
        if (response.data.length > 0) {
          setSelectedKelas(response.data[0].id);
        }
      }
    } catch (error) {
      showNotification('error', 'Gagal memuat data kelas');
    }
  };

  const loadLeaderboard = async () => {
    if (!selectedKelas) return;
    
    setLeaderboardLoading(true);
    try {
      const response = await leaderboardService.getByKelas(selectedKelas);
      if (response.success && response.data) {
        setLeaderboard(response.data.slice(0, 5));
      }
    } catch (error) {
      showNotification('error', 'Gagal memuat data leaderboard');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const kelasOptions = kelas.map(k => ({ value: k.id, label: k.nama_kelas }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Guru</h1>
        <p className="text-gray-600">Ringkasan aktivitas literasi dan manajemen kelas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Kelas"
          value={stats?.total_kelas || 0}
          icon={Users}
          subtitle="Kelas aktif"
        />
        <StatsCard
          title="Total Siswa"
          value={stats?.total_siswa || 0}
          icon={GraduationCap}
          subtitle="Siswa terdaftar"
        />
        <StatsCard
          title="Menunggu Verifikasi"
          value={stats?.aktivitas_menunggu || 0}
          icon={Clock}
          subtitle="Aktivitas baru"
        />
        <StatsCard
          title="Disetujui Bulan Ini"
          value={stats?.aktivitas_disetujui_bulan_ini || 0}
          icon={CheckCircle}
          subtitle="Aktivitas terverifikasi"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Leaderboard */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-600" />
              Top 5 Leaderboard
            </h3>
            {kelasOptions.length > 0 && (
              <div className="w-48">
                <Select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  options={[{ value: '', label: 'Pilih Kelas' }, ...kelasOptions]}
                />
              </div>
            )}
          </div>

          {leaderboardLoading ? (
            <LoadingSpinner />
          ) : leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div key={entry.siswa_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${entry.posisi === 1 ? 'bg-yellow-100 text-yellow-800' : 
                        entry.posisi === 2 ? 'bg-gray-100 text-gray-800' : 
                        entry.posisi === 3 ? 'bg-amber-100 text-amber-800' : 
                        'bg-indigo-100 text-indigo-800'}
                    `}>
                      {entry.posisi}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{entry.nama}</p>
                      <p className="text-sm text-gray-500">{entry.jumlah_aktivitas} aktivitas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">{entry.total_poin} poin</p>
                    <Badge variant="info" size="sm">{entry.level.nama_level}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Belum ada data leaderboard</p>
              <p className="text-sm">Pilih kelas untuk melihat peringkat siswa</p>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Aksi Cepat
          </h3>
          <div className="space-y-3">
            <button 
              className="w-full p-4 text-left bg-indigo-50 rounded-lg border-2 border-dashed border-indigo-200 hover:border-indigo-300 transition-colors group"
              onClick={() => window.location.href = '/verifikasi'}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-indigo-700">
                    Verifikasi Aktivitas
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats?.aktivitas_menunggu || 0} aktivitas menunggu verifikasi
                  </p>
                </div>
              </div>
            </button>

            <button 
              className="w-full p-4 text-left bg-green-50 rounded-lg border-2 border-dashed border-green-200 hover:border-green-300 transition-colors group"
              onClick={() => window.location.href = '/rekap'}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-green-700">
                    Lihat Rekap
                  </p>
                  <p className="text-sm text-gray-500">
                    Unduh laporan aktivitas siswa
                  </p>
                </div>
              </div>
            </button>

            <button 
              className="w-full p-4 text-left bg-purple-50 rounded-lg border-2 border-dashed border-purple-200 hover:border-purple-300 transition-colors group"
              onClick={() => window.location.href = '/siswa'}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-purple-700">
                    Kelola Siswa
                  </p>
                  <p className="text-sm text-gray-500">
                    Tambah & atur data siswa
                  </p>
                </div>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GuruDashboard;