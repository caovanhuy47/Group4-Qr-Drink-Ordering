# Ma Trận User Stories — Dự Án Huy CV (Quán Vỉa Hè)

Tài liệu này đóng vai trò mục lục và ma trận truy vết (Traceability Matrix) toàn bộ User Stories của hệ thống **Huy CV — Website đặt món bằng mã QR và quản lý vận hành quán nước vỉa hè**.

---

## 1. Phân Nhóm User Stories

Hệ thống được phân rã thành 3 nhóm người dùng và vai trò chính:

1. [User Stories Khách Hàng (Customer)](khach-hang.md) (`US-CUST-01` đến `US-CUST-07`): Dành cho khách quét mã QR tại bàn, chọn món, gửi đơn và theo dõi tiến trình làm món.
2. [User Stories Vận Hành Bàn (Operations)](van-hanh-ban.md) (`US-OPS-01` đến `US-OPS-08`): Dành cho nhân viên phục vụ, thu ngân và bếp theo dõi bàn, phục vụ món và thu tiền tại chỗ.
3. [User Stories Quản Trị Viên (Admin & Management)](admin.md) (`US-ADM-01` đến `US-ADM-08`): Dành cho chủ quán và quản lý cấu hình thực đơn, danh mục, banner, nhân sự, tổng quan kinh doanh và lịch sử thu tiền.

---

## 2. Ma Trận Truy Vết (Traceability Matrix)

| Mã Story | Tên User Story | Nhóm Vai Trò | Mức Ưu Tiên | Tiêu Chí Nghiệm Thu (AC) | Trạng Thái Triển Khai | Tập Tin Kiểm Chứng |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **US-CUST-01** | Quét QR vào đúng bàn không cần đăng nhập | Khách hàng | P0 (MVP Cốt lõi) | AC-CUST-01.1, AC-CUST-01.2 | [ĐÃ HOÀN THÀNH] | `frontend/src/contexts/RestaurantContext.tsx` |
| **US-CUST-02** | Xem, tìm kiếm và lọc danh mục thực đơn | Khách hàng | P0 (MVP Cốt lõi) | AC-CUST-02.1, AC-CUST-02.2 | [ĐÃ HOÀN THÀNH] | `frontend/src/views/customer/FoodLobbyView.tsx` |
| **US-CUST-03** | Xem chi tiết, tùy chọn size, topping, ghi chú | Khách hàng | P0 (MVP Cốt lõi) | AC-CUST-03.1, AC-CUST-03.2 | [ĐÃ HOÀN THÀNH] | `frontend/src/components/customer/DishDetailModal.tsx` |
| **US-CUST-04** | Chỉnh sửa giỏ hàng nháp theo bàn | Khách hàng | P0 (MVP Cốt lõi) | AC-CUST-04.1, AC-CUST-04.2 | [ĐÃ HOÀN THÀNH] | `frontend/src/views/customer/CartView.tsx` |
| **US-CUST-05** | Gửi món, xác thực giá backend, chống gửi trùng | Khách hàng | P0 (MVP Cốt lõi) | AC-CUST-05.1, AC-CUST-05.2 | [ĐÃ HOÀN THÀNH] | `backend/src/dishes/dishes.controller.ts` (`/validate-order`) |
| **US-CUST-06** | Theo dõi tiến trình món đã đặt của lượt bàn | Khách hàng | P0 (MVP Cốt lõi) | AC-CUST-06.1, AC-CUST-06.2 | [ĐÃ HOÀN THÀNH] | `frontend/src/views/customer/OrderTrackingView.tsx` |
| **US-CUST-07** | Cô lập giỏ hàng và dữ liệu giữa các bàn | Khách hàng | P1 (Tin cậy) | AC-CUST-07.1, AC-CUST-07.2 | [ĐÃ HOÀN THÀNH] | `frontend/src/contexts/RestaurantContext.tsx` |
| **US-OPS-01** | Xem sơ đồ bàn và hàng đợi chờ phục vụ | Vận hành | P0 (MVP Cốt lõi) | AC-OPS-01.1, AC-OPS-01.2 | [ĐÃ HOÀN THÀNH] | `frontend/src/views/admin/TableManagementView.tsx` |
| **US-OPS-02** | Xem chi tiết món tổng hợp của phiên bàn | Vận hành | P0 (MVP Cốt lõi) | AC-OPS-02.1, AC-OPS-02.2 | [ĐÃ HOÀN THÀNH] | `frontend/src/components/admin/TableDetailDrawer.tsx` |
| **US-OPS-03** | Phân biệt tùy chọn size/topping/ghi chú khi gom món | Vận hành / Bếp | P0 (MVP Cốt lõi) | AC-OPS-03.1, AC-OPS-03.2 | [ĐÃ HOÀN THÀNH] | `frontend/src/components/admin/TableDetailDrawer.tsx` |
| **US-OPS-04** | Chốt danh sách món theo lượt bàn | Vận hành / Bếp | P0 (MVP Cốt lõi) | AC-OPS-04.1, AC-OPS-04.2 | [ĐÃ HOÀN THÀNH] | `frontend/src/contexts/RestaurantContext.tsx` |
| **US-OPS-05** | Xác nhận phục vụ và thu tiền một lần duy nhất | Thu ngân / Phục vụ | P0 (MVP Cốt lõi) | AC-OPS-05.1, AC-OPS-05.2 | [ĐÃ HOÀN THÀNH] | `backend/src/reports/reports.service.ts` (`recordPayment`) |
| **US-OPS-06** | Giải phóng bàn về Trống khi khách rời | Phục vụ | P0 (MVP Cốt lõi) | AC-OPS-06.1, AC-OPS-06.2 | [ĐÃ HOÀN THÀNH] | `frontend/src/views/admin/TableManagementView.tsx` |
| **US-OPS-07** | Bảo toàn lịch sử thu và danh tính người thu | Kế toán / Quản lý | P0 (MVP Cốt lõi) | AC-OPS-07.1, AC-OPS-07.2 | [ĐÃ HOÀN THÀNH] | `backend/src/reports/entities/table-session-record.entity.ts` |
| **US-OPS-08** | Kiểm soát quyền thu tiền tại Backend | Bảo mật RBAC | P0 (MVP Cốt lõi) | AC-OPS-08.1, AC-OPS-08.2 | [ĐÃ HOÀN THÀNH] | `backend/src/staff/staff.service.ts` (`verifyStaffPermission`) |
| **US-ADM-01** | Đăng nhập nội bộ xác thực PBKDF2 | Quản trị | P0 (MVP Cốt lõi) | AC-ADM-01.1, AC-ADM-01.2 | [ĐÃ HOÀN THÀNH] | `backend/src/staff/staff.controller.ts` (`/login`) |
| **US-ADM-02** | Quản lý món ăn thực đơn MySQL CRUD | Quản trị | P0 (MVP Cốt lõi) | AC-ADM-02.1, AC-ADM-02.2 | [ĐÃ HOÀN THÀNH] | `tests/playwright/overview-lifecycle.spec.js` |
| **US-ADM-03** | Quản lý danh mục món ăn CRUD | Quản trị | P0 (MVP Cốt lõi) | AC-ADM-03.1, AC-ADM-03.2 | [ĐÃ HOÀN THÀNH] | `backend/src/dishes/dishes.service.ts` |
| **US-ADM-04** | Quản lý Banner khuyến mãi & Carousel | Quản trị | P1 (Quan trọng) | AC-ADM-04.1, AC-ADM-04.2 | [ĐÃ HOÀN THÀNH] | `backend/src/banners/banners.controller.ts` |
| **US-ADM-05** | Quản lý nhân viên và phân quyền 7 nhóm | Chủ quán (Admin) | P0 (MVP Cốt lõi) | AC-ADM-05.1, AC-ADM-05.2 | [ĐÃ HOÀN THÀNH] | `backend/src/staff/staff.service.ts` |
| **US-ADM-06** | Dashboard Tổng quan kinh doanh thực thu | Chủ quán (Admin) | P0 (MVP Cốt lõi) | AC-ADM-06.1, AC-ADM-06.2 | [ĐÃ HOÀN THÀNH] | `tests/playwright/overview-lifecycle.spec.js` |
| **US-ADM-07** | Tra cứu lịch sử hóa đơn thu tiền | Thu ngân / Quản lý | P0 (MVP Cốt lõi) | AC-ADM-07.1, AC-ADM-07.2 | [ĐÃ HOÀN THÀNH] | `frontend/src/views/admin/PaymentHistoryView.tsx` |
| **US-ADM-08** | Quản lý hồ sơ cá nhân và đổi mã PIN ca trực | Nhân sự nội bộ | P1 (Quan trọng) | AC-ADM-08.1, AC-ADM-08.2 | [ĐÃ HOÀN THÀNH] | `tests/playwright/staff-profile-lifecycle.spec.js` |
| **US-EXT-01** | Lưu trữ danh mục bàn ăn bền vững trong DB | Quản trị | P2 (Đề xuất mở rộng) | AC-EXT-01.1 | [CHỜ DUYỆT SCHEMA] | `docs/audit/backend-module-survey.md` |
| **US-EXT-02** | Đồng bộ phiên gọi món đa thiết bị qua WebSocket | Vận hành / Bếp | P2 (Đề xuất mở rộng) | AC-EXT-02.1 | [CHỜ DUYỆT SCHEMA] | `docs/design/architecture.md` |

