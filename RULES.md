# RULES.md — Quy Chuẩn Phát Triển Dự Án: Huy CV — Quán Vỉa Hè

> **Mục tiêu**: Định chuẩn quy trình làm việc kỹ thuật, quy tắc vận hành, tiêu chuẩn mã nguồn và cơ chế bảo vệ hệ thống cho mọi thành viên nhóm và Tác nhân Trí tuệ Nhân tạo (AI Agent).  
> **Áp dụng cho**: Toàn bộ dự án `netsjs` (Frontend React + Backend NestJS).  
> **Tài liệu mục lục trung tâm**: [`docs/README.md`](./docs/README.md)

---

## 1. Quy Trình Làm Việc Chuẩn (Standard Engineering Workflow)

Bất kỳ ai hoặc Agent nào khi nhận nhiệm vụ mới đều **BẮT BUỘC** tuân thủ chu trình 8 bước:

```
[1. Đọc yêu cầu / User Story] 
          ↓
[2. Lập kế hoạch (docs/superpowers/plans/)] 
          ↓
[3. Triển khai kỹ thuật (Frontend / Backend)] 
          ↓
[4. Kiểm chứng độc lập (Lint / Build / Playwright)] 
          ↓
[5. Báo cáo nghiệm thu (docs/reports/)] 
          ↓
[6. Cập nhật nhật ký ngày (docs/changelog/)] 
          ↓
[7. Commit & Push mã nguồn (Git)] 
          ↓
[8. Bàn giao kết quả]
```

### Chỉ dẫn chi tiết từng bước:
1. **Trước khi làm việc**:
   - Tra cứu User Story tương ứng tại [`docs/requirements/user-stories/`](./docs/requirements/user-stories/) và ma trận [`docs/requirements/user-stories/README.md`](./docs/requirements/user-stories/README.md).
   - Đọc quy tắc nghiệp vụ cốt lõi tại [`docs/requirements/business-rules.md`](./docs/requirements/business-rules.md).
2. **Khi lập kế hoạch**:
   - Tạo/cập nhật kế hoạch tại `docs/superpowers/plans/YYYY-MM-DD-<ten-task>-plan.md`.
   - Xác định rõ: Mục tiêu, Tiêu chí nghiệm thu (Acceptance Criteria), Tệp tác động và Lệnh kiểm chứng.
3. **Khi triển khai**:
   - Tuân thủ kiến trúc phân tầng trong [`docs/design/architecture.md`](./docs/design/architecture.md) và thiết kế API trong [`docs/design/api-routes.md`](./docs/design/api-routes.md).
   - Giữ nguyên bảng màu và phong cách quán vỉa hè (`Bang_mau_Quan_Via_He.md` và [`docs/ui/design-system.md`](./docs/ui/design-system.md)).
4. **Khi kiểm chứng**:
   - Chạy kiểm thử tự động Playwright theo đúng quy trình 6 pha: [`docs/testing/playwright-lifecycle.md`](./docs/testing/playwright-lifecycle.md).
   - Kiểm tra linter (`npm --prefix frontend run lint`) và build (`npm --prefix frontend run build`, `npm --prefix backend run build`).
5. **Khi lập báo cáo**:
   - Ghi nhận kết quả kiểm chứng kèm logs/bằng chứng tại `docs/reports/YYYY-MM-DD-<ten-task>-report.md`.
6. **Cuối ngày / kết thúc nhiệm vụ**:
   - Ghi nhật ký tiến độ vào `docs/changelog/YYYY-MM-DD.md`.
7. **Quy ước Commit & Push**:
   - Commit tuân thủ Conventional Commits (ví dụ: `feat:`, `fix:`, `docs:`, `test:`).
   - Luôn kiểm tra `git status` trước khi push lên `origin/main`.
8. **Bàn giao**:
   - Trình bày mạch lạc kết quả đạt được, kèm liên kết dẫn đến tài liệu nghiệm thu.

---

## 2. Ràng Buộc Bất Di Bất Dịch: ZERO DATABASE INTERFERENCE

Khi thực hiện nhiệm vụ (đặc biệt là sửa lỗi giao diện, điều hướng hoặc chạy test):
> [!CAUTION]
> **CẤM TUYỆT ĐỐI**:
> 1. Không can thiệp DB trực tiếp bằng SQL client, raw scripts hoặc ORM query tùy tiện để "dọn dẹp" dữ liệu cho đẹp màn hình.
> 2. Không chạy các lệnh reset, truncate, seed hoặc reseed database.
> 3. Không chạy database migration hoặc schema synchronization (`synchronize: true`) tự động làm xáo trộn cấu trúc bảng đang vận hành.
> 4. Không đổi mật khẩu, không thu hồi quyền admin hoặc tạo tài khoản ghi đè tài khoản quản trị hiện có.
> 5. Không commit mật khẩu, API key, JWT token hoặc file `.env` vào repository.

---

## 3. Bản Đồ Tài Liệu Tham Khảo

- **Mục lục trung tâm**: [`docs/README.md`](./docs/README.md)
- **User Stories & Ma trận**: [`docs/requirements/user-stories/README.md`](./docs/requirements/user-stories/README.md)
- **Quy tắc nghiệp vụ**: [`docs/requirements/business-rules.md`](./docs/requirements/business-rules.md)
- **Kiến trúc hệ thống**: [`docs/design/architecture.md`](./docs/design/architecture.md)
- **Mô hình dữ liệu (ERD)**: [`docs/design/data-model.md`](./docs/design/data-model.md)
- **Danh mục API REST**: [`docs/design/api-routes.md`](./docs/design/api-routes.md)
- **Khảo sát Backend & Mock**: [`docs/audits/backend-module-survey.md`](./docs/audits/backend-module-survey.md)
- **Hệ thống thiết kế giao diện**: [`docs/ui/design-system.md`](./docs/ui/design-system.md)
- **Vòng đời kiểm thử Playwright**: [`docs/testing/playwright-lifecycle.md`](./docs/testing/playwright-lifecycle.md)
- **Nhật ký tiến độ theo ngày**: [`docs/changelog/`](./docs/changelog/)

