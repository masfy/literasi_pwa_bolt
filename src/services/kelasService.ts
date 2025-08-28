import { Kelas } from '../types';
import { apiService } from './apiService';

class KelasService {
  async getAll() {
    return apiService.getAllKelas();
  }

  async getById(id: string) {
    // Not implemented in demo
    return { success: false, message: 'Not implemented' };
  }

  async create(kelas: Omit<Kelas, 'id' | 'created_at' | 'updated_at'>) {
    return apiService.createKelas(kelas);
  }

  async update(id: string, kelas: Partial<Kelas>) {
    return apiService.updateKelas(id, kelas);
  }

  async delete(id: string) {
    return apiService.deleteKelas(id);
  }

  async getMySiswaKelas() {
    // Not implemented in demo
    return { success: false, message: 'Not implemented' };
  }
}

export const kelasService = new KelasService();
