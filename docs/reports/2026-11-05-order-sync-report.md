# Báo Cáo Nghiệm Thu: Sửa Lỗi Khách Đặt Món Trên Điện Thoại Nhưng Admin Không Thấy

> **Mã công việc**: `TASK-ORDER-SYNC-20261105`  
> **Thời điểm hoàn thành**: 05/11/2026  
> **Trạng thái**: ĐÃ HOÀN THÀNH (100% Verified)  
> **Quy chuẩn**: Superpowers + Zero Database Interference + Playwright Lifecycle  
> **Commit**: `fix(orders): đồng bộ lượt gọi món từ điện thoại đến admin`

---

## 1. Tóm Tắt Hiện Tượng & Nguyên Nhân Gốc (Root Cause)

### 1.1. Hiện tượng ban đầu
Khi khách hàng dùng điện thoại truy cập qua mạng LAN (hoặc quét mã QR bàn `http://192.168.1.6:5173/#/?table=B01`), chọn món và bấm "Gửi đơn gọi món":
- Trên điện thoại xuất hiện thông báo toast "Đã gửi đơn gọi món thành công" và chuyển sang màn hình theo dõi đơn `/#/order-tracking`.
- Tuy nhiên trên màn hình Quản lý bàn của Admin (`/#/staff/tables`) trên laptop không hề thấy bàn đó chuyển trạng thái `Order thành công`, không hiển thị món hay số tiền của lượt gọi món.

### 1.2. Nguyên nhân cốt lõi phát hiện qua điều tra hệ thống (Root Cause Analysis)
1. **Frontend chỉ cập nhật bộ nhớ cục bộ (Mock Client-Side)**:
   - Trong `RestaurantContext.tsx` hàm `submitOrder`, frontend chỉ gọi API `dishesApi.validateOrder(currentTable, valPayload)` để kiểm tra giá món, sau đó tự sinh mã ngẫu nhiên `orderId` và chỉ cập nhật state `tables` vào `sessionStorage` **của riêng trình duyệt điện thoại**.
   - **Hoàn toàn không có API gọi lên backend để lưu đơn hoặc tạo phiên phục vụ bàn!**
2. **Admin và Khách chạy trên hai vùng nhớ độc lập**:
   - Trình duyệt laptop (Admin) có `sessionStorage` riêng, khởi tạo từ `INITIAL_TABLES`.
   - Nút "Làm mới" (`refreshTables`) chỉ tăng biến `waitingMinutes + 1` của state trong RAM laptop mà không gọi bất kỳ API nào từ backend.
3. **Thiếu các API phục vụ quản lý bàn thời gian thực**:
   - Backend chưa có endpoint tiếp nhận đơn gọi món (`/active-orders`), chưa có endpoint trả về trạng thái hoạt động thực tế của 8 bàn (`/tables`), và chưa có endpoint giải phóng bàn (`/tables/complete`).

---

## 2. Các Thay Đổi Đã Thực Hiện

### 2.1. Phía Backend (NestJS 12 + TypeORM)
Tận dụng 100% bảng `table_session_records` sẵn có trong MySQL, **tuyệt đối không can thiệp schema hay migration**:
- `POST /api/reports/active-orders`: Endpoint công khai cho khách quét QR đặt món. Tự động chuẩn hóa mã bàn (ví dụ `B01`, `Bàn 01` ➔ `BÀN 01`). Nếu bàn đang trống, tạo phiên mới với `status = 'ordered'`. Nếu bàn đã có khách ngồi, tự động gom thêm món mới vào phiên hiện tại và giữ trạng thái ưu tiên `ordered` để báo cho bếp và nhân viên.
- `GET /api/reports/tables`: Endpoint lấy trạng thái thực tế của 8 bàn từ MySQL. Tính toán thời gian chờ thực tế (`waitingMinutes`).
- `POST /api/reports/tables/complete`: Cho phép nhân viên giải phóng bàn `seated` về Trống (`status = 'completed'`). Chặn nghiêm ngặt nếu bàn đang có đơn `ordered` chưa thu tiền.
- Cập nhật `POST /api/reports/payments`: Đồng bộ hóa trạng thái phiên từ `ordered` sang `seated` khi nhân viên xác nhận phục vụ & thu tiền.
- Cập nhật `GET /api/reports/overview`: Đếm số lượng bàn trống, order và đang ngồi trực tiếp từ các phiên hoạt động trong MySQL.

### 2.2. Phía Frontend (React 19 + TypeScript)
- `reportsApi.ts`: Bổ sung `fetchActiveTables()`, `submitActiveOrder()`, `completeTableSession()`.
- `RestaurantContext.tsx`:
  - `submitOrder`: Gọi API `reportsApi.submitActiveOrder()`. Chỉ báo thành công và chuyển trang khi backend đã lưu thành công vào MySQL.
  - `refreshTables`: Gọi `reportsApi.fetchActiveTables()` để cập nhật dữ liệu mới nhất từ server.
  - `markTableEmpty`: Gọi `reportsApi.completeTableSession()` giải phóng bàn trên database thật.
- `TableManagementView.tsx`: Tích hợp cơ chế tự động polling chu kỳ 4 giây để đồng bộ danh sách bàn theo thời gian thực từ server. Đèn báo kết nối phản ánh đúng trạng thái mạng.
- `TableDetailDrawer.tsx`: Bổ sung phòng thủ dữ liệu cho `sizeName` và `toppingsList`, loại bỏ hoàn toàn lỗi crash khi mở drawer.

---

## 3. Bằng Chứng Nghiệm Thu (Verification Evidence)

### 3.1. Kiểm thử linter & biên dịch
```text
> oxlint
Found 0 warnings and 0 errors.

> frontend build
✓ built in 472ms

> backend build
nest build -> Success (code 0)
```

### 3.2. Kiểm thử Playwright E2E toàn diện (9/9 suites đạt 100%)
```text
Running 9 tests using 1 worker

  ok 1 [chromium] › tests\playwright\order-sync-lifecycle.spec.js:8:3 › Vòng đời Đồng bộ Gọi Món Từ Điện Thoại Đến Admin (Tuân thủ Zero-DB-Interference) › Toàn bộ luồng: Khách quét QR Bàn 03 đặt món ➔ Admin nhận đơn thời gian thực ➔ Thu tiền ➔ Giải phóng bàn (10.4s)
  ok 2 [chromium] › tests\playwright\overview-lifecycle.spec.js:21:3 › Vòng đời Kiểm thử Playwright Trang Tổng quan (Tuân thủ Zero-DB-Interference) › Kịch bản 1: Điều hướng từ Sơ đồ bàn sang Tổng quan không bị trắng trang (6.2s)
  ok 3 [chromium] › tests\playwright\overview-lifecycle.spec.js:32:3 › Vòng đời Kiểm thử Playwright Trang Tổng quan (Tuân thủ Zero-DB-Interference) › Kịch bản 2: Điều hướng từ Quản lý món ăn sang Tổng quan (5.4s)
  ok 4 [chromium] › tests\playwright\overview-lifecycle.spec.js:41:3 › Vòng đời Kiểm thử Playwright Trang Tổng quan (Tuân thủ Zero-DB-Interference) › Kịch bản 3: Mở trực tiếp URL /#/staff/overview và F5 reload (5.0s)
  ok 5 [chromium] › tests\playwright\overview-lifecycle.spec.js:48:3 › Vòng đời Kiểm thử Playwright Trang Tổng quan (Tuân thủ Zero-DB-Interference) › Kịch bản 4: Xử lý phòng thủ khi API trả về doanh thu món null (Mock client-side không ghi DB) (4.1s)
  ok 6 [chromium] › tests\playwright\staff-profile-lifecycle.spec.js:21:3 › Vòng đời Kiểm thử Playwright Trang Hồ sơ Nhân viên & Ca làm việc (Zero DB Interference) › Kịch bản 1: Mở trang Hồ sơ cá nhân hiển thị thông tin thực tế từ tài khoản (3.8s)
  ok 7 [chromium] › tests\playwright\staff-profile-lifecycle.spec.js:34:3 › Vòng đời Kiểm thử Playwright Trang Hồ sơ Nhân viên & Ca làm việc (Zero DB Interference) › Kịch bản 2: Mở Modal Chỉnh sửa hồ sơ cá nhân và kiểm tra các trường (3.8s)
  ok 8 [chromium] › tests\playwright\staff-profile-lifecycle.spec.js:51:3 › Vòng đời Kiểm thử Playwright Trang Hồ sơ Nhân viên & Ca làm việc (Zero DB Interference) › Kịch bản 3: Mở Modal Đổi mật khẩu/PIN và kiểm tra xác thực form (4.0s)
  ok 9 [chromium] › tests\playwright\staff-profile-lifecycle.spec.js:74:3 › Vòng đời Kiểm thử Playwright Trang Hồ sơ Nhân viên & Ca làm việc (Zero DB Interference) › Kịch bản 4: Bật/tắt chuông báo đơn mới lưu trạng thái (3.4s)

  9 passed (47.0s)
```

---

## 4. Kết Luận
Lỗi mất đồng bộ giữa điện thoại của khách và màn hình admin đã được giải quyết triệt để từ tầng API đến giao diện. Toàn bộ luồng hoạt động chính xác theo đúng nghiệp vụ thực tế của quán vỉa hè.
