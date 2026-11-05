# Kế Hoạch Triển Khai: Sửa Lưu và Hiển Thị Ảnh Banner Tải Từ Máy

> **Ngày thực hiện**: 05/11/2026  
> **Nhiệm vụ**: `fix(banners): sửa lưu và hiển thị ảnh tải từ máy`  
> **Quy chuẩn**: Tuân thủ triệt để [RULES.md](../../../RULES.md) và [AGENTS.md](../../../AGENTS.md) (Zero Database Interference).

---

## 1. Phân Tích Hiện Tượng & Nguyên Nhân Kỹ Thuật

Qua khảo sát toàn bộ vòng đời lưu và hiển thị ảnh:

1. **Điểm đứt preview banner hoàn chỉnh (Preview Disconnect)**:
   - Trong `ImageUploader.tsx`, khi người dùng chọn file ảnh từ máy (ví dụ file PNG 2,28 MB), component tạo `objectUrl` cục bộ và lưu vào state nội bộ `previewUrl` của nó.
   - Tuy nhiên, `ImageUploader` không truyền `previewUrl` ra component cha (`BannerManagementView`), mà chỉ gọi `onImageChange` sau khi request upload lên server thành công.
   - Do file dung lượng lớn cần thời gian upload, trong suốt thời gian này, state `imageUrl` của form cha vẫn là URL cũ (hoặc chuỗi rỗng), khiến khung xem trước banner hoàn chỉnh bên phải không hiển thị ảnh mới chọn.

2. **Điểm đứt lưu URL ảnh (Premature Save / Missing Await Guard)**:
   - Nút "Cập nhật banner" trong `BannerManagementView` không kiểm tra trạng thái upload (`isUploading`), dẫn đến việc người dùng có thể bấm lưu ngay khi file đang được tải lên.
   - Khi đó, payload gửi lên backend vẫn mang `imageUrl` cũ hoặc rỗng, làm mất ảnh mới.

3. **Lớp phủ Gradient / Mix-blend che kín ảnh (Over-masking Visual Quirks)**:
   - Tại các vị trí hiển thị:
     - Khung xem trước trong modal (`BannerManagementView.tsx` L999): `opacity-35 mix-blend-overlay` kết hợp với gradient đen làm ảnh bị tối và hòa trộn gần như biến mất.
     - Thumbnail danh sách quản trị (`BannerManagementView.tsx` L559): `opacity-40 mix-blend-overlay` trên nền `bgGradient` làm ảnh chìm hẳn vào màu nền.
     - Popup xem trước (`viewingBanner`) & Sảnh khách (`HeroBannerCarousel.tsx` L135): `opacity-30 mix-blend-overlay` gây hiện tượng ảnh bị mờ đục hoặc không thấy rõ.

4. **Lỗi khuyết Tiêu đề hiển thị cho khách khi mở Chỉnh sửa**:
   - Trong `handleOpenEdit`: `setTitle(banner.title)`. Nếu bản ghi banner ban đầu hoặc trong DB có `title` rỗng nhưng có `adminName`, form mở ra để trống trường bắt buộc `title`, khiến người dùng phải nhập lại hoặc có nguy cơ mất tiêu đề.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [ ] **AC-1**: Khi chọn ảnh từ máy trong `ImageUploader`, khung xem trước banner hoàn chỉnh bên phải cập nhật tức thì ảnh mới (sử dụng local preview trước, sau đó đồng bộ URL server).
- [ ] **AC-2**: Khóa nút submit ("Đang tải ảnh lên máy chủ...") và có spinner khi upload ảnh đang diễn ra, chặn tuyệt đối việc lưu form khi upload chưa hoàn tất.
- [ ] **AC-3**: Sau khi upload thành công, URL `/uploads/banners/...` được gắn vào banner payload và lưu bền vững vào database; sau khi F5 và mở lại form, ảnh vẫn hiển thị chuẩn xác.
- [ ] **AC-4**: Nếu người dùng bấm "Hủy chọn", khôi phục ngay về ảnh gốc ban đầu của banner cả ở khung upload lẫn khung xem trước bên phải.
- [ ] **AC-5**: Bỏ `mix-blend-overlay` và chỉnh lớp gradient phủ tương phản vừa vặn để ảnh hiển thị sắc nét, sống động trên cả 5 vị trí:
  1. Khung preview file upload.
  2. Khung xem trước banner hoàn chỉnh bên phải modal.
  3. Thumbnail trên danh sách quản trị banner.
  4. Popup xem trước chi tiết banner (`viewingBanner`).
  5. Banner sảnh khách (`HeroBannerCarousel`).
- [ ] **AC-6**: Khi mở form Chỉnh sửa, tự động ánh xạ an toàn `title || adminName` và `adminName || title`, đảm bảo không bao giờ để trống tiêu đề hiển thị.
- [ ] **AC-7**: Đảm bảo không gây lỗi hồi quy (regression) cho tính năng upload ảnh món ăn (`MenuItemFormModal`).
- [ ] **AC-8**: 100% test suites Playwright E2E xanh, linter 0 warnings/errors, build frontend và backend thành công.
- [ ] **AC-9**: Không can thiệp database ngoài luồng (Zero Database Interference).

---

## 3. Danh Sách Tệp Sửa Đổi

1. `frontend/src/components/admin/ImageUploader.tsx`:
   - Bổ sung callback `onPreviewChange?: (previewUrl: string) => void`.
   - Gọi `onPreviewChange(objectUrl)` ngay khi chọn file; gọi `onPreviewChange('')` khi hủy hoặc chuyển tab URL.
   - Đảm bảo token `x-staff-id` có fallback an toàn từ session storage.
2. `frontend/src/views/admin/BannerManagementView.tsx`:
   - Thêm state `localPreviewUrl` và `isUploadingImage`.
   - Kết nối `onPreviewChange` và `onUploadingChange` vào `ImageUploader`.
   - Cập nhật khung xem trước banner hoàn chỉnh: hiển thị `localPreviewUrl || imageUrl` với `object-cover` sắc nét và gradient tương phản nhẹ `bg-gradient-to-r from-black/80 via-black/45 to-black/20` (bỏ `mix-blend-overlay` và `opacity-35`).
   - Cập nhật thumbnail danh sách: hiển thị ảnh nổi bật sắc nét kèm overlay mờ nhẹ, không bị blend màu chìm vào nền.
   - Cập nhật popup xem trước (`viewingBanner`): đồng bộ phong cách hiển thị ảnh rõ nét.
   - Nút submit: disable khi `isUploadingImage`, hiển thị "Đang tải ảnh lên máy chủ...".
   - `handleOpenEdit`: ánh xạ an toàn `setTitle(banner.title || banner.adminName || '')`.
3. `frontend/src/views/admin/MenuItemFormModal.tsx`:
   - Đồng bộ `onPreviewChange` và `onUploadingChange` để xem trước thẻ món ăn hiển thị ảnh tức thì, chặn submit khi đang upload.
4. `frontend/src/components/customer/HeroBannerCarousel.tsx`:
   - Chỉnh sửa ảnh nền banner sảnh khách: bỏ `mix-blend-overlay` và `opacity-30`, áp dụng `object-cover` chuẩn sắc nét với overlay gradient chuyển mượt bảo đảm độ đọc chữ hoàn hảo.
5. `tests/playwright/media-upload-and-admin-feedback.spec.js`:
   - Bổ sung kịch bản kiểm thử toàn diện cho banner: chọn file ảnh từ máy, kiểm tra preview hoàn chỉnh tức thì, lưu banner, kiểm tra thumbnail hiển thị đúng trong danh sách và sau khi reload F5.

