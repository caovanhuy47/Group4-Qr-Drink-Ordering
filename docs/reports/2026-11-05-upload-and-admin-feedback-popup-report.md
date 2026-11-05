# Báo Cáo Nghiệm Thu: Upload Ảnh Món/Banner và Chuẩn Hóa Popup Thông Báo Admin

> **Ngày thực hiện**: 05/11/2026  
> **Nhiệm vụ**: Hỗ trợ chọn ảnh từ máy cho món ăn & banner, chuẩn hóa popup phản hồi trong Admin, sửa icon Order thành công.  
> **Quy chuẩn tuân thủ**: [RULES.md](../../RULES.md), [AGENTS.md](../../AGENTS.md) (Zero Database Interference).

---

## 1. Kết Quả Nghiệm Thu Theo Tiêu Chí (Acceptance Criteria)

| Tiêu chí | Trạng thái | Ghi chú bằng chứng kỹ thuật |
| :--- | :---: | :--- |
| **AC-1**: Nút "Chọn ảnh từ máy", kéo thả, xem trước, tên file & dung lượng | **ĐẠT (PASS)** | Component `ImageUploader` tích hợp vào cả `MenuItemFormModal` và `BannerManagementView`. Hỗ trợ dialog OS, drag & drop, hiển thị `formatFileSize` và preview thời gian thực. |
| **AC-2**: 2 tab nguồn ảnh độc lập ("Tải ảnh từ máy" vs "Dùng link URL") | **ĐẠT (PASS)** | Phân tách 2 tab rõ ràng, chỉ yêu cầu 1 nguồn ảnh hợp lệ, không ép nhập URL khi đã chọn file. |
| **AC-3**: Chỉnh sửa hiển thị ảnh hiện tại, hỗ trợ đổi/hủy ảnh để khôi phục | **ĐẠT (PASS)** | Khi sửa món/banner, hiển thị huy hiệu "Ảnh hiện tại". Nút "Hủy chọn" khôi phục ngay về ảnh gốc ban đầu. Không lưu ảnh mẫu mặc định khi chưa chọn. |
| **AC-4**: Giới hạn dung lượng < 10 MB, kiểm tra độc lập magic bytes buffer | **ĐẠT (PASS)** | Frontend chặn ngay file >= 10MB (`MAX_FILE_SIZE_BYTES`). Backend `MediaService` kiểm tra độc lập file size và magic bytes buffer (JPG `FF D8 FF`, PNG `89 50 4E 47`, WebP `RIFF...WEBP`), chặn đứng file giả mạo (400 Bad Request). |
| **AC-5**: Ảnh lưu trữ thực tế trên server, tải được sau F5 và qua LAN | **ĐẠT (PASS)** | Server lưu tại `uploads/dishes` và `uploads/banners` với tên file ngẫu nhiên chống trùng. Phục vụ static qua NestJS và Vite proxy `/uploads`, truy cập mượt mà qua LAN `http://<IP-LAN>:5173/uploads/...`. |
| **AC-6**: Phân quyền upload nhân viên nội bộ | **ĐẠT (PASS)** | API `POST /api/media/upload` yêu cầu header `x-staff-id` có quyền `canManageMenu` hoặc `canManageBanners`. Từ chối 403 Forbidden nếu không có quyền. |
| **AC-7**: Chuẩn hóa toàn bộ thông báo Admin sang `AdminFeedbackModal` | **ĐẠT (PASS)** | Loại bỏ toàn bộ toast rời rạc trong Admin, chuyển sang popup modal chuyên dụng với icon riêng biệt, tiêu đề súc tích, nội dung xuống dòng, nút Đóng/X, khóa cuộn (`overflow: hidden`), phím Escape/Enter. |
| **AC-8**: Sửa icon "Order thành công" không bị chồng lệch | **ĐẠT (PASS)** | Cấu trúc lại `TableStatusIcon` với box flex chuẩn, icon receipt_long kết hợp mini-badge checkmark tròn viền trắng xanh lá, không bị lệch do font rendering. |
| **AC-9**: 100% kiểm thử Playwright E2E, lint và build xanh | **ĐẠT (PASS)** | 15/15 tests Playwright Pass (100%), Oxlint 0 warnings 0 errors, Frontend & Backend builds đạt exit code 0. |
| **AC-10**: Zero Database Interference | **ĐẠT (PASS)** | Tuyệt đối không can thiệp SQL/ORM ngoài luồng, không reset/seed/truncate dữ liệu. |

---

## 2. Bằng Chứng Kiểm Thử Tự Động (Test Suites Evidence)

### 2.1. Playwright E2E (15/15 tests PASSED)
```bash
Running 15 tests using 1 worker

  ok  1 [chromium] › tests\playwright\media-upload-and-admin-feedback.spec.js:59:3 › Kịch bản 1: Mở Form Món ăn, kiểm tra ImageUploader có 2 tab rõ ràng và switch tab (6.1s)
  ok  2 [chromium] › tests\playwright\media-upload-and-admin-feedback.spec.js:91:3 › Kịch bản 2: Upload file ảnh từ máy (< 10MB) hiển thị xem trước, tên file và dung lượng (6.7s)
  ok  3 [chromium] › tests\playwright\media-upload-and-admin-feedback.spec.js:113:3 › Kịch bản 3: Từ chối file >= 10MB hiển thị thông báo lỗi rõ ràng (7.4s)
  ok  4 [chromium] › tests\playwright\media-upload-and-admin-feedback.spec.js:129:3 › Kịch bản 4: Mở Form Banner quảng cáo, kiểm tra ImageUploader hỗ trợ tỉ lệ banner (5.3s)
  ok  5 [chromium] › tests\playwright\media-upload-and-admin-feedback.spec.js:146:3 › Kịch bản 5: Biểu tượng "Order thành công" trên thẻ bàn hiển thị chuẩn xác không bị lệch (4.1s)
  ok  6 [chromium] › tests\playwright\order-sync-lifecycle.spec.js:8:3 › Toàn bộ luồng: Khách quét QR Bàn 03 đặt món ➔ Admin nhận đơn thời gian thực ➔ Thu tiền ➔ Giải phóng bàn (7.6s)
  ok  7 [chromium] › tests\playwright\order-sync-lifecycle.spec.js:156:3 › Kịch bản 2: Bấm "Xem món" Bàn 01 hiển thị trơn tru, phòng thủ lỗi toLocaleString (4.2s)
  ok  8 [chromium] › tests\playwright\overview-lifecycle.spec.js:21:3 › Kịch bản 1: Điều hướng từ Sơ đồ bàn sang Tổng quan không bị trắng trang (3.8s)
  ok  9 [chromium] › tests\playwright\overview-lifecycle.spec.js:32:3 › Kịch bản 2: Điều hướng từ Quản lý món ăn sang Tổng quan (3.5s)
  ok 10 [chromium] › tests\playwright\overview-lifecycle.spec.js:41:3 › Kịch bản 3: Mở trực tiếp URL /#/staff/overview và F5 reload (4.9s)
  ok 11 [chromium] › tests\playwright\overview-lifecycle.spec.js:48:3 › Kịch bản 4: Xử lý phòng thủ khi API trả về doanh thu món null (Mock client-side không ghi DB) (4.6s)
  ok 12 [chromium] › tests\playwright\staff-profile-lifecycle.spec.js:21:3 › Kịch bản 1: Mở trang Hồ sơ cá nhân hiển thị thông tin thực tế từ tài khoản (6.3s)
  ok 13 [chromium] › tests\playwright\staff-profile-lifecycle.spec.js:34:3 › Kịch bản 2: Mở Modal Chỉnh sửa hồ sơ cá nhân và kiểm tra các trường (8.0s)
  ok 14 [chromium] › tests\playwright\staff-profile-lifecycle.spec.js:51:3 › Kịch bản 3: Mở Modal Đổi mật khẩu/PIN và kiểm tra xác thực form (4.3s)
  ok 15 [chromium] › tests\playwright\staff-profile-lifecycle.spec.js:74:3 › Kịch bản 4: Bật/tắt chuông báo đơn mới lưu trạng thái (5.7s)

  15 passed (1.4m)
```

### 2.2. Linter & Typecheck
- **Frontend Oxlint**: `Found 0 warnings and 0 errors. Finished in 125ms on 49 files with 116 rules`.
- **Frontend Build**: `tsc -b && vite build` hoàn thành trong 634ms, 0 lỗi.
- **Backend Build**: `nest build` biên dịch sạch, 0 lỗi.
- **Backend Unit Tests**: Vitest 2/2 tests PASSED.
