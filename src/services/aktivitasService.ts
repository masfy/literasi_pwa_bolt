import { Aktivitas } from '../types';
import { apiService } from './apiService';

interface AktivitasFilter {
  status?: string;
  kelas_id?: string;
  q?: string;
  from?: string;
  to?: string;
}

class AktivitasService {
  async getAll(filters: AktivitasFilter = {}) {
    return apiService.getAllAktivitas(filters);
  }

  async create(aktivitas: Omit<Aktivitas, 'id' | 'status' | 'poin' | 'created_at' | 'updated_at'>) {
    return apiService.createAktivitas(aktivitas);
  }

  async verify(id: string, status: 'Disetujui' | 'Ditolak', catatan?: string) {
    return apiService.verifyAktivitas(id, status, catatan);
  }

  async getRekap(filters: AktivitasFilter = {}) {
    return apiService.getAllAktivitas(filters);
  }
}

export const aktivitasService = new AktivitasService();
