# Danh Mục REST API & Ranh Giới Mạng (API Routes)

Tài liệu đặc tả toàn bộ các endpoints REST API của hệ thống **Huy CV — Quán Vỉa Hè**, bao gồm phương thức HTTP, đường dẫn, tham số, cấu trúc DTO, phân quyền và mã phản hồi HTTP.

---

## 1. Phân Hệ Thực Đơn & Danh Mục (`/api/dishes`)

| Phương Thức | Đường Dẫn | Tiêu Đề Yêu Cầu (Headers) | Dữ Liệu Gửi Lên (DTO) | Quyền Hạn (RBAC) | Mô Tả Chức Năng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/dishes` | Không | `?category=drinks&search=trà` | Công khai | Khách & nội bộ lấy danh sách món ăn đang hiển thị |
| `GET` | `/api/dishes?includeArchived=true` | `x-staff-id: <id>` | Không | `canManageMenu` | Quản lý lấy danh sách toàn bộ món kể cả món bị ẩn |
| `GET` | `/api/dishes/:id` | Không | Không | Công khai | Lấy chi tiết thông tin một món ăn |
| `POST` | `/api/dishes/validate-order` | Không | `ValidateOrderDto` | Công khai (Theo Bàn) | Xác thực tính hợp lệ của món và giá trước khi đặt |
| `POST` | `/api/dishes` | `x-staff-id: <id>` | `CreateDishDto` | `canManageMenu` | Thêm món ăn mới vào thực đơn MySQL |
| `PUT` | `/api/dishes/:id` | `x-staff-id: <id>` | `UpdateDishDto` | `canManageMenu` | Cập nhật thông tin món ăn (Lọc bỏ `categoryName`) |
| `PATCH` | `/api/dishes/:id/status` | `x-staff-id: <id>` | Không | `canManageMenu` | Bật/tắt nhanh trạng thái Còn món / Hết món |
| `DELETE` | `/api/dishes/:id` | `x-staff-id: <id>` | Không | `canManageMenu` | Xóa món ăn khỏi cơ sở dữ liệu |
| `GET` | `/api/dishes/categories` | Không | Không | Công khai | Lấy danh sách danh mục và số lượng món liên kết |
| `POST` | `/api/dishes/categories` | `x-staff-id: <id>` | `CreateCategoryDto` | `canManageMenu` | Tạo mới một danh mục món |
| `PUT` | `/api/dishes/categories/:id` | `x-staff-id: <id>` | `UpdateCategoryDto` | `canManageMenu` | Sửa tên, icon, thứ tự danh mục |
| `DELETE` | `/api/dishes/categories/:id` | `x-staff-id: <id>` | Không | `canManageMenu` | Xóa danh mục (bảo vệ toàn vẹn không để mồ côi món) |

---

## 2. Phân Hệ Banner Khuyến Mãi (`/api/banners`)

| Phương Thức | Đường Dẫn | Tiêu Đề Yêu Cầu | Dữ Liệu Gửi Lên | Quyền Hạn | Mô Tả Chức Năng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/banners` | Không | Không | Công khai | Lấy danh sách banner đang bật (`isActive = true`) |
| `GET` | `/api/banners?all=true` | `x-staff-id: <id>` | Không | `canManageBanners` | Lấy toàn bộ banner phục vụ trang quản lý |
| `GET` | `/api/banners/:id` | `x-staff-id: <id>` | Không | `canManageBanners` | Xem chi tiết thông tin một banner |
| `POST` | `/api/banners` | `x-staff-id: <id>` | `CreateBannerDto` | `canManageBanners` | Tạo banner mới kèm tag giờ vàng, gradient |
| `PUT` | `/api/banners/reorder` | `x-staff-id: <id>` | `ReorderBannersDto` | `canManageBanners` | Sắp xếp lại thứ tự carousel hàng loạt |
| `PUT` | `/api/banners/:id` | `x-staff-id: <id>` | `UpdateBannerDto` | `canManageBanners` | Chỉnh sửa thông tin banner |
| `PATCH` | `/api/banners/:id/status` | `x-staff-id: <id>` | Không | `canManageBanners` | Bật hoặc tắt trạng thái hiển thị của banner |
| `DELETE` | `/api/banners/:id` | `x-staff-id: <id>` | Không | `canManageBanners` | Xóa banner khỏi cơ sở dữ liệu |

---

## 3. Phân Hệ Nhân Sự & Phân Quyền (`/api/staff`)

| Phương Thức | Đường Dẫn | Tiêu Đề Yêu Cầu | Dữ Liệu Gửi Lên | Quyền Hạn | Mô Tả Chức Năng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/staff/login` | Không | `LoginStaffDto` | Công khai nội bộ | Đăng nhập tài khoản, xác thực mã băm PBKDF2 |
| `GET` | `/api/staff` | `x-staff-id: <id>` | Không | Nội bộ đã đăng nhập | Lấy danh sách nhân sự (đã loại bỏ passwordHash) |
| `GET` | `/api/staff/:id` | `x-staff-id: <id>` | Không | Nội bộ đã đăng nhập | Xem chi tiết thông tin một nhân viên |
| `POST` | `/api/staff` | `x-staff-id: <id>` | `CreateStaffDto` | `canManageStaff` (Admin) | Tạo tài khoản nhân viên mới kèm mật khẩu khởi tạo |
| `PUT` | `/api/staff/:id` | `x-staff-id: <id>` | `UpdateStaffDto` | `canManageStaff` (Admin) | Cập nhật phân quyền 7 nhóm vai trò |
| `PUT` | `/api/staff/:id/profile` | `x-staff-id: <id>` | `UpdateProfileDto` | Sở hữu tài khoản | Nhân viên cập nhật tên, số điện thoại, ca làm việc |
| `PATCH` | `/api/staff/:id/status` | `x-staff-id: <id>` | Không | `canManageStaff` (Admin) | Khóa hoặc kích hoạt lại tài khoản nhân viên |
| `POST` | `/api/staff/:id/reset-password` | `x-staff-id: <id>` | `ResetPasswordDto` | Admin hoặc Chính chủ | Đổi mật khẩu/mã PIN ca trực |

---

## 4. Phân Hệ Báo Cáo, Quản Lý Bàn & Đặt Món (`/api/reports`)

| Phương Thức | Đường Dẫn | Tiêu Đề Yêu Cầu | Dữ Liệu Gửi Lên | Quyền Hạn | Mô Tả Chức Năng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/tables` | Không | Không | Công khai nội bộ | Lấy trạng thái hoạt động thực tế của 8 bàn từ MySQL |
| `POST` | `/api/reports/active-orders` | Không | `CreateActiveOrderDto` | Công khai (Quét QR) | Khách gửi đơn gọi món từ điện thoại (Tạo mới hoặc gom phiên) |
| `POST` | `/api/reports/tables/complete` | `x-staff-id: <id>` | `CompleteTableDto` | `canCollectMoney` | Nhân viên giải phóng bàn về Trống (Chặn nếu chưa thu tiền) |
| `POST` | `/api/reports/payments` | `x-staff-id: <id>` | `CreatePaymentRecordDto` | `canCollectMoney` | Xác nhận phục vụ và thu tiền tại bàn (Idempotent) |
| `GET` | `/api/reports/overview` | `x-staff-id: <id>` | `?period=today` | `canViewOverview` | Thống kê doanh thu, biểu đồ giờ, top món bán chạy, bàn chờ lâu |
| `GET` | `/api/reports/payment-history` | `x-staff-id: <id>` | `QueryPaymentHistoryDto` | `canViewHistory` | Tra cứu lịch sử hóa đơn thu tiền có phân trang |
| `GET` | `/api/reports/payment-history/:id`| `x-staff-id: <id>` | Không | `canViewHistory` | Xem chi tiết snapshot món của hóa đơn |

