import { test, expect } from '../../src/fixtures/mock.fixtures';

test.describe('Checkout with mocked API (500 error)', () => {
  test.use({ mockApi: { checkout: '500' } });

  test('Handles server error when payment submission fails', async ({ pom, page }) => {
    test.setTimeout(90_000);

    await test.step('Navigate home and confirm logged-in session', async () => {
      await pom.homePage.navigate();
      await expect(pom.homePage.logoutLink).toBeVisible();
      await expect(page.getByText(/under heavy load|queue full/i)).toHaveCount(0);
    });

    await test.step('Add a product and open a populated cart', async () => {
      await pom.homePage.addFirstProductToCart();
      await pom.homePage.viewCartFromAddedModal();
      await expect(page).toHaveURL(/view_cart/, { timeout: 15000 });
      await expect(page.getByText(/under heavy load|queue full/i)).toHaveCount(0);
      await expect(pom.cartPage.emptyCartMessage).toBeHidden();
      await expect(pom.cartPage.cartItems.first()).toBeVisible();
      await expect(pom.cartPage.proceedToCheckoutButton).toBeVisible({ timeout: 15000 });
    });

    await test.step('Proceed to checkout and open payment page', async () => {
      await pom.cartPage.proceedToCheckout();
      await expect(pom.checkoutPage.page).toHaveURL(/checkout/, { timeout: 15000 });
      await pom.checkoutPage.goToPayment();
      await expect(pom.paymentPage.page).toHaveURL(/payment/);
    });

    await test.step('Submit payment and verify 500 mock prevents order success', async () => {
      await pom.paymentPage.fillCardAndConfirm('Test User', '4111111111111111', '123', '12', '2028');
      await expect(pom.paymentDonePage.orderPlacedHeading).toBeHidden({ timeout: 5000 });
    });
  });
});

test.describe('Checkout with mocked API + slow 3G', () => {
  test.use({ mockApi: { checkout: '500', delay: 2000 } });

  test('Handles 500 with delay (simulates slow 3G)', async ({ pom, page }) => {
    test.setTimeout(90_000);

    await test.step('Navigate home and confirm logged-in session', async () => {
      await pom.homePage.navigate();
      await expect(pom.homePage.logoutLink).toBeVisible();
      await expect(page.getByText(/under heavy load|queue full/i)).toHaveCount(0);
    });

    await test.step('Add a product and open a populated cart', async () => {
      await pom.homePage.addFirstProductToCart();
      await pom.homePage.viewCartFromAddedModal();
      await expect(page).toHaveURL(/view_cart/, { timeout: 15000 });
      await expect(page.getByText(/under heavy load|queue full/i)).toHaveCount(0);
      await expect(pom.cartPage.emptyCartMessage).toBeHidden();
      await expect(pom.cartPage.cartItems.first()).toBeVisible();
      await expect(pom.cartPage.proceedToCheckoutButton).toBeVisible({ timeout: 15000 });
    });

    await test.step('Proceed to checkout and open payment page', async () => {
      await pom.cartPage.proceedToCheckout();
      await expect(pom.checkoutPage.page).toHaveURL(/checkout/, { timeout: 15000 });
      await pom.checkoutPage.goToPayment();
      await expect(pom.paymentPage.page).toHaveURL(/payment/);
    });

    await test.step('Submit delayed payment and verify order success stays hidden', async () => {
      await pom.paymentPage.fillCardAndConfirm('Test User', '4111111111111111', '123', '12', '2028');
      await expect(pom.paymentDonePage.orderPlacedHeading).toBeHidden({ timeout: 5000 });
    });
  });
});
