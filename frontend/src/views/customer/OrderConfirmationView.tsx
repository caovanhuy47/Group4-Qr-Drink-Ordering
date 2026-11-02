import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';

export const OrderConfirmationView: React.FC = () => {
  const {
    cart,
    cartTotalPrice,
    currentTable,
    submitOrder,
    setViewRoute,
  } = useRestaurant();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const finalPrice = cartTotalPrice;

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await submitOrder();
      if (!result.success) {
        setErrorMessage(result.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi đơn vào bếp. Vui lòng thử lại.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-xl border-b border-border shadow-xs">
        <div className="max-w-[720px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewRoute('cart')}
              disabled={isSubmitting}
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h2 className="font-headline font-bold text-base md:text-lg text-on-surface leading-tight">
                Xác Nhận Đặt Món • Huy CV
              </h2>
              <span className="text-[11px] text-primary font-bold">{currentTable}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Confirmation Content */}
      <main className="max-w-[720px] mx-auto w-full px-4 md:px-8 py-6 flex-1 space-y-4">
        {/* Error Alert Banner if validation fails */}
        {errorMessage && (
          <div className="bg-error-container/20 border border-error/30 rounded-xl p-4 flex items-start gap-3 text-xs text-error">
            <span className="material-symbols-outlined text-[20px] shrink-0 text-error">error</span>
            <div className="flex-1 space-y-1">
              <span className="font-bold text-sm block">Không thể gửi đơn vào bếp</span>
              <p className="text-on-surface-variant leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Table & Bill Highlight Box */}
        <div className="bg-surface-container-lowest border-2 border-primary-container/30 rounded-2xl p-5 md:p-6 shadow-warm-sm text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-primary-soft text-primary mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[30px]">table_restaurant</span>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Xác nhận phục vụ tại bàn
            </span>
            <h3 className="font-headline font-bold text-2xl text-on-surface mt-0.5">
              {currentTable}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Vui lòng kiểm tra lại số bàn và danh sách món trước khi gửi đơn vào quầy Huy CV.
            </p>
          </div>

          {/* Pricing Highlight Pill */}
          <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-around">
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant font-medium">Tổng số món</span>
              <span className="font-headline font-bold text-base text-on-surface">
                {cart.reduce((sum, i) => sum + i.quantity, 0)} món
              </span>
            </div>
            <div className="h-8 w-[1px] bg-border" />
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant font-medium">Tổng thanh toán</span>
              <span className="font-headline font-bold text-lg text-primary">
                {finalPrice.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        </div>

        {/* Payment Policy Notice Box (Strictly per RULES.md) */}
        <div className="bg-secondary-soft border border-secondary-container rounded-xl p-4 flex gap-3 items-start">
          <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">
            local_atm
          </span>
          <div className="space-y-1 text-xs text-on-surface">
            <span className="font-bold text-secondary text-sm block">
              Thanh toán tiền mặt hoặc chuyển khoản lúc nhận món
            </span>
            <p className="text-on-surface-variant leading-relaxed">
              Nhân viên quán Huy CV sẽ mang món ra tận bàn và thu đủ số tiền{' '}
              <strong>{finalPrice.toLocaleString('vi-VN')}đ</strong>. Thanh toán xong quý khách vẫn tiếp tục ngồi tại bàn thưởng thức thoải mái, bàn không bị đóng hay làm trống.
            </p>
          </div>
        </div>

        {/* Dish Items Review */}
        <div className="bg-surface-container-lowest border border-border rounded-xl p-4 space-y-3">
          <h4 className="font-headline font-bold text-sm text-on-surface pb-2 border-b border-border/50">
            Chi tiết các món gửi bếp
          </h4>
          <div className="divide-y divide-border/40 space-y-2">
            {cart.map((item) => (
              <div key={item.cartItemId} className="pt-2 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-bold text-primary w-5 text-center shrink-0">
                    {item.quantity}x
                  </span>
                  <div className="truncate">
                    <span className="font-semibold text-on-surface">{item.name}</span>
                    <span className="text-[11px] text-on-surface-variant block truncate">
                      {item.selectedSize.name}
                      {item.selectedToppings.length > 0
                        ? ` • ${item.selectedToppings.map((t) => t.name).join(', ')}`
                        : ''}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-on-surface shrink-0">
                  {item.totalPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Actions */}
      <footer className="sticky bottom-0 z-30 bg-surface/95 backdrop-blur-xl border-t border-border p-4 pb-safe">
        <div className="max-w-[720px] mx-auto flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => setViewRoute('cart')}
            disabled={isSubmitting}
            className="w-full sm:w-1/3 py-3 rounded-full bg-surface-container text-on-surface font-headline font-semibold text-xs md:text-sm hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            Quay lại sửa giỏ
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || cart.length === 0}
            className="w-full sm:flex-1 py-3.5 rounded-full bg-primary-container text-on-primary hover:bg-primary-hover font-headline font-bold text-sm shadow-warm-md flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                <span>Đang kiểm tra & gửi đơn...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">send</span>
                <span>Xác nhận gửi đơn vào bếp ({finalPrice.toLocaleString('vi-VN')}đ)</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};
export default OrderConfirmationView;
