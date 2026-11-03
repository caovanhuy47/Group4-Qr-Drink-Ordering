# Kế Hoạch Triển Khai: Rà Soát Mock & Hoàn Thiện Backend

> **Loại tài liệu**: Kế hoạch kỹ thuật (Implementation Plan - Superpowers)  
> **Mã công việc**: `TASK-BACKEND-AUDIT-20261103`  
> **Thời điểm**: 03/11/2026  
> **Trạng thái**: Đã hoàn thành (Archived / Implemented)  
> **Liên kết User Story**: Toàn bộ hệ thống ([`docs/requirements/user-stories/README.md`](../../requirements/user-stories/README.md))

---

## 1. Mục Tiêu Kỹ Thuật
1. Tiến hành rà soát mã nguồn toàn diện trên tất cả các view frontend và controller backend nhằm phân loại rõ:
   - Màn hình nào đã kết nối 100% cơ sở dữ liệu MySQL thật.
   - Màn hình/tính năng nào còn sử dụng state ram / mock dữ liệu.
2. Lập báo cáo khảo sát kỹ thuật chi tiết tại [`docs/audits/backend-module-survey.md`](../../audits/backend-module-survey.md).
3. Đề xuất kiến trúc và DTO chuẩn cho các module còn thiếu (Bàn ăn & Đơn hàng trực tiếp) mà không tự ý can thiệp làm đảo lộn database đang chạy.
4. Gỡ bỏ triệt để các mock timers, fake latency hoặc static JSON còn vướng trong code logic nghiệp vụ thực.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- [x] **AC-AUD-01**: Xác định chính xác 5 bảng thực thể MySQL đang tồn tại (`dishes`, `categories`, `banners`, `staff`, `table_session_records`).
- [x] **AC-AUD-02**: Xác định rõ module Bàn ăn (`DiningTable`) và Phiên gọi món đang hoạt động bằng In-Memory context và Local Storage, phục vụ tốt cho bản thử nghiệm hiện tại.
- [x] **AC-AUD-03**: Ghi nhận lộ trình di chuyển dữ liệu (Data Migration Roadmap) an toàn mà không làm mất dữ liệu hóa đơn của quán.
- [x] **AC-AUD-04**: Hoàn thiện tài liệu khảo sát kỹ thuật đầy đủ để bàn giao cho các giai đoạn tiếp theo.

---

## 3. Các Tệp Tác Động
- Báo cáo khảo sát:
  - `docs/audits/backend-module-survey.md`
- Frontend logic:
  - `frontend/src/context/TableContext.tsx`
  - `frontend/src/views/staff/TablesManagementView.tsx`

---

## 4. Lệnh Kiểm Chứng
```bash
# Kiểm tra tài liệu và định dạng mã nguồn
npm --prefix frontend run lint
npm --prefix backend run build
```

