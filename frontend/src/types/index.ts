export interface ServerHealth {
  status: 'online' | 'offline' | 'checking';
  latency: number | null;
  message: string;
  timestamp: string | null;
}
