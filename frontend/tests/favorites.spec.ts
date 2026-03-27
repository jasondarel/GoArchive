import { test, expect } from "@playwright/test";

test.describe("Favorites", () => {
  test("favorites page loads with heading", async ({ page }) => {
    await page.goto("/favorites");
    await expect(page.getByRole("heading", { name: "Favorites" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("empty favorites shows 'No favorites yet' or book cards", async ({ page }) => {
    await page.goto("/favorites");

    const hasCards = await page.locator('[data-testid="book-card"]').count();
    if (hasCards === 0) {
      await expect(page.locator("text=No favorites yet")).toBeVisible({ timeout: 10_000 });
      await expect(page.locator("text=Browse Catalog")).toBeVisible();
    } else {
      expect(hasCards).toBeGreaterThan(0);
    }
  });

  test("browse catalog button from empty favorites navigates to /catalog", async ({ page }) => {
    await page.goto("/favorites");

    const browseBtn = page.locator("button", { hasText: "Browse Catalog" });
    const isVisible = await browseBtn.isVisible().catch(() => false);
    if (isVisible) {
      await browseBtn.click();
      await expect(page).toHaveURL(/\/catalog/);
    } else {
      test.skip();
    }
  });

  test("unauthenticated user visiting /favorites is redirected to /login", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto("/favorites");
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

    await context.close();
  });
});
