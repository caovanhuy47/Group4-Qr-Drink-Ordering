import React from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';

export const CustomerHeader: React.FC = () => {
  const {
    currentTable,
    cartTotalCount,
    cartTotalPrice,
    searchTerm,
    setSearchTerm,
    setViewRoute,
    viewRoute,
    showToast,
    currentCustomer,
    setIsCustomerAuthModalOpen,
    logoutCustomer,
  } = useRestaurant();

  const handleCallWaiter = () => {
    showToast(`Đã gửi yêu cầu gọi phục vụ tới ${currentTable}! Nhân viên Huy CV sẽ tới ngay.`, 'info');
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-surface/95 backdrop-blur-xl border-b border-border shadow-[0_1px_8px_rgba(43,33,24,0.06)]">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-8 py-2 md:py-3 flex flex-col gap-2">
        {/* Main Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-6 min-w-0">
          {/* Brand Wordmark: Huy CV */}
          <button
            onClick={() => setViewRoute('lobby')}
            className="flex items-center gap-2 text-left focus:outline-none group shrink-0 min-w-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">local_cafe</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline font-extrabold text-base sm:text-xl text-primary tracking-tight leading-none truncate">
                Huy CV
              </span>
              <span className="text-[10px] sm:text-[11px] text-on-surface-variant font-semibold tracking-wide uppercase mt-0.5 truncate">
                Quán Nước Vỉa Hè
              </span>
            </div>
          </button>

          {/* Desktop Center Search Bar (shown in Food Lobby on md+ screens) */}
          {viewRoute === 'lobby' && (
            <div className="hidden md:flex flex-1 max-w-md mx-auto relative items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm món ngon: Bún bò, Cơm tấm, Trà đào, Bánh tráng..."
                className="w-full h-10 pl-11 pr-10 bg-surface-container-low rounded-full text-sm text-on-surface placeholder:text-on-surface-variant/70 border border-transparent focus:border-primary-container focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container outline-none transition-all shadow-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          )}

          {/* Right Actions: Compact on mobile, rich on desktop */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            {/* Table Badge */}
            <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-secondary-soft rounded-full border border-secondary-container text-on-surface shadow-xs text-xs font-bold shrink-0">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-tertiary animate-pulse shrink-0"></span>
              <span className="whitespace-nowrap">{currentTable}</span>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setViewRoute('cart')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full font-semibold text-xs md:text-sm transition-all shadow-sm shrink-0 ${
                viewRoute === 'cart'
                  ? 'bg-primary-hover text-on-primary ring-2 ring-primary-container'
                  : 'bg-primary-container text-on-primary hover:bg-primary-hover'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">shopping_bag</span>
              <span>{cartTotalCount}</span>
              <span className="hidden sm:inline">món</span>
              {cartTotalCount > 0 && (
                <>
                  <span className="opacity-60 hidden md:inline">•</span>
                  <span className="hidden md:inline">{cartTotalPrice.toLocaleString('vi-VN')}đ</span>
                </>
              )}
            </button>

            {/* Call Waiter Button */}
            <button
              onClick={handleCallWaiter}
              title="Gọi nhân viên phục vụ tại bàn"
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors text-xs font-semibold flex items-center gap-1 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">
                notifications_active
              </span>
              <span className="hidden sm:inline">Gọi phục vụ</span>
            </button>

            {/* Customer Account Button (Separate from Staff) */}
            {currentCustomer ? (
              <button
                onClick={logoutCustomer}
                title={`Tài khoản: ${currentCustomer.name} (Bấm để đăng xuất)`}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full bg-primary-soft text-primary hover:bg-primary-container hover:text-on-primary text-xs font-bold transition-all shadow-xs shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">account_circle</span>
                <span className="hidden sm:inline truncate max-w-[70px]">{currentCustomer.name}</span>
                <span className="material-symbols-outlined text-[14px]">logout</span>
              </button>
            ) : (
              <button
                onClick={() => setIsCustomerAuthModalOpen(true)}
                title="Đăng nhập hoặc đăng ký thành viên khách hàng"
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors shadow-xs shrink-0"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">account_circle</span>
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar (Only shown on mobile when in Food Lobby) */}
        {viewRoute === 'lobby' && (
          <div className="md:hidden w-full relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm món ngon: Bún bò, Cơm tấm, Trà đào..."
              className="w-full h-9 pl-10 pr-9 bg-surface-container-low rounded-full text-xs text-on-surface placeholder:text-on-surface-variant/70 border border-transparent focus:border-primary-container focus:bg-surface-container-lowest outline-none transition-all shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 text-on-surface-variant hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
