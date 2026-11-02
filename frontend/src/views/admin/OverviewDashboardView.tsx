import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useRestaurant } from '../../contexts/useRestaurant';
import { reportsApi, type OverviewData, type PaymentHistoryRecord } from '../../services/reportsApi';
import { PaymentDetailDrawer } from '../../components/admin/PaymentDetailDrawer';

export const OverviewDashboardView: React.FC = () => {
  const { setViewRoute, setSelectedTableForDetail, tables } = useRestaurant();

  const [period, setPeriod] = useState<'today' | '7days' | 'this_month' | 'custom'>('today');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Selected session for detail popup
  const [selectedRecord, setSelectedRecord] = useState<PaymentHistoryRecord | null>(null);

  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    reportsApi
      .fetchOverview(period, customStart, customEnd)
      .then((res) => {
        if (!ignore) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setErrorMessage(err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ');
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [period, customStart, customEnd, reloadTrigger]);

  const loadOverview = () => {
    setIsLoading(true);
    setReloadTrigger((t) => t + 1);
  };

  // Handle clicking a recent session to view full details
  const handleViewSessionDetail = async (sessionId: string) => {
    try {
      const detail = await reportsApi.fetchPaymentDetail(sessionId);
      setSelectedRecord(detail);
    } catch (e) {
      console.error('Error fetching detail:', e);
    }
  };

  // Navigate to tables management view
  const handleGoToTables = (tableNumber?: string) => {
    if (tableNumber) {
      const found = tables.find((t) => t.number.toLowerCase() === tableNumber.toLowerCase());
      if (found) setSelectedTableForDetail(found);
    }
    setViewRoute('admin/tables');
  };

  // Navigate to history with filter
  const handleGoToHistory = () => {
    setViewRoute('admin/history');
  };

  return (
    <AdminLayout
      title="Tổng quan kinh doanh"
      subtitle="Theo dõi doanh thu thực thu, hiệu suất bán món và vận hành bàn"
    >
      <div className="space-y-6">
        {/* Period Selector Bar */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'today', label: 'Hôm nay' },
              { id: '7days', label: '7 ngày qua' },
              { id: 'this_month', label: 'Tháng này' },
              { id: 'custom', label: 'Tùy chọn ngày' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPeriod(tab.id as typeof period)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-headline font-bold whitespace-nowrap transition-all ${
                  period === tab.id
                    ? 'bg-primary-container text-on-primary shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker */}
          {period === 'custom' && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1.5 bg-surface-container-low rounded-lg border border-border text-on-surface outline-none"
              />
              <span className="text-on-surface-variant font-medium">đến</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1.5 bg-surface-container-low rounded-lg border border-border text-on-surface outline-none"
              />
            </div>
          )}

          {/* Refresh Action */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={loadOverview}
              title="Làm mới số liệu"
              className="p-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
            <span className="text-[11px] text-on-surface-variant font-medium">
              Múi giờ quán: GMT+7
            </span>
          </div>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-error-container/40 border border-error/30 text-error flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={loadOverview}
              className="px-3 py-1 rounded-lg bg-error text-on-error font-bold text-xs"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Metric 1: Total Revenue in period */}
          <div
            onClick={handleGoToHistory}
            className="p-4 rounded-2xl bg-surface-container-lowest border border-border shadow-xs hover:border-primary cursor-pointer transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs font-bold uppercase tracking-wider">Tiền đã thu trong kỳ</span>
              <span className="material-symbols-outlined text-[20px] text-primary">payments</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline font-black text-2xl lg:text-3xl text-primary">
                {isLoading ? '...' : `${(data?.totalRevenue || 0).toLocaleString('vi-VN')}đ`}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Chỉ tính các lượt đã phục vụ & thu đủ tiền
            </p>
          </div>

          {/* Metric 2: Total Paid Sessions */}
          <div
            onClick={handleGoToHistory}
            className="p-4 rounded-2xl bg-surface-container-lowest border border-border shadow-xs hover:border-secondary cursor-pointer transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs font-bold uppercase tracking-wider">Số lượt đã thu</span>
              <span className="material-symbols-outlined text-[20px] text-secondary">receipt</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline font-black text-2xl lg:text-3xl text-on-surface">
                {isLoading ? '...' : data?.totalPaidSessions || 0}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">lượt bàn</span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Xem chi tiết trong Lịch sử thu tiền ➔
            </p>
          </div>

          {/* Metric 3: Total Items Sold */}
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-border shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs font-bold uppercase tracking-wider">Phần món đã bán</span>
              <span className="material-symbols-outlined text-[20px] text-tertiary">restaurant</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline font-black text-2xl lg:text-3xl text-tertiary">
                {isLoading ? '...' : data?.totalItemsSold || 0}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">phần</span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Tổng số lượng các món trong lượt đã thu
            </p>
          </div>

          {/* Metric 4: Currently Occupied Tables */}
          <div
            onClick={() => handleGoToTables()}
            className="p-4 rounded-2xl bg-surface-container-lowest border border-border shadow-xs hover:border-primary cursor-pointer transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <span>Bàn đang dùng</span>
                <span className="px-1.5 py-0.2 rounded bg-secondary-soft text-secondary font-bold text-[10px]">
                  Hiện tại
                </span>
              </span>
              <span className="material-symbols-outlined text-[20px] text-primary">table_restaurant</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline font-black text-2xl lg:text-3xl text-on-surface">
                {isLoading ? '...' : data?.currentUsingTables || 0}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">/ 12 bàn</span>
            </div>
            <p className="text-[11px] text-primary font-bold">
              Chuyển đến Quản lý bàn ➔
            </p>
          </div>
        </div>

        {/* Real-time Table Operational Status & Longest Waiting Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Current Live Table Status Pill Row */}
          <div className="bg-surface-container-lowest p-4 md:p-5 rounded-2xl border border-border shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-headline font-bold text-sm text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">analytics</span>
                  <span>Tình trạng bàn hiện tại</span>
                </h4>
                <button
                  onClick={() => handleGoToTables()}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Mở sảnh bàn ➔
                </button>
              </div>
              <p className="text-xs text-on-surface-variant">
                Đồng bộ trực tiếp theo 3 trạng thái vận hành chuẩn:
              </p>
            </div>

            <div className="space-y-2">
              <div
                onClick={() => handleGoToTables()}
                className="flex items-center justify-between p-2.5 rounded-xl bg-tertiary-soft/40 border border-tertiary/20 cursor-pointer hover:bg-tertiary-soft"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                  <span className="font-bold text-on-surface">Bàn Trống</span>
                </div>
                <span className="font-headline font-bold text-sm text-tertiary">
                  {data?.tableStatusCounts.empty ?? 4} bàn
                </span>
              </div>

              <div
                onClick={() => handleGoToTables()}
                className="flex items-center justify-between p-2.5 rounded-xl bg-primary-soft/50 border border-primary/20 cursor-pointer hover:bg-primary-soft"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">receipt_long</span>
                  <span className="font-bold text-primary">Order thành công</span>
                </div>
                <span className="font-headline font-bold text-sm text-primary">
                  {data?.tableStatusCounts.ordered ?? 3} bàn (Cần phục vụ)
                </span>
              </div>

              <div
                onClick={() => handleGoToTables()}
                className="flex items-center justify-between p-2.5 rounded-xl bg-secondary-soft/50 border border-secondary/20 cursor-pointer hover:bg-secondary-soft"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary">event_seat</span>
                  <span className="font-bold text-on-surface">Đang ngồi (Đã thu tiền)</span>
                </div>
                <span className="font-headline font-bold text-sm text-secondary">
                  {data?.tableStatusCounts.seated ?? 5} bàn
                </span>
              </div>
            </div>
          </div>

          {/* Longest Waiting Tables Card (Priority Action) */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-4 md:p-5 rounded-2xl border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-error">timer</span>
                <span>Bàn chờ lâu cần ưu tiên phục vụ</span>
              </h4>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Xếp theo thời điểm gửi đầu tiên
              </span>
            </div>

            <div className="divide-y divide-border/60">
              {data?.longestWaitingTables.map((tbl) => (
                <div
                  key={tbl.sessionId}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary font-bold flex items-center justify-center font-headline text-xs">
                      {tbl.tableNumber.replace('BÀN ', '')}
                    </div>
                    <div>
                      <span className="font-bold text-on-surface block text-sm leading-tight">
                        {tbl.tableNumber}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        #{tbl.sessionId} • {tbl.totalQuantity} phần gọi • Gửi lúc {tbl.firstOrderAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-headline font-bold text-xs text-primary block">
                        {tbl.totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-[11px] text-error font-bold flex items-center gap-0.5 justify-end">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        Chờ {tbl.waitingMinutes} phút
                      </span>
                    </div>

                    <button
                      onClick={() => handleGoToTables(tbl.tableNumber)}
                      className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-xs font-bold transition-colors"
                    >
                      Xem bàn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Chart Section (Native SVG responsive chart) */}
        <div className="bg-surface-container-lowest p-4 md:p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-headline font-bold text-base text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-primary">show_chart</span>
                <span>
                  Biểu đồ tiền đã thu ({period === 'today' ? 'Phân bổ theo giờ' : 'Phân bổ theo ngày'})
                </span>
              </h4>
              <p className="text-xs text-on-surface-variant">
                Chỉ tính các lượt đã phục vụ và thu tiền thành công • Đơn vị: VNĐ
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs font-semibold text-on-surface">Tiền đã thu</span>
            </div>
          </div>

          {/* SVG Bar / Area Chart */}
          {(!data || data.revenueChartData.length === 0) ? (
            <div className="h-48 flex items-center justify-center text-xs text-on-surface-variant">
              Chưa có dữ liệu thu tiền trong kỳ này
            </div>
          ) : (
            <div className="w-full overflow-x-auto no-scrollbar pt-2">
              <div className="min-w-[500px] h-56 flex flex-col justify-between">
                {/* Visual Chart Bars */}
                <div className="flex-1 flex items-end gap-2 md:gap-3 px-2 border-b border-border pb-2">
                  {(() => {
                    const maxRev = Math.max(...data.revenueChartData.map((d) => d.revenue), 100000);
                    return data.revenueChartData.map((point, idx) => {
                      const heightPercent = Math.max(6, Math.round((point.revenue / maxRev) * 100));
                      return (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col items-center justify-end h-full group relative"
                        >
                          {/* Tooltip on hover */}
                          <div className="absolute -top-8 opacity-0 group-hover:opacity-100 bg-surface-container-highest text-on-surface text-[10px] font-bold py-1 px-2 rounded-md pointer-events-none shadow-xs transition-opacity z-10 whitespace-nowrap">
                            {point.revenue.toLocaleString('vi-VN')}đ
                          </div>

                          {/* Bar */}
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full max-w-[36px] rounded-t-lg transition-all ${
                              point.revenue > 0
                                ? 'bg-gradient-to-t from-primary to-primary-container shadow-xs group-hover:opacity-90'
                                : 'bg-surface-container-low border border-border/40'
                            }`}
                          />
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* X-axis Labels */}
                <div className="flex items-center gap-2 md:gap-3 px-2 pt-2">
                  {data.revenueChartData.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex-1 text-center text-[10px] md:text-[11px] font-medium text-on-surface-variant truncate"
                    >
                      {point.timeLabel}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2 Bottom Columns: Top Selling Dishes & Recent Paid Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Selling Dishes */}
          <div className="bg-surface-container-lowest p-4 md:p-5 rounded-2xl border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary">award_star</span>
                <span>Món bán chạy nhất trong kỳ</span>
              </h4>
              <span className="text-xs text-on-surface-variant">Theo số phần đã thu tiền</span>
            </div>

            {(!data || data.topSellingDishes.length === 0) ? (
              <p className="text-xs text-on-surface-variant py-8 text-center">Chưa có dữ liệu món trong kỳ</p>
            ) : (
              <div className="divide-y divide-border/60">
                {data.topSellingDishes.map((dish, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-secondary-soft text-secondary font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-on-surface block leading-tight">{dish.name}</span>
                        <span className="text-[11px] text-on-surface-variant">
                          Doanh thu: {dish.revenue.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                    <span className="font-headline font-black text-sm text-primary">
                      {dish.quantity} phần
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Paid Sessions */}
          <div className="bg-surface-container-lowest p-4 md:p-5 rounded-2xl border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-tertiary">history</span>
                <span>Các lượt vừa thu tiền</span>
              </h4>
              <button
                onClick={handleGoToHistory}
                className="text-xs text-primary font-bold hover:underline"
              >
                Xem toàn bộ lịch sử ➔
              </button>
            </div>

            {(!data || data.recentPaidSessions.length === 0) ? (
              <p className="text-xs text-on-surface-variant py-8 text-center">Chưa có lượt thu tiền nào</p>
            ) : (
              <div className="divide-y divide-border/60">
                {data.recentPaidSessions.map((rec) => (
                  <div key={rec.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-on-surface font-headline">{rec.tableNumber}</span>
                        <span className="font-mono text-[11px] text-primary">#{rec.sessionId}</span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant block mt-0.5">
                        Lúc {rec.confirmedAt} • {rec.confirmedBy}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-xs text-primary">
                        {rec.totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                      <button
                        onClick={() => handleViewSessionDetail(rec.sessionId)}
                        className="p-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs"
                        title="Xem chi tiết lượt"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
export default OverviewDashboardView;
