import { Kelas } from '../types';
import { demoApiService } from './demoApiService';

class KelasService {
  async getAll() {
    return demoApiService.getAllKelas();
  }

  async getById(id: string) {
    // Not implemented in demo
    return { success: false, message: 'Not implemented' };
  }

  async create(kelas: Omit<Kelas, 'id' | 'created_at' | 'updated_at'>) {
    return demoApiService.createKelas(kelas);
  }

  async update(id: string, kelas: Partial<Kelas>) {
    return demoApiService.updateKelas(id, kelas);
  }

  async delete(id: string) {
    return demoApiService.deleteKelas(id);
  }

  async getMySiswaKelas() {
    // Not implemented in demo
    return { success: false, message: 'Not implemented' };
  }
}

export const kelasService = new KelasService();