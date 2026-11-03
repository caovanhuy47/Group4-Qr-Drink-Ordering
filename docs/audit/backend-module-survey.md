# Báo Cáo Rà Soát Mock & Kiểm Kê Module Backend Toàn Diện

Dự án: **Huy CV — Quán Vỉa Hè (Nhóm 4)**  
Ngày thực hiện: **03/11/2026**  
Quy chuẩn: **Superpowers Systematic Review & Playwright Lifecycle (Zero DB Interference)**

---

## 1. Bảng Kiểm Kê Toàn Bộ 12 Module Hệ Thống

| STT | Phân hệ / Module | Route Frontend & Component | API Endpoint Backend | Controller / Service & Nguồn Dữ Liệu | Quyền Truy Cập (RBAC) | Trạng Thái Lưu Trữ & Sau F5 | Phân Loại & Đánh Giá Hiện Trạng |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Thực đơn khách, danh mục & chi tiết món** | `/#/`, `/#/lobby`<br>`FoodLobbyView.tsx`<br>`DishDetailModal.tsx` | `GET /api/dishes`<br>`GET /api/dishes/categories`<br>`GET /api/banners` | `DishesController` / `DishesService`<br>MySQL: Bảng `dishes`, `categories`, `banners` | Công khai (Public, không yêu cầu đăng nhập) | Dữ liệu nạp trực tiếp từ MySQL. F5 giữ nguyên dữ liệu thật. | **1. Có backend thật và đã nối 100%** |
| **2** | **Giỏ nháp, gửi món & theo dõi đơn** | `/#/cart`, `/#/order-confirm`, `/#/order-tracking`<br>`CartView.tsx`, `OrderConfirmationView.tsx`, `OrderTrackingView.tsx` | `POST /api/dishes/validate-order` | `DishesController` / `DishesService`<br>Xác thực giá và món với DB `dishes` | Công khai theo Bàn (Public QR) | Giỏ hàng lưu `sessionStorage` theo từng bàn. Đơn sau khi validate nạp vào `currentOrder`. | **1. Đã nối backend xác thực món thật** *(Phiên bàn chưa có bảng riêng, xem mục 4)* |
| **3** | **Tổng quan kinh doanh (Dashboard)** | `/#/staff/overview`<br>`OverviewDashboardView.tsx` | `GET /api/reports/overview` | `ReportsController` / `ReportsService`<br>MySQL: Bảng `table_session_records` | `canViewOverview` (Admin / Quản lý) | Dữ liệu tính toán từ các lượt thu tiền thực trong DB. F5 nạp số liệu thật. | **1. Có backend thật và đã nối 100%** *(Đã phòng thủ null-safe & ErrorBoundary)* |
| **4** | **Quản lý sơ đồ bàn & cấu hình QR** | `/#/staff/tables`<br>`TableManagementView.tsx`<br>`TableQrConfigModal.tsx` | *Chưa có endpoint REST riêng cho bàn* | Context in-memory `tables`<br>(Trước đây khởi tạo từ `INITIAL_TABLES`) | `canViewTables`, `canManageTables` | Hiện tại lưu trong RAM Context. Chưa có bảng `dining_tables` trong MySQL. | **3. Có giao diện nhưng thiếu bảng Database riêng** *(Đã chuẩn bị đề xuất cấu trúc)* |
| **5** | **Danh sách món theo bàn / Bếp** | `TableDetailDrawer.tsx` | Hiển thị snapshot món trong phiên bàn | Lấy từ `currentSession.items` | `canViewTables` | Gắn liền với phiên phục vụ bàn. | **1. Đã nối qua Drawer bàn và lịch sử thu tiền** |
| **6** | **Xác nhận phục vụ & thu tiền tại bàn** | `TableDetailDrawer.tsx`<br>`TableManagementView.tsx` | `POST /api/reports/payments` | `ReportsController` / `ReportsService`<br>MySQL: Bảng `table_session_records` | `canCollectMoney` (Admin, Thu ngân, Phục vụ) | Lưu vĩnh viễn vào MySQL, gán nhân viên thu thật, tính toán tổng tiền bất biến. | **1. Có backend thật và đã nối 100%** |
| **7** | **Lịch sử thu tiền & Tra cứu hóa đơn** | `/#/staff/history`<br>`PaymentHistoryView.tsx`<br>`PaymentDetailDrawer.tsx` | `GET /api/reports/payment-history`<br>`GET /api/reports/payment-history/:id` | `ReportsController` / `ReportsService`<br>MySQL: Bảng `table_session_records` | `canViewHistory` (Admin, Thu ngân, Phục vụ) | Truy vấn trực tiếp MySQL với phân trang, lọc theo ngày/ca/nhân viên. | **1. Có backend thật và đã nối 100%** |
| **8** | **Quản lý món ăn (Thực đơn nội bộ)** | `/#/staff/menu`<br>`MenuManagementView.tsx`<br>`MenuItemFormModal.tsx` | `GET /api/dishes?includeArchived=true`<br>`POST /api/dishes`<br>`PUT /api/dishes/:id`<br>`PATCH /api/dishes/:id/status`<br>`DELETE /api/dishes/:id` | `DishesController` / `DishesService`<br>MySQL: Bảng `dishes` | `canManageMenu` (Admin) | Thao tác CRUD đầy đủ, lưu trực tiếp vào MySQL. F5 không quay về mẫu. | **1. Có backend thật và đã nối 100%** |
| **9** | **Quản lý danh mục món ăn** | `/#/staff/categories`<br>`CategoryManagementView.tsx`<br>`CategoryFormModal.tsx` | `GET /api/dishes/categories`<br>`POST /api/dishes/categories`<br>`PUT /api/dishes/categories/:id`<br>`DELETE /api/dishes/categories/:id` | `DishesController` / `DishesService`<br>MySQL: Bảng `categories` | `canManageMenu` (Admin) | Thao tác CRUD danh mục, tự động đếm món liên kết trong DB. | **1. Có backend thật và đã nối 100%** |
| **10** | **Quản lý banner & Carousel trang chủ** | `/#/staff/banners`<br>`BannerManagementView.tsx`<br>`HeroBannerCarousel.tsx` | `GET /api/banners?all=true`<br>`POST /api/banners`<br>`PUT /api/banners/:id`<br>`PUT /api/banners/reorder`<br>`PATCH /api/banners/:id/status`<br>`DELETE /api/banners/:id` | `BannersController` / `BannersService`<br>MySQL: Bảng `banners` | `canManageBanners` (Admin) | Lưu thứ tự hiển thị, bật/tắt, ảnh và liên kết thật trong MySQL. | **1. Có backend thật và đã nối 100%** |
| **11** | **Nhân viên & Phân quyền (RBAC)** | `/#/staff/rbac`<br>`StaffRbacView.tsx`<br>`StaffFormModal.tsx` | `GET /api/staff`<br>`POST /api/staff`<br>`PUT /api/staff/:id`<br>`PATCH /api/staff/:id/status` | `StaffController` / `StaffService`<br>MySQL: Bảng `staff` | `canManageStaff` (Chỉ Admin) | Quản lý tài khoản, mã hóa PBKDF2, cấp/thu hồi 7 nhóm quyền trong MySQL. | **1. Có backend thật và đã nối 100%** |
| **12** | **Đăng nhập, Hồ sơ cá nhân & Đổi mật khẩu** | `/#/staff/login`<br>`/#/staff/profile`<br>`StaffLoginView.tsx`<br>`StaffProfileView.tsx` | `POST /api/staff/login`<br>`PUT /api/staff/:id/profile`<br>`POST /api/staff/:id/reset-password`<br>`GET /api/reports/payment-history` | `StaffController` / `StaffService`<br>MySQL: Bảng `staff` & `table_session_records` | Nhân viên sở hữu tài khoản | Đăng nhập xác thực PBKDF2; Đổi mật khẩu và cập nhật hồ sơ trực tiếp vào DB. Số liệu ca trực tính từ database thật. | **1. Đã hoàn thiện và kết nối backend thật 100%** *(Vừa loại bỏ stub alert và số liệu gán cứng)* |

---

## 2. Các Nguồn Mock Đã Được Rà Soát & Triệt Tiêu Trong Mã Nguồn

1. **Module Hồ sơ cá nhân (`StaffProfileView.tsx`):**
   - *Trước khi sửa:*
     - Hiển thị số liệu gán cứng: `28 đơn` và `2.450.000đ`.
     - Nút "Đổi PIN" gọi `alert('Chức năng đổi mã PIN: Cần kết nối API backend sau này.')`.
     - Không có chức năng chỉnh sửa họ tên, số điện thoại, ca trực.
   - *Sau khi sửa:*
     - Tính toán hiệu suất ca trực thật từ MySQL thông qua `reportsApi.fetchPaymentHistory`: đếm chính xác số hóa đơn và tổng tiền do `currentUser` xác nhận.
     - Triển khai Modal Đổi Mật khẩu / Mã PIN ca trực kết nối trực tiếp `POST /api/staff/:id/reset-password` với mã hóa an toàn PBKDF2.
     - Triển khai Modal Chỉnh sửa hồ sơ cá nhân kết nối trực tiếp `PUT /api/staff/:id/profile`.
2. **Khởi tạo dữ liệu mẫu trong Context (`RestaurantContext.tsx`):**
   - Toàn bộ các mảng mock tĩnh `INITIAL_DISHES`, `INITIAL_CATEGORIES`, `INITIAL_BANNERS`, `INITIAL_STAFF` đã được gỡ bỏ khỏi `useState`.
   - Các danh sách đều khởi tạo rỗng `[]` và nạp bất đồng bộ từ MySQL API kèm Skeleton Loaders chống giật layout.

---

## 3. Module Còn Thiếu Cấu Trúc Database & Đề Xuất Thiết Kế

Theo đúng ràng buộc của quy trình **"Tuyệt đối không can thiệp database, không tự chạy migration hoặc schema sync khi chưa được review"**, dự án ghi nhận hiện trạng module **Sơ đồ Bàn ăn (`DiningTable`)**:

### Hiện trạng
- Cơ sở dữ liệu MySQL hiện có 5 bảng: `dishes`, `categories`, `banners`, `staff`, `table_session_records`.
- Bảng danh mục bàn ăn (`DiningTable`) và các phiên đang gọi món thời gian thực (`active_table_sessions`) chưa có thực thể (entity) trong backend.
- Trên frontend, sơ đồ bàn hiện đang quản lý 8 bàn (`BÀN 01` đến `BÀN 27`) qua Context in-memory. Khi nhân viên xác nhận thu tiền, bản ghi lịch sử được lưu vĩnh viễn vào bảng `table_session_records`. Tuy nhiên nếu người dùng F5 tải lại trang, trạng thái mở bàn hoặc bàn mới tạo chưa được lưu bền vững.

### Đề xuất thiết kế bảng cho giai đoạn tiếp theo (Prepared for Review)
Khi được phép bổ sung bảng vào cơ sở dữ liệu MySQL:

```sql
-- 1. Bảng quản lý danh mục bàn ăn và mã QR
CREATE TABLE dining_tables (
  id VARCHAR(50) PRIMARY KEY,
  table_number VARCHAR(50) NOT NULL UNIQUE, -- e.g. "BÀN 01"
  area VARCHAR(100) NOT NULL DEFAULT 'Vỉa hè trước quán',
  status ENUM('empty', 'ordered', 'seated') NOT NULL DEFAULT 'empty',
  qr_code_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Bảng phiên phục vụ đang hoạt động (Active Sessions)
CREATE TABLE active_table_sessions (
  session_id VARCHAR(50) PRIMARY KEY, -- e.g. "LT-2801"
  table_id VARCHAR(50) NOT NULL,
  first_order_at DATETIME NOT NULL,
  status ENUM('ordered', 'seated') NOT NULL DEFAULT 'ordered',
  items JSON NOT NULL,
  total_quantity INT NOT NULL DEFAULT 0,
  total_amount INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES dining_tables(id) ON DELETE CASCADE
);
```
*(Lưu ý: Thiết kế trên ở trạng thái chuẩn bị review, chưa áp dụng vào database để bảo toàn nguyên vẹn dữ liệu vận hành hiện tại).*

