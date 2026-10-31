import { createContext } from 'react';
import type { ServerHealth } from '../types';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface AppContextType {
  serverHealth: ServerHealth;
  checkServerHealth: () => Promise<void>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

