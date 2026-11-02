import React from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';

export const FloatingCartBar: React.FC = () => {
  const { cartTotalCount, cartTotalPrice, setViewRoute, viewRoute } = useRestaurant();

  if (cartTotalCount === 0 || viewRoute !== 'lobby') {
    return null;
  }

  return (
    <div className="floating-cart-bar-mobile md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 pb-safe bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
      <div className="max-w-[480px] mx-auto pointer-events-auto">
        <div className="w-full bg-primary-container text-on-primary rounded-2xl p-3 shadow-warm-lg flex items-center justify-between gap-3 animate-slide-up border border-primary-hover">
          {/* Cart Info */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-xl bg-on-primary/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-secondary-container text-on-secondary-container font-bold text-[10px] rounded-full flex items-center justify-center px-1 shadow-xs">
                {cartTotalCount}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-on-primary-container font-medium">Giỏ hàng của bạn</span>
              <span className="font-headline font-bold text-sm leading-tight">
                {cartTotalPrice.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={() => setViewRoute('cart')}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-surface-container-lowest text-primary font-headline font-bold text-xs shadow-xs hover:bg-surface-container transition-transform active:scale-95"
          >
            <span>Xem giỏ hàng</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default FloatingCartBar;
