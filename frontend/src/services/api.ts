import { API_BASE_URL } from './apiConfig';

export interface HealthResponse {
  status: 'online' | 'offline';
  message: string;
  latency?: number;
}

export const apiService = {
  async checkHealth(): Promise<HealthResponse> {
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json();
        return {
          status: 'online',
          message: typeof data === 'object' && data !== null && 'status' in data ? String(data.status) : 'OK',
          latency,
        };
      }
      return { status: 'offline', message: `HTTP ${res.status}`, latency };
    } catch (err: unknown) {
      const latency = Math.round(performance.now() - start);
      const msg = err instanceof Error ? err.message : 'Connection failed';
      return { status: 'offline', message: msg, latency };
    }
  },
};
