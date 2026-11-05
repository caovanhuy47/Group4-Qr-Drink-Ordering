# Kế Hoạch Triển Khai: Upload Ảnh Món/Banner và Chuẩn Hóa Popup Thông Báo Admin

> **Ngày thực hiện**: 05/11/2026  
> **Nhiệm vụ**: `feat(media): hỗ trợ tải ảnh món và banner từ máy` & `fix(ui): thống nhất popup thông báo và sửa icon bị chồng`  
> **Quy chuẩn**: Tuân thủ triệt để [RULES.md](../../../RULES.md) và [AGENTS.md](../../../AGENTS.md) (Zero Database Interference).

---

## 1. Mục Tiêu Kỹ Thuật

1. **Hệ thống Upload Ảnh Món và Banner**:
   - Hỗ trợ chọn file từ hộp thoại OS và kéo thả (drag & drop) trên máy tính cho cả form tạo mới và chỉnh sửa món ăn / banner.
   - Hỗ trợ 2 tab nguồn ảnh rõ ràng: "Tải ảnh từ máy" và "Dùng đường dẫn URL".
   - Xem trước ngay sau khi chọn kèm tên file và dung lượng.
   - Cho phép thay ảnh hoặc hủy lựa chọn mới để giữ lại ảnh cũ khi chỉnh sửa.
   - Thống nhất giới hạn dung lượng: **Nhỏ hơn 10 MB** (< 10,485,760 bytes).
   - Hỗ trợ định dạng: JPG/JPEG, PNG, WebP. Backend kiểm tra độc lập cả dung lượng và magic bytes thực tế của buffer để chặn file giả mạo hoặc lỗi.
   - Lưu trữ an toàn trên backend tại thư mục `uploads/` (`uploads/dishes`, `uploads/banners`), cấp phát tên file ngẫu nhiên chống trùng.
   - Phục vụ static file qua NestJS và Vite proxy `/uploads`, đảm bảo truy cập bền vững sau F5, restart và qua mạng LAN trên điện thoại.
   - Phân quyền upload: Yêu cầu định danh tài khoản nhân viên có quyền quản lý món / banner (`admin`, `cashier`).

2. **Chuẩn Hóa Hệ Thống Popup Thông Báo Admin**:
   - Chuyển toàn bộ các thông báo kết quả thao tác trong Admin (thành công, thất bại, cảnh báo, thông tin) từ toast/alert rời rạc sang component Popup Modal dùng chung (`AdminFeedbackModal`).
   - Thiết kế chuẩn UI/UX Pro Max:
     - Icon nằm trong vùng riêng biệt theo đúng type (thành công: xanh lá vỉa hè `tertiary`, lỗi: đỏ `error`, cảnh báo: hổ phách `warning`, thông tin: xanh dương `info`).
     - Tiêu đề ngắn gọn, nội dung đầy đủ xuống dòng không bị cắt chữ.
     - Nút "Đóng" hoặc hành động rõ ràng, nút X đóng.
     - Khóa cuộn nền (`overflow: hidden`), phím Escape / Enter đóng popup.
     - Viewport responsive trên mobile và desktop, căn giữa tự nhiên.
   - Loại bỏ tình trạng hiện song song cả toast lẫn popup cho cùng một sự kiện.

3. **Sửa Icon "Order thành công" Bị Chồng Lệch**:
   - Tinh chỉnh `TableStatusIcon` và `TableStatusBadge`: Căn chỉnh huy hiệu phiếu có tích (receipt with check) chuẩn xác, loại bỏ hiện tượng icon con bị lệch hoặc cắt viền do font rendering.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [ ] **AC-1**: Cả form Món ăn (`MenuItemFormModal`) và Banner (`BannerManagementView`) đều có nút "Chọn ảnh từ máy", hỗ trợ kéo thả, xem trước, hiển thị tên file và dung lượng.
- [ ] **AC-2**: Giữ tùy chọn nhập URL trực tiếp, phân tách 2 nguồn rõ ràng; chỉ yêu cầu 1 nguồn ảnh hợp lệ.
- [ ] **AC-3**: Chỉnh sửa hiển thị ảnh hiện tại; nếu hủy chọn ảnh mới sẽ khôi phục về ảnh cũ; không lưu ảnh mẫu mặc định khi chưa chọn.
- [ ] **AC-4**: File upload < 10 MB thành công; file >= 10 MB hoặc file giả ảnh (sai magic bytes) bị từ chối với thông báo lỗi rõ ràng.
- [ ] **AC-5**: Ảnh upload lưu trữ thực tế trên server, sinh URL `/uploads/...`, tải được sau F5 và truy cập được từ điện thoại qua mạng LAN.
- [ ] **AC-6**: Tài khoản không có quyền upload nội bộ (khách vãng lai) bị từ chối 401/403.
- [ ] **AC-7**: Mọi thông báo thao tác trong Admin chuyển sang popup modal chuyên dụng, không cắt chữ, không đè thẻ thống kê.
- [ ] **AC-8**: Biểu tượng "Order thành công" trên thẻ bàn và thanh trạng thái hiển thị chuẩn đẹp, không bị lệch.
- [ ] **AC-9**: 100% kiểm thử Playwright E2E, linter và build đạt kết quả Xanh.
- [ ] **AC-10**: Không can thiệp database ngoài luồng (Zero Database Interference).

---

## 3. Danh Sách Tệp Sửa Đổi & Tạo Mới

1. **Backend**:
   - `backend/src/media/media.module.ts` (Mới): Module quản lý media & uploads.
   - `backend/src/media/media.controller.ts` (Mới): Controller xử lý `POST /api/media/upload`.
   - `backend/src/media/media.service.ts` (Mới): Service kiểm tra magic bytes, dung lượng, ghi file an toàn vào `uploads/`.
   - `backend/src/main.ts`: Cấu hình static assets serving cho `/uploads/`.
   - `backend/src/app.module.ts`: Import `MediaModule`.

2. **Frontend**:
   - `frontend/vite.config.ts`: Bổ sung proxy `/uploads` trỏ về `http://localhost:3000`.
   - `frontend/src/api/mediaApi.ts` (Mới): API client upload file.
   - `frontend/src/components/admin/ImageUploader.tsx` (Mới): Component chọn ảnh, kéo thả, xem trước, hiển thị dung lượng/tên file.
   - `frontend/src/components/admin/AdminFeedbackModal.tsx` (Mới): Component popup thông báo admin thống nhất.
   - `frontend/src/components/admin/TableStatusBadge.tsx`: Sửa biểu tượng phiếu có tích của trạng thái "Order thành công".
   - `frontend/src/contexts/RestaurantContext.tsx` & `restaurantContextDef.ts`: Tích hợp `adminFeedback` state và hàm hiển thị popup.
   - `frontend/src/views/admin/MenuItemFormModal.tsx`: Tích hợp `ImageUploader` và popup thông báo.
   - `frontend/src/views/admin/BannerManagementView.tsx`: Tích hợp `ImageUploader` và popup thông báo.
   - `frontend/src/views/admin/MenuManagementView.tsx`: Chuyển phản hồi sang popup.
   - `frontend/src/views/admin/CategoryManagementView.tsx`: Chuyển phản hồi sang popup.
   - `frontend/src/views/admin/StaffRbacView.tsx`: Chuyển phản hồi sang popup.
   - `frontend/src/views/admin/StaffProfileView.tsx`: Chuyển phản hồi sang popup.
   - `frontend/src/App.tsx`: Mount `AdminFeedbackModal`.

3. **Kiểm thử**:
   - `tests/playwright/media-upload-and-admin-feedback.spec.js` (Mới): E2E test upload ảnh và popup admin.

