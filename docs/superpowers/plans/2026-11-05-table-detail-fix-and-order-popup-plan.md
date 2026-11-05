# Kế Hoạch Triển Khai: Sửa Xem Món Bàn 01 và Popup Xác Nhận Đặt Món Trên Điện Thoại

> **Ngày thực hiện**: 05/11/2026  
> **Mã công việc**: `fix(orders): sửa chi tiết bàn và popup xác nhận trên điện thoại`  
> **Quy chuẩn**: Tuân thủ triệt để [RULES.md](../../../RULES.md) và [AGENTS.md](../../../AGENTS.md) (Zero Database Interference).

---

## 1. Mục Tiêu Kỹ Thuật

1. **Khắc phục lỗi xem món Bàn 01**:
   - Xử lý triệt để lỗi runtime `Cannot read properties of undefined (reading 'toLocaleString')` khi quản lý/nhân viên bấm "Xem món" tại Bàn 01.
   - Chuẩn hóa dữ liệu snapshot món (`OrderItemSnapshot`) ở tầng backend NestJS (`reports.service.ts`) đảm bảo `unitPrice`, `totalPrice`, `quantity` luôn là số hợp lệ, tương thích ngược với các bản ghi lịch sử cũ có `price`/`subtotal`.
   - Bổ sung phòng vệ hiển thị (defensive rendering) tại `TableDetailDrawer.tsx` để không bao giờ bị crash nếu trường dữ liệu thiếu.

2. **Thay thế toast đè bằng Popup Xác Nhận Đặt Món (`OrderSuccessModal`)**:
   - Loại bỏ hoàn toàn toast notification đè lên thanh header, tiêu đề và nút trên màn hình điện thoại khi khách đặt món.
   - Tạo mới popup modal chuyên dụng với bố cục chuẩn UI/UX vỉa hè:
     - Icon thành công rõ ràng, màu xanh lá vỉa hè/tertiary.
     - Tiêu đề "Đã gửi món thành công".
     - Badge thông tin bàn & mã phiên thật từ backend (ví dụ `#LT-5915 • Bàn 01`).
     - Dòng thông điệp xác nhận: "Quán đã nhận món của bàn và chuyển thẳng tới quầy bếp/pha chế".
     - Nút CTA nổi bật: "Xem món đã đặt".
   - Khóa cuộn màn hình nền (`overflow: hidden`) khi popup mở.
   - Bấm nút đóng/xem món chuyển mượt mà tới `order-tracking`, không gửi lại request, không reload hay mất dữ liệu. F5 không kích hoạt lại đơn.

3. **Tinh chỉnh màn hình theo dõi đơn (`OrderTrackingView`)**:
   - Gỡ bỏ nút "Gọi thêm món" gây mâu thuẫn trên header.
   - Loại bỏ hoàn toàn trạng thái giả "Đơn hàng đang chờ tiếp nhận / nhân viên duyệt" (quy trình quán nhận đơn thẳng vào quầy bếp).
   - Tinh chỉnh header và timeline responsive, hiển thị gọn gàng trên mobile (360px - 414px) không bị tràn viền hay đè chữ.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [x] **AC-1**: Bấm "Xem món" Bàn 01 (và mọi bàn khác) hiển thị thông suốt chi tiết danh sách món, quy cách, topping, đơn giá, thành tiền mà không gặp lỗi `toLocaleString`.
- [x] **AC-2**: Khách đặt món trên điện thoại không còn thấy toast thông báo che khuất header; xuất hiện popup modal xác nhận chuyên dụng ngay ngắn giữa màn hình.
- [x] **AC-3**: Bấm "Xem món đã đặt" trên modal chuyển sang màn hình theo dõi đơn `OrderTrackingView` với thông tin mã đơn, số bàn chính xác.
- [x] **AC-4**: `OrderTrackingView` hiển thị đúng quy trình thực tế: tiếp nhận thẳng vào bếp, không còn khâu giả lập "chờ tiếp nhận".
- [x] **AC-5**: Toàn bộ kiểm thử build, lint và Playwright E2E đều đạt 100% xanh.
- [x] **AC-6**: Không can thiệp database bằng SQL script, không reset, seed lại hay xóa dữ liệu kiểm thử.

---

## 3. Danh Sách Tệp Thay Đổi

1. `backend/src/reports/reports.service.ts`: Chuẩn hóa mapper dữ liệu món `normalizeOrderItemSnapshots` trong `getActiveTables`, `getPaymentDetail`, `getPaymentHistory`.
2. `frontend/src/components/admin/TableDetailDrawer.tsx`: Defensive formatting cho đơn giá, thành tiền và tổng tiền.
3. `frontend/src/components/customer/OrderSuccessModal.tsx`: Tạo mới component modal thông báo đặt món thành công.
4. `frontend/src/contexts/RestaurantContext.tsx` & `restaurantContextDef.ts`: Thêm state quản lý `orderSuccessModalData`, ngắt gọi `showToast` khi đặt món thành công.
5. `frontend/src/views/customer/OrderConfirmationView.tsx`: Xử lý luồng đặt món mở modal.
6. `frontend/src/views/customer/OrderTrackingView.tsx`: Gỡ bỏ nút "Gọi thêm món" trên header, loại bỏ bước giả "chờ tiếp nhận", tối ưu responsive.
7. `frontend/src/App.tsx`: Mount `OrderSuccessModal`.
8. `tests/playwright/order-sync-lifecycle.spec.js`: Cập nhật và bổ sung test cases xác minh popup và xem chi tiết Bàn 01.

---

## 4. Kế Hoạch Kiểm Chứng

1. Chạy `npm --prefix frontend run lint`
2. Chạy `npm --prefix frontend run build` và `npm --prefix backend run build`
3. Chạy Playwright E2E: `npx playwright test`
4. Chụp ảnh màn hình kiểm chứng kết quả thực tế trên giao diện mobile và admin.
