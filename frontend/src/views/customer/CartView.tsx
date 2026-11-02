import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';

export const CartView: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotalPrice,
    currentTable,
    setViewRoute,
  } = useRestaurant();

  const [orderNotes, setOrderNotes] = useState<string>('');
  const finalPrice = cartTotalPrice;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-xl border-b border-border px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewRoute('lobby')}
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h2 className="font-headline font-bold text-base md:text-lg text-on-surface leading-tight">
                Giỏ Hàng • Huy CV
              </h2>
              <span className="text-[11px] text-primary font-bold">{currentTable}</span>
            </div>
          </div>
        </header>

        {/* Empty State */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/50">
            <span className="material-symbols-outlined text-[48px]">remove_shopping_cart</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-xl text-on-surface">Giỏ hàng đang trống</h3>
            <p className="text-xs md:text-sm text-on-surface-variant mt-1.5 leading-relaxed">
              Bạn chưa chọn món nào từ thực đơn của Huy CV. Hãy lướt menu và chọn món ngon nhé!
            </p>
          </div>
          <button
            onClick={() => setViewRoute('lobby')}
            className="px-6 py-3 rounded-full bg-primary-container text-on-primary font-headline font-bold text-sm shadow-warm-sm hover:bg-primary-hover active:scale-95 transition-all"
          >
            Xem thực đơn ngay
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-xl border-b border-border shadow-xs">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewRoute('lobby')}
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h2 className="font-headline font-bold text-base md:text-lg text-on-surface leading-tight">
                Giỏ Hàng • Huy CV
              </h2>
              <span className="text-[11px] text-primary font-bold">
                {currentTable} • {cart.reduce((sum, i) => sum + i.quantity, 0)} món
              </span>
            </div>
          </div>

          <button
            onClick={clearCart}
            className="text-xs font-semibold text-error hover:bg-error-container/40 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            <span>Xóa giỏ</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout: 2 Columns on Desktop */}
      <main className="max-w-[1200px] mx-auto w-full px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-headline font-bold text-base text-on-surface">
              Món đã chọn
            </h3>
            <button
              onClick={() => setViewRoute('lobby')}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
            >
              <span>+ Thêm món khác</span>
            </button>
          </div>

          {cart.map((item) => (
            <div
              key={item.cartItemId}
              className="bg-surface-container-lowest border border-border rounded-xl p-3.5 flex gap-3.5 shadow-xs hover:border-primary-container/40 transition-colors"
            >
              {/* Dish Photo */}
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-lg object-cover bg-surface-container shrink-0"
              />

              {/* Item Details */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-headline font-bold text-sm text-on-surface line-clamp-1">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-on-surface-variant hover:text-error transition-colors p-0.5"
                      title="Xóa món"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  {/* Size & Toppings Pill */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[11px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-medium">
                      {item.selectedSize.name}
                    </span>
                    {item.selectedToppings.map((t) => (
                      <span
                        key={t.id}
                        className="text-[11px] bg-tertiary-soft text-tertiary px-2 py-0.5 rounded font-medium"
                      >
                        +{t.name}
                      </span>
                    ))}
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-on-surface-variant/75 italic mt-1 line-clamp-1">
                      Ghi chú: {item.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Stepper & Total Item Price */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/40">
                  <div className="flex items-center gap-2 bg-surface-container-low border border-border px-2 py-1 rounded-full">
                    <button
                      onClick={() => updateCartQuantity(item.cartItemId, -1)}
                      className="w-6 h-6 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[14px]">remove</span>
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-on-surface">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.cartItemId, 1)}
                      className="w-6 h-6 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                    </button>
                  </div>

                  <span className="font-headline font-bold text-sm text-primary">
                    {item.totalPrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* General Order Notes */}
          <div className="bg-surface-container-lowest border border-border rounded-xl p-3.5 space-y-1.5 shadow-xs">
            <label className="block font-headline font-bold text-xs text-on-surface">
              Ghi chú phục vụ cho toàn bộ đơn hàng
            </label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="VD: Mang đá lạnh ra trước, cho xin thêm đĩa ớt băm..."
              className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-xs text-on-surface border border-border outline-none focus:border-primary-container focus:bg-surface-container-lowest transition-all"
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout */}
        <div className="lg:col-span-5 space-y-4">
          {/* Pricing Summary Card */}
          <div className="bg-surface-container-lowest border border-border rounded-xl p-4 md:p-5 shadow-warm-sm space-y-4">
            <h3 className="font-headline font-bold text-base text-on-surface pb-2 border-b border-border/50">
              Tóm Tắt Đơn Hàng
            </h3>

            <div className="space-y-2.5 text-xs md:text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Tạm tính ({cart.reduce((sum, i) => sum + i.quantity, 0)} món):</span>
                <span className="font-semibold text-on-surface">
                  {cartTotalPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>

              <div className="flex justify-between text-on-surface-variant">
                <span>Phí phục vụ tại {currentTable}:</span>
                <span className="font-semibold text-tertiary">Miễn phí (0đ)</span>
              </div>

              <div className="pt-2 border-t border-border flex justify-between items-baseline">
                <span className="font-headline font-bold text-sm md:text-base text-on-surface">
                  Tổng thanh toán:
                </span>
                <span className="font-headline font-bold text-lg md:text-xl text-primary">
                  {finalPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            {/* Payment & Seating Note per RULES.md */}
            <div className="bg-secondary-soft border border-secondary-container rounded-xl p-3 text-xs text-on-surface space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-secondary">
                <span className="material-symbols-outlined text-[16px]">payments</span>
                <span>Quy trình phục vụ quán Huy CV</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Nhân viên sẽ mang món ra tận <strong>{currentTable}</strong> và thu đủ tiền lúc nhận món. Sau khi thanh toán, quý khách vẫn tiếp tục ngồi thưởng thức thoải mái tại bàn.
              </p>
            </div>

            {/* Submit Action */}
            <button
              onClick={() => setViewRoute('order-confirm')}
              className="w-full py-3.5 rounded-full bg-primary-container text-on-primary hover:bg-primary-hover font-headline font-bold text-sm shadow-warm-sm flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <span>Tiến hành đặt món</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
export default CartView;
