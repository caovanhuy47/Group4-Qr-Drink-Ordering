# Kế Hoạch Triển Khai: Rà Soát & Gỡ Mock/Demo, Xác Định Module Chưa Hoàn Thiện

> **Loại tài liệu**: Kế hoạch kỹ thuật (Implementation Plan - Superpowers)  
> **Mã công việc**: `TASK-MOCK-REMOVAL-20261103`  
> **Thời điểm**: 03/11/2026  
> **Trạng thái**: Đang thực hiện (In Progress)  
> **Quy chuẩn**: Superpowers + Zero Database Interference

---

## 1. Mục Tiêu Kỹ Thuật
1. Khảo sát và phân loại toàn bộ 11 module nghiệp vụ theo 5 mức độ hoàn thiện.
2. Xóa bỏ triệt để các nguồn mock và dữ liệu giả trong luồng ứng dụng:
   - Gỡ bỏ mock sessions gán cứng trong `INITIAL_TABLES` (loại bỏ hiện tượng Bàn 05 tự có 4 món 143.000đ, Bàn 02, Bàn 08, Bàn 12, Bàn 27).
   - Xóa bỏ stub data trong `backend/src/reports/reports.service.ts` (`longestWaitingTables` mock và `tableStatusCounts` gán cứng 3/3/2/8).
   - Đồng bộ một nguồn dữ liệu duy nhất giữa Quản lý bàn và Trang tổng quan, không để hai màn hình lệch số liệu.
   - Xóa bỏ cơ chế bypass quyền ngầm: gỡ bỏ `staffIdHeader || 'staff-1'` trong `backend/src/staff/staff.service.ts` và gỡ bỏ `currentUser?.id || 'staff-1'` trong `RestaurantContext.tsx`.
   - Bổ sung cơ chế lưu trữ phiên làm việc của sơ đồ bàn vào `sessionStorage` (`huycv_tables_state`) để khi F5 không bị hồi sinh dữ liệu giả.
3. Bảo toàn nguyên vẹn cơ sở dữ liệu: TUYỆT ĐỐI KHÔNG can thiệp database, không migration, không seed/reset.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- [ ] **AC-MOCK-01**: Sơ đồ bàn khởi tạo 8 bàn sạch (`status: 'empty'`), không có bất kỳ bàn nào tự có đơn gán cứng. Bàn 05 hoàn toàn trống khi chưa có khách gọi món.
- [ ] **AC-MOCK-02**: Trang Tổng quan và Sơ đồ bàn hiển thị thống nhất một bộ số liệu. Khi không có bàn chờ, Tổng quan hiển thị trạng thái rỗng "Hiện không có bàn nào đang chờ phục vụ" thay vì hiển thị bàn giả 02/05/27.
- [ ] **AC-MOCK-03**: Backend API chặn các request ghi thiếu `x-staff-id` với lỗi `403 Forbidden` thay vì tự nhận là `staff-1` (Admin). Frontend kiểm tra `currentUser` trước khi gọi API bảo vệ.
- [ ] **AC-MOCK-04**: Sau khi khách đặt món hoặc nhân viên thu tiền dọn bàn, F5 trang không làm hồi sinh lại các đơn mẫu cũ.
- [ ] **AC-MOCK-05**: 100% kiểm thử Playwright (8/8 tests) và build/lint frontend/backend đều đạt.

---

## 3. Các Tệp Tác Động
- Frontend:
  - `frontend/src/data/mockData.ts` (làm sạch `INITIAL_TABLES`)
  - `frontend/src/contexts/RestaurantContext.tsx` (lưu/nạp `sessionStorage`, gỡ fallback `staff-1`)
  - `frontend/src/views/admin/OverviewDashboardView.tsx` (bỏ fallback mock `longestWaitingTables`)
- Backend:
  - `backend/src/reports/reports.service.ts` (gỡ bỏ stub `longestWaitingTables` và mock `tableStatusCounts`)
  - `backend/src/staff/staff.service.ts` (yêu cầu bắt buộc `staffIdHeader` trong `verifyStaffPermission`)
- Tài liệu:
  - `docs/audits/mock-and-module-gap-audit.md`
  - `docs/reports/2026-11-03-mock-removal-and-module-gap-report.md`
  - `docs/changelog/2026-11-03.md`

---

## 4. Lệnh Kiểm Chứng
```bash
# Kiểm tra linter
npm --prefix frontend run lint

# Biên dịch frontend & backend
npm --prefix frontend run build
npm --prefix backend run build

# Chạy toàn bộ Playwright test suites
npx playwright test
```

