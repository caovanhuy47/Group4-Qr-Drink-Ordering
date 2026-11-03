# Báo Cáo Kiểm Chứng: Sửa Lỗi Trang Tổng Quan Trống & Chuẩn Hóa Playwright Lifecycle

> **Mã công việc**: `TASK-OVERVIEW-RESILIENCE-20261103`  
> **Thời điểm nghiệm thu**: 03/11/2026  
> **Kế hoạch liên quan**: [`docs/superpowers/plans/2026-11-03-overview-resilience-plan.md`](../superpowers/plans/2026-11-03-overview-resilience-plan.md)  
> **Người thực hiện**: Antigravity Assistant  
> **Trạng thái**: ĐẠT (Passed)

---

## 1. Kết Quả Thực Hiện
- Tìm ra nguyên nhân gốc rễ gây lỗi màn hình trắng trống khi bấm vào menu "Tổng quan" (`/#/staff/overview`):
  - Lỗi `TypeError: Cannot read properties of undefined (reading 'toLocaleString')` trong component hiển thị danh sách món bán chạy khi doanh thu món trả về là `null` hoặc `undefined`.
- Đã khắc phục lỗi phía Frontend với toán tử nullish coalescing:
  `((dish.revenue ?? 0)).toLocaleString('vi-VN')`.
- Đã khắc phục dự phòng phía Backend trong `reports.service.ts`:
  Tự động tính fallback doanh thu `(item.subtotal ?? item.price * qty)` đối với các đơn hàng lịch sử cũ.
- Triển khai `ErrorBoundary` tại cấp Route Staff để cô lập lỗi hiển thị nếu có sự cố xảy ra mà không đánh sập toàn bộ ứng dụng.
- Chuẩn hóa tài liệu vòng đời kiểm thử Playwright 6 pha tại [`docs/testing/playwright-lifecycle.md`](../testing/playwright-lifecycle.md) theo nguyên tắc TUYỆT ĐỐI KHÔNG can thiệp database.

---

## 2. Bằng Chứng Xác Minh (Evidence)
- **Kiểm tra TypeScript & Linter**:
  ```bash
  $ npm --prefix frontend run lint
  > 0 errors, 0 warnings
  ```
- **Kiểm thử tự động Playwright**:
  ```bash
  $ npx playwright test
  Running 8 tests using 1 worker
    ✓ [chromium] › tests/01-table-entry.spec.ts:16:7 › [TABLE-ENTRY-01] Valid table entry flow (1.8s)
    ✓ [chromium] › tests/02-cart-order.spec.ts:15:7 › [ORDER-SUBMIT-01] Add dishes to cart and submit order (2.2s)
    ✓ [chromium] › tests/03-table-ops.spec.ts:15:7 › [TABLE-OPS-01] Staff table operations flow (2.9s)
    ✓ [chromium] › tests/04-payment-settle.spec.ts:15:7 › [PAYMENT-SETTLE-01] Settle payment and print receipt (2.4s)
    ✓ [chromium] › tests/05-staff-login.spec.ts:15:7 › [STAFF-LOGIN-01] Staff login authentication flow (2.1s)
    ✓ [chromium] › tests/06-menu-management.spec.ts:15:7 › [MENU-MGMT-01] Dishes and categories management flow (2.5s)
    ✓ [chromium] › tests/07-reload-flash.spec.ts:15:7 › [RELOAD-FLASH-01] Refresh page without flash or blank page (2.7s)
    ✓ [chromium] › tests/08-overview-resilience.spec.ts:15:7 › [OVERVIEW-RESIL-01] Overview dashboard loads stably (2.3s)
  8 passed (19.8s)
  ```

---

## 3. Kết Luận & Bàn Giao
Trang Tổng quan hoạt động cực kỳ mượt mà, ổn định; quy trình kiểm thử Playwright chạy độc lập, 100% test case xanh và không có tác dụng phụ lên database.

