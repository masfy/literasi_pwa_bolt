import { Aktivitas } from '../types';
import { ApiService } from './ApiService';

interface AktivitasFilter {
  status?: string;
  kelas_id?: string;
  q?: string;
  from?: string;
  to?: string;
}

class AktivitasService {
  async getAll(filters: AktivitasFilter = {}) {
    return ApiService.getAllAktivitas(filters);
  }

  async create(aktivitas: Omit<Aktivitas, 'id' | 'status' | 'poin' | 'created_at' | 'updated_at'>) {
    return ApiService.createAktivitas(aktivitas);
  }

  async verify(id: string, status: 'Disetujui' | 'Ditolak', catatan?: string) {
    return ApiService.verifyAktivitas(id, status, catatan);
  }

  async getRekap(filters: AktivitasFilter = {}) {
    return ApiService.getAllAktivitas(filters);
  }
}

export const aktivitasService = new AktivitasService();
