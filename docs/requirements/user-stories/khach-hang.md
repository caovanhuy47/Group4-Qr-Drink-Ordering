# User Stories: Phân Hệ Khách Hàng (Customer)

Tài liệu đặc tả các User Stories dành riêng cho đối tượng **Khách hàng quét mã QR** tại quán nước vỉa hè Huy CV.

---

### US-CUST-01: Quét mã QR vào đúng bàn, không yêu cầu đăng nhập

- **Mã định danh:** `US-CUST-01`
- **Vai trò:** Khách hàng đến quán vỉa hè.
- **Tuyên bố:** Là một khách hàng ngồi tại bàn, tôi muốn dùng camera điện thoại quét mã QR dán trên bàn để mở thực đơn quán với số bàn của tôi được nhận diện tự động, để tôi có thể chọn món ngay mà không phải cài app hay đăng ký tài khoản phiền phức.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.
- **Điều kiện trước:** Bàn đã có mã QR chứa tham số bàn (ví dụ `https://huycv.vn/#/?table=02` hoặc `?t=B05`).

#### Luồng chính (Main Flow)
1. Khách quét mã QR bằng camera/Zalo trên điện thoại.
2. Trình duyệt mở ứng dụng tại route `#/` hoặc `#/lobby`.
3. Hệ thống trích xuất tham số `table` từ URL Query hoặc Hash, chuẩn hóa thành tên bàn hiển thị (ví dụ "BÀN 02").
4. Hệ thống lưu số bàn vào `sessionStorage` của phiên duyệt web hiện tại.
5. Giao diện sảnh thực đơn hiển thị huy hiệu bàn "Đang ngồi tại BÀN 02" trên thanh tiêu đề.

#### Ngoại lệ (Exceptions)
- **E1. URL không có tham số bàn:** Hệ thống hiển thị huy hiệu chọn bàn nhanh, cho phép khách chọn số bàn từ danh sách bàn đang hoạt động trước khi gửi đơn.

#### Tiêu chí nghiệm thu (Acceptance Criteria)
- **AC-CUST-01.1:** *Cho trước* khách quét URL `http://localhost:5173/#/?table=05`, *Khi* trang tải xong, *Thì* hệ thống hiển thị số bàn là `BÀN 05`, không xuất hiện bất kỳ popup đăng nhập/đăng ký nào, và không yêu cầu nhập OTP.
- **AC-CUST-01.2:** *Cho trước* khách đang ở bàn `BÀN 05`, *Khi* khách bấm F5 tải lại trang, *Thì* số bàn `BÀN 05` vẫn được bảo toàn nguyên vẹn từ `sessionStorage`.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/contexts/RestaurantContext.tsx` (`resolveCurrentTableFromEnv`), `frontend/src/views/customer/FoodLobbyView.tsx`.

---

### US-CUST-02: Xem, tìm kiếm và lọc danh mục thực đơn món ăn

- **Mã định danh:** `US-CUST-02`
- **Vai trò:** Khách hàng tại bàn.
- **Tuyên bố:** Là một khách hàng, tôi muốn xem toàn bộ danh mục thực đơn, cuộn lướt các món kèm hình ảnh trực quan, tìm kiếm theo tên và lọc theo nhóm món, để tôi nhanh chóng tìm được đồ uống hoặc món ăn yêu thích.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.
- **Điều kiện trước:** Backend đã nạp dữ liệu từ MySQL bảng `dishes` và `categories`.

#### Luồng chính
1. Khách xem carousel banner giờ vàng/khuyến mãi ở đầu trang.
2. Khách vuốt thanh tab danh mục trượt ngang (Tất cả, Món bán chạy, Đồ uống hè, Ăn vặt phố...).
3. Bấm vào một tab danh mục: Danh sách món tự động lọc tương ứng.
4. Nhập từ khóa vào thanh tìm kiếm: Lưới món tự động lọc thời gian thực.
5. Mỗi thẻ món hiển thị rõ: Ảnh món, tên món, nhãn đặc biệt (Bán chạy / Mới / Chay), giá tiền VNĐ rõ ràng, và nút "+".

#### Ngoại lệ
- **E1. Món hết hàng (`isAvailable === false`):** Thẻ món hiển thị mờ, gắn nhãn "Tạm hết", nút "+" chuyển sang trạng thái disabled ngăn thêm vào giỏ.

#### Tiêu chí nghiệm thu
- **AC-CUST-02.1:** *Cho trước* thực đơn có 6 món trong database, *Khi* khách bấm tab "Đồ uống hè", *Thì* chỉ các món thuộc danh mục đồ uống xuất hiện.
- **AC-CUST-02.2:** *Cho trước* thanh tìm kiếm, *Khi* khách gõ "Huế", *Thì* món "Bún bò Huế đặc biệt" xuất hiện ngay lập tức mà không cần bấm Enter.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/views/customer/FoodLobbyView.tsx`, `frontend/src/services/dishesApi.ts`.

---

### US-CUST-03: Xem chi tiết món, tùy chọn Size, Topping và Ghi chú

- **Mã định danh:** `US-CUST-03`
- **Vai trò:** Khách hàng tại bàn.
- **Tuyên bố:** Là một khách hàng, tôi muốn bấm vào thẻ món để xem ảnh lớn, mô tả hương vị, chọn kích cỡ (Size), chọn các món thêm (Topping) và nhập ghi chú riêng (ví dụ: "Ít đường, nhiều đá"), để món được làm đúng khẩu vị của tôi.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.
- **Điều kiện trước:** Khách bấm vào một thẻ món đang còn hàng.

#### Luồng chính
1. BottomSheet (trên Mobile) hoặc Modal căn giữa (trên Desktop) mở lên mượt mà.
2. Hiển thị ảnh lớn, tên món, giá gốc.
3. Phần chọn Size: Radio button chọn 1 size (mặc định chọn size Tiêu chuẩn).
4. Phần chọn Topping: Checkbox cho phép chọn nhiều loại topping kèm giá cộng thêm.
5. Ô nhập ghi chú riêng cho nhà bếp (tối đa 150 ký tự).
6. Bộ tăng giảm số lượng phần món (mặc định là 1, tối thiểu 1).
7. Nút hành động "Thêm vào giỏ — [Tổng tiền tính động]đ".

#### Tiêu chí nghiệm thu
- **AC-CUST-03.1:** *Cho trước* món Bún Bò Huế giá 55.000đ, *Khi* khách chọn Size Tô lớn (+10.000đ) và Topping Chả cua (+10.000đ), *Thì* nút hành động cập nhật tức thì thành "Thêm vào giỏ — 75.000đ".
- **AC-CUST-03.2:** *Cho trước* modal chi tiết đang mở, *Khi* khách bấm "Thêm vào giỏ", *Thì* modal đóng lại, thanh giỏ hàng nổi hiển thị tổng số lượng tăng lên kèm thông báo toast xác nhận thành công.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/components/customer/DishDetailModal.tsx`.

---

### US-CUST-04: Điều chỉnh giỏ hàng nháp theo bàn

- **Mã định danh:** `US-CUST-04`
- **Vai trò:** Khách hàng tại bàn.
- **Tuyên bố:** Là một khách hàng, tôi muốn xem lại toàn bộ các món đã chọn trong giỏ, tăng/giảm số lượng từng món, xóa món không muốn gọi trước khi gửi đơn, để tôi kiểm soát chính xác chi phí bữa ăn.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.
- **Điều kiện trước:** Giỏ hàng có ít nhất 1 món.

#### Luồng chính
1. Khách bấm vào nút Giỏ hàng nổi hoặc chuyển tới URL `/#/cart`.
2. Hiển thị từng dòng món kèm chi tiết Size, Topping, Ghi chú và thành tiền.
3. Bấm "+" để tăng số lượng; bấm "-" để giảm số lượng (nếu giảm về 0 sẽ hỏi xác nhận xóa khỏi giỏ).
4. Tổng thanh toán hiển thị đúng 100% bằng tổng tiền các món ăn (theo quy định: không áp dụng voucher trong MVP).
5. Nút "Tiếp tục đặt món" dẫn sang trang Xác nhận đặt món.

#### Tiêu chí nghiệm thu
- **AC-CUST-04.1:** *Cho trước* giỏ hàng có 2 món tổng tiền 95.000đ, *Khi* khách giảm 1 món giá 20.000đ về 0, *Thì* món đó biến mất khỏi giỏ và tổng tiền tự động tính lại thành 75.000đ.
- **AC-CUST-04.2:** *Cho trước* quy định MVP quán vỉa hè, *Khi* mở giỏ hàng, *Thì* tuyệt đối không có khối nhập mã giảm giá, voucher hay phụ phí dịch vụ ẩn nào.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/views/customer/CartView.tsx`.

---

### US-CUST-05: Gửi món vào bếp, xác thực giá backend và chống gửi trùng

- **Mã định danh:** `US-CUST-05`
- **Vai trò:** Khách hàng tại bàn.
- **Tuyên bố:** Là một khách hàng, tôi muốn bấm "Gửi đơn gọi món" để đơn được chuyển thẳng tới bếp làm đồ, đồng thời hệ thống tự động kiểm tra xem giá và món có còn bán hay không, ngăn chặn gửi trùng lặp nếu tôi bấm nút nhiều lần.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.
- **Điều kiện trước:** Khách đang ở trang Xác nhận đặt món `/#/order-confirm`, giỏ hàng có món và đã xác định bàn.

#### Luồng chính
1. Khách kiểm tra lại số bàn và danh sách món.
2. Bấm nút "Gửi đơn gọi món".
3. Nút chuyển sang trạng thái loading disabled, ngăn khách bấm liên tục (chống gửi trùng).
4. Hệ thống gọi API `POST /api/dishes/validate-order` gửi danh sách món lên backend.
5. Backend kiểm tra tính khả dụng và đối chiếu giá hiện tại trong MySQL `dishes`.
6. Nếu hợp lệ: Backend phản hồi thành công; frontend làm rỗng giỏ hàng nháp, lưu đơn vào `currentOrder` và tự động điều hướng sang màn hình theo dõi `/#/order-tracking`.

#### Ngoại lệ
- **E1. Món bị đổi giá:** Backend phát hiện giá cũ khác giá hiện hành trong database, từ chối gửi đơn và phản hồi `reason: "price_changed"`. Frontend tự động cập nhật lại giá mới vào giỏ hàng và hiển thị toast giải thích cho khách.
- **E2. Món vừa hết hàng:** Backend phản hồi `reason: "dish_unavailable"`. Đơn không được gửi, hiển thị thông báo lỗi rõ ràng.

#### Tiêu chí nghiệm thu
- **AC-CUST-05.1:** *Cho trước* giỏ hàng hợp lệ, *Khi* gửi đơn thành công, *Thì* giỏ hàng bị xóa rỗng, và khách được chuyển thẳng tới trang `/#/order-tracking` hiển thị mã đơn hàng.
- **AC-CUST-05.2:** *Cho trước* món ăn bị quản trị viên tắt trong DB (`isAvailable = false`), *Khi* khách gửi đơn, *Thì* hệ thống chặn đơn và báo lỗi cụ thể bằng tiếng Việt, không tạo đơn rác.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/views/customer/OrderConfirmationView.tsx`, `backend/src/dishes/dishes.controller.ts` (`/validate-order`).

---

### US-CUST-06: Theo dõi tiến trình món đã đặt của lượt bàn (Order Tracking)

- **Mã định danh:** `US-CUST-06`
- **Vai trò:** Khách hàng tại bàn.
- **Tuyên bố:** Là một khách hàng sau khi đã gửi món, tôi muốn theo dõi tiến trình làm đồ của bếp theo từng bước (Đã gửi đơn ➔ Bếp đang làm ➔ Đã phục vụ và thu tiền), để tôi an tâm chờ đợi mà không phải giục nhân viên.
- **Ưu tiên:** P0 (MVP Cốt lõi).
- **Phạm vi:** MVP.
- **Điều kiện trước:** Khách đã gửi đơn thành công từ bàn hiện tại.

#### Luồng chính
1. Màn hình `/#/order-tracking` hiển thị:
   - Số bàn (ví dụ "BÀN 05").
   - Mã đơn hàng (ví dụ "#DH-5812") và thời gian gửi.
   - Trục thời gian tiến trình (Timeline FIFO): "1. Đã nhận đơn" ➔ "2. Bếp đang chuẩn bị" ➔ "3. Đã phục vụ & Thu đủ tiền".
   - Danh sách chi tiết các món đã đặt kèm số lượng và thành tiền.
   - Hướng dẫn thanh toán: "Nhân viên sẽ mang món ra bàn và thu tiền trực tiếp. Quý khách vui lòng chuẩn bị tiền mặt hoặc chuyển khoản tại chỗ".
2. Bấm nút "Gọi thêm món khác": Điều hướng về sảnh thực đơn để chọn món bổ sung cho lượt bàn này.

#### Tiêu chí nghiệm thu
- **AC-CUST-06.1:** *Cho trước* đơn vừa gửi thành công, *Khi* mở trang tracking, *Thì* timeline hiển thị bước "Đã gửi đơn" và bước "Bếp đang làm" đang sáng đèn.
- **AC-CUST-06.2:** *Cho trước* nhân viên đã bấm "Đã phục vụ & thu tiền" tại bàn, *Khi* khách xem trang tracking, *Thì* bước 3 "Đã phục vụ & Thu đủ tiền" hoàn tất.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/views/customer/OrderTrackingView.tsx`.

---

### US-CUST-07: Cô lập giỏ hàng và dữ liệu giữa các bàn khác nhau

- **Mã định danh:** `US-CUST-07`
- **Vai trò:** Khách hàng và quán.
- **Tuyên bố:** Là người dùng hệ thống, tôi muốn dữ liệu giỏ hàng và đơn của bàn này không bao giờ bị lẫn lộn sang bàn khác khi khách quét mã QR của bàn khác hoặc khi đổi bàn, để tránh việc khách bàn A trả tiền cho món bàn B.
- **Ưu tiên:** P1 (Tin cậy hệ thống).
- **Phạm vi:** MVP.

#### Luồng chính
1. Khách đang ở Bàn 02, chọn 2 món vào giỏ (lưu vào key `huycv_cart_BÀN 02`).
2. Khách chuyển sang quét mã QR Bàn 05 (URL `?table=05`).
3. Hệ thống chuyển `currentTable` sang "BÀN 05", nạp giỏ hàng từ `huycv_cart_BÀN 05` (nếu chưa có thì giỏ trống).
4. Giỏ hàng của Bàn 02 hoàn toàn độc lập, không bị ghi đè hay dồn lẫn sang Bàn 05.

#### Tiêu chí nghiệm thu
- **AC-CUST-07.1:** *Cho trước* Bàn 01 có giỏ hàng 50.000đ, *Khi* chuyển sang URL `?table=02`, *Thì* giỏ hàng Bàn 02 rỗng (0đ), và khi quay lại `?table=01` thì giỏ hàng 50.000đ được khôi phục nguyên vẹn.

- **Trạng thái:** [ĐÃ HOÀN THÀNH VÀ XÁC MINH]
- **Tập tin liên quan:** `frontend/src/contexts/RestaurantContext.tsx` (`loadDraftCartForTable`, `saveDraftCartForTable`).

