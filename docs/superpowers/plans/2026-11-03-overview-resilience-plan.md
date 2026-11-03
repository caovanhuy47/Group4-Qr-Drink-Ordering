# Kế Hoạch Triển Khai: Sửa Lỗi Trang Tổng Quan Trống & Chuẩn Hóa Playwright Lifecycle

> **Loại tài liệu**: Kế hoạch kỹ thuật (Implementation Plan - Superpowers)  
> **Mã công việc**: `TASK-OVERVIEW-RESILIENCE-20261103`  
> **Thời điểm**: 03/11/2026  
> **Trạng thái**: Đã hoàn thành (Archived / Implemented)  
> **Liên kết User Story**: [`US-ADM-05`](../../requirements/user-stories/admin.md#us-adm-05)

---

## 1. Mục Tiêu Kỹ Thuật
1. Điều tra và xử lý triệt để lỗi khi người dùng click "Tổng quan" (`/#/staff/overview`), giao diện biến mất và chỉ còn nền trống.
2. Xác định nguyên nhân gốc rễ: Exception JavaScript trong component `OverviewDashboardView` khi tính toán doanh thu (`dish.revenue.toLocaleString()` trên giá trị `null`/`undefined`).
3. Triển khai bọc `ErrorBoundary` chuyên biệt cho các phân vùng staff view, phòng ngừa sập toàn màn hình khi có sự cố dữ liệu.
4. Chuẩn hóa quy trình kiểm thử tự động Playwright theo 6 giai đoạn (Pre-flight, Auth Bootstrap, Navigation, Assertion, Teardown, Evidence Capture) mà TUYỆT ĐỐI KHÔNG can thiệp chỉnh sửa DB.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- [x] **AC-OVW-01**: Truy cập `/#/staff/overview` render đầy đủ 4 thẻ thống kê (Doanh thu, Đơn hoàn tất, Bàn đang hoạt động, Khách phục vụ) và biểu đồ danh sách món bán chạy mà không gây crash.
- [x] **AC-OVW-02**: Hàm tính toán dữ liệu xử lý an toàn với optional chaining và fallback: `(dish.revenue ?? 0).toLocaleString('vi-VN')`.
- [x] **AC-OVW-03**: Backend `/api/reports/dashboard` tính toán an toàn kể cả khi các đơn hàng cũ thiếu trường `subtotal` bằng fallback `(item.subtotal ?? item.price * qty)`.
- [x] **AC-OVW-04**: 8/8 bài kiểm tra Playwright chạy thành công ổn định mà không can thiệp database.

---

## 3. Các Tệp Tác Động
- Frontend:
  - `frontend/src/views/staff/OverviewDashboardView.tsx`
  - `frontend/src/components/common/ErrorBoundary.tsx`
  - `frontend/src/App.tsx`
- Backend:
  - `backend/src/reports/reports.service.ts`
- Tests & Specs:
  - `playwright.config.ts`
  - `tests/overview-dashboard.spec.ts`
  - `docs/testing/playwright-lifecycle.md`

---

## 4. Lệnh Kiểm Chứng
```bash
# Kiểm tra build frontend
npm --prefix frontend run build

# Chạy toàn bộ test suites Playwright
npx playwright test
```

