# Kế Hoạch Triển Khai: Quản Lý Thực Đơn & Danh Mục Món

> **Loại tài liệu**: Kế hoạch kỹ thuật (Implementation Plan - Superpowers)  
> **Mã công việc**: `TASK-MENU-20261102`  
> **Thời điểm**: 02/11/2026  
> **Trạng thái**: Đã hoàn thành (Archived / Implemented)  
> **Liên kết User Story**: [`US-ADM-01`](../../requirements/user-stories/admin.md#us-adm-01), [`US-ADM-02`](../../requirements/user-stories/admin.md#us-adm-02)

---

## 1. Mục Tiêu Kỹ Thuật
1. Hoàn thiện toàn diện CRUD món ăn (`dishes`) và danh mục (`categories`) kết nối trực tiếp cơ sở dữ liệu MySQL thông qua NestJS TypeORM backend.
2. Xóa bỏ mock dữ liệu cục bộ trên giao diện Quản lý món (`DishesManagementView`) và Quản lý danh mục (`CategoriesManagementView`).
3. Đảm bảo form thêm/sửa hỗ trợ đầy đủ các trường: Tên, Giá bán, Danh mục (liên kết foreign key), Mô tả, Trạng thái (Còn hàng / Tạm hết), Ảnh minh họa.
4. Bảo toàn tính toàn vẹn cơ sở dữ liệu: không reset/xóa dữ liệu thực tế đang vận hành của quán.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- [x] **AC-MENU-01**: API `/api/dishes` và `/api/categories` phản hồi đúng cấu trúc DTO, có validation hợp lệ (`name`, `price >= 0`, `categoryId`).
- [x] **AC-MENU-02**: Frontend đồng bộ danh mục thực từ backend vào dropdown chọn danh mục trong modal món ăn.
- [x] **AC-MENU-03**: Thêm món mới, cập nhật thông tin và cập nhật trạng thái còn/hết hàng phản hồi tức thì và cập nhật lại danh sách mà không cần tải lại toàn trang.
- [x] **AC-MENU-04**: Thao tác xoá hoặc đổi trạng thái được xác nhận rõ ràng, có thông báo toast thành công/thất bại theo UI UX Pro Max.

---

## 3. Các Tệp Tác Động
- Backend:
  - `backend/src/dishes/dishes.controller.ts`
  - `backend/src/dishes/dishes.service.ts`
  - `backend/src/dishes/dto/create-dish.dto.ts`
  - `backend/src/categories/categories.controller.ts`
  - `backend/src/categories/categories.service.ts`
- Frontend:
  - `frontend/src/views/staff/DishesManagementView.tsx`
  - `frontend/src/views/staff/CategoriesManagementView.tsx`
  - `frontend/src/api/client.ts`

---

## 4. Lệnh Kiểm Chứng
```bash
# Kiểm tra định dạng mã nguồn
npm --prefix frontend run lint

# Biên dịch frontend
npm --prefix frontend run build

# Chạy test Playwright cho chức năng quản lý món & danh mục
npx playwright test tests/menu-management.spec.ts
```

