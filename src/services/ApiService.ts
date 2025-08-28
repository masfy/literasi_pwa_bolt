// Demo service that simulates API calls with sample data
import { User, LoginResponse, ApiResponse, Kelas, Aktivitas, Level, LeaderboardEntry, DashboardStats } from '../types';
import { sampleUsers, sampleKelas, sampleLevels, sampleAktivitas } from '../data/sampleData';
import { calculateLevel } from '../utils/levelUtils';
import { calculatePoin } from '../utils/pointUtils';

class ApiService {
  private users: User[] = [...sampleUsers];
  private kelas: Kelas[] = [...sampleKelas];
  private aktivitas: Aktivitas[] = [...sampleAktivitas];
  private levels: Level[] = [...sampleLevels];
  private currentUser: User | null = null;

  // Simulate network delay
  private delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

  async login(username: string, password: string): Promise<LoginResponse> {
    await this.delay();
    
    const user = this.users.find(u => u.username === username && u.aktif);
    
    if (!user || password !== 'password123') {
      return { success: false, message: 'Username atau password salah' };
    }

    const token = `demo-token-${user.id}`;
    this.currentUser = user;
    
    return {
      success: true,
      token,
      user,
    };
  }

  async logout(): Promise<ApiResponse<void>> {
    await this.delay(200);
    this.currentUser = null;
    return { success: true };
  }

  async getMe(): Promise<User> {
    await this.delay(200);
    if (!this.currentUser) {
      throw new Error('Not authenticated');
    }
    return this.currentUser;
  }

  // Kelas endpoints
  async getAllKelas(): Promise<ApiResponse<Kelas[]>> {
    await this.delay();
    return { success: true, data: this.kelas };
  }

  async createKelas(data: Omit<Kelas, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Kelas>> {
    await this.delay();
    const newKelas: Kelas = {
      ...data,
      id: `kelas${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.kelas.push(newKelas);
    return { success: true, data: newKelas };
  }

  async updateKelas(id: string, data: Partial<Kelas>): Promise<ApiResponse<Kelas>> {
    await this.delay();
    const index = this.kelas.findIndex(k => k.id === id);
    if (index === -1) {
      return { success: false, message: 'Kelas tidak ditemukan' };
    }
    
    this.kelas[index] = { ...this.kelas[index], ...data, updated_at: new Date().toISOString() };
    return { success: true, data: this.kelas[index] };
  }

  async deleteKelas(id: string): Promise<ApiResponse<void>> {
    await this.delay();
    const index = this.kelas.findIndex(k => k.id === id);
    if (index === -1) {
      return { success: false, message: 'Kelas tidak ditemukan' };
    }
    
    this.kelas.splice(index, 1);
    return { success: true };
  }

  // Siswa endpoints
  async getSiswaByKelas(kelasId: string): Promise<ApiResponse<User[]>> {
    await this.delay();
    const siswa = this.users.filter(u => u.role === 'siswa' && u.kelas_id === kelasId);
    return { success: true, data: siswa };
  }

  async createSiswa(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<User>> {
    await this.delay();
    
    // Check if username already exists
    if (this.users.some(u => u.username === data.username)) {
      return { success: false, message: 'Username sudah digunakan' };
    }
    
    const newSiswa: User = {
      ...data,
      id: `siswa${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.push(newSiswa);
    return { success: true, data: newSiswa };
  }

  async updateSiswa(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    await this.delay();
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return { success: false, message: 'Siswa tidak ditemukan' };
    }
    
    this.users[index] = { ...this.users[index], ...data, updated_at: new Date().toISOString() };
    return { success: true, data: this.users[index] };
  }

  async resetPasswordSiswa(id: string): Promise<ApiResponse<void>> {
    await this.delay();
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return { success: false, message: 'Siswa tidak ditemukan' };
    }
    
    this.users[index].password_hash = 'password123';
    this.users[index].updated_at = new Date().toISOString();
    return { success: true };
  }

  async toggleActiveSiswa(id: string, aktif: boolean): Promise<ApiResponse<void>> {
    await this.delay();
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return { success: false, message: 'Siswa tidak ditemukan' };
    }
    
    this.users[index].aktif = aktif;
    this.users[index].updated_at = new Date().toISOString();
    return { success: true };
  }

  // Aktivitas endpoints
  async getAllAktivitas(filters: any = {}): Promise<ApiResponse<Aktivitas[]>> {
    await this.delay();
    
    let filtered = [...this.aktivitas];
    
    // Add siswa names
    filtered = filtered.map(a => ({
      ...a,
      siswa_nama: this.users.find(u => u.id === a.siswa_id)?.nama || 'Unknown'
    }));
    
    if (filters.status) {
      filtered = filtered.filter(a => a.status === filters.status);
    }
    
    if (filters.kelas_id) {
      filtered = filtered.filter(a => a.kelas_id === filters.kelas_id);
    }
    
    if (filters.q) {
      const query = filters.q.toLowerCase();
      filtered = filtered.filter(a => 
        a.judul_bacaan.toLowerCase().includes(query) ||
        a.siswa_nama?.toLowerCase().includes(query) ||
        a.penulis_sumber.toLowerCase().includes(query)
      );
    }
    
    return { success: true, data: filtered };
  }

  async createAktivitas(data: Omit<Aktivitas, 'id' | 'status' | 'poin' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Aktivitas>> {
    await this.delay();
    
    const newAktivitas: Aktivitas = {
      ...data,
      id: `aktivitas${Date.now()}`,
      status: 'Menunggu',
      poin: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.aktivitas.push(newAktivitas);
    return { success: true, data: newAktivitas };
  }

  async verifyAktivitas(id: string, status: 'Disetujui' | 'Ditolak', catatan?: string): Promise<ApiResponse<void>> {
    await this.delay();
    
    const index = this.aktivitas.findIndex(a => a.id === id);
    if (index === -1) {
      return { success: false, message: 'Aktivitas tidak ditemukan' };
    }
    
    const aktivitas = this.aktivitas[index];
    aktivitas.status = status;
    aktivitas.verifikator_id = this.currentUser?.id || '';
    aktivitas.verifikasi_at = new Date().toISOString();
    aktivitas.updated_at = new Date().toISOString();
    
    if (status === 'Disetujui') {
      aktivitas.poin = calculatePoin(aktivitas.durasi_menit, aktivitas.ringkasan);
    } else {
      aktivitas.catatan_verifikasi = catatan || '';
    }
    
    return { success: true };
  }

  // Level endpoints
  async getAllLevels(): Promise<ApiResponse<Level[]>> {
    await this.delay();
    return { success: true, data: this.levels };
  }

  async createLevel(data: Omit<Level, 'id'>): Promise<ApiResponse<Level>> {
    await this.delay();
    const newLevel: Level = {
      ...data,
      id: `level${Date.now()}`,
    };
    this.levels.push(newLevel);
    return { success: true, data: newLevel };
  }

  async updateLevel(id: string, data: Partial<Level>): Promise<ApiResponse<Level>> {
    await this.delay();
    const index = this.levels.findIndex(l => l.id === id);
    if (index === -1) {
      return { success: false, message: 'Level tidak ditemukan' };
    }
    
    this.levels[index] = { ...this.levels[index], ...data };
    return { success: true, data: this.levels[index] };
  }

  async deleteLevel(id: string): Promise<ApiResponse<void>> {
    await this.delay();
    const index = this.levels.findIndex(l => l.id === id);
    if (index === -1) {
      return { success: false, message: 'Level tidak ditemukan' };
    }
    
    this.levels.splice(index, 1);
    return { success: true };
  }

  // Leaderboard
  async getLeaderboardByKelas(kelasId: string): Promise<ApiResponse<LeaderboardEntry[]>> {
    await this.delay();
    
    const siswaInKelas = this.users.filter(u => u.role === 'siswa' && u.kelas_id === kelasId);
    const leaderboard: LeaderboardEntry[] = [];
    
    for (const siswa of siswaInKelas) {
      const aktivitasDisetujui = this.aktivitas.filter(a => a.siswa_id === siswa.id && a.status === 'Disetujui');
      const totalPoin = aktivitasDisetujui.reduce((sum, a) => sum + a.poin, 0);
      const totalDurasi = aktivitasDisetujui.reduce((sum, a) => sum + a.durasi_menit, 0);
      const level = calculateLevel(totalPoin, this.levels) || this.levels[0];
      
      leaderboard.push({
        posisi: 0, // Will be set after sorting
        siswa_id: siswa.id,
        nama: siswa.nama,
        total_poin: totalPoin,
        level,
        total_durasi: totalDurasi,
        jumlah_aktivitas: aktivitasDisetujui.length
      });
    }
    
    // Sort and assign positions
    leaderboard.sort((a, b) => {
      if (a.total_poin !== b.total_poin) return b.total_poin - a.total_poin;
      if (a.total_durasi !== b.total_durasi) return b.total_durasi - a.total_durasi;
      return b.jumlah_aktivitas - a.jumlah_aktivitas;
    });
    
    leaderboard.forEach((entry, index) => {
      entry.posisi = index + 1;
    });
    
    return { success: true, data: leaderboard };
  }

  // Dashboard stats
  async getGuruStats(kelasId?: string): Promise<ApiResponse<DashboardStats>> {
    await this.delay();
    
    const totalKelas = this.kelas.length;
    const totalSiswa = this.users.filter(u => u.role === 'siswa').length;
    const aktivitasMenunggu = this.aktivitas.filter(a => a.status === 'Menunggu').length;
    
    // Count approved activities this month
    const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const aktivitasDisetujuiBulanIni = this.aktivitas.filter(a => 
      a.status === 'Disetujui' && a.verifikasi_at?.startsWith(thisMonth)
    ).length;
    
    const stats: DashboardStats = {
      total_kelas: totalKelas,
      total_siswa: totalSiswa,
      aktivitas_menunggu: aktivitasMenunggu,
      aktivitas_disetujui_bulan_ini: aktivitasDisetujuiBulanIni,
    };
    
    return { success: true, data: stats };
  }

  async getSiswaStats(siswaId: string): Promise<ApiResponse<DashboardStats>> {
    await this.delay();
    
    const aktivitasSiswa = this.aktivitas.filter(a => a.siswa_id === siswaId);
    const aktivitasDisetujui = aktivitasSiswa.filter(a => a.status === 'Disetujui');
    const totalPoin = aktivitasDisetujui.reduce((sum, a) => sum + a.poin, 0);
    const level = calculateLevel(totalPoin, this.levels);
    
    const stats: DashboardStats = {
      total_poin: totalPoin,
      level_saat_ini: level || undefined,
      aktivitas_disetujui: aktivitasDisetujui.length,
      aktivitas_menunggu: aktivitasSiswa.filter(a => a.status === 'Menunggu').length,
      aktivitas_ditolak: aktivitasSiswa.filter(a => a.status === 'Ditolak').length,
    };
    
    return { success: true, data: stats };
  }
}

export const ApiService = new ApiService();
