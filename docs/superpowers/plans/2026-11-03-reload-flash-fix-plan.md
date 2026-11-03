# Kế Hoạch Triển Khai: Khắc Phục Trang Trắng & Nháy Dữ Liệu Khi Tải Lại

> **Loại tài liệu**: Kế hoạch kỹ thuật (Implementation Plan - Superpowers)  
> **Mã công việc**: `TASK-FLASH-FIX-20261103`  
> **Thời điểm**: 03/11/2026  
> **Trạng thái**: Đã hoàn thành (Archived / Implemented)  
> **Liên kết User Story**: [`US-ADM-01`](../../requirements/user-stories/admin.md#us-adm-01), [`US-ADM-05`](../../requirements/user-stories/admin.md#us-adm-05)

---

## 1. Mục Tiêu Kỹ Thuật
1. Loại bỏ triệt để hiện tượng nháy dữ liệu (từ 8 món demo/mock nhảy sang 5 món thực tế từ backend) khi tải lại trang `DishesManagementView`.
2. Khắc phục khoảng trắng (blank page) do bất đồng bộ khởi tạo `StaffAuthContext` và router hash.
3. Thay thế các mảng khởi tạo tĩnh (hardcoded dummy items) bằng initial state rỗng kèm Skeleton loading components mượt mà.
4. Đảm bảo race condition giữa các request đồng thời được triệt tiêu bằng cờ `isMounted` hoặc `AbortController`.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- [x] **AC-FLASH-01**: Khi F5/reload trang Quản lý món, không bao giờ xuất hiện số lượng món 8 rồi mới hạ xuống 5.
- [x] **AC-FLASH-02**: Hiển thị Skeleton loading thanh thoát trong thời gian chờ API phản hồi.
- [x] **AC-FLASH-03**: Khi phiên đăng nhập đang được khôi phục từ token/session, giao diện hiển thị spinner trung tâm thay vì màn hình trắng đục.
- [x] **AC-FLASH-04**: Thống kê số lượng món và số danh mục luôn đồng bộ với dữ liệu thực từ backend.

---

## 3. Các Tệp Tác Động
- Frontend:
  - `frontend/src/views/staff/DishesManagementView.tsx`
  - `frontend/src/context/StaffAuthContext.tsx`
  - `frontend/src/components/common/SkeletonLoader.tsx`
  - `frontend/src/App.tsx`

---

## 4. Lệnh Kiểm Chứng
```bash
# Kiểm tra định dạng mã nguồn
npm --prefix frontend run lint

# Chạy test xác minh chống nháy dữ liệu và kiểm tra F5 reload
npx playwright test tests/reload-flash.spec.ts
```

