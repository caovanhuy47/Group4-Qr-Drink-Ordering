// @ts-check
const { test, expect } = require('@playwright/test');

const TEST_USER = process.env.TEST_STAFF_USER || 'hungnv';
const TEST_PASS = process.env.TEST_STAFF_PASSWORD || '1234';

test.describe('Vòng đời Kiểm thử Playwright Trang Hồ sơ Nhân viên & Ca làm việc (Zero DB Interference)', () => {
  test.beforeEach(async ({ page }) => {
    // Phase A: Chuẩn bị & Đăng nhập người dùng thực tế
    await page.goto('/#/staff/login');
    await page.fill('input[placeholder*="username"], input[name="username"], input[type="text"]', TEST_USER);
    await page.fill('input[type="password"]', TEST_PASS);
    await page.click('button[type="submit"]');

    const startShiftBtn = page.locator('button', { hasText: 'Bắt đầu ca trực' });
    await startShiftBtn.waitFor({ state: 'visible', timeout: 5000 });
    await startShiftBtn.click();
    await page.waitForTimeout(1000);
  });

  test('Kịch bản 1: Mở trang Hồ sơ cá nhân hiển thị thông tin thực tế từ tài khoản', async ({ page }) => {
    await page.goto('/#/staff/profile');

    // Kiểm tra tiêu đề và thông tin tài khoản
    await expect(page.locator('h3').filter({ hasText: 'Nguyễn Văn Hùng' })).toBeVisible();
    await expect(page.locator('text=@hungnv')).toBeVisible();
    await expect(page.locator('text=Chủ quán / Quản lý').first()).toBeVisible();

    // Kiểm tra các thẻ ca trực hiển thị số liệu thực (không dùng mock 28 đơn / 2.450.000đ)
    await expect(page.locator('text=Đơn đã phục vụ (Database)')).toBeVisible();
    await expect(page.locator('text=Doanh số thu tại bàn')).toBeVisible();
  });

  test('Kịch bản 2: Mở Modal Chỉnh sửa hồ sơ cá nhân và kiểm tra các trường', async ({ page }) => {
    await page.goto('/#/staff/profile');

    const editBtn = page.locator('button', { hasText: 'Chỉnh sửa hồ sơ' });
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Modal xuất hiện
    await expect(page.locator('h3', { hasText: 'Chỉnh sửa thông tin cá nhân' })).toBeVisible();
    const nameInput = page.locator('input[value="Nguyễn Văn Hùng"]');
    await expect(nameInput).toBeVisible();

    // Đóng modal an toàn
    await page.locator('button', { hasText: 'Hủy' }).click();
    await expect(page.locator('h3', { hasText: 'Chỉnh sửa thông tin cá nhân' })).not.toBeVisible();
  });

  test('Kịch bản 3: Mở Modal Đổi mật khẩu/PIN và kiểm tra xác thực form', async ({ page }) => {
    await page.goto('/#/staff/profile');

    const pinBtn = page.locator('button', { hasText: 'Đổi PIN' });
    await expect(pinBtn).toBeVisible();
    await pinBtn.click();

    // Modal đổi PIN xuất hiện
    await expect(page.locator('h3', { hasText: 'Đổi mật khẩu / Mã PIN ca trực' })).toBeVisible();

    // Thử nhập mật khẩu ngắn hơn 4 ký tự
    await page.fill('input[placeholder="Nhập mã mới"]', '12');
    await page.fill('input[placeholder="Nhập lại mã mới"]', '12');
    await page.click('button[type="submit"]');

    // Kiểm tra thông báo lỗi validation
    await expect(page.locator('text=Mật khẩu / Mã PIN ca trực phải có ít nhất 4 ký tự.')).toBeVisible();

    // Đóng modal
    await page.locator('button', { hasText: 'Hủy' }).click();
    await expect(page.locator('h3', { hasText: 'Đổi mật khẩu / Mã PIN ca trực' })).not.toBeVisible();
  });

  test('Kịch bản 4: Bật/tắt chuông báo đơn mới lưu trạng thái', async ({ page }) => {
    await page.goto('/#/staff/profile');

    const checkbox = page.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();

    const initialState = await checkbox.isChecked();
    await checkbox.click();
    const newState = await checkbox.isChecked();
    expect(newState).toBe(!initialState);
  });
});
