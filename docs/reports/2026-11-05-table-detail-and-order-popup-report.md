# Báo Cáo Nghiệm Thu: Sửa Xem Món Bàn 01 và Popup Xác Nhận Đặt Món Trên Điện Thoại

> **Ngày thực hiện**: 05/11/2026  
> **Người thực hiện**: Antigravity (Advanced Agentic AI)  
> **Tuân thủ quy chuẩn**: [RULES.md](../../../RULES.md) và [AGENTS.md](../../../AGENTS.md) (Zero Database Interference).

---

## 1. Tóm Tắt Nhiệm Vụ

Xử lý triệt để hai lỗi được phản ánh qua hình ảnh thực tế:
1. **Admin bấm "Xem món" Bàn 01 gặp lỗi runtime**:
   `Cannot read properties of undefined (reading 'toLocaleString')` do bản ghi lịch sử `test-session-1793672018284-paid` thiếu thuộc tính `unitPrice` và `totalPrice`.
2. **Khách đặt món thành công trên điện thoại nhưng thông báo toast che khuất header**:
   Toast thông báo thành công che kín tiêu đề "Tiến Trình Đơn Hàng • Huy CV", số bàn và nút trên cùng. Khách cần một Popup chuyên dụng xác nhận đặt món rõ ràng, không đè lấn header, khóa cuộn và chuyển hướng êm mượt. Đồng thời làm sạch giao diện `OrderTrackingView` (gỡ bỏ nút "Gọi thêm món" trên header, loại bỏ bước giả "Đơn hàng đang chờ tiếp nhận").

---

## 2. Nguyên Nhân Gốc Rễ

1. **Lỗi `toLocaleString` tại `TableDetailDrawer.tsx`**:
   - Trong dữ liệu lưu trữ MySQL cũ (`table_session_records`), mảng JSON `items` của Bàn 01 chứa các trường `price` và `subtotal`, không có `totalPrice` và `unitPrice`.
   - Tại `TableDetailDrawer.tsx` dòng 161 và 165, frontend gọi trực tiếp `item.totalPrice.toLocaleString('vi-VN')` mà không fallback phòng thủ, gây ra unhandled exception ném lên `ErrorBoundary`.
2. **Lỗi thông báo toast che đè header**:
   - Khi hoàn tất `submitOrder()`, hệ thống kích hoạt `showToast('Đã gửi đơn gọi món thành công...')` nằm cố định tại `top-4` với z-index cao, đè lên header và các nút thao tác.
   - `OrderTrackingView` hiển thị bước giả "Đơn hàng đang chờ tiếp nhận" không phản ánh đúng quy trình quán vỉa hè Huy CV (đơn gửi thẳng vào bếp/quầy pha chế).

---

## 3. Giải Pháp Triển Khai

### A. Chuẩn hóa dữ liệu tại Backend NestJS & Phòng vệ Frontend
- **Backend (`backend/src/reports/reports.service.ts`)**:
  - Bổ sung hàm tiện ích `normalizeOrderItemSnapshots` chuẩn hóa mọi mảng món từ database:
    - `unitPrice` tự động fallback sang `item.price` hoặc `item.subtotal / quantity`.
    - `totalPrice` tự động fallback sang `item.subtotal` hoặc `unitPrice * quantity`.
    - Đảm bảo `sizeName`, `toppings`, `notes`, `quantity` luôn có giá trị hợp lệ.
  - Áp dụng chuẩn hóa cho `getActiveTables()`, `getPaymentDetail()`, `getPaymentHistory()`.
  - Khắc phục lỗi logic idempotent trong `recordPayment`: Khi bàn có đơn bổ sung đưa về `ordered`, cho phép xác nhận thanh toán chuyển trạng thái sang `seated`.
- **Frontend (`TableDetailDrawer.tsx`)**:
  - Tính toán an toàn `itemTotalPrice` và `itemUnitPrice` với fallback đa tầng trước khi gọi `.toLocaleString('vi-VN')`.
  - Bảo vệ an toàn `session.totalAmount` và `session.confirmedAmount` bằng toán tử `?? 0`.

### B. Popup Xác Nhận Đặt Món Chuyên Dụng (`OrderSuccessModal`)
- **Tạo mới `frontend/src/components/customer/OrderSuccessModal.tsx`**:
  - Giao diện mobile-first theo bảng màu Huy CV: Icon thành công `check_circle` xanh lá vỉa hè (`tertiary`), tiêu đề "Đã gửi món thành công", pill hiển thị Bàn và Mã đơn thật từ backend (ví dụ `#LT-5915 • Bàn 01`).
  - Dòng thông điệp xác nhận quán đã tiếp nhận đơn và chuyển thẳng tới quầy bếp/pha chế.
  - Nút CTA chính: "Xem món đã đặt →".
  - Tự động khóa cuộn trang (`document.body.style.overflow = 'hidden'`) khi popup hiển thị.
  - Khi bấm "Xem món đã đặt", modal đóng và chuyển hướng mượt mà sang `order-tracking`, không gửi lại request, không reload trang.
- **Tích hợp `RestaurantContext.tsx` & `App.tsx`**:
  - Thêm state `orderSuccessModalData`.
  - Khi gửi đơn thành công, ngắt kích hoạt `showToast`, mở `OrderSuccessModal`.

### C. Tinh chỉnh `OrderTrackingView`
- Gỡ bỏ hoàn toàn nút "Gọi thêm món" trên header để tránh xung đột hành vi.
- Thay thế trạng thái giả "Đơn hàng đang chờ tiếp nhận" thành "Đã gửi vào bếp • Đang chuẩn bị món".
- Cập nhật tiến trình 3 bước chuẩn vận hành:
  1. *Đã gửi vào bếp* (Hệ thống tiếp nhận & chuyển đơn thẳng tới quầy bếp / pha chế).
  2. *Bếp đang chuẩn bị* (Món ăn & thức uống đang được hoàn thiện nóng hổi).
  3. *Đã phục vụ & Thu đủ tiền* (Nhân viên mang món ra bàn và thu tiền hoàn tất).

---

## 4. Bằng Chứng Nghiệm Thu Thực Tế

### A. Kiểm thử tự động Playwright (10/10 test suites đạt 100% Xanh)
```bash
Running 10 tests using 1 worker

  ok  1 [chromium] › tests\playwright\order-sync-lifecycle.spec.js:8:3 › Toàn bộ luồng: Khách quét QR Bàn 03 đặt món ➔ Admin nhận đơn thời gian thực ➔ Thu tiền ➔ Giải phóng bàn (10.3s)
  ok  2 [chromium] › tests\playwright\order-sync-lifecycle.spec.js:140:3 › Kịch bản 2: Bấm "Xem món" Bàn 01 hiển thị trơn tru, phòng thủ lỗi toLocaleString (2.7s)
  ok  3 [chromium] › tests\playwright\overview-lifecycle.spec.js:21:3 › Kịch bản 1: Điều hướng từ Sơ đồ bàn sang Tổng quan không bị trắng trang (3.3s)
  ok  4 [chromium] › tests\playwright\overview-lifecycle.spec.js:32:3 › Kịch bản 2: Điều hướng từ Quản lý món ăn sang Tổng quan (3.7s)
  ok  5 [chromium] › tests\playwright\overview-lifecycle.spec.js:41:3 › Kịch bản 3: Mở trực tiếp URL /#/staff/overview và F5 reload (3.6s)
  ok  6 [chromium] › tests\playwright\overview-lifecycle.spec.js:48:3 › Kịch bản 4: Xử lý phòng thủ khi API trả về doanh thu món null (3.4s)
  ok  7 [chromium] › tests\playwright\staff-profile-lifecycle.spec.js:21:3 › Kịch bản 1: Mở trang Hồ sơ cá nhân hiển thị thông tin thực tế từ tài khoản (3.3s)
  ok  8 [chromium] › tests\playwright\staff-profile-lifecycle.spec.js:34:3 › Kịch bản 2: Mở Modal Chỉnh sửa hồ sơ cá nhân và kiểm tra các trường (3.4s)
  ok  9 [chromium] › tests\playwright\staff-profile-lifecycle.spec.js:51:3 › Kịch bản 3: Mở Modal Đổi mật khẩu/PIN và kiểm tra xác thực form (3.5s)
  ok 10 [chromium] › tests\playwright\staff-profile-lifecycle.spec.js:74:3 › Kịch bản 4: Bật/tắt chuông báo đơn mới lưu trạng thái (3.4s)

  10 passed (41.4s)
```

### B. Kiểm tra Linter & Build
- `npm --prefix frontend run lint`: 0 errors, 0 warnings.
- `npm --prefix frontend run build`: Thành công không lỗi.
- `npm --prefix backend run build`: Thành công không lỗi.

### C. Hình ảnh nghiệm thu
- `mobile-order-success-modal.png`: Popup modal xác nhận chuyên dụng ngay ngắn, khóa cuộn, không đè toast.
- `mobile-clean-order-tracking.png`: Màn hình theo dõi đơn tinh gọn, không nút "Gọi thêm món", không bước giả "chờ tiếp nhận".
- `admin-ban-01-detail-clean.png`: Admin xem món Bàn 01 hiển thị đầy đủ đơn giá, thành tiền, không crash runtime.

---

## 5. Cam Kết Ràng Buộc (Zero Database Interference)

- Không can thiệp database bằng SQL script ngoài luồng.
- Không reset, truncate hay seed lại database MySQL.
- Toàn bộ dữ liệu kiểm thử được thực hiện qua luồng nghiệp vụ chuẩn và dọn dẹp theo vòng đời.
