import { Aktivitas } from '../types';
import { demoApiService } from './demoApiService';

interface AktivitasFilter {
  status?: string;
  kelas_id?: string;
  q?: string;
  from?: string;
  to?: string;
}

class AktivitasService {
  async getAll(filters: AktivitasFilter = {}) {
    return demoApiService.getAllAktivitas(filters);
  }

  async create(aktivitas: Omit<Aktivitas, 'id' | 'status' | 'poin' | 'created_at' | 'updated_at'>) {
    return demoApiService.createAktivitas(aktivitas);
  }

  async verify(id: string, status: 'Disetujui' | 'Ditolak', catatan?: string) {
    return demoApiService.verifyAktivitas(id, status, catatan);
  }

  async getRekap(filters: AktivitasFilter = {}) {
    return demoApiService.getAllAktivitas(filters);
  }
}

export const aktivitasService = new AktivitasService();