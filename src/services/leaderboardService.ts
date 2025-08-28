import { LeaderboardEntry } from '../types';
import { apiService } from './apiService';

class LeaderboardService {
  async getByKelas(kelasId: string) {
    return apiService.getLeaderboardByKelas(kelasId);
  }
}

export const leaderboardService = new LeaderboardService();
