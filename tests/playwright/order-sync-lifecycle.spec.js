// @ts-check
const { test, expect } = require('@playwright/test');

const TEST_USER = process.env.TEST_STAFF_USER || 'hungnv';
const TEST_PASS = process.env.TEST_STAFF_PASSWORD || '1234';

test.describe('Vòng đời Đồng bộ Gọi Món Từ Điện Thoại Đến Admin (Tuân thủ Zero-DB-Interference)', () => {
  test('Toàn bộ luồng: Khách quét QR Bàn 03 đặt món ➔ Admin nhận đơn thời gian thực ➔ Thu tiền ➔ Giải phóng bàn', async ({ page }) => {
    // ==========================================
    // PHẦN 1: KHÁCH HÀNG ĐẶT MÓN QUA MẠNG LAN / QR
    // ==========================================
    // 1. Khách mở link QR bàn B03 (mô phỏng quét mã QR trên điện thoại)
    await page.goto('/#/?table=B03');
    await page.waitForTimeout(500);

    // Xác nhận đã nhận diện đúng Bàn 03
    await expect(page.locator('text=Bàn 03').first()).toBeVisible();

    // 2. Mở chi tiết món "Bún Bò Huế Đặc Biệt"
    const dishCard = page.locator('text=Bún Bò Huế Đặc Biệt').first();
    await dishCard.waitFor({ state: 'visible' });
    await dishCard.click();

    // 3. Trong Modal chi tiết, bấm "Thêm vào giỏ"
    const addToCartBtn = page.locator('button', { hasText: 'Thêm vào giỏ' }).first();
    await addToCartBtn.waitFor({ state: 'visible' });
    await addToCartBtn.click();
    await page.waitForTimeout(500);

    // 4. Mở trang Giỏ hàng
    await page.goto('/#/cart');
    await expect(page.locator('text=Bàn 03').first()).toBeVisible();

    // 5. Bấm "Tiến hành đặt món" để sang trang Xác nhận
    const proceedBtn = page.locator('button', { hasText: 'Tiến hành đặt món' }).first();
    await proceedBtn.waitFor({ state: 'visible' });
    await proceedBtn.click();

    // 6. Trên trang Xác nhận, bấm "Xác nhận gửi đơn vào bếp"
    const submitBtn = page.locator('button', { hasText: 'Xác nhận gửi đơn vào bếp' }).first();
    await submitBtn.waitFor({ state: 'visible' });

    const [orderResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/reports/active-orders') && res.ok()),
      submitBtn.click(),
    ]);

    const orderData = await orderResponse.json();
    expect(orderData.success).toBe(true);
    expect(orderData.tableNumber).toBe('BÀN 03');
    expect(orderData.status).toBe('ordered');

    // 7. Xác nhận đã tự động chuyển sang màn hình Theo dõi đơn
    await expect(page).toHaveURL(/.*order-tracking.*/);
    await expect(page.locator('text=Bàn 03').first()).toBeVisible();

    // ==========================================
    // PHẦN 2: QUẢN TRỊ VIÊN / ADMIN NHẬN ĐƠN BÀN 03
    // ==========================================
    // 8. Đăng nhập nhân viên/admin
    await page.goto('/#/staff/login');
    await page.fill('input[placeholder*="username"], input[name="username"], input[type="text"]', TEST_USER);
    await page.fill('input[type="password"]', TEST_PASS);
    await page.click('button[type="submit"]');

    const startShiftBtn = page.locator('button', { hasText: 'Bắt đầu ca trực' });
    await startShiftBtn.waitFor({ state: 'visible', timeout: 5000 });
    await startShiftBtn.click();
    await page.waitForTimeout(1000);

    // 9. Mở màn hình quản lý bàn
    await page.goto('/#/staff/tables');
    await page.waitForSelector('text=Quản lý bàn');

    // Bàn 03 phải hiển thị trạng thái Order thành công (ordered)
    const table03Card = page.locator('div').filter({ hasText: /^BÀN 03/ }).first();
    await expect(table03Card).toBeVisible();

    // Nút xem món trên card Bàn 03
    const viewDishBtn = table03Card.locator('button', { hasText: /Xem món/ }).first();
    await expect(viewDishBtn).toBeVisible();
    await viewDishBtn.click();

    // Drawer hiển thị đúng Chi tiết BÀN 03 và món ăn
    await expect(page.locator('h3', { hasText: 'Chi tiết BÀN 03' })).toBeVisible();
    await expect(page.locator('text=Bún Bò Huế Đặc Biệt').first()).toBeVisible();

    // ==========================================
    // PHẦN 3: PHỤC VỤ, THU TIỀN VÀ GIẢI PHÓNG BÀN
    // ==========================================
    // 10. Bấm "Đã phục vụ và thu tiền" bên trong Drawer
    const drawer = page.locator('.fixed.inset-0');
    const payBtn = drawer.locator('button', { hasText: 'Đã phục vụ và thu tiền' }).first();
    await payBtn.waitFor({ state: 'visible' });

    const [payResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/reports/payments') && res.ok()),
      payBtn.click(),
    ]);

    const payData = await payResponse.json();
    expect(payData.success).toBe(true);

    // 11. Đóng drawer nếu còn mở
    const closeBtn = drawer.locator('button', { hasText: 'close' }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
    await page.waitForTimeout(500);

    // 12. Kiểm tra Bàn 03 đã chuyển sang Đang ngồi (seated) với nút "Bàn trống"
    const seatedCard = page.locator('div').filter({ hasText: /^BÀN 03/ }).first();
    const clearBtn = seatedCard.locator('button', { hasText: 'Bàn trống' }).first();
    await expect(clearBtn).toBeVisible();

    // 13. Bấm "Bàn trống" giải phóng bàn về Trống
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/reports/tables/complete') && res.ok()),
      clearBtn.click(),
    ]);

    // Bàn 03 trở về Trống hoàn toàn
    await expect(seatedCard.locator('button', { hasText: 'Xem thông tin bàn' }).first()).toBeVisible();
  });
});
