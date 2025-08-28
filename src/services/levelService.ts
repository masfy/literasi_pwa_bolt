import { Level } from '../types';
import { apiService } from './apiService';

class LevelService {
  async getAll() {
    return apiService.getAllLevels();
  }

  async create(level: Omit<Level, 'id'>) {
    return apiService.createLevel(level);
  }

  async update(id: string, level: Partial<Level>) {
    return apiService.updateLevel(id, level);
  }

  async delete(id: string) {
    return apiService.deleteLevel(id);
  }
}
export const levelService = new LevelService();
