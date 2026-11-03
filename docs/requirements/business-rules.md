# Quy Tắc Nghiệp Vụ Cốt Lõi (Business Rules)

Tài liệu này tổng hợp toàn bộ các quy tắc nghiệp vụ bắt buộc của hệ thống **Huy CV — Quán Vỉa Hè**, được chuẩn hóa từ yêu cầu của người dùng, đặc tả `Du_an_QR_Order_Nhom4.md`, `RULES.md` và các quyết định kỹ thuật đã kiểm chứng.

---

## 1. Nguyên Tắc Trải Nghiệm Khách Hàng (Customer Rules)

- **BR-CUST-01: Không yêu cầu tài khoản khách hàng**
  - Khách quét mã QR tại bàn là có thể xem thực đơn, chọn món và gửi đơn ngay lập tức.
  - Tuyệt đối không bắt buộc đăng ký tài khoản, không bắt đăng nhập, không yêu cầu mã OTP SMS/Zalo.
- **BR-CUST-02: Không thanh toán online trong phạm vi MVP**
  - Quán áp dụng mô hình phục vụ thực tế của quán nước vỉa hè: Khách gọi món ➔ Bếp làm đồ ➔ Nhân viên bưng món ra bàn ➔ Thu đủ tiền mặt hoặc quét mã QR chuyển khoản trực tiếp với nhân viên khi nhận món.
  - Tuyệt đối không tích hợp cổng thanh toán trực tuyến (VNPAY, MoMo, thẻ tín dụng) trong phạm vi MVP.
- **BR-CUST-03: Không áp dụng voucher / mã giảm giá cho khách QR**
  - Tổng tiền thanh toán tại bàn bằng đúng 100% tổng giá trị các món ăn và topping khách đã chọn. Không hiển thị khối nhập voucher hay giảm giá gây rối mắt trên giao diện khách.
- **BR-CUST-04: Khách gửi xong chỉ xem tiến trình và món đã đặt**
  - Sau khi bấm gửi đơn thành công, giỏ hàng nháp tự động xóa rỗng.
  - Khách được điều hướng đến trang `/#/order-tracking` để theo dõi tiến trình làm món của bếp theo chuẩn FIFO. Khách không được tự ý sửa hay xóa đơn sau khi bếp đã nhận. Nếu muốn gọi thêm, khách bấm "Gọi thêm món khác" để gửi đợt bổ sung.

---

## 2. Vận Hành Bàn & Quản Lý Phiên (Table & Session Rules)

- **BR-OPS-01: Đơn vị vận hành cốt lõi là Bàn và Lượt Bàn**
  - Định danh bàn duy nhất theo chuỗi chuẩn hóa (ví dụ: `BÀN 01`, `BÀN 02`, `BÀN 05`).
  - Mỗi lượt ngồi của bàn được gán một mã phiên phục vụ duy nhất `sessionId` (ví dụ: `LT-2801`).
- **BR-OPS-02: Gom đơn thông minh theo lượt bàn**
  - Một bàn có thể có nhiều người cùng ngồi hoặc khách gọi thêm nhiều đợt.
  - Mọi lần gửi món hợp lệ từ cùng một bàn trong thời gian phiên đang hoạt động đều được tự động gom vào cùng một `sessionId`, cộng dồn số lượng phần món và tổng tiền, không chia vụn thành nhiều đơn rời rạc.
- **BR-OPS-03: Bếp nhận món trực tiếp, không qua duyệt trung gian**
  - Sau khi API `POST /api/dishes/validate-order` xác thực món và giá thành công, danh sách món được chuyển thẳng đến hàng đợi của bếp.
  - Không bắt nhân viên phục vụ phải bấm nút "Duyệt đơn" trước khi bếp làm đồ, nhằm đảm bảo tốc độ phục vụ nhanh nhất của quán vỉa hè giờ cao điểm.
- **BR-OPS-04: Vòng đời 3 trạng thái bàn bắt buộc**
  Bàn chỉ có đúng 3 trạng thái hợp lệ và chuyển tiếp theo chu trình khép kín:
  ```
  [Trống (empty)] ──(Khách gửi món)──> [Order thành công (ordered)]
        ▲                                          │
        │                               (Phục vụ & Thu tiền)
        │                                          │
        │                                          ▼
  (Dọn dẹp xong) <──(Khách rời bàn)──── [Đang ngồi (seated)]
  ```
- **BR-OPS-05: Thu tiền chuyển trạng thái sang "Đang ngồi" (`seated`)**
  - Khi nhân viên bưng đồ ra và thu tiền thành công, bàn chuyển từ `ordered` sang `seated`.
  - Khách tiếp tục ngồi thưởng thức đồ uống tại bàn. **Thu tiền không làm bàn trở về Trống và không kết thúc lượt ngồi của khách.**
- **BR-OPS-06: Chỉ chuyển về Trống (`empty`) khi khách đã rời quán và bàn đã dọn sạch**
  - Bàn chỉ được giải phóng về `empty` khi nhân viên bấm "Giải phóng bàn / Chuyển về Trống".
  - **Quy tắc an toàn:** Không bao giờ được phép chuyển bàn về Trống khi bàn đang ở trạng thái `ordered` (chưa phục vụ và chưa thu tiền).

---

## 3. Quản Lý Tài Chính & Lịch Sử Thu Tiền (Financial Rules)

- **BR-FIN-01: Chống ghi nhận tiền trùng lặp (Idempotent Payment)**
  - Mỗi phiên bàn (`sessionId`) chỉ được ghi nhận thu tiền thành công đúng một lần.
  - Backend kiểm tra khóa trùng lặp `sessionId` trong bảng `table_session_records`. Nếu nhân viên bấm nút nhiều lần do mạng lag, backend trả về bản ghi hiện có mà không cộng dồn doanh thu hai lần.
- **BR-FIN-02: Snapshot món bất biến (Immutable Items Snapshot)**
  - Khi ghi nhận thu tiền, toàn bộ thông tin món ăn (tên món, size, topping, đơn giá, thành tiền) được đóng băng dạng JSON snapshot bất biến trong trường `items`.
  - Mọi thay đổi về giá bán, tên món hoặc việc xóa món trên thực đơn sau này **tuyệt đối không làm thay đổi lịch sử và hóa đơn đã thu trong quá khứ**.
- **BR-FIN-03: Bảo toàn lịch sử và người thao tác khi giải phóng bàn**
  - Khi bàn chuyển về Trống để đón lượt khách mới, toàn bộ bản ghi thu tiền cũ trong database vẫn được bảo toàn nguyên vẹn.
  - Trường `confirmedBy` lưu trữ vĩnh viễn tên và chức vụ của nhân viên đã trực tiếp xác nhận thu tiền (ví dụ: `"Trần Thị Mai (Thu ngân)"`).
- **BR-FIN-04: Thống kê Tổng quan (Dashboard) chỉ tính tiền thực thu**
  - Doanh thu hiển thị trên Dashboard chỉ được tính từ các bản ghi đã xác nhận thu tiền (`confirmedAt IS NOT NULL`).
  - Các đơn nháp hoặc bàn đang ở trạng thái `ordered` chưa thu tiền tuyệt đối không được tính vào doanh thu thực tế.

---

## 4. Bảo Mật & Phân Quyền Nội Bộ (RBAC Rules)

- **BR-SEC-01: Kiểm soát phân quyền tại Backend (Server-Side Authorization)**
  - Mọi thao tác nội bộ quan trọng (Thêm/sửa/xóa món, banner, nhân viên, xác nhận thu tiền) **bắt buộc phải được kiểm tra quyền tại Backend NestJS** thông qua `StaffService.verifyStaffPermission`.
  - Không phụ thuộc vào việc ẩn/hiện nút trên giao diện frontend.
- **BR-SEC-02: Bảy nhóm quyền hạn độc lập**
  Hệ thống quản lý 7 cờ quyền phân định rõ ràng:
  1. `canViewTables`: Xem sơ đồ bàn và hàng đợi món.
  2. `canCollectMoney`: Xác nhận đã phục vụ và thu tiền tại bàn.
  3. `canManageTables`: Thêm bàn mới, sửa thông tin bàn, tạo mã QR.
  4. `canViewOverview`: Xem bảng điều khiển doanh thu tổng quan.
  5. `canViewHistory`: Xem lịch sử hóa đơn và in lại phiếu thu.
  6. `canManageMenu`: Thêm, sửa, xóa món ăn và danh mục món.
  7. `canManageBanners`: Quản lý banner khuyến mãi và carousel trang chủ.
- **BR-SEC-03: Bảo vệ Quản trị viên tối cao (Admin Self-Preservation)**
  - Không cho phép khóa tài khoản hoặc hạ vai trò của tài khoản Quản trị viên (`role = 'admin'`) duy nhất còn lại trong hệ thống.
  - Ngăn ngừa tình huống hệ thống bị mất quyền quản trị hoàn toàn.

