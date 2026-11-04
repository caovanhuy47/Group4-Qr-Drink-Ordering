# Kế Hoạch Triển Khai: Cấu Hình Demo Đặt Món QR Trên Điện Thoại Qua Mạng LAN

> **Loại tài liệu**: Kế hoạch kỹ thuật (Implementation Plan - Superpowers)  
> **Mã công việc**: `TASK-LAN-QR-DEMO-20261104`  
> **Thời điểm**: 04/11/2026  
> **Trạng thái**: Đang thực hiện (In Progress)  
> **Quy chuẩn**: Superpowers + Zero Database Interference + Playwright Lifecycle

---

## 1. Mục Tiêu Kỹ Thuật
1. Cho phép điện thoại di động kết nối cùng mạng Wi-Fi/LAN với laptop có thể quét mã QR thực tế của từng bàn để truy cập thẳng vào thực đơn gọi món.
2. Thiết lập kiến trúc mạng qua Vite Proxy:
   `Điện thoại (Trình duyệt) ➔ Frontend LAN (http://<IP-LAN>:5173) ➔ Vite Proxy ➔ Backend Laptop (http://localhost:3000)`.
3. Tập trung cấu hình `API_BASE_URL`: loại bỏ hoàn toàn `http://localhost:3000` gán cứng trong API clients, dùng đường dẫn tương đối `/api` thông qua Vite Proxy.
4. Chuẩn hóa cơ chế tạo mã QR tại một nơi tập trung (`frontend/src/utils/qrConfig.ts`), sinh QR URL dựa trên địa chỉ IP LAN thực tế (`192.168.12.75:5173`), xóa bỏ tên miền mẫu `https://huycv.vn`.
5. Bổ sung script `npm run dev:lan` để chạy Vite với `--host 0.0.0.0 --port 5173 --strictPort` mà không làm ảnh hưởng các script chạy bình thường hiện có.
6. Bảo toàn cơ sở dữ liệu: TUYỆT ĐỐI KHÔNG can thiệp database, không migration, không seed/reset.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- [ ] **AC-LAN-01**: Vite config được cấu hình proxy `/api` và `/health` trỏ về `http://localhost:3000`. Thêm lệnh `dev:lan` cho phép Vite lắng nghe trên `0.0.0.0:5173` với `strictPort: true`.
- [ ] **AC-LAN-02**: Tất cả các API clients (`api.ts`, `dishesApi.ts`, `bannersApi.ts`, `reportsApi.ts`, `staffApi.ts`) tập trung dùng `API_BASE_URL` rỗng mặc định để gọi relative path `/api/...` qua proxy, không còn gán cứng `http://localhost:3000`.
- [ ] **AC-LAN-03**: Module tiện ích `qrConfig.ts` sinh mã QR với URL thực tế: `http://<IP-LAN>:5173/#/?table=<TABLE_NUMBER>` (ví dụ `http://192.168.12.75:5173/#/?table=B01`), loại bỏ hoàn toàn `huycv.vn`.
- [ ] **AC-LAN-04**: Xem trước, tải ảnh và in thẻ QR trong modal `TableQrConfigModal` đều dùng chung cơ chế sinh QR chuẩn LAN.
- [ ] **AC-LAN-05**: Kiểm thử độc lập Playwright (8/8 test suites), lint và build frontend/backend đều đạt 100% không lỗi.
- [ ] **AC-LAN-06**: Tài liệu hướng dẫn sử dụng demo LAN chi tiết tại `docs/testing/lan-qr-demo-guide.md`.

---

## 3. Các Tệp Tác Động
- Cấu hình & Scripts:
  - `package.json` (bổ sung script `dev:lan`)
  - `frontend/package.json` (bổ sung script `dev:lan`)
  - `frontend/vite.config.ts` (cấu hình `strictPort` và `proxy`)
  - `frontend/.env.example` (hướng dẫn cấu hình LAN / Port)
- Mã nguồn Frontend:
  - `frontend/src/services/apiConfig.ts` (module tập trung cấu hình URL API)
  - `frontend/src/services/api.ts`
  - `frontend/src/services/dishesApi.ts`
  - `frontend/src/services/bannersApi.ts`
  - `frontend/src/services/reportsApi.ts`
  - `frontend/src/services/staffApi.ts`
  - `frontend/src/utils/qrConfig.ts` (module tập trung sinh mã QR bàn)
  - `frontend/src/data/mockData.ts` (dùng `buildTableQrCodeUrl`)
  - `frontend/src/contexts/RestaurantContext.tsx` (dùng `buildTableQrCodeUrl`)
  - `frontend/src/components/admin/TableQrConfigModal.tsx` (dùng `buildTableQrCodeUrl`)
- Tài liệu:
  - `docs/testing/lan-qr-demo-guide.md`
  - `docs/reports/2026-11-04-lan-qr-demo-report.md`
  - `docs/changelog/2026-11-04.md`

---

## 4. Lệnh Kiểm Chứng
```bash
# Kiểm tra linter
npm --prefix frontend run lint

# Biên dịch frontend & backend
npm --prefix frontend run build
npm --prefix backend run build

# Chạy toàn bộ Playwright test suites
npx playwright test

# Kiểm tra phản hồi qua proxy LAN
curl.exe -s http://192.168.12.75:5173/api/dishes
```

