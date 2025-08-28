import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { leaderboardService } from '../services/leaderboardService';
import { kelasService } from '../services/kelasService';
import { LeaderboardEntry, Kelas } from '../types';
import Card from '../components/UI/Card';
import Select from '../components/UI/Select';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'guru') {
      loadKelas();
    } else if (user?.kelas_id) {
      setSelectedKelas(user.kelas_id);
      loadLeaderboard(user.kelas_id);
    }
  }, [user]);

  useEffect(() => {
    if (selectedKelas) {
      loadLeaderboard(selectedKelas);
    }
  }, [selectedKelas]);

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
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (kelasId: string) => {
    setLoading(true);
    try {
      const response = await leaderboardService.getByKelas(kelasId);
      if (response.success && response.data) {
        setLeaderboard(response.data);
      }
    } catch (error) {
      showNotification('error', 'Gagal memuat data leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-indigo-600">{position}</span>
          </div>
        );
    }
  };

  const getRankCardStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-lg';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 shadow-md';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-md';
      default:
        return 'bg-white border-gray-200 hover:shadow-sm';
    }
  };

  const kelasOptions = kelas.map(k => ({ value: k.id, label: k.nama_kelas }));
  const currentKelasName = kelas.find(k => k.id === selectedKelas)?.nama_kelas || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600">Peringkat siswa berdasarkan total poin literasi</p>
        </div>
        
        {user?.role === 'guru' && kelasOptions.length > 0 && (
          <div className="w-64">
            <Select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              options={[{ value: '', label: 'Pilih Kelas' }, ...kelasOptions]}
            />
          </div>
        )}
      </div>

      {!selectedKelas ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Pilih kelas untuk melihat leaderboard</p>
          </div>
        </Card>
      ) : loading ? (
        <Card>
          <LoadingSpinner />
        </Card>
      ) : (
        <>
          {/* Header Info */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Peringkat Kelas {currentKelasName}</h2>
                <p className="text-sm text-gray-500">{leaderboard.length} siswa terdaftar</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Poin Kelas</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {leaderboard.reduce((sum, entry) => sum + entry.total_poin, 0)}
                </p>
              </div>
            </div>
          </Card>

          {/* Leaderboard */}
          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada data peringkat</p>
                  <p className="text-sm text-gray-400">Siswa belum memiliki aktivitas yang disetujui</p>
                </div>
              </Card>
            ) : (
              leaderboard.map((entry, index) => (
                <Card 
                  key={entry.siswa_id} 
                  className={`transition-all duration-200 ${getRankCardStyle(entry.posisi)}`}
                  padding={false}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {getRankIcon(entry.posisi)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-lg font-semibold ${
                              entry.posisi <= 3 ? 'text-gray-900' : 'text-gray-800'
                            }`}>
                              {entry.nama}
                            </h3>
                            <Badge 
                              variant="info" 
                              size="sm"
                              className={entry.posisi === 1 ? 'bg-yellow-100 text-yellow-800' : ''}
                            >
                              {entry.level.nama_level}
                            </Badge>
                            {user?.id === entry.siswa_id && (
                              <Badge variant="success" size="sm">Anda</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              {entry.jumlah_aktivitas} aktivitas
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {Math.round(entry.total_durasi / 60)} jam baca
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${
                          entry.posisi === 1 ? 'text-yellow-600' : 
                          entry.posisi === 2 ? 'text-gray-600' : 
                          entry.posisi === 3 ? 'text-amber-600' : 'text-indigo-600'
                        }`}>
                          {entry.total_poin}
                        </p>
                        <p className="text-sm text-gray-500">poin</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;