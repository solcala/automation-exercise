import { test, expect } from '../../src/fixtures/base-fixture';
import { TestUtils } from '../../src/utils/test-utils';

test.describe('Homepage Visuals @visual', () => {

  test('should match the baseline snapshot', async ({ pom, page }) => {
    await test.step('Navigate home and wait for page to settle', async () => {
      await pom.homePage.navigate();
      await expect(pom.homePage.footer).toBeVisible();
      await expect(page.getByText(/under heavy load|queue full/i)).toHaveCount(0);
      await TestUtils.prepareForScreenshot(page);
    });

    await test.step('Capture full-page homepage screenshot against baseline', async () => {
      await expect(page).toHaveScreenshot('homepage.png', {
        mask: [
          pom.homePage.mainCarouselSlider,
          pom.homePage.recommendedItemCarousel
        ],
        fullPage: true
      });
    });
  });

});
