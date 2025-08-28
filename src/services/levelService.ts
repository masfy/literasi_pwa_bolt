import { Level } from '../types';
import { demoApiService } from './demoApiService';

class LevelService {
  async getAll() {
    return demoApiService.getAllLevels();
  }

  async create(level: Omit<Level, 'id'>) {
    return demoApiService.createLevel(level);
  }

  async update(id: string, level: Partial<Level>) {
    return demoApiService.updateLevel(id, level);
  }

  async delete(id: string) {
    return demoApiService.deleteLevel(id);
  }
}

export const levelService = new LevelService();