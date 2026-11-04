# Báo Cáo Nghiệm Thu: Cấu Hình Demo Đặt Món QR Trên Điện Thoại Qua Mạng LAN

> **Mã công việc**: `TASK-LAN-QR-DEMO-20261104`  
> **Thời điểm nghiệm thu**: 04/11/2026  
> **Kế hoạch liên quan**: [`docs/superpowers/plans/2026-11-04-lan-qr-demo-plan.md`](../superpowers/plans/2026-11-04-lan-qr-demo-plan.md)  
> **Tài liệu hướng dẫn**: [`docs/testing/lan-qr-demo-guide.md`](../testing/lan-qr-demo-guide.md)  
> **Người thực hiện**: Antigravity Assistant  
> **Trạng thái**: ĐẠT (Passed 100%)

---

## 1. Kết Quả Triển Khai Kỹ Thuật

1. **Xác định chính xác địa chỉ IP LAN mạng Wi-Fi**:
   - Card mạng Wi-Fi đang hoạt động: `192.168.12.75` (Subnet `192.168.12.0/24`, Default Gateway: `192.168.12.1`).
   - Đã lọc bỏ toàn bộ card mạng ảo VMware, loopback và Ethernet chưa kết nối.
2. **Cấu hình Vite Dev Server & Proxy**:
   - Thêm script `dev:lan`: `vite --host 0.0.0.0 --port 5173 --strictPort`.
   - Cấu hình Vite Proxy trong `frontend/vite.config.ts`: Chuyển tiếp `/api` và `/health` về `http://localhost:3000`.
   - Giữ nguyên script `dev` và `dev:front` chạy bình thường.
3. **Tập trung hóa cấu hình API Client**:
   - Tạo module tập trung `frontend/src/services/apiConfig.ts`.
   - Loại bỏ hoàn toàn `http://localhost:3000` gán cứng trong tất cả các API client (`api.ts`, `dishesApi.ts`, `bannersApi.ts`, `reportsApi.ts`, `staffApi.ts`). Mặc định gọi relative path `/api/...` để Vite proxy xử lý trong suốt.
4. **Tập trung hóa cơ chế sinh mã QR cho mạng LAN**:
   - Tạo module `frontend/src/utils/qrConfig.ts` với các hàm `buildTableOrderUrl`, `buildTableQrCodeUrl`, `getPublicBaseUrl`.
   - Loại bỏ hoàn toàn tên miền mẫu `https://huycv.vn`.
   - Mã QR được tạo ra nhúng chính xác địa chỉ: `http://192.168.12.75:5173/#/?table=<TABLE_NUMBER>`.
   - Khi admin mở trang trên laptop qua `localhost:5173`, mã QR sinh ra vẫn chứa địa chỉ IP LAN để điện thoại quét được.
   - Thống nhất cơ chế sinh QR trên cả: Danh sách bàn ban đầu (`mockData.ts`), Thêm bàn mới (`RestaurantContext.tsx`), Modal xem/in/tải QR (`TableQrConfigModal.tsx`).
5. **Tuân thủ quy chuẩn Zero Database Interference**:
   - Không chạy SQL script, migration hay schema sync.
   - Không sửa đổi hay xóa bản ghi trong MySQL database.
   - Không tự động gửi đơn thử hay thanh toán giả trên database thật.

---

## 2. Bằng Chứng Xác Minh Kỹ Thuật (Evidence)

- **Kiểm tra truy cập Frontend qua IP LAN**:
  ```bash
  $ curl.exe -s -I http://192.168.12.75:5173/
  HTTP/1.1 200 OK
  Content-Type: text/html
  ```
- **Kiểm tra Vite Proxy gọi Backend qua IP LAN**:
  ```bash
  $ curl.exe -s http://192.168.12.75:5173/api/dishes
  [{"id":"dish-4","name":"Trà Tắc Xí Muội Đường Phèn",...},{"id":"dish-5",...},{"id":"dish-1",...}]
  # Trả về mảng JSON 5 món ăn thực tế từ MySQL Database qua Vite Proxy thành công!
  ```
- **Kiểm tra sinh ảnh mã QR (QRServer API)**:
  ```bash
  $ curl.exe -s -I "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http%3A%2F%2F192.168.12.75%3A5173%2F%23%2F%3Ftable%3DB01"
  HTTP/1.1 200 OK
  Content-Type: image/png
  ```
- **Linter Frontend**:
  ```bash
  $ npm --prefix frontend run lint
  > oxlint
  Found 0 warnings and 0 errors. Finished in 123ms on 45 files.
  ```
- **Biên dịch Frontend & Backend**:
  - `npm --prefix frontend run build`: Thành công trong 1.11s.
  - `npm --prefix backend run build`: `nest build` thành công.
- **Kiểm thử tự động Playwright (Zero Database Interference)**:
  - `npx playwright test`: **8/8 test suites PASSED (100%)** trong 26.0s.

---

## 3. Kết Luận & Phạm Vi Bàn Giao

- **Phần đã hoàn tất và kiểm chứng độc lập trên laptop**: Hệ thống Frontend, Backend, Vite Proxy và cơ chế sinh mã QR LAN đã hoạt động trơn tru 100%.
- **Phần bàn giao cho người dùng**: Người dùng có thể cầm điện thoại di động kết nối cùng mạng Wi-Fi và quét trực tiếp mã QR của bàn để trải nghiệm thực tế quy trình đặt món.
