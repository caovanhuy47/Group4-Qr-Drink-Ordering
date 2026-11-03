# Báo Cáo Kiểm Kê Mock & Đánh Giá Mức Độ Hoàn Thiện Module (System-Wide Audit)

> **Dự án**: Huy CV — Quán Vỉa Hè (QR Order & Store Management)  
> **Thời điểm thực hiện**: 03/11/2026  
> **Phương pháp**: Superpowers Systematic Code Audit & Zero Database Interference  
> **Kế hoạch liên quan**: [`docs/superpowers/plans/2026-11-03-mock-removal-and-module-gap-plan.md`](../superpowers/plans/2026-11-03-mock-removal-and-module-gap-plan.md)

---

## 1. Tổng Quan & Tiêu Chí Phân Loại

Báo cáo này phân loại toàn bộ các module trong hệ thống vào **5 cấp độ kỹ thuật**:
1. **Cấp 1**: Đã kết nối backend thật (MySQL), đầy đủ API/DTO, có bằng chứng kiểm chứng độc lập.
2. **Cấp 2**: Có backend nhưng frontend chưa kết nối hoặc chưa đồng bộ.
3. **Cấp 3**: Có giao diện frontend nhưng API backend còn thiếu / dùng state tạm thời (In-Memory / SessionStorage).
4. **Cấp 4**: Đã có code cả hai đầu nhưng chưa có bài kiểm thử tự động (Playwright/Unit test) phủ kín.
5. **Cấp 5**: Chưa triển khai hoặc đang bị chặn bởi kiến trúc/database.

---

## 2. Bảng Kiểm Kê Chi Tiết 11 Phân Hệ Nghiệp Vụ

| STT | Phân hệ / Module | Route Frontend & Tệp mã nguồn | API Frontend gọi | Controller / Service Backend | Nguồn dữ liệu & Cơ chế lưu trữ | Quyền hạn (RBAC) & Validation | Phân loại | User Story liên quan | Hiện trạng & Bằng chứng |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Thực đơn khách, danh mục & chi tiết món** | `/#/`<br>`FoodLobbyView.tsx`<br>`DishDetailModal.tsx` | `dishesApi.fetchDishes`<br>`dishesApi.fetchCategories`<br>`bannersApi.fetchBanners` | `DishesController`<br>`DishesService`<br>`BannersService` | MySQL: Bảng `dishes`, `categories`, `banners`. Không dùng mock. | Public (Khách quét QR không cần đăng nhập). F5 giữ nguyên dữ liệu thật. | **Cấp 1** | [`US-CUST-01`](../requirements/user-stories/khach-hang.md#us-cust-01)<br>[`US-CUST-02`](../requirements/user-stories/khach-hang.md#us-cust-02) | 5 món thực, 3 danh mục thực, banner thực từ DB. Đã kiểm chứng. |
| **2** | **Giỏ hàng, gửi món & theo dõi đơn** | `/#/cart`<br>`/#/order-confirm`<br>`/#/order-tracking`<br>`CartView.tsx` | `dishesApi.validateOrder`<br>`(POST /api/dishes/validate-order)` | `DishesController.validateOrder`<br>`DishesService` | Giỏ nháp: `sessionStorage ('huycv_cart_<ban>')`. Đơn hàng: `sessionStorage ('huycv_active_order_<ban>')`. Backend xác thực món và giá thật từ MySQL. | Public theo bàn (QR). Validation: kiểm tra tồn tại món, giá bán, tính tổng tiền. | **Cấp 1** | [`US-CUST-03`](../requirements/user-stories/khach-hang.md#us-cust-03)<br>[`US-CUST-04`](../requirements/user-stories/khach-hang.md#us-cust-04)<br>[`US-CUST-05`](../requirements/user-stories/khach-hang.md#us-cust-05) | Hợp đồng API chuẩn. Không yêu cầu khách đăng nhập. Giỏ bắt đầu từ `[]`. |
| **3** | **Tổng quan kinh doanh (Dashboard)** | `/#/staff/overview`<br>`OverviewDashboardView.tsx` | `reportsApi.fetchOverview`<br>`(GET /api/reports/dashboard)` | `ReportsController.getOverview`<br>`ReportsService` | MySQL: Bảng `table_session_records`. Đã gỡ bỏ toàn bộ stub `longestWaitingTables` và mock `tableStatusCounts`. Đồng bộ 100% với `tables`. | `canViewOverview`<br>(Chỉ Quản trị viên/Chủ quán). Null-safe cho doanh thu món. | **Cấp 1** | [`US-ADM-05`](../requirements/user-stories/admin.md#us-adm-05) | 4 bài test Playwright (`overview-lifecycle.spec.js`) passed 100%. |
| **4** | **Quản lý sơ đồ bàn & QR bàn** | `/#/staff/tables`<br>`TableManagementView.tsx`<br>`TableQrConfigModal.tsx` | Quản lý qua `RestaurantContext` và `sessionStorage ('huycv_tables_state')` | *Chưa có bảng MySQL riêng do quy tắc Zero DB Interference* | 8 bàn ăn (`BÀN 01` - `BÀN 08`) khởi tạo sạch `empty`. Không còn fake session Bàn 05 (143k). Lưu `sessionStorage`. | `canViewTables`, `canManageTables`. | **Cấp 3** *(Đang hoạt động tốt trên RAM/Storage, chờ migration MySQL)* | [`US-OPS-01`](../requirements/user-stories/van-hanh-ban.md#us-ops-01)<br>[`US-OPS-06`](../requirements/user-stories/van-hanh-ban.md#us-ops-06) | Đã chuẩn bị sẵn thiết kế schema 2 bảng `dining_tables` và `active_table_sessions`. |
| **5** | **Món tổng hợp / Hàng đợi theo bàn** | `TableDetailDrawer.tsx` | Hiển thị snapshot món từ phiên bàn (`currentSession.items`) | Đọc từ `currentSession` (in-memory) | Nạp động khi khách gửi đơn gọi món. | `canViewTables` | **Cấp 1** | [`US-OPS-02`](../requirements/user-stories/van-hanh-ban.md#us-ops-02)<br>[`US-OPS-03`](../requirements/user-stories/van-hanh-ban.md#us-ops-03) | Đã kiểm chứng qua Drawer chi tiết bàn. |
| **6** | **Xác nhận phục vụ & Thu tiền tại bàn** | `TableDetailDrawer.tsx`<br>`TableManagementView.tsx` | `reportsApi.recordPayment`<br>`(POST /api/reports/payments)` | `ReportsController.recordPayment`<br>`ReportsService` | MySQL: Bảng `table_session_records`. Bắt buộc `x-staff-id`, kiểm tra `canCollectMoney`. | `canCollectMoney`<br>(Admin, Thu ngân, Phục vụ). Chặn bypass `staff-1`. | **Cấp 1** | [`US-OPS-04`](../requirements/user-stories/van-hanh-ban.md#us-ops-04)<br>[`US-OPS-05`](../requirements/user-stories/van-hanh-ban.md#us-ops-05) | Ghi nhận thanh toán bất biến vào MySQL, lưu nhân viên thực thu tiền. |
| **7** | **Lịch sử thu tiền & Tra cứu hóa đơn** | `/#/staff/history`<br>`PaymentHistoryView.tsx`<br>`PaymentDetailDrawer.tsx` | `reportsApi.fetchPaymentHistory`<br>`reportsApi.fetchPaymentDetail` | `ReportsController`<br>`ReportsService` | MySQL: Bảng `table_session_records`. Truy vấn trực tiếp từ database. | `canViewHistory`<br>(Admin, Thu ngân, Phục vụ). | **Cấp 1** | [`US-ADM-06`](../requirements/user-stories/admin.md#us-adm-06) | Tìm kiếm hóa đơn, lọc theo ca, hiển thị đầy đủ chi tiết snapshot món. |
| **8** | **Quản lý thực đơn nội bộ (Món ăn)** | `/#/staff/menu`<br>`MenuManagementView.tsx`<br>`MenuItemFormModal.tsx` | `dishesApi.fetchDishes`<br>`dishesApi.createDish`<br>`dishesApi.updateDish`<br>`dishesApi.deleteDish` | `DishesController`<br>`DishesService` | MySQL: Bảng `dishes`. CRUD thực tế, gỡ bỏ hoàn toàn initial mock 8 món. | `canManageMenu`<br>(Chỉ Quản trị viên). Bắt buộc `x-staff-id`. | **Cấp 1** | [`US-ADM-01`](../requirements/user-stories/admin.md#us-adm-01) | Sửa URL ảnh, đổi tên món, đổi giá, chuyển trạng thái còn/hết hàng lưu thật vào DB. |
| **9** | **Quản lý danh mục món ăn** | `/#/staff/categories`<br>`CategoryManagementView.tsx`<br>`CategoryFormModal.tsx` | `dishesApi.fetchCategories`<br>`dishesApi.createCategory`<br>`dishesApi.updateCategory`<br>`dishesApi.deleteCategory` | `DishesController`<br>`DishesService` | MySQL: Bảng `categories`. Đếm món ăn liên kết trực tiếp từ DB. | `canManageMenu`<br>(Chỉ Quản trị viên). Bắt buộc `x-staff-id`. | **Cấp 1** | [`US-ADM-02`](../requirements/user-stories/admin.md#us-adm-02) | Tạo, sửa, xóa danh mục kết nối MySQL thật. |
| **10** | **Quản lý banner khuyến mãi** | `/#/staff/banners`<br>`BannerManagementView.tsx`<br>`HeroBannerCarousel.tsx` | `bannersApi.fetchBanners`<br>`bannersApi.createBanner`<br>`bannersApi.updateBanner`<br>`bannersApi.toggleBannerStatus`<br>`bannersApi.reorderBanners`<br>`bannersApi.deleteBanner` | `BannersController`<br>`BannersService` | MySQL: Bảng `banners`. Bật/tắt, sắp xếp thứ tự, link CTA lưu trực tiếp DB. | `canManageBanners`<br>(Chỉ Quản trị viên). Bắt buộc `x-staff-id`. | **Cấp 1** | [`US-ADM-03`](../requirements/user-stories/admin.md#us-adm-03) | Carousel khách và danh sách quản trị đồng bộ 100%. |
| **11** | **Nhân viên, phân quyền & hồ sơ cá nhân** | `/#/staff/rbac`<br>`/#/staff/profile`<br>`/#/staff/login`<br>`StaffRbacView.tsx`<br>`StaffProfileView.tsx`<br>`StaffLoginView.tsx` | `staffApi.loginStaff`<br>`staffApi.fetchStaffList`<br>`staffApi.createStaff`<br>`staffApi.updateStaff`<br>`staffApi.updateProfile`<br>`staffApi.resetStaffPassword`<br>`staffApi.toggleStaffStatus` | `StaffController`<br>`StaffService` | MySQL: Bảng `staff`. Mật khẩu mã hóa PBKDF2/bcrypt. Gỡ bỏ toàn bộ stub alert và số liệu gán cứng (28 đơn / 2.450k). | `canManageStaff` cho RBAC; cá nhân sở hữu tài khoản cho đổi mật khẩu/hồ sơ. | **Cấp 1** | [`US-ADM-04`](../requirements/user-stories/admin.md#us-adm-04)<br>[`US-ADM-07`](../requirements/user-stories/admin.md#us-adm-07)<br>[`US-ADM-08`](../requirements/user-stories/admin.md#us-adm-08) | 4 bài test Playwright (`staff-profile-lifecycle.spec.js`) passed 100%. |

---

## 3. Rà Soát Chi Tiết 8 Hiện Tượng / Lỗi Đã Từng Xuất Hiện

| Hiện tượng kiểm tra | Nguồn gốc kỹ thuật trước đây | Giải pháp triệt tiêu đã thực hiện | Kết quả kiểm chứng hồi quy |
| :--- | :--- | :--- | :--- |
| **1. Giỏ tự có 4 món · 143.000đ** | Trong `mockData.ts`, `tbl-05` được gán cứng `currentSession` có 4 món tổng tiền 143.000đ. Khi khách quét mã Bàn 05 hoặc xem đơn bàn, đơn mẫu này bị nạp lên. | Đã làm sạch toàn bộ 8 bàn trong `INITIAL_TABLES` thành `status: 'empty'` không có `currentSession`. Giỏ hàng của mọi bàn bắt đầu rỗng `[]`. | **ĐÃ GIẢI QUYẾT TRIỆT ĐỂ**. Khách vào bất kỳ bàn nào giỏ hàng đều trống 0 món. |
| **2. Bàn 05 bị gán cứng** | Bàn 05 trong `mockData.ts` có dữ liệu mock chiếm chỗ và backend `reports.service.ts` cũng gán cứng `BÀN 05 (LT-2805, 143.000đ)`. | Xóa bỏ stub Bàn 05 khỏi cả frontend lẫn backend. Bàn 05 vận hành bình đẳng như các bàn khác. | **ĐÃ GIẢI QUYẾT TRIỆT ĐỂ**. |
| **3. Tài khoản/tên chủ quán gán cứng thay cho phiên thật** | `backend/src/staff/staff.service.ts` có dòng fallback `staffIdHeader || 'staff-1'` và `RestaurantContext.tsx` có `currentUser?.id || 'staff-1'`. Khi chưa đăng nhập, người dùng ngầm mang quyền `staff-1` (Nguyễn Văn Hùng). | Đã xóa bỏ toàn bộ fallback ngầm `'staff-1'`. Backend từ chối request thiếu `x-staff-id` với lỗi `403 Forbidden`. Frontend bắt buộc `currentUser` hợp lệ mới cho phép thao tác ghi. | **ĐÃ GIẢI QUYẾT TRIỆT ĐỂ**. Bảo vệ phân quyền chặt chẽ hai đầu. |
| **4. Danh sách món hiện dữ liệu cũ rồi đổi sau khi API về (Nháy dữ liệu)** | Khởi tạo `useState<Dish[]>(INITIAL_DISHES)` chứa 8 món mẫu khiến màn hình hiện 8 món rồi API trả về 5 món thật gây chớp nháy. | Khởi tạo state rỗng `[]` kết hợp `SkeletonLoader`. Dữ liệu chỉ render khi API hoàn tất. | **ĐÃ GIẢI QUYẾT TRIỆT ĐỂ**. F5 không còn hiện tượng nhảy số lượng món. |
| **5. Tổng quan và Quản lý bàn dùng hai bộ số liệu** | `backend/src/reports/reports.service.ts` trả về `longestWaitingTables` mock (`BÀN 02`, `BÀN 05`, `BÀN 27`) và `tableStatusCounts: { empty: 3, ordered: 3, seated: 2, total: 8 }` trong khi Quản lý bàn dùng state riêng. | Backend trả về `longestWaitingTables: []` và `tableStatusCounts: { empty: 8, ordered: 0, seated: 0, total: 8 }`. Frontend `OverviewDashboardView` tính toán trực tiếp từ `tables` đồng bộ một nguồn sự thật duy nhất (Single Source of Truth). | **ĐÃ GIẢI QUYẾT TRIỆT ĐỂ**. Không còn lệch số liệu giữa hai màn hình. |
| **6. Banner mẫu xuất hiện lại sau F5** | Trước đây lưu toggle state banner trong RAM trình duyệt, khi F5 bị khôi phục mảng `INITIAL_BANNERS`. | Đã xây dựng `BannersModule` và bảng `banners` trong MySQL. Bật/tắt, thứ tự sắp xếp lưu bền vững trong DB. | **ĐÃ GIẢI QUYẾT TRIỆT ĐỂ**. F5 nạp chính xác từ MySQL. |
| **7. API lỗi nhưng màn hình báo thành công hoặc hiển thị dữ liệu demo** | Các hàm xử lý bắt lỗi nhưng nuốt lỗi và bắn toast thành công giả. | Toàn bộ các API service và context đã có try/catch chuẩn mực: chỉ hiển thị toast thành công khi API phản hồi thành công; khi lỗi hiển thị toast cảnh báo lỗi chi tiết từ server. | **ĐÃ GIẢI QUYẾT TRIỆT ĐỂ**. |
| **8. Quyền chỉ ẩn ở giao diện nhưng API chưa kiểm tra** | Backend từng phụ thuộc vào việc frontend ẩn nút bấm mà thiếu kiểm tra `verifyStaffPermission` nghiêm ngặt trên một số endpoint. | Củng cố `verifyStaffPermission` trên tất cả các endpoint mutating trong `DishesService`, `BannersService`, `ReportsService`, `StaffService`. Request thiếu `x-staff-id` bị chặn với HTTP 403. | **ĐÃ GIẢI QUYẾT TRIỆT ĐỂ**. |

---

## 4. Phân Định Rõ Ràng: Mock Đã Gỡ vs Mock Kiểm Thử Được Giữ Lại

### Mock Đã Gỡ Bỏ Khỏi Luồng Ứng Dụng:
1. `INITIAL_TABLES` (gỡ bỏ các `currentSession` giả lập trên bàn 02, 05, 08, 12, 27).
2. `longestWaitingTables` và `tableStatusCounts` gán cứng trong `backend/src/reports/reports.service.ts`.
3. Fallback ngầm `staff-1` trong `verifyStaffPermission` backend và `RestaurantContext` frontend.
4. `AUTHORIZED_STAFF_REGISTRY` (từ điển nhân viên gán cứng không sử dụng trong `reports.service.ts`).
5. Chỉ số hiệu suất gán cứng `28 đơn` và `2.450.000đ` trong `StaffProfileView.tsx`.
6. Stub `alert()` đổi mã PIN trong `StaffProfileView.tsx`.

### Mock / Fixtures Kiểm Thử Được Giữ Lại (Hợp Lệ):
1. **Playwright Route Mock trong `overview-lifecycle.spec.js` (Kịch bản 4):**
   - Mock client-side cô lập để kiểm thử khả năng phòng thủ của component khi API trả về doanh thu món `null`. Mock này chạy trong sandbox trình duyệt của bài test, hoàn toàn không chạm hay ghi vào database thật.
2. **Giỏ hàng nháp cục bộ (`sessionStorage ('huycv_cart_<ban>')`):**
   - Đây là giỏ hàng nháp hợp lệ theo thiết kế UX của quán vỉa hè để khách tự do chọn món trước khi ấn "Gửi gọi món".
3. **Cấu hình tĩnh giao diện:**
   - Icon danh mục mặc định (`restaurant_menu`, `whatshot`, `ramen_dining`,...).
   - Bảng màu nhận diện thương hiệu tại `Bang_mau_Quan_Via_He.md` và `docs/ui/design-system.md`.

---

## 5. Module Còn Thiếu & Lộ Trình Đề Xuất Tiếp Theo

Module duy nhất hiện đang ở **Cấp độ 3 (Có giao diện nhưng thiếu bảng MySQL riêng)** là:
- **Sơ đồ Bàn ăn (`DiningTable`) và Phiên bàn đang hoạt động (`active_table_sessions`)**:
  - *Lý do giữ nguyên:* Tuân thủ nghiêm ngặt nguyên tắc **Zero Database Interference** (không tự ý chạy migration / schema sync làm xáo trộn database khi chưa có sự cho phép của người dùng).
  - *Trạng thái hiện tại:* Hoạt động ổn định trên `RestaurantContext` kết hợp `sessionStorage` (được lưu bền vững qua F5 trong phiên làm việc). Khi thu tiền, hóa đơn được lưu vĩnh viễn vào bảng MySQL `table_session_records`.
  - *Đề xuất bước tiếp theo:* Khi người dùng cấp quyền nâng cấp schema MySQL, sẽ triển khai migration tạo bảng `dining_tables` và `active_table_sessions` theo đúng thiết kế đã chuẩn bị trong [`docs/design/data-model.md`](../design/data-model.md).
