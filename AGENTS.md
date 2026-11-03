# AGENTS.md — Hướng Dẫn Dành Cho Tác Nhân AI (AI Agents)

> **Dự án**: Huy CV — Quán Vỉa Hè (QR Order & Store Management)  
> **Repository**: `netsjs`  
> **Quy chuẩn kỹ thuật**: Tuân thủ nghiêm ngặt [`RULES.md`](./RULES.md) và tài liệu trung tâm [`docs/README.md`](./docs/README.md).

---

## 1. Nguyên Tắc Hoạt Động Của Agent

Mỗi khi Agent tiếp nhận bất kỳ nhiệm vụ nào từ người dùng, Agent **PHẢI** thực hiện theo quy trình chuẩn:

1. **Khảo sát & Tra cứu User Story**:
   - Luôn đọc User Story và tiêu chí chấp nhận liên quan trong [`docs/requirements/user-stories/`](./docs/requirements/user-stories/).
   - Kiểm tra các quy tắc nghiệp vụ bất biến tại [`docs/requirements/business-rules.md`](./docs/requirements/business-rules.md).
2. **Lập Kế Hoạch Triển Khai (Superpowers Plan)**:
   - Tạo mới hoặc cập nhật kế hoạch tại `docs/superpowers/plans/YYYY-MM-DD-<task-name>-plan.md`.
   - Vạch rõ mục tiêu kỹ thuật, tiêu chí nghiệm thu (AC), danh sách tệp sửa đổi và lệnh kiểm chứng.
3. **Triển Khai & Giữ Trọn Bản Sắc Dự Án**:
   - Sử dụng đúng bảng màu và thiết kế tại `Bang_mau_Quan_Via_He.md` và [`docs/ui/design-system.md`](./docs/ui/design-system.md).
   - Tuyệt đối không tự ý thay đổi stack công nghệ hoặc bổ sung các dependency nặng không cần thiết.
4. **Kiểm Chứng Độc Lập**:
   - Chạy linter: `npm --prefix frontend run lint`.
   - Chạy build: `npm --prefix frontend run build` và `npm --prefix backend run build`.
   - Chạy test E2E Playwright: `npx playwright test`. Phải đảm bảo 100% test suites xanh.
5. **Lập Báo Cáo Nghiệm Thu**:
   - Ghi lại bằng chứng xác minh và kết quả chạy test tại `docs/reports/YYYY-MM-DD-<task-name>-report.md`.
6. **Cập Nhật Nhật Ký Phát Triển**:
   - Bổ sung nội dung vào `docs/changelog/YYYY-MM-DD.md`.
7. **Commit & Push**:
   - Commit với thông điệp rõ ràng theo chuẩn Conventional Commits.
   - Luôn kiểm tra `git status` trước khi push lên `origin/main`.
8. **Bàn Giao Trực Tiếp**:
   - Trả lời người dùng ngắn gọn, cung cấp đường dẫn tài liệu và bằng chứng nghiệm thu thực tế.

---

## 2. Ràng Buộc Tối Cao (Zero Database Interference)

- **KHÔNG** can thiệp trực tiếp vào database bằng SQL script ngoài luồng ứng dụng.
- **KHÔNG** xóa, reset, truncate, seed lại database.
- **KHÔNG** làm lộ mật khẩu, bí mật phiên hoặc cấu hình môi trường `.env`.

---

## 3. Liên Kết Tài Liệu Trọng Yếu

- **Mục Lục Toàn Dự Án**: [`docs/README.md`](./docs/README.md)
- **Quy Chuẩn Dự Án**: [`RULES.md`](./RULES.md)
- **Ma Trận Yêu Cầu**: [`docs/requirements/user-stories/README.md`](./docs/requirements/user-stories/README.md)
- **Kiến Trúc & API**: [`docs/design/architecture.md`](./docs/design/architecture.md), [`docs/design/api-routes.md`](./docs/design/api-routes.md)
- **Vòng Đời Kiểm Thử Playwright**: [`docs/testing/playwright-lifecycle.md`](./docs/testing/playwright-lifecycle.md)

