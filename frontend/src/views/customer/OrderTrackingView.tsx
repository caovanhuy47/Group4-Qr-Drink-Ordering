import React from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';
import type { OrderStatus } from '../../types/restaurant';

export const OrderTrackingView: React.FC = () => {
  const { currentOrder, setViewRoute } = useRestaurant();

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[40px]">receipt_long</span>
        </div>
        <h3 className="font-headline font-bold text-lg text-on-surface">Chưa có đơn hàng nào</h3>
        <p className="text-xs text-on-surface-variant max-w-xs">
          Bạn chưa gửi đơn gọi món nào cho Bàn này.
        </p>
        <button
          onClick={() => setViewRoute('lobby')}
          className="px-5 py-2.5 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-xs hover:bg-primary-hover"
        >
          Xem thực đơn gọi món
        </button>
      </div>
    );
  }

  const steps: { status: OrderStatus; label: string; desc: string; icon: string }[] = [
    {
      status: 'pending',
      label: 'Đã gửi vào bếp',
      desc: 'Hệ thống Huy CV đã tiếp nhận và chuyển đơn thẳng tới quầy bếp / pha chế',
      icon: 'skillet',
    },
    {
      status: 'preparing',
      label: 'Bếp đang chuẩn bị',
      desc: 'Món ăn & thức uống đang được hoàn thiện nóng hổi',
      icon: 'restaurant',
    },
    {
      status: 'served_paid',
      label: 'Đã phục vụ & Thu đủ tiền',
      desc: 'Nhân viên đã mang món ra bàn và thu tiền hoàn tất',
      icon: 'task_alt',
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'preparing':
        return 1;
      case 'served_paid':
      case 'seated':
        return 2;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(currentOrder.status);

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      {/* Top Header: Clean and responsive without conflicting extra actions */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-xl border-b border-border shadow-xs">
        <div className="max-w-[800px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setViewRoute('lobby')}
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
              title="Quay lại thực đơn"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex flex-col min-w-0">
              <h2 className="font-headline font-bold text-sm md:text-base text-on-surface leading-tight truncate">
                Tiến Trình Đơn Hàng • Huy CV
              </h2>
              <span className="text-[11px] text-primary font-bold truncate">
                Mã đơn: #{currentOrder.id} • {currentOrder.tableNumber}
              </span>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-primary-soft text-primary font-bold text-xs shrink-0">
            {currentOrder.tableNumber}
          </div>
        </div>
      </header>

      {/* Main Tracking Content */}
      <main className="max-w-[800px] mx-auto w-full px-4 md:px-8 py-6 space-y-6 flex-1">
        {/* Status Card & Progress Timeline */}
        <div className="bg-surface-container-lowest border border-border rounded-2xl p-5 md:p-6 shadow-warm-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">
                Thời gian đặt: {currentOrder.createdAt}
              </span>
              <h3 className="font-headline font-bold text-xl md:text-2xl text-on-surface mt-0.5">
                {(currentOrder.status === 'pending' || currentOrder.status === 'preparing') &&
                  'Đã gửi vào bếp • Đang chuẩn bị món'}
                {(currentOrder.status === 'served_paid' || currentOrder.status === 'seated') &&
                  'Đã phục vụ xong • Đang dùng bữa'}
              </h3>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-primary-soft text-primary font-bold text-xs shrink-0">
              {currentOrder.tableNumber}
            </div>
          </div>

          {/* Timeline Step Indicators */}
          <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
            {steps.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.status} className="relative flex items-start gap-4">
                  {/* Step Icon Badge */}
                  <div
                    className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                      isPast
                        ? 'bg-tertiary text-on-tertiary'
                        : isCurrent
                        ? 'bg-primary-container text-on-primary ring-4 ring-primary-soft scale-110'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {isPast ? (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Step Info */}
                  <div>
                    <h4
                      className={`font-headline font-bold text-sm md:text-base ${
                        isCurrent
                          ? 'text-primary'
                          : isPast
                          ? 'text-tertiary'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Post-Payment Seating Reminder per RULES.md */}
        <div className="bg-secondary-soft border border-secondary-container rounded-2xl p-4 md:p-5 flex gap-3.5 items-start">
          <span className="material-symbols-outlined text-secondary text-[24px] shrink-0 mt-0.5">
            chair
          </span>
          <div className="space-y-1 text-xs md:text-sm text-on-surface">
            <span className="font-headline font-bold text-secondary block text-sm">
              Quy tắc ngồi tại quán vỉa hè Huy CV
            </span>
            <p className="text-on-surface-variant leading-relaxed">
              Sau khi nhân viên thu tiền đủ cho đơn này, quý khách tiếp tục ngồi dùng nước và trò chuyện thoải mái tại <strong>{currentOrder.tableNumber}</strong>. Bàn chỉ trở lại trạng thái Trống khi quý khách rời quán và nhân viên đã dọn dẹp xong.
            </p>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="bg-surface-container-lowest border border-border rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <h4 className="font-headline font-bold text-sm md:text-base text-on-surface">
              Danh sách món đã gửi ({currentOrder.items.reduce((s, i) => s + i.quantity, 0)} món)
            </h4>
            <span className="text-xs font-bold text-primary">
              Tổng thanh toán: {currentOrder.totalAmount.toLocaleString('vi-VN')}đ
            </span>
          </div>

          <div className="divide-y divide-border/40 space-y-2.5">
            {currentOrder.items.map((item) => (
              <div key={item.cartItemId} className="pt-2 flex items-center justify-between gap-3 text-xs md:text-sm">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-surface-container shrink-0"
                  />
                  <div>
                    <span className="font-semibold text-on-surface">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-xs text-on-surface-variant block mt-0.5">
                      {item.selectedSize.name}
                      {item.selectedToppings.length > 0
                        ? ` • ${item.selectedToppings.map((t) => t.name).join(', ')}`
                        : ''}
                    </span>
                    {item.notes && (
                      <span className="text-[11px] text-on-surface-variant/75 italic block">
                        Ghi chú: {item.notes}
                      </span>
                    )}
                  </div>
                </div>

                <span className="font-bold text-on-surface shrink-0">
                  {item.totalPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>
            ))}
          </div>

          {currentOrder.notes && (
            <div className="bg-surface-container-low p-3 rounded-xl text-xs text-on-surface-variant border border-border/40">
              <span className="font-bold text-on-surface block mb-0.5">Ghi chú đơn hàng:</span>
              {currentOrder.notes}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default OrderTrackingView;
