const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class APIClient {
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        window.location.href = '/auth/login';
      }
      throw new Error('Sesión no autorizada');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API error: ${response.statusText}`);
    }

    return response.json();
  }

  static get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static post<T>(endpoint: string, data?: Record<string, any>) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static put<T>(endpoint: string, data?: Record<string, any>) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Hook para usar en componentes del cliente
export function useAPI() {
  return {
    get: <T,>(endpoint: string) => APIClient.get<T>(endpoint),
    post: <T,>(endpoint: string, data?: Record<string, any>) =>
      APIClient.post<T>(endpoint, data),
    put: <T,>(endpoint: string, data?: Record<string, any>) =>
      APIClient.put<T>(endpoint, data),
    delete: <T,>(endpoint: string) => APIClient.delete<T>(endpoint),
  };
}
