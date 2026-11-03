// @ts-check
const { test, expect } = require('@playwright/test');

const TEST_USER = process.env.TEST_STAFF_USER || 'hungnv';
const TEST_PASS = process.env.TEST_STAFF_PASSWORD || '1234';

test.describe('Vòng đời Kiểm thử Playwright Trang Tổng quan (Tuân thủ Zero-DB-Interference)', () => {
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

  test('Kịch bản 1: Điều hướng từ Sơ đồ bàn sang Tổng quan không bị trắng trang', async ({ page }) => {
    await page.goto('/#/staff/tables');
    const overviewBtn = page.locator('aside button, nav button').filter({ hasText: 'Tổng quan' }).first();
    await overviewBtn.waitFor({ state: 'visible' });
    await overviewBtn.click();

    await expect(page.locator('h1, h2, h3').filter({ hasText: 'Tổng quan kinh doanh' }).first()).toBeVisible();
    await expect(page.locator('text=Biểu đồ tiền đã thu')).toBeVisible();
    await expect(page.locator('text=Món bán chạy nhất trong kỳ')).toBeVisible();
  });

  test('Kịch bản 2: Điều hướng từ Quản lý món ăn sang Tổng quan', async ({ page }) => {
    await page.goto('/#/staff/menu');
    const overviewBtn = page.locator('aside button, nav button').filter({ hasText: 'Tổng quan' }).first();
    await overviewBtn.waitFor({ state: 'visible' });
    await overviewBtn.click();

    await expect(page.locator('h1, h2, h3').filter({ hasText: 'Tổng quan kinh doanh' }).first()).toBeVisible();
  });

  test('Kịch bản 3: Mở trực tiếp URL /#/staff/overview và F5 reload', async ({ page }) => {
    await page.goto('/#/staff/overview');
    await expect(page.locator('h1, h2, h3').filter({ hasText: 'Tổng quan kinh doanh' }).first()).toBeVisible();
    await page.reload();
    await expect(page.locator('h1, h2, h3').filter({ hasText: 'Tổng quan kinh doanh' }).first()).toBeVisible();
  });

  test('Kịch bản 4: Xử lý phòng thủ khi API trả về doanh thu món null (Mock client-side không ghi DB)', async ({ page }) => {
    await page.route('**/api/reports/overview*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          period: 'today',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          totalRevenue: 0,
          totalPaidSessions: 0,
          totalItemsSold: 0,
          currentUsingTables: 0,
          tableStatusCounts: { empty: 8, ordered: 0, seated: 0, total: 8 },
          longestWaitingTables: [],
          revenueChartData: [],
          topSellingDishes: [
            { name: 'Món Thử Nghiệm Null Revenue', quantity: 1, revenue: null },
          ],
          recentPaidSessions: [],
        }),
      });
    });

    await page.goto('/#/staff/overview');
    await expect(page.locator('text=Món Thử Nghiệm Null Revenue')).toBeVisible();
    await expect(page.locator('text=Doanh thu: 0đ')).toBeVisible();
  });
});
