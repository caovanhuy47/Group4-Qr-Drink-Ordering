import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useRestaurant } from '../../contexts/useRestaurant';
import { TableDetailDrawer } from '../../components/admin/TableDetailDrawer';
import { TableQrConfigModal } from '../../components/admin/TableQrConfigModal';
import { TableStatusBadge, TableStatusIcon } from '../../components/admin/TableStatusBadge';
import type { DiningTable, TableOperationalStatus } from '../../types/restaurant';

export const TableManagementView: React.FC = () => {
  const {
    tables,
    currentUser,
    selectedTableForDetail,
    setSelectedTableForDetail,
    isTableQrConfigModalOpen,
    setIsTableQrConfigModalOpen,
    markTableServedAndPaid,
    markTableEmpty,
    refreshTables,
  } = useRestaurant();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TableOperationalStatus>('all');
  const [processingTableId, setProcessingTableId] = useState<string | null>(null);
  const [isConnected] = useState<boolean>(true);

  const canCollect = currentUser?.canCollectMoney !== false;
  const isAdmin = currentUser?.role === 'admin' || !currentUser;

  // Count summaries
  const counts = useMemo(() => {
    return {
      total: tables.length,
      empty: tables.filter((t) => t.status === 'empty').length,
      ordered: tables.filter((t) => t.status === 'ordered').length,
      seated: tables.filter((t) => t.status === 'seated').length,
    };
  }, [tables]);

  // Filter and sort tables
  const filteredTables = useMemo(() => {
    return tables
      .filter((table) => {
        const matchesSearch =
          searchTerm === '' ||
          table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          table.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (table.currentSession?.sessionId &&
            table.currentSession.sessionId.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Priority 1: 'ordered' tables come first
        if (a.status === 'ordered' && b.status !== 'ordered') return -1;
        if (b.status === 'ordered' && a.status !== 'ordered') return 1;

        // Priority 2: Among 'ordered' tables, longer waiting minutes come first
        if (a.status === 'ordered' && b.status === 'ordered') {
          return (b.currentSession?.waitingMinutes || 0) - (a.currentSession?.waitingMinutes || 0);
        }

        // Priority 3: Natural table number order
        return a.number.localeCompare(b.number, undefined, { numeric: true });
      });
  }, [tables, searchTerm, statusFilter]);

  const handleServeAndPay = async (table: DiningTable) => {
    if (!canCollect || processingTableId) return;
    setProcessingTableId(table.id);
    try {
      await markTableServedAndPaid(table.id);
    } finally {
      setProcessingTableId(null);
    }
  };

  const handleMarkEmpty = (table: DiningTable) => {
    markTableEmpty(table.id);
  };

  return (
    <AdminLayout
      title="Quản lý bàn"
      subtitle="Theo dõi gọi món, phục vụ và tình trạng bàn"
    >
      <div className="space-y-5">
        {/* Top Operational Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-2xl border border-border shadow-xs">
          <div className="flex items-center gap-3">
            {/* Live Connection Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-border text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected ? 'bg-tertiary animate-pulse' : 'bg-error'
                }`}
              />
              <span className="font-semibold text-on-surface">
                {isConnected ? 'Đang kết nối thời gian thực' : 'Mất kết nối'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshTables}
              title="Cập nhật lại trạng thái bàn"
              className="p-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center justify-center text-xs"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên hoặc số bàn..."
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-xl text-xs md:text-sm text-on-surface border border-transparent focus:border-primary-container focus:bg-surface-container-lowest outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 text-on-surface-variant hover:text-on-surface p-0.5"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Admin QR Config Button */}
            {isAdmin && (
              <button
                onClick={() => setIsTableQrConfigModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary border border-primary/20 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">qr_code</span>
                <span className="hidden sm:inline">Cấu hình bàn & QR</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Quick Stat Summary Cards & Filter Pills */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: All Tables */}
          <button
            onClick={() => setStatusFilter('all')}
            className={`p-3.5 md:p-4 rounded-2xl border text-left transition-all ${
              statusFilter === 'all'
                ? 'bg-surface-container-lowest border-primary shadow-warm-sm ring-2 ring-primary/20'
                : 'bg-surface-container-lowest border-border hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center justify-between text-on-surface-variant mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Tổng số bàn</span>
              <span className="material-symbols-outlined text-[20px]">table_restaurant</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-black text-2xl md:text-3xl text-on-surface">
                {counts.total}
              </span>
              <span className="text-xs text-on-surface-variant">bàn hoạt động</span>
            </div>
          </button>

          {/* Card 2: Empty Tables */}
          <button
            onClick={() => setStatusFilter('empty')}
            className={`p-3.5 md:p-4 rounded-2xl border text-left transition-all ${
              statusFilter === 'empty'
                ? 'bg-surface-container-lowest border-on-surface-variant shadow-warm-sm ring-2 ring-border'
                : 'bg-surface-container-lowest border-border hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center justify-between text-on-surface-variant mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Bàn trống</span>
              <TableStatusIcon status="empty" size="md" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-black text-2xl md:text-3xl text-on-surface">
                {counts.empty}
              </span>
              <span className="text-xs text-on-surface-variant">sẵn sàng đón khách</span>
            </div>
          </button>

          {/* Card 3: Ordered Tables (Action Needed) */}
          <button
            onClick={() => setStatusFilter('ordered')}
            className={`p-3.5 md:p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              statusFilter === 'ordered'
                ? 'bg-primary-soft/40 border-primary-container shadow-warm-sm ring-2 ring-primary/20'
                : 'bg-surface-container-lowest border-border hover:bg-surface-container-low'
            }`}
          >
            {counts.ordered > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-ping" />
            )}
            <div className="flex items-center justify-between text-on-surface-variant mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Order thành công
              </span>
              <TableStatusIcon status="ordered" size="md" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-black text-2xl md:text-3xl text-primary">
                {counts.ordered}
              </span>
              <span className="text-xs text-primary font-bold">cần phục vụ</span>
            </div>
          </button>

          {/* Card 4: Seated Tables */}
          <button
            onClick={() => setStatusFilter('seated')}
            className={`p-3.5 md:p-4 rounded-2xl border text-left transition-all ${
              statusFilter === 'seated'
                ? 'bg-surface-container-lowest border-tertiary shadow-warm-sm ring-2 ring-tertiary/20'
                : 'bg-surface-container-lowest border-border hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center justify-between text-on-surface-variant mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-tertiary">Bàn Đang ngồi</span>
              <TableStatusIcon status="seated" size="md" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-black text-2xl md:text-3xl text-tertiary">
                {counts.seated}
              </span>
              <span className="text-xs text-on-surface-variant">đang thưởng thức</span>
            </div>
          </button>
        </div>

        {/* Section Heading & Active Filter Feedback */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <h3 className="font-headline font-bold text-base md:text-lg text-on-surface">
              {statusFilter === 'all'
                ? 'Toàn bộ danh sách bàn'
                : statusFilter === 'ordered'
                ? 'Danh sách bàn Order thành công (Ưu tiên phục vụ)'
                : statusFilter === 'seated'
                ? 'Danh sách bàn Đang ngồi (Đã thu tiền)'
                : 'Danh sách bàn Trống'}
            </h3>
            <span className="text-xs text-on-surface-variant">
              ({filteredTables.length} bàn)
            </span>
          </div>

          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          )}
        </div>

        {/* Grid of Tables */}
        {filteredTables.length === 0 ? (
          /* Empty Search or Filter State */
          <div className="bg-surface-container-lowest rounded-2xl border border-border p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px]">table_restaurant</span>
            </div>
            <h4 className="font-headline font-bold text-base text-on-surface">
              Không tìm thấy bàn nào phù hợp
            </h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Không có bàn nào khớp với từ khóa tìm kiếm hoặc bộ lọc trạng thái hiện tại.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold hover:bg-primary-hover shadow-xs"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 md:gap-4">
            {filteredTables.map((table) => {
              const session = table.currentSession;
              const isProcessing = processingTableId === table.id;

              return (
                <div
                  key={table.id}
                  className={`rounded-2xl border p-4 md:p-5 flex flex-col justify-between transition-all shadow-xs ${
                    table.status === 'ordered'
                      ? 'bg-surface-container-lowest border-2 border-primary-container/80 shadow-warm-sm ring-1 ring-primary-container/30'
                      : table.status === 'seated'
                      ? 'bg-surface-container-lowest border-border hover:border-secondary/50'
                      : 'bg-surface-container-lowest border-border/70 hover:border-border'
                  }`}
                >
                  {/* Top: Table Number & Status Badge */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {/* Table Number displayed without breaking lines */}
                        <h4 className="font-headline font-black text-2xl md:text-3xl text-on-surface tracking-tight leading-none whitespace-nowrap">
                          {table.number}
                        </h4>
                        <span className="text-[11px] text-on-surface-variant font-medium mt-1 block truncate">
                          {table.area}
                        </span>
                      </div>

                      {/* Compact Status Icon Badge (Receipt with check for Ordered, Tooltip & accessible name) */}
                      <TableStatusBadge status={table.status} variant="compact" />
                    </div>

                    {/* Middle: Operational State Info */}
                    <div className="py-2.5 border-t border-border/50">
                      {table.status === 'empty' && (
                        <div className="py-3 text-center space-y-1">
                          <span className="material-symbols-outlined text-[28px] text-on-surface-variant/40 block">
                            chair_alt
                          </span>
                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            Sẵn sàng nhận lượt gọi món mới
                          </p>
                          <span className="text-[10px] text-on-surface-variant/60 block">
                            (Khách quét QR gửi đơn sẽ tự động chuyển trạng thái)
                          </span>
                        </div>
                      )}

                      {table.status === 'ordered' && session && (
                        <div className="space-y-1.5">
                          {/* Total count & total money */}
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs font-bold text-on-surface">
                              {session.totalQuantity} phần gọi
                            </span>
                            <span className="font-headline font-black text-base text-primary">
                              {session.totalAmount.toLocaleString('vi-VN')}đ
                            </span>
                          </div>

                          {/* Time & waiting info */}
                          <div className="flex items-center justify-between text-[11px] text-on-surface-variant bg-surface-container-low px-2 py-1.5 rounded-lg">
                            <span className="font-mono text-primary font-bold">
                              #{session.sessionId}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-error">
                              <span className="material-symbols-outlined text-[13px]">timer</span>
                              Gửi {session.firstOrderAt} (Chờ {session.waitingMinutes}p)
                            </span>
                          </div>
                        </div>
                      )}

                      {table.status === 'seated' && session && (
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between font-semibold text-tertiary">
                            <span className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px]">groups</span>
                              Đã phục vụ & thu tiền
                            </span>
                            <span className="font-headline font-bold text-sm text-on-surface">
                              {(session.confirmedAmount || session.totalAmount).toLocaleString('vi-VN')}đ
                            </span>
                          </div>

                          <div className="text-[11px] text-on-surface-variant bg-surface-container-low p-2 rounded-lg leading-tight space-y-0.5">
                            <span className="block truncate">
                              NV: <strong>{session.confirmedBy || 'Quản lý'}</strong>
                            </span>
                            <span className="block text-[10px] opacity-80">
                              Lúc {session.confirmedAt} • Khách đang ngồi thưởng thức
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Action Buttons */}
                  <div className="pt-2 border-t border-border/50">
                    {table.status === 'empty' && (
                      <button
                        type="button"
                        onClick={() => setSelectedTableForDetail(table)}
                        className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors"
                      >
                        Xem thông tin bàn
                      </button>
                    )}

                    {table.status === 'ordered' && session && (
                      <div className="space-y-2">
                        {/* Primary Action Button */}
                        <button
                          type="button"
                          disabled={!canCollect || isProcessing}
                          onClick={() => handleServeAndPay(table)}
                          className={`w-full py-2.5 px-3 rounded-xl font-headline font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
                            !canCollect
                              ? 'bg-surface-container text-on-surface-variant/50 cursor-not-allowed'
                              : isProcessing
                              ? 'bg-primary-hover text-on-primary opacity-80 cursor-wait'
                              : 'bg-primary-container text-on-primary hover:bg-primary-hover'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isProcessing ? 'sync' : 'payments'}
                          </span>
                          <span>
                            {isProcessing ? 'Đang lưu...' : 'Đã phục vụ và thu tiền'}
                          </span>
                        </button>

                        {/* View Dishes button */}
                        <button
                          type="button"
                          onClick={() => setSelectedTableForDetail(table)}
                          className="w-full py-1.5 rounded-lg text-primary hover:bg-primary-soft text-xs font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">list_alt</span>
                          <span>Xem món ({session.items.length} món)</span>
                        </button>
                      </div>
                    )}

                    {table.status === 'seated' && (
                      <div className="space-y-2">
                        {/* Mark Empty button */}
                        <button
                          type="button"
                          onClick={() => handleMarkEmpty(table)}
                          className="w-full py-2.5 px-3 rounded-xl bg-tertiary-container text-on-tertiary hover:opacity-90 font-headline font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            cleaning_services
                          </span>
                          <span>Bàn trống</span>
                        </button>

                        {/* View again button */}
                        <button
                          type="button"
                          onClick={() => setSelectedTableForDetail(table)}
                          className="w-full py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">history</span>
                          <span>Xem lại món</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-over Drawer for Order Detail */}
      {selectedTableForDetail && (
        <TableDetailDrawer
          table={selectedTableForDetail}
          onClose={() => setSelectedTableForDetail(null)}
        />
      )}

      {/* Admin QR Configuration Modal */}
      <TableQrConfigModal
        isOpen={isTableQrConfigModalOpen}
        onClose={() => setIsTableQrConfigModalOpen(false)}
      />
    </AdminLayout>
  );
};
export default TableManagementView;

