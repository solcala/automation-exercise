import { test, expect } from '../../src/fixtures/base-fixture';

test.describe('Place order flow @e2e', () => {

  test('Success: place order as logged-in user', async ({ pom, page }) => {
    test.setTimeout(90_000);

    await test.step('Navigate home and confirm logged-in session', async () => {
      await pom.homePage.navigate();
      await expect(pom.homePage.logoutLink).toBeVisible();
    });

    await test.step('Add first product to cart and open cart', async () => {
      await pom.homePage.addFirstProductToCart();
      await pom.homePage.viewCartFromAddedModal();
      await expect(page.getByText(/under heavy load|queue full/i)).toHaveCount(0);
      await expect(pom.cartPage.proceedToCheckoutButton).toBeVisible({ timeout: 15000 });
    });

    await test.step('Proceed to checkout', async () => {
      await pom.cartPage.proceedToCheckout();
      await expect(pom.checkoutPage.page).toHaveURL(/checkout/);
      await expect.soft(pom.checkoutPage.checkoutBreadcrum).toBeVisible();
    });

    await test.step('Go to payment and submit card details', async () => {
      await pom.checkoutPage.goToPayment();
      await expect(pom.paymentPage.page).toHaveURL(/payment/);
      await pom.paymentPage.fillCardAndConfirm('Test User', '4111...', '123', '12', '2028');
      await pom.paymentPage.orderSuccessMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
    });

    await test.step('Verify order confirmation on payment done page', async () => {
      await pom.paymentPage.page.waitForURL(/payment_done/, { timeout: 30000 });
      await expect(page.getByText(/under heavy load|queue full/i)).toHaveCount(0);
      await expect(pom.paymentDonePage.orderPlacedHeading).toBeVisible({ timeout: 15000 });
      await expect(pom.paymentDonePage.congratulationsMessage).toBeVisible({ timeout: 15000 });
    });
  });
});
