# BẢNG MÀU QUÁN VỈA HÈ

## 1. Hướng thiết kế

Phong cách: **ấm áp – gần gũi – món ăn đường phố Việt Nam**. Phù hợp cho website giới thiệu quán, menu điện tử và giao diện đặt món bằng QR trên điện thoại.

Bộ màu đề xuất: **đỏ gạch + vàng ấm + nền kem + xanh lá đậm**. Đỏ gạch làm thương hiệu và nút đặt món; vàng tạo điểm nhấn; nền kem giữ giao diện nhẹ; xanh lá bổ sung cảm giác tươi và dùng cho trạng thái thành công.

Đây là đề xuất thiết kế mới, có thể áp dụng trực tiếp hoặc điều chỉnh theo logo và ảnh món ăn của quán.

## 2. Bảng màu chính

| Vai trò | Màu | Mã HEX | Cách sử dụng |
| --- | --- | --- | --- |
| Thương hiệu / Primary | Đỏ gạch | `#B93824` | Logo dạng chữ, nút thêm món, nút đặt món, mục menu đang chọn |
| Primary hover | Đỏ gạch đậm | `#942C1C` | Hover nút chính trên máy tính |
| Primary pressed | Đỏ nâu | `#792316` | Nút chính khi nhấn |
| Primary soft | Hồng đất nhạt | `#FCEAE5` | Nền danh mục được chọn, nền nhãn nổi bật |
| Secondary | Vàng ấm | `#F4B740` | Nhãn món bán chạy, điểm nhấn giá ưu đãi, chi tiết trang trí |
| Secondary soft | Vàng kem | `#FFF3D6` | Nền khuyến mãi hoặc thông báo gợi ý |
| Accent | Xanh lá đậm | `#356044` | Điểm nhấn phụ, trạng thái còn món và thành công |
| Accent soft | Xanh lá nhạt | `#EAF2E8` | Nền nhãn còn món, thông báo thành công |
| Background | Kem ấm | `#FFF8EF` | Nền tổng thể trang |
| Surface | Trắng | `#FFFFFF` | Card món ăn, modal, biểu mẫu, bảng quản lý |
| Surface muted | Kem nhạt | `#F6EDE2` | Khối phụ, nền bộ lọc, vùng tóm tắt đơn |
| Border | Be trung tính | `#E4D4C3` | Viền card và đường phân cách mang tính trang trí |
| Input border | Nâu xám | `#8A7566` | Viền ô nhập cần nhận biết rõ |
| Text primary | Nâu đen | `#2B2118` | Tiêu đề, tên món, nội dung chính |
| Text secondary | Nâu xám đậm | `#6B5848` | Mô tả món, đơn vị tính, thông tin phụ |
| Text inverse | Trắng | `#FFFFFF` | Chữ và icon trên nền đỏ gạch hoặc xanh lá đậm |

## 3. Quy tắc phối màu

- Khoảng **70%** diện tích dùng nền kem và trắng; **20%** dùng chữ, viền và các nền phụ; **10%** dùng màu thương hiệu và điểm nhấn. Đây là tỷ lệ định hướng, không cần đo chính xác.
- Dùng đỏ gạch nhất quán cho hành động chính: **Thêm món**, **Xem giỏ hàng**, **Đặt món**.
- Trên nền vàng `#F4B740`, dùng chữ nâu đen `#2B2118`.
- Trên nền đỏ gạch `#B93824` hoặc xanh lá đậm `#356044`, dùng chữ trắng.
- Trên nền kem và trắng, dùng chữ nâu đen hoặc nâu xám đậm.
- Ưu tiên nền trung tính quanh ảnh món ăn để ảnh giữ vai trò nổi bật.
- Không trải nền đỏ hoặc vàng bão hòa trên toàn trang; dành các màu này cho khu vực cần chú ý.

## 4. Áp dụng theo thành phần

| Thành phần | Nền | Chữ / icon | Viền / ghi chú |
| --- | --- | --- | --- |
| Header khách hàng | `#FFF8EF` | `#2B2118` | Logo nhấn `#B93824` |
| Trang menu | `#FFF8EF` | `#2B2118` | Card món nền trắng |
| Card món ăn | `#FFFFFF` | `#2B2118` | Viền `#E4D4C3` |
| Giá món | Theo nền card | `#B93824` | Dùng nét chữ đậm |
| Mô tả món | Theo nền card | `#6B5848` | Không giảm opacity chữ |
| Danh mục đang chọn | `#FCEAE5` | `#B93824` | Thêm nét đậm hoặc dấu chọn |
| Danh mục chưa chọn | `#FFFFFF` | `#6B5848` | Có thể có viền be |
| Nút chính | `#B93824` | `#FFFFFF` | Hover `#942C1C` |
| Nút phụ | `#FFFFFF` | `#B93824` | Viền `#B93824` |
| Nhãn bán chạy | `#F4B740` | `#2B2118` | Kèm chữ “Bán chạy” |
| Giỏ hàng cố định cuối màn hình | `#B93824` | `#FFFFFF` | Thể hiện số món và tổng tiền |
| Modal chi tiết món | `#FFFFFF` | `#2B2118` | Overlay `rgba(43, 33, 24, 0.40)` |
| Input | `#FFFFFF` | `#2B2118` | Viền `#8A7566`, focus đỏ gạch |
| Sidebar quản trị | `#2B2118` | `#FFF8EF` | Mục active nền `#B93824`, chữ trắng |
| Bảng quản trị | `#FFFFFF` | `#2B2118` | Header nền `#F6EDE2` |
| Nút vô hiệu hóa | `#F6EDE2` | `#6B5848` | Thêm thuộc tính disabled và bỏ hiệu ứng nhấn |

## 5. Màu trạng thái

| Trạng thái | Màu chữ / icon | Màu nền nhạt | Nhãn ví dụ |
| --- | --- | --- | --- |
| Thành công / còn món | `#356044` | `#EAF2E8` | Đã xác nhận, Còn món |
| Đang xử lý / cảnh báo | `#795000` | `#FFF3D6` | Đang chuẩn bị, Sắp hết |
| Lỗi / hủy | `#A12622` | `#FDECE9` | Đã hủy, Không thể đặt món |
| Thông tin | `#245B78` | `#EAF3F8` | Đang phục vụ, Ghi chú |
| Hết món / không hoạt động | `#6B5848` | `#F6EDE2` | Hết món, Tạm ngưng |

Luôn hiển thị chữ hoặc icon đi kèm màu trạng thái. Với món hết hàng, giữ tên và giá dễ đọc, gắn nhãn “Hết món” và vô hiệu hóa nút thêm món.

## 6. CSS variables dùng cho frontend

```css
:root {
  color-scheme: light;

  --color-primary: #B93824;
  --color-primary-hover: #942C1C;
  --color-primary-pressed: #792316;
  --color-primary-soft: #FCEAE5;
  --color-secondary: #F4B740;
  --color-secondary-soft: #FFF3D6;
  --color-accent: #356044;
  --color-accent-soft: #EAF2E8;

  --color-background: #FFF8EF;
  --color-surface: #FFFFFF;
  --color-surface-muted: #F6EDE2;
  --color-border: #E4D4C3;
  --color-input-border: #8A7566;
  --color-text: #2B2118;
  --color-text-secondary: #6B5848;
  --color-text-inverse: #FFFFFF;

  --color-success: #356044;
  --color-success-bg: #EAF2E8;
  --color-warning: #795000;
  --color-warning-bg: #FFF3D6;
  --color-danger: #A12622;
  --color-danger-bg: #FDECE9;
  --color-info: #245B78;
  --color-info-bg: #EAF3F8;
  --color-disabled-bg: #F6EDE2;
  --color-disabled-text: #6B5848;

  --color-sidebar-bg: #2B2118;
  --color-sidebar-text: #FFF8EF;
  --color-focus: #B93824;
  --color-overlay: rgba(43, 33, 24, 0.40);
  --shadow-card: 0 4px 16px rgba(43, 33, 24, 0.08);
}

body {
  background: var(--color-background);
  color: var(--color-text);
}

.button-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-primary);
}

@media (hover: hover) {
  .button-primary:hover:not(:disabled) {
    background: var(--color-primary-hover);
    border-color: var(--color-primary-hover);
  }
}

.button-primary:active:not(:disabled) {
  background: var(--color-primary-pressed);
}

.button-primary:disabled {
  background: var(--color-disabled-bg);
  color: var(--color-disabled-text);
  border-color: var(--color-border);
  cursor: not-allowed;
}

:where(button, a, input, select, textarea):focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}
```

## 7. Kiểm tra khi triển khai

- Đồng bộ màu qua variables; rà các mã màu viết trực tiếp trong component.
- Kiểm tra trang menu, chi tiết món, giỏ hàng, đặt món và màn hình quản trị nếu có.
- Kiểm tra đủ trạng thái thường, hover, nhấn, focus, disabled, loading, lỗi và không có dữ liệu.
- Đo tương phản trên giao diện thực tế; mục tiêu chữ thường đạt ít nhất 4.5:1, chữ lớn và các dấu hiệu giao diện cần nhận biết đạt ít nhất 3:1. Không mặc định mọi cách ghép trong bảng đều đạt yêu cầu.
- Giữ ảnh món ăn đúng màu; tránh phủ bộ lọc màu thương hiệu lên ảnh.
- Kiểm tra trên điện thoại, đặc biệt nút đặt món và tổng tiền trong giỏ hàng.
- Viền be nhạt chỉ để phân cách trang trí; ô nhập và điều khiển cần dùng viền đủ rõ.

## 8. Chốt hướng triển khai

**Nền kem + card trắng + chữ nâu đen + nút đỏ gạch + nhãn vàng ấm.** Xanh lá dùng tiết chế cho điểm nhấn phụ và trạng thái thành công. Duy trì cùng bộ màu cho giao diện khách hàng và quản trị.
