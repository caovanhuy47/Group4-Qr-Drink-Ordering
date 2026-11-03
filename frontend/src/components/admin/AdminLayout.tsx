import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';
import type { ViewRoute, Staff } from '../../types/restaurant';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  const { viewRoute, setViewRoute, currentUser, logout, isAuthChecking } = useRestaurant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { route: ViewRoute; label: string; icon: string; permission?: keyof Staff }[] = [
    { route: 'admin/overview', label: 'Tổng quan', icon: 'insights', permission: 'canViewOverview' },
    { route: 'admin/tables', label: 'Quản lý bàn', icon: 'table_restaurant', permission: 'canViewTables' },
    { route: 'admin/history', label: 'Lịch sử thu tiền', icon: 'payments', permission: 'canViewHistory' },
    { route: 'admin/menu', label: 'Quản lý món ăn', icon: 'restaurant_menu', permission: 'canManageMenu' },
    { route: 'admin/categories', label: 'Quản lý danh mục', icon: 'category', permission: 'canManageMenu' },
    { route: 'admin/banners', label: 'Quản lý banner', icon: 'view_carousel', permission: 'canManageBanners' },
    { route: 'admin/staff', label: 'Nhân viên & Phân quyền', icon: 'badge', permission: 'canManageStaff' },
    { route: 'admin/profile', label: 'Tài khoản & Ca trực', icon: 'account_circle' },
  ];

  // Shell skeleton shown during session restoration & auth verification
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex flex-col md:flex-row text-on-surface">
        {/* Mobile Header Skeleton */}
        <div className="md:hidden sticky top-0 z-30 bg-surface-container-highest px-4 py-3 flex items-center justify-between border-b border-border shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container animate-pulse" />
            <div className="flex flex-col gap-1">
              <div className="h-4 w-16 bg-surface-container rounded animate-pulse" />
              <div className="h-2.5 w-24 bg-surface-container rounded animate-pulse" />
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-surface-container animate-pulse" />
        </div>

        {/* Desktop Sidebar Skeleton */}
        <aside className="hidden md:flex sticky top-0 left-0 h-screen z-40 w-64 bg-surface-container-lowest border-r border-border flex-col justify-between p-4">
          <div>
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-border/60">
              <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[24px]">storefront</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-extrabold text-lg text-primary leading-tight">
                  Huy CV
                </span>
                <span className="text-[11px] text-on-surface-variant font-semibold uppercase">
                  Quản Trị Quán Vỉa Hè
                </span>
              </div>
            </div>

            <div className="bg-surface-container-low p-3 rounded-xl mb-4 border border-border/50 flex items-center gap-2.5 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-surface-container-high" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-24 bg-surface-container-high rounded" />
                <div className="h-2.5 w-16 bg-surface-container rounded" />
              </div>
            </div>

            <div className="space-y-1.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-surface-container-low/60 animate-pulse" />
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border/60">
            <div className="h-9 rounded-xl bg-surface-container-low/40 animate-pulse" />
          </div>
        </aside>

        {/* Main Content Area Skeleton */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="bg-surface-container-lowest border-b border-border px-4 md:px-8 py-4 flex items-center justify-between shadow-xs">
            <div>
              <h1 className="font-headline font-bold text-xl md:text-2xl text-on-surface leading-tight">
                {title}
              </h1>
              {subtitle && <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>}
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] animate-spin text-primary">sync</span>
                <span>Đang đồng bộ...</span>
              </span>
            </div>
          </div>

          <div className="p-4 md:p-8 flex-1 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-surface-container-lowest border border-border p-4 animate-pulse space-y-2">
                  <div className="h-3 w-20 bg-surface-container rounded" />
                  <div className="h-6 w-16 bg-surface-container-high rounded" />
                </div>
              ))}
            </div>

            <div className="h-64 rounded-2xl bg-surface-container-lowest border border-border p-6 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] animate-spin text-primary">sync</span>
              </div>
              <span className="text-xs text-on-surface-variant font-medium">
                Đang xác thực quyền hạn và tải dữ liệu vận hành từ máy chủ...
              </span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Filter items based on staff permissions
  const authorizedNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    if (currentUser?.role === 'admin') return true;
    return Boolean(currentUser?.[item.permission]);
  });

  // Verify access for currently active route
  const currentItem = navItems.find((item) => item.route === viewRoute);
  const isAuthorized =
    Boolean(currentUser) &&
    (!currentItem?.permission ||
      currentUser?.role === 'admin' ||
      Boolean(currentUser?.[currentItem.permission]));

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-on-surface">
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-30 bg-surface-container-highest px-4 py-3 flex items-center justify-between border-b border-border shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
          <div className="flex flex-col">
            <span className="font-headline font-extrabold text-base text-primary leading-tight">
              Huy CV
            </span>
            <span className="text-[10px] text-on-surface-variant font-medium uppercase">
              Quản Trị Vận Hành
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewRoute('lobby')}
            className="px-2.5 py-1 rounded-full bg-secondary-soft border border-secondary-container text-xs font-bold text-on-surface"
          >
            Sảnh khách
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar (and Mobile Slide-over Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-40 w-64 bg-surface-container-lowest border-r border-border flex flex-col justify-between p-4 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand & Badge: Huy CV */}
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-border/60">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">storefront</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-extrabold text-lg text-primary leading-tight">
                Huy CV
              </span>
              <span className="text-[11px] text-on-surface-variant font-semibold uppercase">
                Quản Trị Quán Vỉa Hè
              </span>
            </div>
          </div>

          {/* Current Staff Info Card */}
          {currentUser && (
            <div className="bg-surface-container-low p-3 rounded-xl mb-4 border border-border/50 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs text-on-surface truncate">{currentUser.name}</span>
                <span className="text-[11px] text-primary font-medium">{currentUser.roleName}</span>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="space-y-1">
            {authorizedNavItems.map((item) => {
              const isActive = viewRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => {
                    setViewRoute(item.route);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all text-left ${
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? 'text-on-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Logout */}
        <div className="pt-3 border-t border-border/60">
          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-error hover:bg-error-container/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Đăng xuất ca trực</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <div className="bg-surface-container-lowest border-b border-border px-4 md:px-8 py-4 flex items-center justify-between shadow-xs">
          <div>
            <h1 className="font-headline font-bold text-xl md:text-2xl text-on-surface leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setViewRoute('lobby')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary-soft text-on-surface border border-secondary-container text-xs font-bold hover:bg-secondary-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">
                visibility
              </span>
              <span>Xem Sảnh Khách</span>
            </button>
          </div>
        </div>

        {/* Page Content with Permission Guard */}
        <div className="p-4 md:p-8 flex-1">
          {isAuthorized ? (
            children
          ) : !currentUser ? (
            <div className="max-w-md mx-auto my-12 bg-surface-container-lowest border border-border rounded-2xl p-8 text-center space-y-4 shadow-warm-xs">
              <div className="w-16 h-16 rounded-2xl bg-secondary-soft text-secondary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px]">lock</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  Yêu Cầu Đăng Nhập Ca Trực
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Bạn chưa đăng nhập hoặc phiên làm việc đã kết thúc. Vui lòng đăng nhập tài khoản nhân viên để tiếp tục thao tác.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewRoute('login')}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-hover transition-colors"
                >
                  Đến trang đăng nhập
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto my-12 bg-surface-container-lowest border border-border rounded-2xl p-8 text-center space-y-4 shadow-warm-xs">
              <div className="w-16 h-16 rounded-2xl bg-error-container/40 text-error flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px]">lock_person</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  Không Có Quyền Truy Cập
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Tài khoản của bạn ({currentUser.name} - {currentUser.roleName}) chưa được cấp quyền truy cập vào màn hình này.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewRoute('admin/tables')}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-hover transition-colors"
                >
                  Về Quản lý bàn
                </button>
                <button
                  type="button"
                  onClick={() => setViewRoute('admin/profile')}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors"
                >
                  Xem hồ sơ của tôi
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
