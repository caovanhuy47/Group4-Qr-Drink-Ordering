# Quy Trình Vòng Đời Kiểm Thử Playwright & Ràng Buộc Không Can Thiệp Database

Tài liệu này quy chuẩn hóa vòng đời kiểm thử tự động End-to-End (E2E) bằng Playwright cho dự án **Huy CV — Quán Vỉa Hè**, đảm bảo kiểm thử giao diện và điều hướng tin cậy, không làm ô nhiễm hoặc thay đổi cơ sở dữ liệu sản phẩm.

---

## 1. Ràng buộc Cốt Lõi: Tuyệt Đối Không Can Thiệp Database

Các kiểm thử giao diện người dùng (UI), điều hướng và hiển thị **BẮT BUỘC** tuân thủ nguyên tắc "Zero DB Interference":

1. **CẤM can thiệp trực tiếp vào Database:**
   - Không thực thi SQL trực tiếp, script ORM hoặc công cụ quản trị để can thiệp dữ liệu trong quá trình test.
   - Không reset, truncate, drop bảng, seed hoặc reseed dữ liệu.
   - Không chạy migration, schema sync hoặc thay đổi cấu trúc bảng.
2. **CẤM tạo dữ liệu rác để test hiển thị:**
   - Không tự động tạo/sửa/xóa món ăn, bàn, tài khoản hoặc lịch sử đơn chỉ để phục vụ kiểm thử giao diện.
   - Không đổi mật khẩu, phân quyền hoặc thông tin admin.
   - Không thêm script cleanup xóa dữ liệu sau test.
3. **Sử dụng tài khoản và API đọc có sẵn:**
   - Đăng nhập bằng tài khoản thử nghiệm nội bộ đã có (`hungnv` / `1234` hoặc biến môi trường `TEST_STAFF_USER` / `TEST_STAFF_PASSWORD`).
   - Sử dụng các API `GET` để đọc trạng thái thực tế.
4. **Kiểm thử trường hợp biên (Edge Cases) bằng Network Mocking phía Client:**
   - Để kiểm thử các trường hợp dữ liệu rỗng, doanh thu null, API chậm hoặc mã lỗi HTTP 500/403, sử dụng tính năng `page.route()` của Playwright để chặn và phản hồi cục bộ trong ngữ cảnh trình duyệt. Tuyệt đối không can thiệp vào backend hay cơ sở dữ liệu thật.

---

## 2. Chuẩn Hóa Vòng Đời Kiểm Thử Playwright (6 Pha)

Mọi kịch bản kiểm thử Playwright trong dự án cần tuân theo 6 pha tuần tự:

```
[Phase A: Chuẩn bị] ──> [Phase B: Thực hiện] ──> [Phase C: Xác minh]
                                                        │
[Phase F: Hồi quy]  <── [Phase E: Kết thúc]  <── [Phase D: Thu bằng chứng]
```

### Phase A: Chuẩn Bị (Setup & Readiness)
- Xác nhận các dev server (Backend port 3000, Frontend port 5173) đang chạy và phản hồi HTTP 200 trước khi mở trình duyệt.
- Khởi tạo `BrowserContext` hoàn toàn độc lập, tách biệt cookie và localStorage.
- Đăng ký lắng nghe sự kiện trình duyệt trước khi mở trang:
  - `page.on('pageerror')`: Thu thập ngoại lệ chưa bắt (Unhandled Exceptions).
  - `page.on('console')`: Thu thập các cảnh báo / lỗi console.
  - `page.on('requestfailed')`: Bắt các request mạng thất bại ngoài ý muốn.
- Tuyệt đối không chạy lệnh có tác dụng phụ làm thay đổi database trong pha chuẩn bị.

### Phase B: Thực Hiện (User Emulation)
- Tương tác thông qua các phần tử giao diện thực tế (nhập input, bấm nút) giống như người dùng thật.
- Sử dụng locator ổn định và thân thiện với accessibility (`getByRole`, `locator('aside button').filter({ hasText: '...' })`).
- Đợi điều kiện cụ thể (`waitFor({ state: 'visible' })`, `waitForResponse`) thay vì dùng lệnh sleep/timeout cố định.
- Không can thiệp state nội bộ hoặc vượt qua route guard một cách giả tạo.

### Phase C: Xác Minh (Assertions & Integrity)
- Kiểm tra URL đích khớp với route mong đợi (ví dụ `/#/staff/overview`).
- Xác nhận tiêu đề và nội dung chính của màn hình hiển thị đầy đủ.
- Kiểm tra phần tử `#root` không bị rỗng (`innerHTML.length > 0`) và không xuất hiện màn hình trắng trơn.
- Xác nhận các trạng thái tải (Skeleton Loaders) kết thúc bằng dữ liệu thật, trạng thái rỗng hoặc thông báo lỗi phù hợp.
- Đảm bảo không có ngoại lệ `pageerror` phát sinh.

### Phase D: Thu Thập Bằng Chứng (Evidence Collection)
- Chụp ảnh màn hình (`page.screenshot()`) tại các mốc quan trọng (trước thao tác, sau thao tác, khi lỗi).
- Ghi hình video hoặc vết thực thi (`trace: 'on-first-retry'`) khi cần đối chiếu.
- Lưu trữ kết quả kiểm thử có cấu trúc vào thư mục `scratch/evidence/`.

### Phase E: Kết Thúc An Toàn (Teardown & Cleanup)
- Luôn đóng `Page`, `Context` và `Browser` trong khối `finally`, kể cả khi test gặp lỗi.
- Không tắt dev server đang chạy của hệ thống nếu không phải do lần test đó tự tạo.
- Không xóa database, không xóa tài khoản.
- Không commit các token, cookie hoặc thông tin nhạy cảm vào Git.

### Phase F: Kiểm Tra Hồi Quy & Trường Hợp Biên (Regression)
- Kiểm tra chuyển hướng qua lại giữa các module (ví dụ: Bàn -> Tổng quan, Món ăn -> Tổng quan).
- Kiểm tra mở trực tiếp URL và bấm F5 tải lại trang.
- Kiểm tra dữ liệu biên (mảng rỗng, giá trị `null`, số `0`, chuỗi rỗng) bằng `page.route()`.
- Kiểm tra tính kiên cường (Resilience) khi API phản hồi lỗi HTTP 500: đảm bảo `ErrorBoundary` hiển thị giao diện báo lỗi thân thiện, không để sập toàn bộ ứng dụng thành màn hình trắng.

---

## 3. Lệnh Thực Thi Kiểm Thử

1. **Chạy bộ kiểm thử Playwright tự động:**
   ```bash
   npx playwright test
   ```

2. **Chạy script kiểm thử vòng đời chi tiết kèm chụp ảnh bằng chứng:**
   ```bash
   node scratch/verify_overview_lifecycle.js
   ```
