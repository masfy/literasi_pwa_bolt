import { User, LoginResponse } from '../types';
import { demoApiService } from './demoApiService';

class AuthService {
  async login(username: string, password: string): Promise<LoginResponse> {
    return await demoApiService.login(username, password);
  }

  async logout(): Promise<void> {
    await demoApiService.logout();
  }

  async getMe(): Promise<User> {
    return await demoApiService.getMe();
  }
}

export const authService = new AuthService();