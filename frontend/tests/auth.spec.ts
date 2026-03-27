import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /login to/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("valid credentials redirect to catalog", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "user@goarchive.com");
    await page.fill('input[type="password"]', "User1234");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/catalog/, { timeout: 15_000 });
  });

  test("invalid credentials shows persistent error banner", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    const errorBanner = page.locator('[data-testid="error-banner"]');
    await expect(errorBanner).toBeVisible({ timeout: 10_000 });

    await page.waitForTimeout(2000);
    await expect(errorBanner).toBeVisible();
  });

  test("register link navigates to register page", async ({ page }) => {
    await page.goto("/login");
    await page.click("text=Register");
    await expect(page).toHaveURL(/\/register/);
  });
});

test.describe("Register", () => {
  test("register page renders correctly", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /join us/i })).toBeVisible();
    await expect(page.locator('input[placeholder="John Doe"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("mismatched passwords shows inline error", async ({ page }) => {
    await page.goto("/register");
    await page.fill('input[placeholder="John Doe"]', "Test User");
    await page.fill('input[type="email"]', "newuser@example.com");

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill("Password123");
    await passwordInputs.nth(1).fill("DifferentPass");

    await expect(page.locator("text=Passwords don't match")).toBeVisible();
  });
});
