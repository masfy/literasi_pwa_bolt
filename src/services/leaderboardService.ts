import { LeaderboardEntry } from '../types';
import { demoApiService } from './demoApiService';

class LeaderboardService {
  async getByKelas(kelasId: string) {
    return demoApiService.getLeaderboardByKelas(kelasId);
  }
}

export const leaderboardService = new LeaderboardService();