import React, { useState, useEffect, type ReactNode } from 'react';
import type { ServerHealth } from '../types';
import { apiService } from '../services/api';
import { AppContext, type Toast } from './context';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [serverHealth, setServerHealth] = useState<ServerHealth>({
    status: 'checking',
    latency: null,
    message: 'Đang kiểm tra kết nối...',
    timestamp: null,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const checkServerHealth = async () => {
    const res = await apiService.checkHealth();
    setServerHealth({
      status: res.status,
      latency: res.latency ?? null,
      message: res.message,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
    });
  };

  useEffect(() => {
    let isMounted = true;
    apiService.checkHealth().then((res) => {
      if (isMounted) {
        setServerHealth({
          status: res.status,
          latency: res.latency ?? null,
          message: res.message,
          timestamp: new Date().toLocaleTimeString('vi-VN'),
        });
      }
    });

    const interval = setInterval(checkServerHealth, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        serverHealth,
        checkServerHealth,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
