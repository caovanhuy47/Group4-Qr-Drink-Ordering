import React from 'react';
import { useApp } from '../../contexts/useApp';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9999,
        maxWidth: '380px',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          id={`toast-item-${t.id}`}
          className="glass-panel animate-fade-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderLeft: `4px solid ${
              t.type === 'success' ? '#10b981' : t.type === 'error' ? '#f43f5e' : '#6366f1'
            }`,
            background: 'rgba(15, 23, 42, 0.95)',
          }}
        >
          {t.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
          {t.type === 'error' && <AlertTriangle size={18} color="#f43f5e" />}
          {t.type === 'info' && <Info size={18} color="#6366f1" />}
          <span style={{ fontSize: '0.875rem', flex: 1, color: '#f1f5f9' }}>{t.message}</span>
          <button
            id={`toast-close-${t.id}`}
            onClick={() => removeToast(t.id)}
            style={{ background: 'transparent', color: '#94a3b8', padding: '2px', border: 'none', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
