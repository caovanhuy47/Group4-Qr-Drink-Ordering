import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';
import type { DiningTable } from '../../types/restaurant';

interface TableDetailDrawerProps {
  table: DiningTable | null;
  onClose: () => void;
}

export const TableDetailDrawer: React.FC<TableDetailDrawerProps> = ({ table, onClose }) => {
  const {
    currentUser,
    markTableServedAndPaid,
    markTableEmpty,
  } = useRestaurant();

  const [isProcessing, setIsProcessing] = useState(false);

  if (!table) return null;

  const session = table.currentSession;
  const canCollect = currentUser?.canCollectMoney !== false;

  const handleServeAndPay = async () => {
    if (!canCollect || isProcessing) return;
    setIsProcessing(true);
    // Simulate brief network latency for feedback stability
    setTimeout(() => {
      markTableServedAndPaid(table.id);
      setIsProcessing(false);
    }, 350);
  };

  const handleMarkEmpty = () => {
    markTableEmpty(table.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over Panel (Drawer on Desktop, Modal/Sheet on Mobile) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-container-lowest border-l border-border shadow-warm-lg flex flex-col justify-between animate-slide-left">
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-border bg-surface-container-low/50">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline font-black text-2xl text-on-surface tracking-tight">
                    {table.number}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container border border-border text-on-surface-variant font-medium">
                    {table.area}
                  </span>
                </div>
                {session ? (
                  <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant">
                    <span className="font-mono font-bold text-primary">#{session.sessionId}</span>
                    <span>•</span>
                    <span>Lượt gửi: {session.firstOrderAt}</span>
                    {table.status === 'ordered' && session.waitingMinutes > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-error font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px]">timer</span>
                          Chờ {session.waitingMinutes} phút
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-tertiary font-medium mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Bàn đang trống • Sẵn sàng đón khách mới
                  </p>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Status Indicator */}
            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Trạng thái vận hành
              </span>
              {table.status === 'ordered' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-soft text-secondary-container-on font-bold text-xs border border-secondary-container">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  Order thành công
                </span>
              )}
              {table.status === 'seated' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-soft text-tertiary font-bold text-xs border border-tertiary/20">
                  <span className="material-symbols-outlined text-[15px]">event_seat</span>
                  Đang ngồi (Đã thu tiền)
                </span>
              )}
              {table.status === 'empty' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-bold text-xs border border-border">
                  <span className="material-symbols-outlined text-[15px]">event_seat</span>
                  Trống
                </span>
              )}
            </div>
          </div>

          {/* Dish List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3">
            <h4 className="font-headline font-bold text-sm text-on-surface flex items-center justify-between">
              <span>Danh sách món của lượt bàn</span>
              {session && (
                <span className="text-xs text-primary font-bold">
                  {session.totalQuantity} phần gọi
                </span>
              )}
            </h4>

            {!session || session.items.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant space-y-2">
                <span className="material-symbols-outlined text-[40px] opacity-40">restaurant</span>
                <p className="text-xs">Chưa có món nào được gọi trong lượt này.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {session.items.map((item, idx) => (
                  <div key={`${item.itemId}-${idx}`} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-primary-soft text-primary font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {item.quantity}x
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-on-surface block leading-tight">
                          {item.name}
                        </span>
                        {(item.selectedSize.price > 0 || item.selectedSize.name !== 'Tiêu chuẩn') && (
                          <span className="text-[11px] text-on-surface-variant block mt-0.5">
                            Quy cách: {item.selectedSize.name}
                          </span>
                        )}
                        {item.selectedToppings.length > 0 && (
                          <span className="text-[11px] text-on-surface-variant block">
                            Topping: {item.selectedToppings.map((t) => t.name).join(', ')}
                          </span>
                        )}
                        {item.notes && (
                          <span className="text-[11px] text-secondary font-medium block italic mt-0.5">
                            Ghi chú: {item.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-headline font-bold text-xs text-on-surface block">
                        {item.totalPrice.toLocaleString('vi-VN')}đ
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-on-surface-variant block">
                          ({item.unitPrice.toLocaleString('vi-VN')}đ/phần)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Seated Audit info */}
            {table.status === 'seated' && session && session.confirmedBy && (
              <div className="p-3.5 rounded-xl bg-tertiary-soft/60 border border-tertiary/20 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-tertiary">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Đã phục vụ & thu đủ tiền</span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Nhân viên xác nhận: <strong>{session.confirmedBy}</strong> lúc <strong>{session.confirmedAt}</strong>.
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Số tiền đã thu: <strong className="text-tertiary">{session.confirmedAmount?.toLocaleString('vi-VN')}đ</strong>. Khách vẫn tiếp tục ngồi tại bàn.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 md:p-5 border-t border-border bg-surface-container-low/70 space-y-3">
            {session && (
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-on-surface-variant uppercase">
                  Tổng tiền lượt bàn
                </span>
                <span className="font-headline font-black text-xl text-primary">
                  {session.totalAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            )}

            {table.status === 'ordered' && session && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant">
                  <span>Xác nhận cho: <strong>{table.number}</strong> (#{session.sessionId})</span>
                  <span className="font-bold text-primary">{session.totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>

                {!canCollect && (
                  <p className="text-[11px] text-error font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Tài khoản của bạn chưa được cấp quyền thu tiền tại bàn.
                  </p>
                )}

                <button
                  type="button"
                  disabled={!canCollect || isProcessing}
                  onClick={handleServeAndPay}
                  className={`w-full py-3.5 rounded-xl font-headline font-bold text-xs md:text-sm shadow-warm-sm flex items-center justify-center gap-2 transition-all active:scale-98 ${
                    !canCollect
                      ? 'bg-surface-container text-on-surface-variant/50 cursor-not-allowed'
                      : isProcessing
                      ? 'bg-primary-hover text-on-primary opacity-80 cursor-wait'
                      : 'bg-primary-container text-on-primary hover:bg-primary-hover'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isProcessing ? 'sync' : 'payments'}
                  </span>
                  <span>
                    {isProcessing ? 'Đang lưu xác nhận...' : 'Đã phục vụ và thu tiền'}
                  </span>
                </button>
              </div>
            )}

            {table.status === 'seated' && (
              <button
                type="button"
                onClick={handleMarkEmpty}
                className="w-full py-3.5 rounded-xl bg-tertiary-container text-on-tertiary hover:opacity-90 font-headline font-bold text-xs md:text-sm shadow-warm-sm flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px]">cleaning_services</span>
                <span>Bàn trống (Khách đã rời • Sẵn sàng đón khách mới)</span>
              </button>
            )}

            {table.status === 'empty' && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-surface-container text-on-surface font-semibold text-xs hover:bg-surface-container-high transition-colors"
              >
                Đóng chi tiết
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default TableDetailDrawer;

