# Báo Cáo Nghiệm Thu: Sửa Lưu & Hiển Thị Ảnh Banner và Phòng Thủ Lỗi Giao Diện

> **Dự án**: Huy CV — Quán Vỉa Hè (QR Order & Store Management)  
> **Ngày thực hiện**: 05/11/2026  
> **Người thực hiện**: AI Senior Engineer  
> **Tiêu chuẩn tuân thủ**: [RULES.md](../../RULES.md), [AGENTS.md](../../AGENTS.md) (Zero Database Interference).

---

## 1. Mục Tiêu & Phạm Vi Công Việc

Xử lý triệt để 2 nhóm vấn đề:
1. **Lỗi Banner có preview nhưng sau khi lưu không hiển thị ảnh**:
   - Khi chọn file ảnh từ máy (dung lượng lớn ~2,28 MB), khung xem trước hoàn chỉnh bên phải modal không cập nhật ảnh mới ngay lập tức.
   - Nút submit cho phép bấm lưu trong lúc request upload file vẫn đang gửi ngầm, dẫn đến payload gửi lên máy chủ bị rỗng hoặc mang URL cũ.
   - Lớp phủ CSS `opacity-30 mix-blend-overlay` và `opacity-40 mix-blend-overlay` tại danh sách banner, popup xem trước và sảnh khách (`HeroBannerCarousel`) làm ảnh sáng bị gradient nuốt chửng hoàn toàn.
   - Khi mở form chỉnh sửa banner, trường tiêu đề hiển thị bị trống nếu dữ liệu gốc ưu tiên `adminName`.
2. **Khắc phục lỗi hiển thị giao diện trong 2 ảnh đính kèm**:
   - **Ảnh 1 (Điện thoại)**: Toast thông báo "Đã gửi đơn gọi món thành công cho Bàn 01..." hiển thị trên mobile bị đè lên header, che khuất nút "Gọi thêm món" và thanh điều hướng. Đã chuyển sang Popup xác nhận chuyên dụng (`OrderSuccessModal`) đặt giữa màn hình, đồng thời dời toast thông báo trên mobile xuống góc dưới (`bottom-6`), đảm bảo không bao giờ đè lên header.
   - **Ảnh 2 (Desktop `localhost:5173/#/staff/tables`)**: Trang quản lý bàn bị văng vào `ErrorBoundary` với lỗi `Cannot read properties of undefined (reading 'toLocaleString')`. Đã phòng thủ toàn diện với `(Number(val) || 0).toLocaleString('vi-VN')` trên `TableManagementView`, `TableDetailDrawer`, `PaymentDetailDrawer`, `PaymentHistoryView` và `RestaurantContext`.

---

## 2. Các Tệp Thay Đổi Kỹ Thuật

| Tệp | Thay đổi kỹ thuật |
|---|---|
| `frontend/src/views/admin/TableManagementView.tsx` | Bổ sung `(Number(session.totalAmount) || 0).toLocaleString('vi-VN')` và `(Number(session.confirmedAmount ?? session.totalAmount) || 0).toLocaleString('vi-VN')` phòng thủ tuyệt đối lỗi crash. |
| `frontend/src/components/admin/PaymentDetailDrawer.tsx` | Bọc an toàn `totalPrice`, `unitPrice`, `totalAmount` với `Number(val) || 0` trước khi gọi `.toLocaleString()`. |
| `frontend/src/views/admin/PaymentHistoryView.tsx` | Bọc an toàn `r.totalAmount` phòng thủ dữ liệu null/undefined. |
| `frontend/src/App.tsx` | Đưa `InAppToast` trên mobile xuống `bottom-6 left-4 right-4` (`md:top-4 md:right-4 md:bottom-auto md:left-auto`), không bao giờ che khuất header. |
| `frontend/src/components/customer/HeroBannerCarousel.tsx` | Loại bỏ `opacity-30 mix-blend-overlay`, sử dụng `object-cover` sắc nét kết hợp gradient đen mờ nhẹ (`bg-gradient-to-r from-black/80 via-black/45 to-black/20`). |
| `frontend/src/components/admin/ImageUploader.tsx` | Bổ sung callback `onPreviewChange`, truyền object URL tức thì cho component cha ngay khi chọn file; đồng bộ an toàn trạng thái không qua cascading effect. |
| `frontend/src/views/admin/BannerManagementView.tsx` | Bổ sung state `localPreviewUrl` và `isUploadingImage`, khóa nút submit kèm spinner "Đang tải ảnh lên máy chủ...", loại bỏ lớp phủ mờ đục tại thumbnail và popup xem trước. |
| `frontend/src/views/admin/MenuItemFormModal.tsx` | Bổ sung `localPreview` và `isUploadingImage`, khóa nút submit khi upload ảnh món đang diễn ra. |
| `frontend/src/api/mediaApi.ts` | Bổ sung fallback đọc `staffId` tự động từ `localStorage.getItem('huycv_staff_session')`. |
| `tests/playwright/overview-lifecycle.spec.js` | Tối ưu hóa click đăng nhập ca trực, tránh lỗi detached element khi chuyển trang. |

---

## 3. Bằng Chứng Xác Minh (Verification Evidence)

1. **Linter**:
   - Lệnh: `npm --prefix frontend run lint`
   - Kết quả: `Found 0 warnings and 0 errors. Finished in 56ms on 49 files.`
2. **Build**:
   - Frontend: `npm --prefix frontend run build` ➔ `built in 710ms`, không phát sinh lỗi Typescript.
   - Backend: `npm --prefix backend run build` ➔ `Found 0 errors. Watching for file changes.`
3. **Playwright E2E**:
   - Lệnh: `npx playwright test`
   - Kết quả: **15/15 tests PASSED (100% test suites xanh)**.
     - `media-upload-and-admin-feedback.spec.js` (5 tests pass)
     - `order-sync-lifecycle.spec.js` (2 tests pass)
     - `overview-lifecycle.spec.js` (4 tests pass)
     - `staff-profile-lifecycle.spec.js` (4 tests pass)

---

## 4. Cam Kết Ràng Buộc Dữ Liệu

- **Zero Database Interference**: Hoàn toàn không can thiệp, không reset, không seed lại hay chỉnh sửa cơ sở dữ liệu ngoài luồng.
- Giữ vững toàn vẹn bảng màu và nhận diện thương hiệu Quán Vỉa Hè Huy CV.
