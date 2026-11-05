import React, { useEffect } from 'react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  tableNumber: string;
  sessionId: string;
  onViewOrder: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  tableNumber,
  sessionId,
  onViewOrder,
}) => {
  // Lock background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const displayOrderCode = sessionId.startsWith('#') ? sessionId : `#${sessionId}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
    >
      <div className="w-full max-w-sm bg-surface-container-lowest border border-border rounded-3xl p-6 shadow-warm-xl text-center space-y-5 animate-in zoom-in-95 duration-200">
        {/* Success Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-full bg-tertiary-soft border border-tertiary/20 flex items-center justify-center text-tertiary shadow-warm-sm">
          <span className="material-symbols-outlined text-[36px]">check_circle</span>
        </div>

        {/* Title & Info */}
        <div className="space-y-2">
          <h3
            id="order-success-title"
            className="font-headline font-black text-xl md:text-2xl text-on-surface"
          >
            Đã gửi món thành công
          </h3>
          <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
            Quán đã nhận món của bàn và chuyển thẳng tới quầy bếp/pha chế.
          </p>
        </div>

        {/* Order Identifier Pill */}
        <div className="p-3.5 rounded-2xl bg-surface-container-low border border-border/80 flex items-center justify-around text-xs">
          <div className="flex items-center gap-1.5 font-bold text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-primary">
              table_restaurant
            </span>
            <span>{tableNumber}</span>
          </div>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex items-center gap-1 font-bold text-primary">
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>{displayOrderCode}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onViewOrder}
            className="w-full py-3.5 px-6 rounded-full bg-primary-container text-on-primary hover:bg-primary-hover font-headline font-bold text-sm shadow-warm-md flex items-center justify-center gap-2 transition-transform active:scale-98"
          >
            <span>Xem món đã đặt</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
