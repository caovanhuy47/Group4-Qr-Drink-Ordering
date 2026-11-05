# Kế Hoạch Triển Khai: Sửa Lỗi Khách Đặt Món Trên Điện Thoại Nhưng Admin Không Thấy

> **Loại tài liệu**: Kế hoạch kỹ thuật (Implementation Plan - Superpowers)  
> **Mã công việc**: `TASK-ORDER-SYNC-20261105`  
> **Thời điểm**: 05/11/2026  
> **Trạng thái**: Đang triển khai (In Progress)  
> **Quy chuẩn**: Superpowers + Zero Database Interference + Playwright Lifecycle  
> **Mục tiêu commit**: `fix(orders): đồng bộ lượt gọi món từ điện thoại đến admin`

---

## 1. Bản Chất Vấn Đề & Phân Tích Nguyên Nhân Gốc (Root Cause Analysis)

### 1.1. Luồng hoạt động hiện tại (Bị đứt luồng)
1. **Khách hàng trên điện thoại (LAN)**:
   - Quét mã QR mở link: `http://192.168.1.6:5173/#/?table=B01`.
   - Chọn món vào giỏ hàng và mở trang xác nhận `/#/order-confirm`.
   - Bấm "Gửi đơn gọi món" (`submitOrder` trong `RestaurantContext.tsx`):
     - Gọi `dishesApi.validateOrder(currentTable, valPayload)`.
     - Backend xác thực giá và trả về `{ valid: true }`.
     - **ĐIỂM ĐỨT LUỒNG**: Frontend tự sinh mã `orderId` ngẫu nhiên cục bộ, chỉ cập nhật `tables` vào React state và `sessionStorage` **nội bộ trên trình duyệt điện thoại**, rồi hiển thị thông báo thành công và chuyển sang `/#/order-tracking`.
     - **Backend KHÔNG HỀ nhận được bất kỳ request lưu đơn hoặc tạo phiên phục vụ nào!**
2. **Quản trị viên trên laptop (Admin / Quản lý bàn)**:
   - Mở màn hình `/#/staff/tables` trên trình duyệt laptop.
   - `RestaurantContext.tsx` khởi tạo `tables` từ `sessionStorage` **của trình duyệt laptop** (hoặc `INITIAL_TABLES`).
   - Hai thiết bị (điện thoại và laptop) có 2 vùng nhớ `sessionStorage` hoàn toàn độc lập.
   - Admin không có API nào để lấy danh sách bàn đang hoạt động từ backend.
   - Nút "Làm mới" (`refreshTables`) chỉ cộng 1 vào `waitingMinutes` của state trong RAM laptop mà không hề gửi request nào lên server.
   - **Kết quả**: Khách trên điện thoại tưởng đã đặt xong, nhưng màn hình admin mãi mãi không thấy đơn.

### 1.2. Giải pháp kỹ thuật triệt để (Không can thiệp cấu trúc database)
Hệ cơ sở dữ liệu MySQL hiện tại đã có sẵn bảng `table_session_records` (thông qua entity `TableSessionRecord` trong `backend/src/reports/entities/table-session-record.entity.ts`) chứa đầy đủ các trường:
- `sessionId` (ví dụ `LT-2801`)
- `tableNumber` (ví dụ `BÀN 01`)
- `area` (Khu vực bàn)
- `status`: `'ordered' | 'seated' | 'completed'`
- `firstOrderAt`, `confirmedAt`, `confirmedBy`, `completedAt`
- `items`: Snapshot JSON danh sách món, topping, size, giá, ghi chú
- `totalQuantity`, `totalAmount`

**Không cần thêm bảng mới, không cần migration, không chỉnh sửa schema MySQL!** Ta sẽ tận dụng 100% bảng này để hoàn thiện luồng nghiệp vụ end-to-end.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [ ] **AC-SYNC-01 (Backend API Đặt Món)**: Bổ sung endpoint `POST /api/reports/active-orders` (công khai cho khách đặt món không cần đăng nhập):
  - Xác thực payload, chuẩn hóa mã bàn (ví dụ `B01` ➔ `BÀN 01`).
  - Nếu bàn đã có phiên `ordered` hoặc `seated`: Tự động gom thêm món mới vào phiên hiện tại, cập nhật tổng số lượng, tổng tiền và đưa/giữ trạng thái `ordered`.
  - Nếu bàn đang `empty`: Khởi tạo phiên mới với `status = 'ordered'`, `firstOrderAt = now()`.
  - Lưu vào MySQL qua `sessionRepo.save()`.
- [ ] **AC-SYNC-02 (Backend API Quản Lý Bàn)**: Bổ sung endpoint `GET /api/reports/tables`:
  - Trả về danh sách 8 bàn chuẩn (`tbl-01` đến `tbl-08`, `BÀN 01` đến `BÀN 08`) kèm phiên hoạt động tương ứng từ MySQL `table_session_records`.
  - Tính toán `waitingMinutes` thực tế từ `firstOrderAt` tới thời điểm hiện tại.
- [ ] **AC-SYNC-03 (Backend API Giải Phóng Bàn)**: Bổ sung endpoint `POST /api/reports/tables/complete`:
  - Nhân viên/quản lý chuyển bàn `seated` về Trống (`completedAt = now()`, `status = 'completed'`).
  - Chặn nghiêm ngặt nếu bàn đang `ordered` chưa thu tiền (HTTP 400).
- [ ] **AC-SYNC-04 (Frontend Gửi Đơn Thật)**: `submitOrder` trong `RestaurantContext.tsx` gọi `reportsApi.submitActiveOrder(...)`. Chỉ thông báo thành công và chuyển trang khi backend xác nhận lưu thành công bản ghi vào MySQL.
- [ ] **AC-SYNC-05 (Frontend Đồng Bộ Tự Động)**: Màn hình `TableManagementView` tự động đồng bộ bàn từ backend (kèm cơ chế polling chu kỳ 4 giây khi đang mở màn hình bàn), nút "Làm mới" gọi API lấy dữ liệu bàn mới nhất từ MySQL.
- [ ] **AC-SYNC-06 (Bảo Toàn Nghiệp Vụ Thu Tiền)**: Thao tác "Đã phục vụ & thu tiền" (`markTableServedAndPaid`) cập nhật trạng thái phiên thành `seated` trên backend MySQL và đồng bộ ngay lập tức.
- [ ] **AC-SYNC-07 (Kiểm Thử Playwright Tự Động)**: Xây dựng Playwright test suite `order-sync-lifecycle.spec.js` kiểm tra toàn bộ vòng đời từ khách quét QR đặt món ➔ Admin hiển thị ➔ Thu tiền ➔ Giải phóng bàn.
- [ ] **AC-SYNC-08 (Zero Database Interference)**: Không chạy migration, không seed/reset, không chỉnh sửa trực tiếp database.

---

## 3. Danh Sách Tệp Tác Động

### Backend:
1. `backend/src/reports/dto/create-active-order.dto.ts` (Tạo mới: DTO nhận đơn gọi món từ khách)
2. `backend/src/reports/dto/complete-table.dto.ts` (Tạo mới: DTO giải phóng bàn)
3. `backend/src/reports/reports.controller.ts` (Thêm endpoints `/active-orders`, `/tables`, `/tables/complete`)
4. `backend/src/reports/reports.service.ts` (Hiện thực logic lưu đơn, gom món, truy vấn bàn và cập nhật báo cáo tổng quan)

### Frontend:
5. `frontend/src/services/reportsApi.ts` (Bổ sung hàm gọi API: `submitActiveOrder`, `fetchActiveTables`, `completeTableSession`)
6. `frontend/src/contexts/RestaurantContext.tsx` (Tích hợp gọi backend thật trong `submitOrder`, nạp và làm mới bàn qua API, đồng bộ tự động)
7. `frontend/src/views/admin/TableManagementView.tsx` (Polling tự động dữ liệu bàn theo thời gian thực)

### Kiểm Thử & Tài Liệu:
8. `tests/playwright/order-sync-lifecycle.spec.js` (Test E2E toàn luồng đặt món từ khách tới admin)
9. `docs/reports/2026-11-05-order-sync-report.md` (Báo cáo nghiệm thu)
10. `docs/changelog/2026-11-05.md` (Nhật ký phát triển)

---

## 4. Kế Hoạch Kiểm Chứng (Verification Commands)

```bash
# 1. Kiểm tra build backend
npm --prefix backend run build

# 2. Kiểm tra lint frontend
npm --prefix frontend run lint

# 3. Kiểm tra build frontend
npm --prefix frontend run build

# 4. Chạy kiểm thử Playwright
npx playwright test tests/playwright/order-sync-lifecycle.spec.js
```
