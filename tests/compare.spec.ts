import { test, expect } from '@playwright/test';

test.describe('Comparison Component', () => {
  test('should render the comparison slider and allow dragging', async ({ page }) => {
    // Replace with a valid slug from your actual data
    const slug = 'some-valid-comparison-slug';
    await page.goto(`/?prompt=${slug}`);

    // Check if the comparison container is visible
    const compareContainer = page.locator('div[class*="cursor-col-resize"]');
    await expect(compareContainer).toBeVisible();

    // Simulate dragging the slider
    const box = await compareContainer.boundingBox();
    if (box) {
      const xStart = box.x + box.width / 2;
      const yStart = box.y + box.height / 2;

      await page.mouse.move(xStart, yStart);
      await page.mouse.down();
      await page.mouse.move(xStart + 100, yStart);
      await page.mouse.up();
    }

    // The test passes if the page doesn't crash and the element is visible
    await expect(compareContainer).toBeVisible();
  });

  test('back button should be interactive', async ({ page }) => {
    const slug = 'some-valid-comparison-slug';
    await page.goto(`/?prompt=${slug}`);

    const backBtn = page.locator('button[aria-label="Back"]');
    await expect(backBtn).toBeVisible();
    await expect(backBtn).toBeEnabled();
  });
});
