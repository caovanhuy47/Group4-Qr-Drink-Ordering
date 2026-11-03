# Kế Hoạch Triển Khai: Phân Quyền & Quản Lý Nhân Viên (Staff RBAC)

> **Loại tài liệu**: Kế hoạch kỹ thuật (Implementation Plan - Superpowers)  
> **Mã công việc**: `TASK-STAFF-RBAC-20261103`  
> **Thời điểm**: 03/11/2026  
> **Trạng thái**: Đã hoàn thành (Archived / Implemented)  
> **Liên kết User Story**: [`US-ADM-04`](../../requirements/user-stories/admin.md#us-adm-04), [`US-ADM-08`](../../requirements/user-stories/admin.md#us-adm-08)

---

## 1. Mục Tiêu Kỹ Thuật
1. Nâng cấp hệ thống phân quyền nhân viên dựa trên vai trò (`role: ADMIN | STAFF`) và quyền chi tiết dạng JSON permissions (`menu:read`, `menu:write`, `table:manage`, `reports:read`, `staff:manage`, `banners:manage`).
2. Xây dựng trang `StaffManagementView`: danh sách tài khoản, gắn quyền hạn chi tiết bằng nhóm checkbox quyền nghiệp vụ, trạng thái kích hoạt (`isActive`).
3. Khóa bảo vệ an toàn: Ngăn chặn tự xóa hoặc tự vô hiệu hóa tài khoản quản trị viên tối cao đang đăng nhập; ngăn chặn nhân viên tự cấp quyền admin cho chính mình.
4. Bảo vệ cả hai đầu: Frontend ẩn các menu/nút bấm không có quyền, Backend kiểm tra Guard (`RolesGuard` / `PermissionsGuard`) bảo vệ endpoint API.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- [x] **AC-RBAC-01**: Admin tạo mới nhân viên với tên đăng nhập, họ tên, vai trò và bộ quyền tích chọn tùy chỉnh.
- [x] **AC-RBAC-02**: Mật khẩu được băm bảo mật (`bcrypt`) phía server; không trả mật khẩu thô trong response API.
- [x] **AC-RBAC-03**: Nhân viên không có quyền quản lý nhân viên (`staff:manage`) sẽ bị chặn truy cập giao diện và API trả về `403 Forbidden`.
- [x] **AC-RBAC-04**: Đăng nhập/đăng xuất cập nhật chính xác quyền hạn trên phiên làm việc của trình duyệt.

---

## 3. Các Tệp Tác Động
- Backend:
  - `backend/src/staff/staff.entity.ts`
  - `backend/src/staff/staff.controller.ts`
  - `backend/src/staff/staff.service.ts`
  - `backend/src/staff/guards/roles.guard.ts`
  - `backend/src/staff/guards/permissions.guard.ts`
- Frontend:
  - `frontend/src/views/staff/StaffManagementView.tsx`
  - `frontend/src/views/staff/StaffLoginView.tsx`
  - `frontend/src/context/StaffAuthContext.tsx`
  - `frontend/src/components/staff/StaffSidebar.tsx`

---

## 4. Lệnh Kiểm Chứng
```bash
# Kiểm tra frontend & backend
npm --prefix frontend run lint
npm --prefix backend run build

# Chạy test Playwright cho luồng nhân viên và phân quyền
npx playwright test tests/staff-rbac.spec.ts
```

