import { ApiResponse } from '../types';

const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbygviE1BN2wUWUbHIjxehKlij-aAM2ggkhZ6XHX-46ZbYN9-o3MUQg2e5DS7UpzN6mx/exec';

// IMPORTANT: Ganti YOUR_DEPLOYMENT_ID dengan ID deployment Apps Script Anda
// Contoh: https://script.google.com/macros/s/AKfycbx.../exec

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('lentera_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Format URL untuk Apps Script dengan parameter path
      const url = `${API_BASE_URL}?path=${encodeURIComponent(endpoint)}`;
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: this.getHeaders(),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan pada server',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data || {}),
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data || {}),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
