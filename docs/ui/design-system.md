# Hệ Thống Thiết Kế & Hướng Dẫn Giao Diện (Design System & UI/UX)

Tài liệu quy chuẩn phong cách thiết kế, bảng màu thương hiệu, typography và các quyết định responsive cho hệ thống **Huy CV — Quán Vỉa Hè**.

---

## 1. Phong Cách Định Vị Thương Hiệu

- **Khái niệm:** Ấm áp — Mộc mạc — Gần gũi — Đậm chất văn hóa ẩm thực đường phố và vỉa hè Việt Nam.
- **Tỷ lệ phối màu vàng (60 - 30 - 10):**
  - **60% Nền không gian:** Kem ấm hoài niệm (`#FFF8F5` / `#FFF8EF`) và trắng tinh khiết (`#FFFFFF`).
  - **30% Cấu trúc & Nội dung:** Chữ nâu đen đậm (`#26190C` / `#2B2118`), chữ phụ (`#59413D` / `#6B5848`) và viền be nhẹ (`#E1BFB9` / `#E4D4C3`).
  - **10% Điểm nhấn thương hiệu:** Đỏ gạch nung (`#971F0E` / `#B93824`) cho các hành động chính (Thêm món, Gửi đơn, Thu tiền) và Vàng ấm trà tắc (`#F4B740` / `#7D5800`) cho khuyến mãi, huy hiệu món bán chạy.

---

## 2. Bảng Token Màu Sắc (Color Tokens)

| Token | Mã HEX | Vai Trò & Vị Trí Sử Dụng |
| :--- | :--- | :--- |
| `primary` | `#971F0E` | Màu thương hiệu chính, tiêu đề nổi bật, nút hành động chính |
| `primary-container` | `#B93824` | Nút gửi đơn, nút thêm giỏ hàng, avatar đại diện |
| `primary-fixed` | `#FFDAD4` | Viền nhãn mềm, nền huy hiệu nhẹ, thanh xoay preloader |
| `on-primary` | `#FFFFFF` | Màu chữ và icon trên nền đỏ thương hiệu |
| `secondary` | `#7D5800` | Nhãn món bán chạy, huy hiệu sao đánh giá, điểm nhấn vàng |
| `secondary-container`| `#FDBF47` | Nền nhãn nổi bật, thanh tiến trình |
| `tertiary` | `#2C563B` | Trạng thái thành công, thông báo đã thu tiền xong |
| `background` / `surface`| `#FFF8F5` | Nền tổng thể toàn bộ trang, mang lại cảm giác dễ chịu |
| `surface-container-lowest` | `#FFFFFF` | Nền thẻ món ăn, modal pop-up, bảng danh sách |
| `surface-container-low` | `#FFF1E8` | Nền ô nhập liệu input, thanh tab không chọn |
| `surface-container` | `#FFEADB` | Nền các khối thống kê phụ, thanh phân cách |
| `border` / `outline`| `#8D716B` | Đường viền các thẻ, phân cách nội dung |
| `error` | `#BA1A1A` | Báo lỗi, nút hủy, cảnh báo bàn chưa thu tiền |

---

## 3. Typography (Nghệ Thuật Chữ)

Hệ thống kết hợp hài hòa giữa 2 bộ phông chữ Google Fonts chuẩn tiếng Việt:
1. **Phông Tiêu Đề (`font-headline`):** `Epilogue` (font-weight: 600, 700, 800)
   - Sử dụng cho: Logo Huy CV, tiêu đề trang, tên món ăn nổi bật, số tiền lớn.
   - Mang lại cảm giác vững chãi, cá tính và hiện đại.
2. **Phông Thân Bài (`font-body` / `font-sans`):** `Be Vietnam Pro` (font-weight: 400, 500, 600, 700)
   - Sử dụng cho: Toàn bộ nội dung mô tả, nút bấm, bảng dữ liệu, form nhập liệu.
   - Hiển thị dấu tiếng Việt sắc nét, dễ đọc trên màn hình điện thoại dưới ánh sáng ngoài trời.

---

## 4. Chuẩn Hóa Responsive & Viewport Phổ Biến

Hệ thống được thiết kế theo tư duy **Mobile-First**, tự động co giãn tự nhiên theo viewport thực tế của trình duyệt mà không dùng iframe giả lập:

| Kích Thước Viewport | Thiết Bị Đại Diện | Quyết Định Thiết Kế Giao Diện |
| :--- | :--- | :--- |
| **`360 × 800`** | Điện thoại Android phổ thông | 0% overflow ngang (`scrollWidth === innerWidth`), nút rút gọn nhãn text, giỏ hàng nổi chân trang |
| **`390 × 844`** | iPhone 12/13/14/15 | BottomSheet trượt mượt mà từ đáy màn hình, thanh danh mục sticky trượt ngang mượt mà |
| **`768 × 1024`** | Máy tính bảng iPad | Lưới món chia 2 cột, Drawer chi tiết trượt ngang, thanh giỏ hàng nổi tự động ẩn để tránh che món |
| **`1366 × 768`** | Laptop văn phòng | Sidebar cố định 64px/256px bên trái, Modal pop-up căn giữa, lưới món chia 3-4 cột |
| **`1920 × 1080`** | Màn hình máy tính bàn lớn | Độ rộng nội dung tối đa giới hạn `max-w-7xl` căn giữa cân đối, thanh điều hướng rộng rãi |

---

## 5. Quy Chuẩn Trạng Thái Giao Diện (UI States)

Tuân thủ nghiêm ngặt kỹ năng **UI UX Pro Max**:
1. **Trạng thái Khởi tạo & Tải (Loading State):**
   - Không để màn hình trắng trơn: Tích hợp preloader tĩnh mang thương hiệu Huy CV ngay trong `<div id="root">` của `index.html`.
   - Sử dụng Skeleton Loader dạng pulse với kích thước cố định thay thế các thẻ thống kê, danh mục và bảng dữ liệu khi nạp API, triệt tiêu hoàn toàn hiện tượng co giật layout (Cumulative Layout Shift).
2. **Trạng thái Rỗng (Empty State):**
   - Khi giỏ hàng rỗng, danh mục chưa có món, hoặc chưa có lịch sử thu tiền: Hiển thị minh họa icon nhẹ nhàng kèm câu dẫn thân thiện ("Giỏ hàng của bạn đang trống", "Chưa có lượt thu tiền nào trong ca trực").
3. **Trạng thái Báo lỗi (Error State):**
   - Biểu mẫu luôn giữ nguyên dữ liệu người dùng đang nhập khi API phản hồi lỗi (không xóa sạch form bắt nhập lại từ đầu).
   - Sử dụng In-App Toast thông báo góc trên bên phải hoặc Banner cảnh báo màu ấm, giải thích lỗi rõ ràng bằng tiếng Việt.
   - Toàn bộ view được bảo vệ bởi `ErrorBoundary` ngăn ngừa ứng dụng bị sập toàn phần.

