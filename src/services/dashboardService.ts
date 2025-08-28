import { DashboardStats } from '../types';
import { apiService } from './apiService';

class DashboardService {
  async getGuruStats(kelasId?: string) {
    return apiService.getGuruStats(kelasId);
  }

  async getSiswaStats(siswaId: string) {
    return apiService.getSiswaStats(siswaId);
  }
}

export const dashboardService = new DashboardService();
