# Hướng Dẫn Thử Nghiệm Gọi Món Qua QR Bằng Điện Thoại (Mạng Wi-Fi / LAN)

> **Dự án**: Huy CV — Quán Vỉa Hè (QR Order & Store Management)  
> **Cập nhật gần nhất**: 04/11/2026  
> **Áp dụng cho**: Môi trường thử nghiệm trực tiếp trên thiết bị di động thật thông qua mạng nội bộ.

---

## 1. Điều Kiện Tiên Quyết (Prerequisites)

1. **Cùng mạng Wi-Fi/LAN**:
   - Máy tính laptop (chạy backend và frontend) và điện thoại di động thông minh (quét mã QR) phải cùng kết nối vào **một mạng Wi-Fi duy nhất** (ví dụ: cùng kết nối mạng Wi-Fi gia đình hoặc quán).
   - Kiểm tra mạng không bật chế độ "AP Isolation" (cách ly thiết bị khách).
2. **Laptop luôn mở và server đang chạy**:
   - Laptop không được rơi vào trạng thái ngủ (Sleep/Hibernate) trong quá trình thử nghiệm.
3. **Tường lửa Windows (Windows Firewall)**:
   - Mạng Wi-Fi trên máy tính nên được đặt ở chế độ **Private Network**.
   - Node.js Runtime đã được cấp quyền cho phép nhận kết nối đến (Inbound Allow) cho các cổng `5173` và `3000`.

---

## 2. Kiến Trúc Mạng & Luồng Kết Nối

Hệ thống sử dụng cơ chế **Vite Dev Server Proxy** trong suốt để tối ưu trải nghiệm và bảo mật:

```
[ Điện thoại di động ]
        │
        │ (1. Quét QR / Mở trình duyệt)
        ▼
[ Frontend LAN: http://192.168.12.75:5173 ]
        │
        │ (2. Tải giao diện SPA & gọi API /api/...)
        ▼
[ Vite Dev Server Proxy (Laptop) ]
        │
        │ (3. Forward request nội bộ)
        ▼
[ Backend NestJS: http://localhost:3000 ]
        │
        │ (4. Truy vấn TypeORM)
        ▼
[ MySQL Database (my_app) ]
```

**Ưu điểm**:
- Điện thoại chỉ cần kết nối tới cổng `5173` của laptop.
- Mọi request API `/api/...` được Vite tự động chuyển tiếp sang Backend `3000` mà điện thoại không cần gọi trực tiếp tới `localhost:3000` hay gặp lỗi CORS.

---

## 3. Lệnh Khởi Chạy Hệ Thống

Mở terminal tại thư mục gốc dự án (`d:\netsjs`):

### Bước 1: Khởi động Backend (Port 3000)
```bash
npm run dev:back
```
*(Chờ thông báo: `Nest application successfully started` hoặc kiểm tra `GET http://localhost:3000/health` trả về `{"status":"ok"}`)*.

### Bước 2: Khởi động Frontend chế độ mạng LAN (Port 5173)
```bash
npm run dev:lan
```
Terminal sẽ hiển thị danh sách địa chỉ mạng khả dụng:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.12.75:5173/  (Wi-Fi)
```

---

## 4. Cách Lấy & Cập Nhật IP Mạng LAN Khi Đổi Mạng

Khi bạn mang laptop sang một mạng Wi-Fi khác, địa chỉ IP của máy tính có thể thay đổi. Cách kiểm tra:

### Trên Windows (PowerShell):
```powershell
Get-NetIPAddress -InterfaceAlias 'Wi-Fi' -AddressFamily IPv4 | Select-Object IPAddress
```
*(Hoặc gõ `ipconfig` và tìm mục `IPv4 Address` của card mạng `Wireless LAN adapter Wi-Fi`)*.

### Cập nhật địa chỉ cho mã QR:
- Tạo hoặc sửa file `frontend/.env` (tham khảo mẫu tại `frontend/.env.example`):
  ```env
  VITE_LAN_HOST=192.168.12.75
  ```
  *(Thay `192.168.12.75` bằng địa chỉ IPv4 mới)*.
- Khởi động lại lệnh `npm run dev:lan`.

---

## 5. Danh Sách URL & Mã QR Mẫu Từng Bàn Ăn

Bạn có thể mở trực tiếp đường dẫn này trên trình duyệt điện thoại hoặc dùng camera quét mã QR:

| Tên bàn | Khu vực kê bàn | Đường dẫn trực tiếp trên điện thoại | Đường dẫn ảnh tem mã QR |
| :--- | :--- | :--- | :--- |
| **BÀN 01** | Vỉa hè trước quán | [http://192.168.12.75:5173/#/?table=B01](http://192.168.12.75:5173/#/?table=B01) | [Xem ảnh QR B01](https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http%3A%2F%2F192.168.12.75%3A5173%2F%23%2F%3Ftable%3DB01) |
| **BÀN 02** | Vỉa hè trước quán | [http://192.168.12.75:5173/#/?table=B02](http://192.168.12.75:5173/#/?table=B02) | [Xem ảnh QR B02](https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http%3A%2F%2F192.168.12.75%3A5173%2F%23%2F%3Ftable%3DB02) |
| **BÀN 03** | Vỉa hè trước quán | [http://192.168.12.75:5173/#/?table=B03](http://192.168.12.75:5173/#/?table=B03) | [Xem ảnh QR B03](https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http%3A%2F%2F192.168.12.75%3A5173%2F%23%2F%3Ftable%3DB03) |
| **BÀN 04** | Vỉa hè trước quán | [http://192.168.12.75:5173/#/?table=B04](http://192.168.12.75:5173/#/?table=B04) | [Xem ảnh QR B04](https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http%3A%2F%2F192.168.12.75%3A5173%2F%23%2F%3Ftable%3DB04) |
| **BÀN 05** | Vỉa hè trước quán | [http://192.168.12.75:5173/#/?table=B05](http://192.168.12.75:5173/#/?table=B05) | [Xem ảnh QR B05](https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http%3A%2F%2F192.168.12.75%3A5173%2F%23%2F%3Ftable%3DB05) |
| **BÀN 06** | Khu vực trong nhà | [http://192.168.12.75:5173/#/?table=B06](http://192.168.12.75:5173/#/?table=B06) | [Xem ảnh QR B06](https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http%3A%2F%2F192.168.12.75%3A5173%2F%23%2F%3Ftable%3DB06) |
| **BÀN 07** | Khu vực trong nhà | [http://192.168.12.75:5173/#/?table=B07](http://192.168.12.75:5173/#/?table=B07) | [Xem ảnh QR B07](https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http%3A%2F%2F192.168.12.75%3A5173%2F%23%2F%3Ftable%3DB07) |
| **BÀN 08** | Góc phố thoáng mát | [http://192.168.12.75:5173/#/?table=B08](http://192.168.12.75:5173/#/?table=B08) | [Xem ảnh QR B08](https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http%3A%2F%2F192.168.12.75%3A5173%2F%23%2F%3Ftable%3DB08) |

*(Bạn cũng có thể vào trang Quản trị: `http://localhost:5173/#/staff/tables` ➔ Bấm nút **"Cấu hình bàn & QR"** để xem và in thẻ QR của từng bàn).*

---

## 6. Xử Lý Sự Cố Thường Gặp (Troubleshooting)

### Vấn đề 1: Điện thoại báo "Không thể kết nối tới máy chủ" hoặc quay tròn không tải được trang
- **Nguyên nhân**: Điện thoại và laptop chưa cùng kết nối vào một mạng Wi-Fi, hoặc Windows Firewall đang chặn cổng 5173 trên mạng Public.
- **Cách xử lý**:
  1. Kiểm tra lại tên Wi-Fi trên cả hai thiết bị.
  2. Đảm bảo Vite đang chạy bằng `npm run dev:lan` (có cờ `--host 0.0.0.0`).
  3. Mở cài đặt Wi-Fi trên Windows, chuyển Network Profile từ `Public` sang `Private`.

### Vấn đề 2: Điện thoại mở được trang nhưng hiện thông báo "Không thể tải thực đơn từ máy chủ"
- **Nguyên nhân**: Frontend mở được nhưng Backend (Port 3000) chưa được bật hoặc Vite proxy bị ngắt.
- **Cách xử lý**:
  1. Kiểm tra Terminal Backend có đang chạy không: thử mở `http://localhost:3000/health` trên laptop.
  2. Kiểm tra proxy bằng cách mở `http://192.168.12.75:5173/api/dishes` trên trình duyệt laptop. Nếu trả về mảng JSON món ăn là proxy hoạt động bình thường.

### Vấn đề 3: Đổi bàn hoặc xóa giỏ hàng
- Khách quét mã QR bàn nào (ví dụ `table=B02`), hệ thống sẽ lưu định danh bàn đó vào `sessionStorage` của trình duyệt điện thoại.
- Muốn chuyển sang bàn khác (ví dụ Bàn 05), chỉ cần dùng camera quét mã QR của Bàn 05, hệ thống sẽ tự động chuyển phiên gọi món sang Bàn 05 mà không làm xáo trộn đơn hàng khác.

