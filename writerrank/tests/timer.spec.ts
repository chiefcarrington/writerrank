import { test, expect } from '@playwright/test';

// Starts the timer and expects redirect to /done

test('redirects to /done after timer ends', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: /start/i }).click();
  await page.waitForURL('**/done', { timeout: 190000 });
  expect(page.url()).toContain('/done');
});
