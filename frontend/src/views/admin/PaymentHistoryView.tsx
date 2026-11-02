import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { reportsApi, type PaymentHistoryResponse, type PaymentHistoryRecord } from '../../services/reportsApi';
import { PaymentDetailDrawer } from '../../components/admin/PaymentDetailDrawer';

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export const PaymentHistoryView: React.FC = () => {
  const todayStr = getTodayString();

  const [dateRangeType, setDateRangeType] = useState<'today' | 'all' | 'custom'>('today');
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [search, setSearch] = useState<string>('');
  const [tableFilter, setTableFilter] = useState<string>('');
  const [staffFilter, setStaffFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const limit = 8;

  // Data state
  const [historyData, setHistoryData] = useState<PaymentHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Selected item for drawer
  const [selectedRecord, setSelectedRecord] = useState<PaymentHistoryRecord | null>(null);

  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    reportsApi
      .fetchPaymentHistory({
        page,
        limit,
        search: search.trim() || undefined,
        tableNumber: tableFilter.trim() || undefined,
        confirmedBy: staffFilter.trim() || undefined,
        startDate: dateRangeType === 'all' ? undefined : startDate,
        endDate: dateRangeType === 'all' ? undefined : endDate,
      })
      .then((res) => {
        if (!ignore) {
          setHistoryData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setErrorMessage(err instanceof Error ? err.message : 'Không thể tải lịch sử thu tiền');
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [page, limit, search, tableFilter, staffFilter, dateRangeType, startDate, endDate, reloadTrigger]);

  const loadData = useCallback(() => {
    setIsLoading(true);
    setReloadTrigger((t) => t + 1);
  }, []);

  // Debounced search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleResetFilters = () => {
    setDateRangeType('today');
    setStartDate(todayStr);
    setEndDate(todayStr);
    setSearch('');
    setTableFilter('');
    setStaffFilter('');
    setPage(1);
  };

  const summary = historyData?.summary || { totalSessions: 0, totalRevenue: 0, totalItems: 0 };
  const records = historyData?.data || [];
  const pagination = historyData?.pagination || { page: 1, limit: 8, totalPages: 1, totalItems: 0 };

  return (
    <AdminLayout
      title="Lịch sử thu tiền"
      subtitle="Tra cứu và đối soát toàn bộ các lượt bàn đã phục vụ & thu tiền thành công"
    >
      <div className="space-y-5">
        {/* Filter & Search Bar */}
        <div className="bg-surface-container-lowest p-4 md:p-5 rounded-2xl border border-border shadow-xs space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div>
              <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider mb-1">
                Tìm kiếm
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Mã lượt (#LT-...) hoặc Bàn..."
                  className="w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
                />
              </div>
            </div>

            {/* Quick Date Range Type */}
            <div>
              <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider mb-1">
                Khoảng thời gian
              </label>
              <select
                value={dateRangeType}
                onChange={(e) => {
                  const val = e.target.value as typeof dateRangeType;
                  setDateRangeType(val);
                  setPage(1);
                  if (val === 'today') {
                    setStartDate(todayStr);
                    setEndDate(todayStr);
                  }
                }}
                className="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
              >
                <option value="today">Hôm nay ({todayStr})</option>
                <option value="all">Toàn bộ lịch sử</option>
                <option value="custom">Tùy chọn khoảng ngày</option>
              </select>
            </div>

            {/* Table Filter */}
            <div>
              <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider mb-1">
                Lọc theo bàn
              </label>
              <select
                value={tableFilter}
                onChange={(e) => {
                  setTableFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
              >
                <option value="">Tất cả bàn</option>
                <option value="BÀN 01">Bàn 01</option>
                <option value="BÀN 02">Bàn 02</option>
                <option value="BÀN 03">Bàn 03</option>
                <option value="BÀN 05">Bàn 05</option>
                <option value="BÀN 06">Bàn 06</option>
                <option value="BÀN 08">Bàn 08</option>
                <option value="BÀN 12">Bàn 12</option>
                <option value="BÀN 27">Bàn 27</option>
              </select>
            </div>

            {/* Staff Filter */}
            <div>
              <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider mb-1">
                Người xác nhận thu
              </label>
              <select
                value={staffFilter}
                onChange={(e) => {
                  setStaffFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
              >
                <option value="">Tất cả nhân sự</option>
                <option value="Mai">Trần Thị Mai (Thu ngân)</option>
                <option value="Nam">Lê Hoàng Nam (Phục vụ)</option>
                <option value="Hùng">Nguyễn Văn Hùng (Quản lý)</option>
              </select>
            </div>
          </form>

          {/* Sub-row for custom date range & reset action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/40">
            {dateRangeType === 'custom' ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-on-surface-variant font-medium">Từ ngày:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-surface-container-low rounded-lg border border-border text-on-surface outline-none"
                />
                <span className="text-on-surface-variant font-medium">Đến:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-surface-container-low rounded-lg border border-border text-on-surface outline-none"
                />
              </div>
            ) : (
              <div className="text-xs text-on-surface-variant">
                Đang hiển thị lượt thu tiền theo múi giờ quán (GMT+7)
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">filter_alt_off</span>
                <span>Xóa bộ lọc</span>
              </button>
              <button
                type="button"
                onClick={loadData}
                className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-hover flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                <span>Làm mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Summary Banner (Matches overall filter results, not just current page) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-border shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block">
                Tổng số lượt khớp lọc
              </span>
              <span className="font-headline font-black text-2xl text-on-surface">
                {isLoading ? '...' : summary.totalSessions}
              </span>
            </div>
            <span className="material-symbols-outlined text-[28px] text-primary/70">receipt_long</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-border shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block">
                Tổng tiền đã thu đủ
              </span>
              <span className="font-headline font-black text-2xl text-primary">
                {isLoading ? '...' : `${summary.totalRevenue.toLocaleString('vi-VN')}đ`}
              </span>
            </div>
            <span className="material-symbols-outlined text-[28px] text-primary/70">payments</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-border shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block">
                Tổng phần món đã bán
              </span>
              <span className="font-headline font-black text-2xl text-tertiary">
                {isLoading ? '...' : summary.totalItems}
              </span>
            </div>
            <span className="material-symbols-outlined text-[28px] text-tertiary/70">restaurant</span>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={loadData} className="px-3 py-1 bg-error text-on-error rounded font-bold">
              Thử lại
            </button>
          </div>
        )}

        {/* Data Presentation (Table on Desktop, Cards on Mobile) */}
        <div className="bg-surface-container-lowest rounded-2xl border border-border shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-on-surface-variant space-y-2">
              <span className="material-symbols-outlined text-[32px] animate-spin text-primary">sync</span>
              <p>Đang tải dữ liệu lịch sử từ máy chủ...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-xs text-on-surface-variant space-y-3">
              <div className="w-14 h-14 rounded-full bg-surface-container mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px] text-on-surface-variant/60">
                  search_off
                </span>
              </div>
              <p className="font-headline font-bold text-sm text-on-surface">
                Không tìm thấy lượt thu tiền nào phù hợp với bộ lọc
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-xs hover:bg-primary-hover"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low/70 border-b border-border text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Mã lượt</th>
                      <th className="py-3 px-4">Bàn</th>
                      <th className="py-3 px-4">Thời điểm thu</th>
                      <th className="py-3 px-4">Tóm tắt món đã gọi</th>
                      <th className="py-3 px-4">Người xác nhận</th>
                      <th className="py-3 px-4 text-right">Tổng tiền</th>
                      <th className="py-3 px-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {records.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-surface-container-low/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedRecord(r)}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-primary">
                          #{r.sessionId}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-headline font-bold text-sm text-on-surface block">
                            {r.tableNumber}
                          </span>
                          <span className="text-[10px] text-on-surface-variant block">
                            {r.area}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface">
                          {r.confirmedAt}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-on-surface-variant">
                          <span className="truncate block" title={r.itemSummary}>
                            {r.itemSummary}
                          </span>
                          <span className="text-[10px] text-primary font-semibold">
                            {r.totalQuantity} phần món
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface font-medium">
                          {r.confirmedBy}
                        </td>
                        <td className="py-3.5 px-4 text-right font-headline font-bold text-sm text-primary">
                          {r.totalAmount.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(r);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-surface-container group-hover:bg-primary group-hover:text-on-primary text-xs font-semibold transition-colors"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List (< 768px) */}
              <div className="md:hidden divide-y divide-border/60">
                {records.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRecord(r)}
                    className="p-4 space-y-2.5 hover:bg-surface-container-low/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-bold text-base text-on-surface">
                            {r.tableNumber}
                          </span>
                          <span className="font-mono text-xs text-primary font-bold">
                            #{r.sessionId}
                          </span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant block">
                          Thu lúc: {r.confirmedAt}
                        </span>
                      </div>
                      <span className="font-headline font-black text-base text-primary">
                        {r.totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <div className="text-xs text-on-surface-variant bg-surface-container-low p-2 rounded-lg">
                      <span className="line-clamp-2">{r.itemSummary}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-on-surface font-medium">
                        NV: {r.confirmedBy}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(r);
                        }}
                        className="text-xs font-bold text-primary flex items-center gap-0.5"
                      >
                        <span>Xem chi tiết</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="p-4 border-t border-border bg-surface-container-low/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-on-surface-variant">
                  Hiển thị trang <strong>{pagination.page}</strong> / <strong>{pagination.totalPages}</strong> (Tổng {pagination.totalItems} lượt đã thu)
                </span>

                <div className="flex items-center gap-1.5 justify-end">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed text-on-surface"
                    title="Trang trước"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setPage(pNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                        pagination.page === pNum
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed text-on-surface"
                    title="Trang tiếp"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedRecord && (
        <PaymentDetailDrawer
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </AdminLayout>
  );
};
export default PaymentHistoryView;
