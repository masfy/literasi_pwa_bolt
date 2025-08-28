import { User } from '../types';
import { demoApiService } from './demoApiService';

class SiswaService {
  async getByKelas(kelasId: string) {
    return demoApiService.getSiswaByKelas(kelasId);
  }

  async create(siswa: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    return demoApiService.createSiswa(siswa);
  }

  async update(id: string, siswa: Partial<User>) {
    return demoApiService.updateSiswa(id, siswa);
  }

  async resetPassword(id: string) {
    return demoApiService.resetPasswordSiswa(id);
  }

  async toggleActive(id: string, aktif: boolean) {
    return demoApiService.toggleActiveSiswa(id, aktif);
  }
}

export const siswaService = new SiswaService();