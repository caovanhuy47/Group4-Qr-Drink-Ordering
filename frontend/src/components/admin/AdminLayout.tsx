import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';
import type { ViewRoute } from '../../types/restaurant';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  const { viewRoute, setViewRoute, currentUser, logout } = useRestaurant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { route: ViewRoute; label: string; icon: string }[] = [
    { route: 'admin/overview', label: 'Tổng quan', icon: 'insights' },
    { route: 'admin/tables', label: 'Quản lý bàn', icon: 'table_restaurant' },
    { route: 'admin/history', label: 'Lịch sử thu tiền', icon: 'payments' },
    { route: 'admin/menu', label: 'Quản lý món ăn', icon: 'restaurant_menu' },
    { route: 'admin/categories', label: 'Quản lý danh mục', icon: 'category' },
    { route: 'admin/banners', label: 'Quản lý banner', icon: 'view_carousel' },
    { route: 'admin/staff', label: 'Nhân viên & Phân quyền', icon: 'badge' },
    { route: 'admin/profile', label: 'Tài khoản & Ca trực', icon: 'account_circle' },
  ];

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
            {navItems.map((item) => {
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

        {/* Bottom Actions: Customer Menu Switch & Logout */}
        <div className="pt-4 border-t border-border/60 space-y-2">
          <button
            onClick={() => {
              setViewRoute('lobby');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-on-surface bg-surface-container-low hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">
              qr_code_scanner
            </span>
            <span>Xem Sảnh Khách (Bàn 05)</span>
          </button>

          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-error hover:bg-error-container/20 transition-colors"
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

        {/* Page Content */}
        <div className="p-4 md:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
};
