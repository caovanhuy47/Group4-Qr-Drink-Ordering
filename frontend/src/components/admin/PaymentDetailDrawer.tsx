import React, { useState, useEffect } from 'react';
import { reportsApi, type PaymentHistoryRecord } from '../../services/reportsApi';

interface PaymentDetailDrawerProps {
  record: PaymentHistoryRecord | null;
  onClose: () => void;
}

export const PaymentDetailDrawer: React.FC<PaymentDetailDrawerProps> = ({ record, onClose }) => {
  const [serverDetail, setServerDetail] = useState<PaymentHistoryRecord | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Fetch freshest details from server whenever selected record changes
  useEffect(() => {
    if (!record) return;

    let ignore = false;
    reportsApi
      .fetchPaymentDetail(record.id || record.sessionId)
      .then((fresh) => {
        if (!ignore && fresh) {
          setServerDetail(fresh);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch fresh payment detail, using initial snapshot:', err);
      })
      .finally(() => {
        if (!ignore) setIsLoadingDetail(false);
      });

    return () => {
      ignore = true;
    };
  }, [record]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!record) return null;
  const current = (serverDetail && (serverDetail.id === record.id || serverDetail.sessionId === record.sessionId)) ? serverDetail : record;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-surface-container-lowest border-l border-border shadow-warm-lg flex flex-col justify-between animate-slide-left">
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-border bg-surface-container-low/50">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline font-black text-2xl text-on-surface tracking-tight">
                    {current.tableNumber}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container border border-border text-on-surface-variant font-medium">
                    {current.area}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant">
                  <span className="font-mono font-bold text-primary">#{current.sessionId}</span>
                  <span>•</span>
                  <span>Lượt đã thu đủ tiền</span>
                  {isLoadingDetail && (
                    <span className="inline-block w-2.5 h-2.5 rounded-full border-2 border-primary border-t-transparent animate-spin ml-1" />
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng chi tiết"
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Current Table Lifecycle Status Badge */}
            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
              <span className="font-semibold text-on-surface-variant">Tình trạng vận hành:</span>
              {current.completedAt ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-bold border border-border">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>Lượt đã kết thúc • Bàn đã Trống</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-soft text-tertiary font-bold border border-tertiary/20">
                  <span className="material-symbols-outlined text-[14px]">event_seat</span>
                  <span>Đã thu tiền • Khách đang ngồi</span>
                </span>
              )}
            </div>
          </div>

          {/* Audit Metadata Info Box */}
          <div className="p-4 md:p-5 bg-surface-container-low/30 border-b border-border/60 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-on-surface-variant block">Thời điểm bắt đầu gọi:</span>
                <strong className="text-on-surface block mt-0.5">{current.firstOrderAt || 'Chưa rõ'}</strong>
              </div>
              <div>
                <span className="text-on-surface-variant block">Thời điểm xác nhận thu:</span>
                <strong className="text-tertiary block mt-0.5">{current.confirmedAt}</strong>
              </div>
              <div>
                <span className="text-on-surface-variant block">Người xác nhận thu tiền:</span>
                <strong className="text-on-surface block mt-0.5">{current.confirmedBy}</strong>
              </div>
              <div>
                <span className="text-on-surface-variant block">Thời điểm giải phóng bàn:</span>
                <strong className="text-on-surface block mt-0.5">{current.completedAt || 'Chưa rời bàn'}</strong>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-on-surface">
                Chi tiết các món đã phục vụ
              </h4>
              <span className="text-xs text-primary font-bold">
                {current.totalQuantity} phần món
              </span>
            </div>

            <div className="divide-y divide-border/60">
              {current.items.map((item, idx) => (
                <div key={`${item.itemId || idx}`} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-primary-soft text-primary font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {item.quantity}x
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-on-surface block leading-tight">
                        {item.name}
                      </span>
                      {item.sizeName && item.sizeName !== 'Tiêu chuẩn' && (
                        <span className="text-[11px] text-on-surface-variant block mt-0.5">
                          Quy cách: {item.sizeName}
                        </span>
                      )}
                      {item.toppings && item.toppings.length > 0 && (
                        <span className="text-[11px] text-on-surface-variant block">
                          Topping: {item.toppings.join(', ')}
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
          </div>

          {/* Footer Total */}
          <div className="p-4 md:p-5 border-t border-border bg-surface-container-low/70 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-on-surface-variant uppercase">
                Tổng tiền đã thu đủ
              </span>
              <span className="font-headline font-black text-2xl text-primary">
                {current.totalAmount.toLocaleString('vi-VN')}đ
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-border text-[11px] text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
              <span>Dữ liệu lịch sử đã đóng sổ kế toán • Không hỗ trợ sửa đổi trực tiếp.</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors"
            >
              Đóng chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PaymentDetailDrawer;
