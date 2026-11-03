# User Stories: Phân Hệ Vận Hành Bàn (Operations)

Tài liệu đặc tả các User Stories dành riêng cho **Nhân viên phục vụ, Thu ngân và Nhân sự quầy/bếp** trong việc vận hành bàn tại quán nước vỉa hè Huy CV.

---

### US-OPS-01: Xem sơ đồ bàn và hàng đợi chờ phục vụ

- **Mã định danh:** `US-OPS-01`
- **Vai trò:** Nhân viên phục vụ, Thu ngân, Quản lý.
- **Tuyên bố:** Là nhân viên quán, tôi muốn xem tổng thể sơ đồ các bàn ăn trên một màn hình với màu sắc trực quan (Trống, Order thành công, Đang ngồi), để tôi biết ngay bàn nào vừa gọi món đang chờ phục vụ và bàn nào đang có khách ngồi.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.
- **Điều kiện trước:** Nhân viên đã đăng nhập và có quyền `canViewTables`.

#### Luồng chính
1. Nhân viên truy cập trang Sơ đồ bàn `/#/staff/tables`.
2. Đầu trang hiển thị các thẻ đếm số lượng: Tổng số bàn, Bàn trống (màu xám), Order thành công (màu đỏ/cam nhấp nháy), Đang ngồi (màu xanh).
3. Hàng đợi thông minh: Các bàn có trạng thái `ordered` (Order thành công) luôn được đẩy lên đầu danh sách theo thứ tự thời gian chờ giảm dần (bàn chờ lâu nhất xếp trước).
4. Mỗi thẻ bàn hiển thị: Số bàn, khu vực, trạng thái, thời gian chờ (phút), số lượng món đã gọi và tổng tiền tạm tính.

#### Tiêu chí nghiệm thu
- **AC-OPS-01.1:** *Cho trước* Bàn 02 chờ 15 phút và Bàn 05 chờ 8 phút, *Khi* mở danh sách bàn, *Thì* Bàn 02 xuất hiện ở vị trí đầu tiên trước Bàn 05.
- **AC-OPS-01.2:** *Cho trước* nhân viên không có quyền `canViewTables`, *Khi* truy cập route này, *Thì* giao diện hiển thị Access Denied (Từ chối truy cập) và menu bàn trên sidebar bị ẩn.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/views/admin/TableManagementView.tsx`, `frontend/src/components/admin/TableStatusBadge.tsx`.

---

### US-OPS-02: Xem chi tiết món tổng hợp của phiên bàn (Table Detail Drawer)

- **Mã định danh:** `US-OPS-02`
- **Vai trò:** Nhân viên phục vụ, Bếp, Thu ngân.
- **Tuyên bố:** Là nhân viên, tôi muốn bấm vào thẻ bàn để mở một ngăn kéo (Drawer) hiển thị toàn bộ các món của phiên bàn đó, để tôi bưng đúng món ra bàn và báo giá thanh toán chính xác cho khách.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.
- **Điều kiện trước:** Bấm vào một bàn bất kỳ trên sơ đồ bàn.

#### Luồng chính
1. Ngăn kéo `TableDetailDrawer` trượt ra từ bên phải màn hình.
2. Tiêu đề hiển thị: Tên bàn (ví dụ "BÀN 05"), khu vực, mã phiên (ví dụ "#LT-2805").
3. Danh sách các món ăn đã gọi trong phiên: Tên món, Size, danh sách Topping kèm giá, số lượng phần và tổng tiền dòng.
4. Ghi chú chung của đơn hoặc ghi chú từng món (ví dụ: "Nhiều đá, ít ngọt").
5. Phần tóm tắt chi phí: Tổng số lượng phần món và Tổng tiền cần thu.
6. Hai nút hành động: "Đã phục vụ & Thu đủ tiền" (màu chính) và "Đóng".

#### Tiêu chí nghiệm thu
- **AC-OPS-02.1:** *Cho trước* Bàn 05 có 3 món với 4 phần gọi, *Khi* mở ngăn kéo chi tiết bàn, *Thì* tất cả 3 món hiển thị đầy đủ size, topping, ghi chú và tổng tiền 143.000đ.
- **AC-OPS-02.2:** *Cho trước* bàn đang ở trạng thái Trống (`empty`), *Khi* mở ngăn kéo, *Thì* hiển thị trạng thái bàn sẵn sàng đón khách mới.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/components/admin/TableDetailDrawer.tsx`.

---

### US-OPS-03: Phân biệt tùy chọn Size/Topping/Ghi chú khi gom món

- **Mã định danh:** `US-OPS-03`
- **Vai trò:** Đầu bếp và nhân viên pha chế.
- **Tuyên bố:** Là người pha chế/làm món, tôi muốn hệ thống phân biệt rõ ràng các món cùng tên nhưng khác kích cỡ hoặc khác topping (ví dụ: 1 Cà phê đen đá ít ngọt và 1 Cà phê đen đá không đường), để tôi không làm nhầm vị cho khách.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.

#### Luồng chính
1. Khách gửi đơn chứa các món có tùy chọn khác nhau.
2. Hệ thống tạo khóa định danh duy nhất cho mỗi dòng món (dựa trên dishId + sizeId + toppings + notes).
3. Trong danh sách bếp và ngăn kéo chi tiết bàn, hai phần món này hiển thị thành 2 dòng riêng biệt rõ ràng, không bị gộp bừa bãi làm mất ghi chú riêng.

#### Tiêu chí nghiệm thu
- **AC-OPS-03.1:** *Cho trước* khách gọi 1 ly Trà tắc size M không đường và 1 ly Trà tắc size L nhiều đường, *Khi* hiển thị danh sách món bàn, *Thì* hệ thống hiển thị 2 dòng riêng biệt với size và ghi chú tương ứng.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/contexts/RestaurantContext.tsx` (`submitOrder`).

---

### US-OPS-04: Chốt danh sách món theo lượt bàn

- **Mã định danh:** `US-OPS-04`
- **Vai trò:** Vận hành quán vỉa hè.
- **Tuyên bố:** Là người quản lý quán, tôi muốn một bàn có thể gọi món nhiều lần trong suốt buổi ngồi (gọi thêm nước, gọi thêm đồ ăn vặt), và tất cả các lần gọi hợp lệ của bàn đó được tự động gom vào đúng phiên phục vụ của bàn, để không bị chia lẻ thành các đơn rời rạc khó kiểm soát.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.

#### Luồng chính
1. Bàn 02 đang có phiên phục vụ `#LT-2801`.
2. Khách tại Bàn 02 quét QR chọn thêm 2 chai nước ngọt và bấm Gửi đơn.
3. Hệ thống nhận diện Bàn 02 đang có phiên, tự động ghép 2 chai nước mới vào danh sách món của phiên `#LT-2801`.
4. Cập nhật lại tổng số phần món và tổng tiền của bàn.
5. Trạng thái bàn tiếp tục giữ ở mức ưu tiên cần phục vụ (`ordered`).

#### Tiêu chí nghiệm thu
- **AC-OPS-04.1:** *Cho trước* Bàn 02 có sẵn 3 món trị giá 75.000đ, *Khi* gửi thêm 1 món 25.000đ, *Thì* phiên bàn cập nhật thành 4 phần món với tổng tiền 100.000đ, giữ nguyên mã phiên `LT-2801`.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/contexts/RestaurantContext.tsx` (`submitOrder`).

---

### US-OPS-05: Xác nhận phục vụ và thu tiền đúng một lần (Idempotent Payment)

- **Mã định danh:** `US-OPS-05`
- **Vai trò:** Nhân viên thu ngân / Phục vụ tại bàn.
- **Tuyên bố:** Là nhân viên mang đồ ra bàn, tôi muốn sau khi giao đủ món và nhận đủ tiền mặt/chuyển khoản từ khách, tôi bấm nút "Đã phục vụ & Thu đủ tiền" để ghi nhận hóa đơn vào cơ sở dữ liệu thật, chuyển trạng thái bàn sang "Đang ngồi", và hệ thống phải chống ghi nhận tiền trùng lặp nếu tôi vô tình bấm nút 2 lần.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.
- **Điều kiện trước:** Bàn đang ở trạng thái `ordered`, nhân viên có quyền `canCollectMoney`.

#### Luồng chính
1. Nhân viên mở Drawer của bàn đang có đơn.
2. Bấm nút "Đã phục vụ & Thu đủ tiền [Tổng tiền]đ".
3. Nút chuyển sang trạng thái xử lý (loading disabled).
4. Hệ thống gửi request `POST /api/reports/payments` kèm `sessionId`, `tableNumber`, `staffId`, tổng tiền và snapshot toàn bộ món ăn.
5. Backend kiểm tra tính bất biến và Idempotency (khóa trùng lặp theo `sessionId`).
6. Backend lưu bản ghi hóa đơn vào bảng MySQL `table_session_records`, ghi nhận tên nhân viên thu tiền thật.
7. Bàn trên giao diện chuyển ngay sang trạng thái "Đang ngồi" (`seated`). Khách tiếp tục ngồi thưởng thức nước/đồ ăn.
8. Hiển thị thông báo Toast thành công màu xanh ấm áp.

#### Ngoại lệ
- **E1. Nhân viên bấm 2 lần liên tiếp hoặc mạng chập chờn:** Backend kích hoạt cơ chế Idempotent, phát hiện `sessionId` đã tồn tại, phản hồi bản ghi hiện có với thông điệp `Lượt bàn đã được ghi nhận trước đó (idempotent)`, tuyệt đối không cộng đôi tiền doanh thu.

#### Tiêu chí nghiệm thu
- **AC-OPS-05.1:** *Cho trước* Bàn 02 trạng thái `ordered` tiền 75.000đ, *Khi* bấm "Đã phục vụ & thu tiền", *Thì* trạng thái bàn chuyển thành `seated`, và bản ghi xuất hiện trong lịch sử thu tiền MySQL với đúng số tiền 75.000đ.
- **AC-OPS-05.2:** *Cho trước* lượt bàn đã được thu tiền, *Khi* gửi lại request thanh toán của cùng `sessionId`, *Thì* backend trả về HTTP 200/201 idempotent và tổng doanh thu trên Dashboard không bị tăng gấp đôi.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/contexts/RestaurantContext.tsx` (`markTableServedAndPaid`), `backend/src/reports/reports.service.ts` (`recordPayment`).

---

### US-OPS-06: Cập nhật Bàn trống khi khách rời và bàn sẵn sàng

- **Mã định danh:** `US-OPS-06`
- **Vai trò:** Nhân viên phục vụ bàn.
- **Tuyên bố:** Là nhân viên phục vụ, tôi muốn sau khi khách thanh toán xong, ngồi xong và rời quán, sau khi tôi đã dọn dẹp sạch sẽ mặt bàn, tôi bấm nút "Chuyển bàn về Trống" để bàn sẵn sàng đón lượt khách mới vào quét mã QR.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.
- **Điều kiện trước:** Bàn đang ở trạng thái `seated` (Đang ngồi - tức đã thu tiền xong).

#### Luồng chính
1. Khách đứng lên ra về.
2. Nhân viên dọn cốc, lau bàn.
3. Nhân viên mở Drawer bàn và bấm nút "Giải phóng bàn / Chuyển về Trống".
4. Hệ thống chuyển trạng thái bàn sang `empty` (Trống).
5. Phiên gọi món cũ được xóa khỏi bàn (nhưng bản ghi doanh thu và lịch sử thu tiền trong database vẫn được lưu trữ vĩnh viễn).
6. Bàn sẵn sàng cho khách mới quét QR.

#### Ngoại lệ
- **E1. Bàn chưa thu tiền (`ordered`):** Hệ thống chặn không cho giải phóng bàn, hiển thị cảnh báo: "Bàn đang có đơn chưa phục vụ và thu tiền, không thể giải phóng bàn".

#### Tiêu chí nghiệm thu
- **AC-OPS-06.1:** *Cho trước* bàn trạng thái `seated`, *Khi* nhân viên bấm chuyển về Trống, *Thì* thẻ bàn đổi sang màu xám `empty`, và không làm mất bất kỳ dữ liệu doanh thu nào trong báo cáo.
- **AC-OPS-06.2:** *Cho trước* bàn trạng thái `ordered`, *Khi* thử bấm chuyển về Trống, *Thì* hệ thống từ chối thao tác và hiển thị toast báo lỗi.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/contexts/RestaurantContext.tsx` (`markTableEmpty`).

---

### US-OPS-07: Bảo toàn lịch sử thu tiền và xác định danh tính nhân viên thu tiền

- **Mã định danh:** `US-OPS-07`
- **Vai trò:** Chủ quán, Kế toán.
- **Tuyên bố:** Là người quản lý, tôi muốn mỗi khi có tiền thu tại bàn, hệ thống phải lưu vết vĩnh viễn: thu lúc mấy giờ, bàn nào, gồm những món gì, tổng bao nhiêu tiền và nhân viên nào đã thu, để đối soát tiền mặt cuối ca không bị thất thoát.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.

#### Tiêu chí nghiệm thu
- **AC-OPS-07.1:** *Cho trước* nhân viên "Lê Hoàng Nam (Phục vụ)" bấm thu tiền Bàn 01, *Khi* tra cứu `GET /api/reports/payment-history`, *Thì* trường `confirmedBy` lưu trữ đúng `"Lê Hoàng Nam (Phục vụ)"` ngay cả khi nhân viên này sau đó đổi ca hoặc đổi thông tin.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `backend/src/reports/entities/table-session-record.entity.ts`, `backend/src/reports/reports.service.ts`.

---

### US-OPS-08: Kiểm soát quyền thu tiền tại Backend

- **Mã định danh:** `US-OPS-08`
- **Vai trò:** Quản trị viên hệ thống.
- **Tuyên bố:** Là người quản trị, tôi muốn quyền thu tiền (`canCollectMoney`) phải được kiểm tra nghiêm ngặt tại Backend NestJS, để ngăn chặn nhân viên nhà bếp hoặc người dùng giả mạo gửi request thu tiền trái phép.
- **Ưu tiên:** P0 (Bảo mật RBAC).
- **Phạm vi:** MVP.

#### Tiêu chí nghiệm thu
- **AC-OPS-08.1:** *Cho trước* nhân viên `staff-4` (Phạm Đức Tuấn - Bếp, `canCollectMoney = false`), *Khi* gửi request `POST /api/reports/payments`, *Thì* Backend trả về HTTP 403 Forbidden kèm thông báo: "Tài khoản của bạn không có quyền xác nhận thu tiền tại bàn."
- **AC-OPS-08.2:** *Cho trước* nhân viên có quyền (`staff-1`, `staff-2`), *Khi* gửi request thu tiền, *Thì* Backend phản hồi HTTP 201 Created thành công.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `backend/src/staff/staff.service.ts` (`verifyStaffPermission`), `backend/src/reports/reports.service.ts`.

