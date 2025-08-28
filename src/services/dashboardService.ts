import { DashboardStats } from '../types';
import { demoApiService } from './demoApiService';

class DashboardService {
  async getGuruStats(kelasId?: string) {
    return demoApiService.getGuruStats(kelasId);
  }

  async getSiswaStats(siswaId: string) {
    return demoApiService.getSiswaStats(siswaId);
  }
}

export const dashboardService = new DashboardService();