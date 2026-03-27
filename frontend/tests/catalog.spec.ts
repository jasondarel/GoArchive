import { test, expect } from "@playwright/test";

test.describe("Catalog", () => {
  test("catalog page loads with heading", async ({ page }) => {
    await page.goto("/catalog");
    await expect(page.getByRole("heading", { name: "Catalog" })).toBeVisible();
  });

  test("catalog displays book cards after loading", async ({ page }) => {
    await page.goto("/catalog");

    await expect(page.locator('[data-testid="book-card"]').first()).toBeVisible({
      timeout: 15_000,
    });

    const cardCount = await page.locator('[data-testid="book-card"]').count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test("clicking a book card navigates to detail page", async ({ page }) => {
    await page.goto("/catalog");

    await expect(page.locator('[data-testid="book-card"]').first()).toBeVisible({
      timeout: 15_000,
    });

    const firstCard = page.locator('[data-testid="book-card"]').first();
    await firstCard.locator("h3").click();

    await expect(page).toHaveURL(/\/catalog\/\d+/, { timeout: 10_000 });
  });

  test("navbar is visible with expected links", async ({ page }) => {
    await page.goto("/catalog");
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("nav").getByRole("link", { name: /catalog/i })).toBeVisible();
    await expect(page.locator("nav").getByRole("link", { name: /favorites/i })).toBeVisible();
  });
});
