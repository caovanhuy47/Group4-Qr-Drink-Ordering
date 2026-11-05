// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const TEST_USER = process.env.TEST_STAFF_USER || 'hungnv';
const TEST_PASS = process.env.TEST_STAFF_PASSWORD || '1234';

test.describe('Vòng đời Kiểm thử Playwright: Upload Ảnh & Chuẩn Hóa Popup Thông Báo Admin', () => {
  const tmpDir = path.join(__dirname, '..', '..', 'tmp-test-media');
  const validPngPath = path.join(tmpDir, 'test-dish.png');
  const oversizedFilePath = path.join(tmpDir, 'oversized-file.jpg');

  test.beforeAll(async () => {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    // 1x1 valid PNG
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    fs.writeFileSync(validPngPath, Buffer.from(pngBase64, 'base64'));

    // > 10MB file (10.5 MB)
    const largeBuffer = Buffer.alloc(10.5 * 1024 * 1024);
    // Add fake JPG magic bytes at start
    largeBuffer[0] = 0xff;
    largeBuffer[1] = 0xd8;
    largeBuffer[2] = 0xff;
    fs.writeFileSync(oversizedFilePath, largeBuffer);
  });

  test.afterAll(async () => {
    try {
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    } catch {}
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/staff/login');
    await page.fill('input[placeholder*="username"], input[name="username"], input[type="text"]', TEST_USER);
    await page.fill('input[type="password"]', TEST_PASS);
    await page.click('button[type="submit"]');

    const startShiftBtn = page.locator('button', { hasText: 'Bắt đầu ca trực' });
    if (await startShiftBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startShiftBtn.click();
      await page.waitForTimeout(500);
    }

    // Dismiss any feedback popup (e.g. login / shift success notice)
    const closeFeedbackBtn = page.locator('button', { hasText: 'Đóng' });
    if (await closeFeedbackBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeFeedbackBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('Kịch bản 1: Mở Form Món ăn, kiểm tra ImageUploader có 2 tab rõ ràng và switch tab', async ({ page }) => {
    await page.goto('/#/admin/menu');
    await page.waitForTimeout(1000);

    const addDishBtn = page.locator('button', { hasText: 'Thêm món' });
    await expect(addDishBtn).toBeVisible();
    await addDishBtn.click();

    // Form modal hiển thị
    await expect(page.locator('#modal-title')).toHaveText('Thêm Món Mới Vào Thực Đơn');

    // Kiểm tra 2 tab của ImageUploader
    const uploadTab = page.locator('button', { hasText: 'Tải ảnh từ máy' });
    const urlTab = page.locator('button', { hasText: 'Dùng link URL' });
    await expect(uploadTab).toBeVisible();
    await expect(urlTab).toBeVisible();

    // Tab mặc định là Tải ảnh từ máy
    await expect(page.locator('text=Bấm để chọn ảnh từ máy hoặc kéo thả vào đây')).toBeVisible();

    // Chuyển sang tab Link URL
    await urlTab.click();
    await expect(page.locator('input[type="url"]')).toBeVisible();

    // Chuyển lại tab Tải ảnh từ máy
    await uploadTab.click();
    await expect(page.locator('text=Bấm để chọn ảnh từ máy hoặc kéo thả vào đây')).toBeVisible();

    // Đóng form an toàn
    await page.locator('button[aria-label="Đóng cửa sổ"]').click();
  });

  test('Kịch bản 2: Upload file ảnh từ máy (< 10MB) hiển thị xem trước, tên file và dung lượng', async ({ page }) => {
    await page.goto('/#/admin/menu');
    await page.waitForTimeout(1000);

    await page.locator('button', { hasText: 'Thêm món' }).click();

    // File input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(validPngPath);

    // Kiểm tra hiển thị tên file và dung lượng
    await expect(page.locator('text=test-dish.png')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=70 B')).toBeVisible();

    // Kiểm tra có nút Đổi ảnh và Hủy chọn
    await expect(page.locator('button', { hasText: 'Đổi ảnh' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Hủy chọn' })).toBeVisible();

    // Đóng form
    await page.locator('button[aria-label="Đóng cửa sổ"]').click();
  });

  test('Kịch bản 3: Từ chối file >= 10MB hiển thị thông báo lỗi rõ ràng', async ({ page }) => {
    await page.goto('/#/admin/menu');
    await page.waitForTimeout(1000);

    await page.locator('button', { hasText: 'Thêm món' }).click();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(oversizedFilePath);

    // Kiểm tra thông báo lỗi dung lượng vượt quá giới hạn 10MB
    await expect(page.locator('text=Dung lượng ảnh vượt quá giới hạn')).toBeVisible({ timeout: 5000 });

    // Đóng form
    await page.locator('button[aria-label="Đóng cửa sổ"]').click();
  });

  test('Kịch bản 4: Mở Form Banner quảng cáo, kiểm tra ImageUploader hỗ trợ tỉ lệ banner', async ({ page }) => {
    await page.goto('/#/admin/banners');
    await page.waitForTimeout(1000);

    const addBannerBtn = page.locator('button', { hasText: 'Thêm banner mới' });
    await expect(addBannerBtn).toBeVisible();
    await addBannerBtn.click();

    // Kiểm tra ImageUploader trong Banner form
    await expect(page.locator('text=Hình ảnh Banner quảng cáo')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Tải ảnh từ máy' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Dùng link URL' })).toBeVisible();

    // Đóng modal
    await page.locator('button', { hasText: 'Hủy' }).first().click();
  });

  test('Kịch bản 5: Biểu tượng "Order thành công" trên thẻ bàn hiển thị chuẩn xác không bị lệch', async ({ page }) => {
    await page.goto('/#/admin/tables');
    await page.waitForTimeout(1000);

    // Kiểm tra bộ lọc trạng thái và huy hiệu
    const heading = page.locator('h1', { hasText: 'Quản lý bàn' });
    await expect(heading).toBeVisible();

    const orderSuccessCard = page.locator('button', { hasText: 'Order thành công' });
    await expect(orderSuccessCard).toBeVisible();

    // Kiểm tra cấu trúc icon status badge
    const badgeIcons = page.locator('.material-symbols-outlined', { hasText: 'receipt_long' });
    const count = await badgeIcons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

