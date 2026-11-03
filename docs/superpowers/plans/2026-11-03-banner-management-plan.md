# Kế Hoạch Triển Khai: Quản Lý Banner & Đồng Bộ Trang Chủ

> **Loại tài liệu**: Kế hoạch kỹ thuật (Implementation Plan - Superpowers)  
> **Mã công việc**: `TASK-BANNER-20261103`  
> **Thời điểm**: 03/11/2026  
> **Trạng thái**: Đã hoàn thành (Archived / Implemented)  
> **Liên kết User Story**: [`US-ADM-03`](../../requirements/user-stories/admin.md#us-adm-03), [`US-CUST-02`](../../requirements/user-stories/khach-hang.md#us-cust-02)

---

## 1. Mục Tiêu Kỹ Thuật
1. Xây dựng phân hệ Quản lý Banner (`banners`) gồm CRUD hoàn chỉnh trên Backend NestJS (TypeORM entity `Banner`, DTOs, Service, Controller).
2. Tích hợp giao diện quản trị `BannersManagementView`: danh sách thẻ banner, form tạo/sửa modal, preview ảnh trực tiếp, switch bật/tắt hiển thị, điều chỉnh thứ tự ưu tiên (`displayOrder`).
3. Đồng bộ hiển thị banner lên Carousel trang chủ khách hàng (`CustomerLobbyView`), lọc chính xác `isActive = true` và sắp xếp tăng dần theo `displayOrder`.
4. Ràng buộc bảo vệ dữ liệu: không can thiệp xóa dữ liệu DB khác.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- [x] **AC-BAN-01**: Admin quản lý được danh sách banner thực từ `/api/banners`, có phân trang/sắp xếp theo `displayOrder`.
- [x] **AC-BAN-02**: Modal tạo/sửa hỗ trợ đầy đủ `title`, `description`, `imageUrl`, `ctaText`, `targetLink`, `displayOrder`, `isActive`.
- [x] **AC-BAN-03**: Trang chủ khách hàng tải banner từ API `/api/banners`, tự động chuyển slide định kỳ (carousel autoplay) và hỗ trợ cử chỉ bấm nút CTA chuyển link nội bộ/ngoại bộ.
- [x] **AC-BAN-04**: Xử lý fallback thân thiện khi không có banner nào hoạt động (hiển thị hero banner mặc định của quán).

---

## 3. Các Tệp Tác Động
- Backend:
  - `backend/src/banners/banners.entity.ts`
  - `backend/src/banners/banners.controller.ts`
  - `backend/src/banners/banners.service.ts`
  - `backend/src/banners/dto/create-banner.dto.ts`
  - `backend/src/banners/banners.module.ts`
- Frontend:
  - `frontend/src/views/staff/BannersManagementView.tsx`
  - `frontend/src/views/customer/CustomerLobbyView.tsx`
  - `frontend/src/components/BannerCarousel.tsx`
  - `frontend/src/api/client.ts`

---

## 4. Lệnh Kiểm Chứng
```bash
# Kiểm tra định dạng mã nguồn và TypeScript
npm --prefix frontend run lint
npm --prefix frontend run build

# Chạy test xác minh banner quản trị và trang chủ
npx playwright test tests/banner-management.spec.ts
```

