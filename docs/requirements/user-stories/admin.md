# User Stories: Phân Hệ Quản Trị Viên (Admin & Management)

Tài liệu đặc tả các User Stories dành riêng cho **Chủ quán, Quản lý điều hành và Kế toán quầy** của quán nước vỉa hè Huy CV.

---

### US-ADM-01: Đăng nhập nội bộ xác thực bảo mật PBKDF2

- **Mã định danh:** `US-ADM-01`
- **Vai trò:** Toàn bộ nhân sự nội bộ (Chủ quán, Thu ngân, Phục vụ, Bếp).
- **Tuyên bố:** Là nhân viên quán, tôi muốn đăng nhập bằng mã tài khoản/username và mật khẩu ca trực với cơ chế xác thực bảo mật 2 bước (Mật khẩu ➔ Xác nhận ca trực), để đảm bảo an toàn hệ thống và ghi nhận đúng ca làm việc hôm nay.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.

#### Luồng chính
1. Truy cập route nội bộ `/#/staff/login`.
2. Bước 1: Nhập tên đăng nhập (`username`) và mật khẩu. Bấm "Xác thực tài khoản ca trực".
3. Backend NestJS đối chiếu mật khẩu băm chuẩn PBKDF2 (1000 vòng lặp, salt 32 bytes, SHA-512) trong MySQL bảng `staff`.
4. Nếu tài khoản đang hoạt động (`status = 'active'`): Chuyển sang Bước 2 (chọn ca làm việc: Ca Sáng / Ca Chiều / Ca Tối).
5. Bấm "Bắt đầu ca trực": Lưu thông tin nhân viên vào `localStorage ('huycv_staff_user')`, thanh điều hướng Sidebar cập nhật quyền động theo 7 nhóm quyền và chuyển vào màn hình đầu tiên được cấp phép.

#### Ngoại lệ
- **E1. Tài khoản bị tạm khóa (`status = 'suspended'`):** Chặn đăng nhập với mã lỗi HTTP 403: "Tài khoản của bạn đang bị tạm khóa. Vui lòng liên hệ Quản lý."
- **E2. Sai mật khẩu:** Báo lỗi rõ ràng bằng tiếng Việt, không để lộ cấu trúc băm.

#### Tiêu chí nghiệm thu
- **AC-ADM-01.1:** *Cho trước* tài khoản `hungnv` / `1234`, *Khi* hoàn tất 2 bước đăng nhập, *Thì* đăng nhập thành công vào trang quản trị với vai trò Chủ quán / Quản lý.
- **AC-ADM-01.2:** *Cho trước* tài khoản bị khóa trong DB, *Khi* nhập đúng mật khẩu, *Thì* hệ thống vẫn từ chối và hiển thị banner cảnh báo tài khoản bị tạm khóa.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/views/admin/StaffLoginView.tsx`, `backend/src/staff/staff.service.ts` (`login`).

---

### US-ADM-02: Quản lý thực đơn món ăn (CRUD Món Ăn MySQL)

- **Mã định danh:** `US-ADM-02`
- **Vai trò:** Chủ quán (Admin) có quyền `canManageMenu`.
- **Tuyên bố:** Là người quản lý quán, tôi muốn thêm món ăn mới, sửa giá, thay ảnh URL, cập nhật danh sách size/topping, gắn nhãn (Món mới, Bán chạy) và bật/tắt nhanh trạng thái Còn món/Hết món, để thực đơn khách quét QR luôn khớp với tình trạng nguyên liệu thực tế tại quán.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.

#### Luồng chính
1. Truy cập `/#/staff/menu`.
2. Danh sách món nạp từ MySQL `GET /api/dishes?includeArchived=true`.
3. Bấm "Thêm món mới": Mở modal biểu mẫu thêm món.
4. Nhập tên món, chọn danh mục, giá bán, giá cũ (nếu có giảm giá), URL ảnh, mô tả, nhãn badge.
5. Thêm các tùy chọn Size (tên size + giá cộng thêm) và Topping.
6. Bấm Lưu: Frontend lọc bỏ các trường thừa (`categoryName`, `createdAt`...) thông qua `sanitizeDishPayload`, gửi lên `POST /api/dishes`.
7. Backend kiểm tra hợp lệ DTO, lưu vào MySQL và phản hồi bản ghi mới.
8. Bảng món cập nhật tức thì, sảnh khách quét QR F5 thấy ngay món mới.
9. Bấm toggle switch trên cột "Trạng thái": Gọi `PATCH /api/dishes/:id/status` để bật/tắt còn món/hết món tức thì.

#### Tiêu chí nghiệm thu
- **AC-ADM-02.1:** *Cho trước* form sửa món, *Khi* quản lý đổi tên và thay URL ảnh rồi bấm Lưu, *Thì* backend phản hồi HTTP 200 thành công, không gặp lỗi `"property categoryName should not exist"`.
- **AC-ADM-02.2:** *Cho trước* một món đang bật, *Khi* bấm toggle tắt trạng thái, *Thì* món chuyển sang "Hết món" trong MySQL và khách quét QR thấy món bị mờ kèm nút disabled.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/views/admin/MenuManagementView.tsx`, `backend/src/dishes/dishes.controller.ts`.

---

### US-ADM-03: Quản lý danh mục món ăn (CRUD Danh Mục)

- **Mã định danh:** `US-ADM-03`
- **Vai trò:** Chủ quán có quyền `canManageMenu`.
- **Tuyên bố:** Là người quản lý, tôi muốn thêm/sửa/xóa các danh mục món (ví dụ: Cà phê, Trà hoa quả, Ăn vặt...), sắp xếp thứ tự hiển thị và xem số lượng món đang có trong từng danh mục, để thực đơn được tổ chức ngăn nắp, khách dễ tìm món.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.

#### Tiêu chí nghiệm thu
- **AC-ADM-03.1:** *Cho trước* trang Quản lý danh mục `/#/staff/categories`, *Khi* nạp trang, *Thì* số lượng món trên từng thẻ danh mục được tính toán từ các món thật trong MySQL, không snap nháy số mock.
- **AC-ADM-03.2:** *Cho trước* danh mục đang chứa 3 món ăn, *Khi* quản lý bấm xóa danh mục, *Thì* hệ thống kích hoạt cơ chế bảo vệ toàn vẹn: từ chối xóa hoặc chuyển các món liên quan về danh mục mặc định để tránh mồ côi dữ liệu.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/views/admin/CategoryManagementView.tsx`, `backend/src/dishes/dishes.service.ts` (`categories`).

---

### US-ADM-04: Quản lý Banner khuyến mãi & Carousel trang chủ

- **Mã định danh:** `US-ADM-04`
- **Vai trò:** Chủ quán có quyền `canManageBanners`.
- **Tuyên bố:** Là người quản lý quán, tôi muốn tạo các banner quảng cáo giờ vàng (ví dụ: Combo Giờ Vàng 16h-19h), đổi thứ tự hiển thị carousel, bật/tắt banner hoặc gán liên kết mở nhanh món ăn/danh mục, để tăng doanh số bán hàng trong các khung giờ cao điểm.
- **Ưu tiên:** P1 (Quan trọng).
- **Phạm vi:** MVP.

#### Tiêu chí nghiệm thu
- **AC-ADM-04.1:** *Cho trước* trang Quản lý banner `/#/staff/banners`, *Khi* tạo banner mới kèm tag "Giờ Vàng" và bấm Lưu, *Thì* dữ liệu lưu vào MySQL bảng `banners` và xuất hiện trên carousel sảnh khách.
- **AC-ADM-04.2:** *Cho trước* nhân viên không có quyền `canManageBanners`, *Khi* gửi request `POST /api/banners`, *Thì* backend trả về HTTP 403 Forbidden.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/views/admin/BannerManagementView.tsx`, `backend/src/banners/banners.controller.ts`.

---

### US-ADM-05: Quản lý nhân viên & Phân quyền 7 nhóm vai trò

- **Mã định danh:** `US-ADM-05`
- **Vai trò:** Duy nhất Chủ quán tối cao (Admin) có quyền `canManageStaff`.
- **Tuyên bố:** Là chủ quán, tôi muốn tạo tài khoản cho nhân viên mới, phân công ca trực, bật/tắt từng nhóm quyền độc lập (Xem bàn, Thu tiền, Quản lý bàn, Xem tổng quan, Xem lịch sử, Sửa menu, Sửa banner), và có thể tạm khóa tài khoản khi nhân viên nghỉ việc, đồng thời hệ thống phải bảo vệ không cho phép khóa hoặc hạ quyền tài khoản Admin duy nhất còn lại.
- **Ưu tiên:** P0 (Bảo mật RBAC Cốt lõi).
- **Phạm vi:** MVP.

#### Tiêu chí nghiệm thu
- **AC-ADM-05.1:** *Cho trước* nhân viên `staff-3` đang là phục vụ, *Khi* Admin bật quyền `canCollectMoney = true`, *Thì* nhân viên này lập tức có quyền xác nhận thu tiền tại bàn; khi tắt quyền này, thao tác thu tiền bị chặn ngay lập tức với HTTP 403.
- **AC-ADM-05.2:** *Cho trước* hệ thống chỉ có 1 Admin (`hungnv`), *Khi* Admin thử khóa tài khoản chính mình hoặc hạ vai trò về nhân viên thường, *Thì* hệ thống kích hoạt cơ chế tự vệ, từ chối với HTTP 400 Bad Request kèm thông báo: "Không thể khóa hoặc hạ quyền tài khoản Quản trị viên duy nhất của hệ thống."

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/views/admin/StaffRbacView.tsx`, `backend/src/staff/staff.service.ts`.

---

### US-ADM-06: Bảng điều khiển Tổng quan kinh doanh thực thu (Dashboard)

- **Mã định danh:** `US-ADM-06`
- **Vai trò:** Chủ quán có quyền `canViewOverview`.
- **Tuyên bố:** Là chủ quán, tôi muốn xem các chỉ số thống kê kinh doanh theo ngày hôm nay, 7 ngày qua hoặc tháng này (Tổng tiền thực thu, Số lượt bàn đã phục vụ, Tổng số ly/món đã bán, Số bàn đang có khách, Biểu đồ phân bổ doanh thu theo giờ, Top 5 món bán chạy nhất), để tôi nắm bắt tình hình kinh doanh của quán theo thời gian thực mà không sợ bị sập giao diện trắng màn hình.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.

#### Tiêu chí nghiệm thu
- **AC-ADM-06.1:** *Cho trước* route `/#/staff/overview`, *Khi* chuyển từ bất kỳ trang nào tới Tổng quan hoặc bấm F5 tải lại, *Thì* giao diện hiển thị trơn tru, biểu đồ và số liệu nạp từ MySQL `table_session_records`, không bao giờ xuất hiện màn hình trắng trơn.
- **AC-ADM-06.2:** *Cho trước* tình huống API trả về món có trường `revenue` là `null`, *Khi* component render, *Thì* hệ thống tự động xử lý phòng thủ hiển thị `0đ`, không ném ra ngoại lệ `TypeError`.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/views/admin/OverviewDashboardView.tsx`, `backend/src/reports/reports.service.ts` (`getOverview`), `tests/playwright/overview-lifecycle.spec.js`.

---

### US-ADM-07: Tra cứu & Xuất hóa đơn Lịch sử thu tiền

- **Mã định danh:** `US-ADM-07`
- **Vai trò:** Thu ngân, Kế toán, Quản lý có quyền `canViewHistory`.
- **Tuyên bố:** Là người quản lý sổ sách, tôi muốn xem danh sách toàn bộ các lượt bàn đã thu tiền, lọc theo ngày/ca trực/nhân viên thu tiền, bấm xem chi tiết từng món và in lại hóa đơn tính tiền nếu khách yêu cầu, để phục vụ công tác đối soát và kiểm toán tài chính.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.

#### Tiêu chí nghiệm thu
- **AC-ADM-07.1:** *Cho trước* trang Lịch sử thu tiền `/#/staff/history`, *Khi* mở danh sách, *Thì* toàn bộ dữ liệu nạp từ API `GET /api/reports/payment-history` của MySQL, hiển thị đầy đủ mã phiên, số bàn, giờ thu, người thu và tổng tiền.
- **AC-ADM-07.2:** *Cho trước* một bản ghi hóa đơn, *Khi* bấm icon con mắt, *Thì* Drawer chi tiết lượt thu mở ra hiển thị snapshot bất biến của các món đã bán trong lượt đó.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/views/admin/PaymentHistoryView.tsx`, `frontend/src/components/admin/PaymentDetailDrawer.tsx`.

---

### US-ADM-08: Quản lý hồ sơ cá nhân và đổi mã PIN ca trực

- **Mã định danh:** `US-ADM-08`
- **Vai trò:** Mọi nhân sự nội bộ đã đăng nhập.
- **Tuyên bố:** Là nhân viên, tôi muốn truy cập trang hồ sơ cá nhân để xem số đơn và doanh thu tôi đã trực tiếp thu trong ca trực hôm nay (lấy từ dữ liệu thật trong DB), chỉnh sửa số điện thoại/họ tên và đổi mật khẩu/mã PIN ca trực của riêng tôi, để bảo mật tài khoản cá nhân.
- **Ưu tiên:** P1 (Quan trọng).
- **Phạm vi:** MVP.

#### Tiêu chí nghiệm thu
- **AC-ADM-08.1:** *Cho trước* trang `/#/staff/profile`, *Khi* nạp trang, *Thì* hai thẻ "Đơn đã phục vụ" và "Doanh số thu tại bàn" tính toán động từ MySQL theo tên của tài khoản đăng nhập, không dùng số liệu giả 28 đơn / 2.450.000đ.
- **AC-ADM-08.2:** *Cho trước* modal Đổi mã PIN, *Khi* nhập mật khẩu mới và xác nhận mật khẩu hợp lệ (>= 4 ký tự) rồi bấm Cập nhật, *Thì* hệ thống gọi API `POST /api/staff/:id/reset-password` băm mật khẩu mới vào MySQL và hiển thị toast thành công.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/views/admin/StaffProfileView.tsx`, `tests/playwright/staff-profile-lifecycle.spec.js`.

---

## 3. Các Chức Năng Đề Xuất Mở Rộng (Post-MVP Extensions)

- **US-EXT-01: Bảng dữ liệu bàn ăn bền vững trong Database**
  - *Mô tả:* Bổ sung bảng `dining_tables` và `active_table_sessions` vào MySQL để lưu trữ vĩnh viễn cấu hình bàn và các phiên đang gọi món dở dang qua các lần restart server.
  - *Trạng thái:* [CHỜ DUYỆT SCHEMA] (Đã chuẩn bị thiết kế trong `docs/audit/backend-module-survey.md`).
- **US-EXT-02: Đồng bộ phiên gọi món đa thiết bị theo thời gian thực (WebSocket / SSE)**
  - *Mô tả:* Khi khách bàn A gửi đơn, màn hình thu ngân và bếp tự động cập nhật mà không cần bấm nút F5/Refresh.
  - *Trạng thái:* [CHỜ DUYỆT KIẾN TRÚC].

