# Group4-Qr-Drink-Ordering
Huy CV — Website đặt món bằng mã QR và quản lý vận hành quán nước vỉa hè (Nhóm 4).

## Giới thiệu dự án
- Thương hiệu: **Huy CV**
- Đề tài: **Website đặt món bằng mã QR và quản lý vận hành quán nước vỉa hè — Nhóm 4**

### Cấu trúc dự án
- `frontend/`: Ứng dụng giao diện khách hàng & quản lý (React 19 + TypeScript + Vite).
- `backend/`: API dịch vụ & nghiệp vụ hệ thống (NestJS 12 + TypeScript + TypeORM + MySQL).
- `package.json`: Quản lý và điều phối lệnh chạy toàn dự án.

### Hướng dẫn cài đặt & khởi động

1. **Cài đặt dependencies**:
```bash
# Cài đặt cho backend
npm --prefix backend install

# Cài đặt cho frontend
npm --prefix frontend install
```

2. **Cấu hình môi trường**:
- Sao chép `backend/.env.example` thành `backend/.env` và cập nhật thông tin kết nối cơ sở dữ liệu MySQL.

3. **Khởi động ứng dụng**:
```bash
# Chạy backend (cổng 3000)
npm run dev
# hoặc: npm run dev:back

# Chạy frontend (cổng 5173)
npm run dev:front
```

---

## Kiến trúc giao diện Frontend (Huy CV — Quán Nước Vỉa Hè)

Giao diện frontend được hoàn thiện 100% từ tài liệu thiết kế mẫu trong `docs/`, mang thương hiệu **Huy CV**, tự động co giãn theo viewport thực tế của trình duyệt (Mobile, Tablet, Laptop, Wide Desktop) mà không dùng bất kỳ thanh demo hay khung giả lập nào.

### 1. Bảng màu & Phong cách thiết kế (Theo `Bang_mau_Quan_Via_He.md` & `DESIGN.md`)
- **Màu chủ đạo (Primary)**: Đỏ gạch nung (`#B93824` / `terracotta`)
- **Màu phụ trợ (Secondary)**: Vàng ấm trà tắc (`#F4B740` / `golden-warm`)
- **Màu nền (Background)**: Kem nhạt hoài niệm (`#FFF8EF` / `cream-light`)
- **Màu tạo điểm nhấn (Accent)**: Xanh lá đậm thảo mộc (`#356044` / `herbal-green`)
- **Màu chữ chính (Text Main)**: Nâu đen đậm (`#1F160F` / `surface-dark`)
- **Typography**: `Be Vietnam Pro` (thân thiện tiếng Việt) & `Epilogue` (tiêu đề cá tính, vững chãi).

### 2. Các màn hình & Cấu trúc điều hướng URL Hash Router (`frontend/src/views/`)
Ứng dụng sử dụng chuẩn URL Hash điều hướng độc lập, hỗ trợ reload, bookmark và nút Back/Forward của trình duyệt:

- **Phân hệ Khách hàng (Customer Routes)**:
  - `#/` (hoặc `#/lobby`): **Sảnh gọi món** — Banner giờ vàng, tab danh mục trượt ngang, lưới thực đơn, tìm kiếm, giỏ hàng mini, nút tài khoản khách hàng (Đăng nhập / Đăng ký thành viên).
  - `#/cart`: **Giỏ hàng** — Danh sách món, tăng giảm số lượng, ghi chú đơn, **không áp dụng voucher** (tổng thanh toán bằng đúng tổng tiền món ăn), lưu ý quy trình phục vụ và thanh toán khi nhận món.
  - `#/order-confirm`: **Xác nhận đặt món** — Xác nhận bàn (Bàn 05), tổng số tiền chính xác, gửi đơn vào bếp.
  - `#/order-tracking`: **Theo dõi tiến trình đơn hàng** — Timeline chuẩn FIFO (Đã gửi ➔ Đang làm ➔ Đã phục vụ & Thu đủ tiền), ghi chú giữ chỗ ngồi theo quy tắc quán vỉa hè.

- **Phân hệ Nhân viên & Quản trị (Staff / Admin Routes)**:
  - `#/staff/login`: **Cổng bảo mật nội bộ** — Đăng nhập bằng Mã nhân viên/Username + Mật khẩu (bảo mật, không phơi bày danh sách nhân viên, không PIN mặc định); xác nhận ca trực 2 bước.
  - `#/staff/overview`: **Tổng quan kinh doanh** — 4 khối chỉ số thực thu, biểu đồ tiền đã thu theo giờ/ngày từ database MySQL, món bán chạy nhất trong kỳ, cảnh báo bàn chờ lâu cần ưu tiên phục vụ, danh sách lượt vừa thu.
  - `#/staff/tables`: **Quản lý bàn (Vận hành trực tiếp)** — Theo dõi gọi món, phục vụ và tình trạng bàn với 3 trạng thái duy nhất (*Trống*, *Order thành công*, *Đang ngồi*); drawer xem chi tiết món; nút xác nhận *“Đã phục vụ và thu tiền”*; nút *“Bàn trống”*; modal *“Cấu hình bàn & QR”* dành riêng cho Admin.
  - `#/staff/history`: **Lịch sử thu tiền & Chi tiết lượt** — Đối soát toàn bộ các lượt bàn đã thu tiền; bộ lọc theo ngày, số bàn, người xác nhận; tổng tiền và tổng phần món toàn bộ kết quả lọc; drawer chi tiết snapshot món, thời điểm bắt đầu/thu/rời bàn.
  - `#/staff/menu`: **Quản lý thực đơn** — Bật/tắt còn món/hết món tức thì, mở modal thêm/sửa món, xóa món.
  - `#/staff/categories`: **Quản lý danh mục** — Thêm danh mục, gán icon, phân loại món.
  - `#/staff/banners`: **Quản lý banner** — Bật/tắt ưu đãi giờ vàng.
  - `#/staff/rbac`: **Nhân sự & Phân quyền** — Cấp quyền xác nhận thu tiền tại bàn theo YC-06/10.
  - `#/staff/profile`: **Tài khoản & Ca trực** — Báo cáo doanh thu ca trực, chuông báo đơn mới.

### 3. Thành phần dùng chung (`frontend/src/components/`)
- `CustomerHeader.tsx`: Header khách hàng đồng bộ thương hiệu **Huy CV** (Bàn 05, chuông gọi phục vụ, tìm kiếm, giỏ hàng).
- `DishCard.tsx`: Thẻ món ăn hiển thị ảnh, tag Bán chạy/Mới/Chay, giá tiền, tự co giãn theo grid/flex.
- `DishDetailModal.tsx`: Tùy biến món ăn (Bottom Sheet trên mobile, Pop-up Modal căn giữa trên desktop; chọn size, topping, ghi chú, stepper >= 44px).
- `FloatingCartBar.tsx`: Thanh giỏ hàng nổi chân trang mobile tự động hiển thị khi giỏ có món.
- `AdminLayout.tsx`: Khung điều hướng quản trị với Sidebar trên desktop và Drawer trượt trên mobile.
- `ToastContainer.tsx`: Hệ thống thông báo toast phản hồi tương tác người dùng.

### 4. Kết quả kiểm tra F12 / DevTools tự động
Đã kiểm chứng bằng DevTools tự động (Chrome CDP) trên 5 kích thước viewport đại diện:
- `360 × 800` (Điện thoại hẹp): 0 overflow-x, chạm dễ dàng.
- `390 × 844` (Điện thoại iPhone phổ biến): 0 overflow-x, Bottom Sheet hoạt động chuẩn.
- `768 × 1024` (Tablet iPad): Co giãn 2 cột mượt mà.
- `1366 × 768` (Laptop phổ biến): Modal pop-up căn giữa, sidebar cố định.
- `1536 × 864` (Màn hình rộng): Tận dụng lưới 4 cột, bố cục cân đối.

### 5. Chi tiết Sửa lỗi & Tối ưu hóa UI/UX Khu vực Khách hàng (User)

1. **Khắc phục triệt để lỗi Banner bị che/cắt dưới Header**:
   - *Nguyên nhân*: Header desktop trước đó xếp 2 hàng (cao 120px) cộng thêm thiếu thiết lập `scrollRestoration: manual`, khiến khi người dùng cuộn hoặc điều hướng quay lại, vị trí cuộn cũ đẩy phần đầu banner lọt dưới header sticky. Đồng thời thanh danh mục sticky offset bị lệch làm che khuất nội dung banner.
   - *Giải pháp*:
     - Tối ưu header desktop thành 1 hàng chuẩn (cao 65px), đưa thanh tìm kiếm vào giữa logo và các nút hành động.
     - Điều chỉnh offset sticky của danh mục thành `md:top-[64px]` và `top-[98px]` trên di động.
     - Tự động cuộn mượt lên đỉnh (`window.scrollTo(0, 0)`) mỗi khi chuyển route hoặc quay lại sảnh.
     - Thiết lập `history.scrollRestoration = 'manual'` ngăn trình duyệt nhớ vị trí cuộn lửng lơ.

2. **Tối ưu Thanh Giỏ Hàng Nổi (`FloatingCartBar`) & Khoảng đệm**:
   - *Vấn đề*: Thanh giỏ hàng nổi màu đỏ cam trước đây có nguy cơ xuất hiện và che mất nút bấm/giá tiền của món ăn ở màn hình laptop (như phản ánh trong ảnh chụp thực tế), trong khi trên laptop đã có nút giỏ hàng to rõ ràng ở Header.
   - *Khắc phục*:
     - Bổ sung quy tắc CSS cưỡng chế `@media (min-width: 768px) { .floating-cart-bar-mobile, .md\:hidden { display: none !important; } }` trong `index.css` để bảo đảm ẩn triệt để 100% trên màn hình laptop/desktop.
     - Tăng khoảng đệm chân trang `pb-36 sm:pb-36 md:pb-16` trong `FoodLobbyView.tsx` giúp nội dung món ăn luôn hiển thị trọn vẹn, không bị che khuất ở bất kỳ độ phân giải nào.

3. **Gỡ bỏ hoàn toàn Voucher khỏi luồng User/QR**:
   - Theo yêu cầu mới: User (kể cả khách quét QR và khách đăng nhập) không sử dụng voucher trong phạm vi hiện tại.
   - Đã gỡ bỏ toàn bộ khối "Mã giảm giá & Voucher", ô nhập mã, nút áp dụng, mã gợi ý, thẻ mã đang áp dụng khỏi `CartView.tsx` và `OrderConfirmationView.tsx`.
   - Tổng thanh toán được tính đúng 100% bằng tổng tiền các món ăn (ví dụ món 25.000đ thì thanh toán đúng 25.000đ).

4. **Tách biệt Cổng Khách Hàng và Cổng Nội Bộ Nhân Viên**:
   - *Khách hàng*: Thêm nút tài khoản khách hàng trên `CustomerHeader.tsx`, mở modal `CustomerAuthModal.tsx` hỗ trợ Đăng nhập & Đăng ký thành viên, có toggle ẩn/hiện mật khẩu, kiểm tra số điện thoại. Khách vãng lai quét QR vẫn chọn món và gửi đơn bình thường mà không bắt buộc đăng nhập, chuyển đổi giữa đăng nhập và chọn món luôn bảo toàn giỏ hàng và Bàn 05.
   - *Nhân viên / Quản lý*: Chuẩn hóa trang `StaffLoginView.tsx` thành form bảo mật nội bộ, loại bỏ danh sách chọn tên nhân viên công khai, bỏ PIN mặc định 1234, form xác thực 2 bước (Mã/Username + Mật khẩu ca trực ➔ Xác nhận ca trực).

5. **Thay thế Alert bằng In-App Toast hiện đại**:
   - Tích hợp hệ thống thông báo `InAppToast` trực quan khi khách hàng bấm "Gọi phục vụ", đăng nhập thành công, hoặc thêm món vào giỏ, tự động biến mất sau 3.5 giây.

6. **Tối ưu Responsive cho điện thoại siêu hẹp (360 × 800)**:
   - Thu gọn nhãn chữ trên các nút header (`hidden sm:inline`), đảm bảo `scrollWidth: 360px / innerWidth: 360px` (0% overflow-x).

---

## Quy Chuẩn Kiểm Thử Tự Động (Testing)

Hệ thống áp dụng quy chuẩn kiểm thử E2E Playwright với **ràng buộc cốt lõi không can thiệp Database** (Zero DB Interference). Chi tiết xem tại:
- [Tài liệu Vòng đời Kiểm thử Playwright (6 Pha)](docs/testing/playwright-lifecycle.md)

Lệnh chạy kiểm thử:
```bash
# Chạy kiểm thử tự động Playwright E2E
npx playwright test

# Chạy script xác minh chi tiết kèm xuất báo cáo và bằng chứng ảnh
node scratch/verify_overview_lifecycle.js
```

