# Group4-Qr-Drink-Ordering
Group 4 - A QR code ordering and operations management website for a street-side beverage shop.

## Giới thiệu dự án
Đề tài: **Website đặt món bằng mã QR và quản lý vận hành quán nước vỉa hè — Nhóm 4**

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
