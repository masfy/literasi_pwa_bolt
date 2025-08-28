import { User } from '../types';
import { apiService } from './apiService';

class SiswaService {
  async getByKelas(kelasId: string) {
    return apiService.getSiswaByKelas(kelasId);
  }

  async create(siswa: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    return apiService.createSiswa(siswa);
  }

  async update(id: string, siswa: Partial<User>) {
    return apiService.updateSiswa(id, siswa);
  }

  async resetPassword(id: string) {
    return apiService.resetPasswordSiswa(id);
  }

  async toggleActive(id: string, aktif: boolean) {
    return apiService.toggleActiveSiswa(id, aktif);
  }
}

export const siswaService = new SiswaService();
