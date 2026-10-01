import { test, expect } from '@playwright/test';
import { logHealing, getHealedLocatorOrThrow } from '../../src/ai-engine/ai-bridge';

test.describe('AI Self-Healing Demo @ai-healing', () => {

  test('should recover from a broken "Contact Us" locator', async ({ page }) => {
    await page.goto('https://automationexercise.com/');

    const goal = 'The Contact Us button in the header';
    const brokenSelector = 'a[href="/wrong-contact-link"]';

    try {
      await page.locator(brokenSelector).click({ timeout: 2000 });
    } catch (err) {

      const error = err as Error;
      console.log(`Locator "${brokenSelector}" failed with error: ${error.message}`);
      console.warn(`⚠️ Primary locator failed. Engaging AI...`);

      const domSnippet = await page.locator('.shop-menu').innerHTML();

      const healedSelector = await getHealedLocatorOrThrow(domSnippet, goal);

      await page.locator(healedSelector).click();
      logHealing(brokenSelector, healedSelector, goal, {
        testName: test.info().title,
        decision: 'success'
      });
    }

    await expect(page).toHaveURL(/contact_us/);
  });
});
