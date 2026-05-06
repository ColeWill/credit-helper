import { test, expect } from '@playwright/test';

const TEST_EMAIL = `test+${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPass123!';

test.describe('Auth flows', () => {
  test('unauthenticated user is redirected to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows error on wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type=email]', 'nobody@example.com');
    await page.fill('input[type=password]', 'wrongpassword');
    await page.click('button[type=submit]');
    await expect(page.locator('.error')).toBeVisible({ timeout: 8000 });
  });

  test('register → login → dashboard loads', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[type=email]', TEST_EMAIL);
    await page.fill('input[type=password]', TEST_PASSWORD);
    await page.click('button[type=submit]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Credit Repair Dashboard');
  });
});

test.describe('Profile flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login with existing test account (requires Firebase project to have this user)
    await page.goto('/login');
    await page.fill('input[type=email]', TEST_EMAIL);
    await page.fill('input[type=password]', TEST_PASSWORD);
    await page.click('button[type=submit]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('can navigate to profile and save', async ({ page }) => {
    await page.click('a[href="/profile"]');
    await expect(page).toHaveURL(/\/profile/);
    await page.fill('input[name=name]', 'Jane Doe');
    await page.fill('input[name=currentAddress]', '456 Oak Ave, Chicago, IL 60601');
    await page.fill('input[name=dob]', '1990-01-15');
    await page.fill('input[name=ssnLast4]', '4321');
    await page.click('button[type=submit]');
    await expect(page.locator('.success')).toBeVisible({ timeout: 8000 });
  });
});

test.describe('Dispute flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type=email]', TEST_EMAIL);
    await page.fill('input[type=password]', TEST_PASSWORD);
    await page.click('button[type=submit]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('can add a dispute and see it in the list', async ({ page }) => {
    await page.goto('/steps/step4');
    await page.click('button:has-text("+ Add Dispute")');
    await page.selectOption('select[name=bureau]', 'Experian');
    await page.fill('input[name=accountName]', 'Test Bank');
    await page.fill('input[name=accountNumber]', '****9999');
    await page.selectOption('select[name=disputeType]', 'not_mine');
    await page.click('button[type=submit]');
    await expect(page.locator('text=Test Bank')).toBeVisible({ timeout: 8000 });
  });

  test('marking dispute sent shows countdown timer', async ({ page }) => {
    await page.goto('/steps/step4');
    const markSentBtn = page.locator('button:has-text("Mark Sent")').first();
    if (await markSentBtn.isVisible()) {
      await markSentBtn.click();
      await expect(page.locator('.countdown')).toBeVisible({ timeout: 8000 });
    }
  });
});
