import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';

export const CustomerHeader: React.FC = () => {
  const {
    currentTable,
    setCurrentTable,
    tables,
    cartTotalCount,
    cartTotalPrice,
    searchTerm,
    setSearchTerm,
    setViewRoute,
    viewRoute,
  } = useRestaurant();

  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);
  const [customTableInput, setCustomTableInput] = useState<string>('');

  const handleSelectTable = (tblNum: string) => {
    setCurrentTable(tblNum);
    setIsTableModalOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTableInput.trim()) {
      setCurrentTable(customTableInput.trim());
      setCustomTableInput('');
      setIsTableModalOpen(false);
    }
  };

  return (
    <>
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

            {/* Right Actions: Table Badge & Cart Button (No Call Waiter, No Customer Login) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Table Badge */}
              <button
                type="button"
                onClick={() => setIsTableModalOpen(true)}
                title={currentTable ? `Đang gọi món tại ${currentTable}. Bấm để đổi số bàn.` : 'Chưa có thông tin bàn. Bấm để chọn bàn.'}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-soft rounded-full border border-secondary-container text-on-surface shadow-xs text-xs font-bold shrink-0 hover:bg-secondary-container/50 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${currentTable ? 'bg-tertiary animate-pulse' : 'bg-on-surface-variant/40'}`} />
                <span className="whitespace-nowrap font-headline">{currentTable || 'Chọn số bàn'}</span>
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">arrow_drop_down</span>
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setViewRoute('cart')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full font-semibold text-xs md:text-sm transition-all shadow-sm shrink-0 ${
                  viewRoute === 'cart'
                    ? 'bg-primary-hover text-on-primary ring-2 ring-primary-container'
                    : cartTotalCount > 0
                    ? 'bg-primary-container text-on-primary hover:bg-primary-hover'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
                aria-label={`Giỏ hàng ${cartTotalCount} món`}
              >
                <span className="material-symbols-outlined text-[17px] sm:text-[18px]">shopping_bag</span>
                <span>{cartTotalCount}</span>
                <span className="hidden sm:inline">món</span>
                {cartTotalCount > 0 && (
                  <>
                    <span className="opacity-60 hidden md:inline">•</span>
                    <span className="hidden md:inline font-bold">{cartTotalPrice.toLocaleString('vi-VN')}đ</span>
                  </>
                )}
              </button>
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

      {/* Table Selector Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 border border-border shadow-warm-lg space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">table_restaurant</span>
                <h3 className="font-headline font-bold text-base text-on-surface">Chọn số bàn phục vụ</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTableModalOpen(false)}
                className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Khi quét mã QR trên bàn, hệ thống tự động nhận diện bàn của bạn. Bạn cũng có thể chọn bàn bên dưới:
            </p>

            {/* Quick table buttons */}
            <div className="grid grid-cols-4 gap-2">
              {tables.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTable(t.number)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                    currentTable === t.number
                      ? 'bg-primary-container text-on-primary border-primary shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-border'
                  }`}
                >
                  {t.number.replace('BÀN ', 'Bàn ')}
                </button>
              ))}
            </div>

            {/* Or custom table input */}
            <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-border/60 flex gap-2">
              <input
                type="text"
                value={customTableInput}
                onChange={(e) => setCustomTableInput(e.target.value)}
                placeholder="Nhập số bàn khác..."
                className="flex-1 px-3 py-1.5 text-xs bg-surface-container-low rounded-xl border border-border focus:border-primary outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-primary-container text-on-primary text-xs font-bold rounded-xl shadow-xs hover:bg-primary-hover"
              >
                Xác nhận
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
