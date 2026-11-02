import React from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const StaffProfileView: React.FC = () => {
  const { currentUser, logout, setViewRoute } = useRestaurant();

  if (!currentUser) {
    return (
      <AdminLayout title="Hồ Sơ Cá Nhân">
        <div className="p-8 text-center space-y-3">
          <p className="text-sm text-on-surface-variant">Bạn chưa đăng nhập.</p>
          <button
            onClick={() => setViewRoute('login')}
            className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-bold text-xs"
          >
            Đến trang đăng nhập
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Tài Khoản & Ca Làm Việc"
      subtitle="Theo dõi hiệu suất phục vụ trong ca trực và thông tin phân công nhiệm vụ"
    >
      <div className="max-w-2xl space-y-6">
        {/* Profile Card */}
        <div className="bg-surface-container-lowest border border-border rounded-2xl p-5 md:p-6 shadow-warm-xs flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center font-headline font-bold text-3xl shadow-warm-sm shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-soft text-primary text-[11px] font-bold uppercase tracking-wider">
              {currentUser.roleName}
            </div>
            <h3 className="font-headline font-bold text-xl md:text-2xl text-on-surface">
              {currentUser.name}
            </h3>
            <p className="text-xs text-on-surface-variant">
              Tài khoản: @{currentUser.username} • SĐT: {currentUser.phone}
            </p>
          </div>
        </div>

        {/* Shift Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-surface-container-lowest border border-border rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-on-surface-variant font-medium block">
              Ca trực hiện tại
            </span>
            <span className="font-headline font-bold text-sm text-on-surface mt-1 block">
              {currentUser.shift}
            </span>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-on-surface-variant font-medium block">
              Đơn đã phục vụ hôm nay
            </span>
            <span className="font-headline font-bold text-xl text-primary mt-1 block">
              28 đơn
            </span>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-on-surface-variant font-medium block">
              Doanh số thu tại bàn
            </span>
            <span className="font-headline font-bold text-xl text-tertiary mt-1 block">
              2.450.000đ
            </span>
          </div>
        </div>

        {/* Settings and Options */}
        <div className="bg-surface-container-lowest border border-border rounded-xl overflow-hidden shadow-xs divide-y divide-border/60">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">
                notifications_active
              </span>
              <div>
                <span className="font-bold text-xs md:text-sm text-on-surface block">
                  Chuông báo khi có đơn món mới
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Phát âm thanh chuông khi khách tại bàn gửi đơn vào bếp
                </span>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="accent-primary w-5 h-5" />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                password
              </span>
              <div>
                <span className="font-bold text-xs md:text-sm text-on-surface block">
                  Đổi mã PIN đăng nhập nhanh
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Cập nhật mã 4 số đăng nhập ca trực
                </span>
              </div>
            </div>
            <button
              onClick={() => alert('Chức năng đổi mã PIN: Cần kết nối API backend sau này.')}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface"
            >
              Đổi PIN
            </button>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-error text-[20px]">logout</span>
              <div>
                <span className="font-bold text-xs md:text-sm text-error block">
                  Đăng xuất tài khoản
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Kết thúc phiên làm việc trên thiết bị này
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-3.5 py-1.5 rounded-lg bg-error-container/20 text-error hover:bg-error-container text-xs font-bold transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
