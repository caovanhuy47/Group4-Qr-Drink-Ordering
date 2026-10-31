import React from 'react';
import { useApp } from './contexts/useApp';
import { ToastContainer } from './components/common/ToastContainer';

export const App: React.FC = () => {
  const { serverHealth } = useApp();

  return (
    <div
      className="app-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <main
        id="main-content"
        className="glass-panel animate-fade-in"
        style={{
          padding: '48px 40px',
          textAlign: 'center',
          maxWidth: '640px',
          width: '100%',
        }}
      >
        <h1
          id="main-title"
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.3,
          }}
        >
          Nhóm 4 — Website đặt món bằng mã QR
        </h1>
        <p
          id="main-subtitle"
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            marginBottom: '24px',
          }}
        >
          Khung dự án đã sẵn sàng.
        </p>

        <div
          id="backend-status-pill"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor:
                serverHealth.status === 'online'
                  ? '#10b981'
                  : serverHealth.status === 'checking'
                  ? '#f59e0b'
                  : '#f43f5e',
            }}
          />
          <span style={{ color: 'var(--text-muted)' }}>
            Backend: {serverHealth.status === 'online' ? 'Kết nối bình thường' : serverHealth.status === 'checking' ? 'Đang kiểm tra...' : 'Không có kết nối'}
          </span>
        </div>
      </main>

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default App;
