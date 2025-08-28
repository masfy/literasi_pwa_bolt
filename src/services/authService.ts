import { User, LoginResponse } from '../types';
import { apiService } from './apiService';

class AuthService {
  async login(username: string, password: string): Promise<LoginResponse> {
    return await apiService.login(username, password);
  }

  async logout(): Promise<void> {
    await apiService.logout();
  }

  async getMe(): Promise<User> {
    return await apiService.getMe();
  }
}

export const authService = new AuthService();
