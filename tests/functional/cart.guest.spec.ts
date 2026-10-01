import { test, expect } from '../../src/fixtures/base-fixture';
import { DataHelper } from '../../src/utils/data-helper';

test.describe('cart page tests - guest user', () => {

  test.describe('validate page elements', () => {

    test('verify emplty list state', async ({ pom }) => {
      await test.step('Navigate to an empty cart', async () => {
        await pom.cartPage.navigate();
      });

      await test.step('Verify empty cart message and link', async () => {
        await expect.soft(pom.cartPage.emptyCartMessage).toBeVisible();
        await expect.soft(pom.cartPage.emptyCartMessage).toHaveText('Cart is empty! Click here to buy products.');
        await expect.soft(pom.cartPage.emptyCartLink).toBeVisible();
        await expect.soft(pom.cartPage.emptyCartLink).toHaveText('here');
      });
    });

    test('verify table headers', async ({ cartPageReady }) => {
      const cartPage = cartPageReady.pom.cartPage;
      const expectedHeaders = DataHelper.getExpectedCartTableHeaders();

      await test.step('Verify cart table headers match expected values', async () => {
        expect(await cartPage.getTableHeaders()).toEqual(expectedHeaders);
      });
    });

  });

  test('verify product details in cart table', async ({ cartPageReady }) => {
    const cartPage = cartPageReady.pom.cartPage;
    const productDetails = cartPageReady.productDetails;

    await test.step('Read product row details from the cart table', async () => {
      const actualData = await cartPage.getProductDataFromRow(productDetails.name);

      expect.soft(actualData.description).toContain(productDetails.name);
      expect.soft(actualData.price).toContain(productDetails.price);
      expect.soft(actualData.quantity).toContain('1');
      expect.soft(actualData.total).toContain('Rs. 1500');
    });
  });

  test('remove product from cart', async ({ cartPageReady }) => {
    const { pom, productDetails } = cartPageReady;

    await test.step('Remove the product from the cart table', async () => {
      await pom.cartPage.removeItemFromCart(productDetails.name);
      await expect(pom.cartPage.emptyCartMessage).toBeVisible();
    });

    await test.step('Follow empty-cart link back to products', async () => {
      await pom.cartPage.goToHomePageViaEmptyCartLink();
      await expect(pom.productPage.page).toHaveURL('/products');
    });
  });

  test.describe('proceed to checkout modal - guest user', () => {

    test('verify modal elements', async ({ cartPageReady }) => {
      const { pom } = cartPageReady;

      await test.step('Open guest checkout modal from cart', async () => {
        await pom.cartPage.proceedToCheckoutAsGuest();
        await expect(pom.cartPage.checkoutModal).toBeVisible();
      });

      await test.step('Verify checkout modal content and actions', async () => {
        await expect.soft(pom.cartPage.checkoutModalTitle).toBeVisible();
        await expect.soft(pom.cartPage.checkoutModalTitle).toHaveText('Checkout');
        await expect.soft(pom.cartPage.checkoutModalText).toBeVisible();
        await expect.soft(pom.cartPage.checkoutModalSignupLoginLink).toBeVisible();
        await expect.soft(pom.cartPage.checkoutModalContinueOnCartButton).toBeVisible();
      });
    });

    test('continue on cart from modal', async ({ cartPageReady }) => {
      const { pom } = cartPageReady;

      await test.step('Open guest checkout modal from cart', async () => {
        await pom.cartPage.proceedToCheckoutAsGuest();
      });

      await test.step('Continue on cart and stay on view cart', async () => {
        await pom.cartPage.checkoutModalContinueOnCartButton.click();
        await expect(pom.cartPage.page).toHaveURL(/view_cart/);
        await expect(pom.cartPage.checkoutModal).toBeHidden();
      });
    });

    test('go to signup/login from modal', async ({ cartPageReady }) => {
      const { pom } = cartPageReady;

      await test.step('Open guest checkout modal from cart', async () => {
        await pom.cartPage.proceedToCheckoutAsGuest();
      });

      await test.step('Navigate to signup/login from the modal', async () => {
        await pom.cartPage.checkoutModalSignupLoginLink.click();
        await expect(pom.cartPage.page).toHaveURL(/login/);
      });
    });

  });

  test('go to home page and add another product - verify product list in cart - and total calculation', async ({
    cartPageReady,
  }) => {
    const { pom, productDetails } = cartPageReady;

    await test.step('Return home via cart breadcrumb', async () => {
      await pom.cartPage.navigaToHomeViaBreadcrum();
      await expect(pom.homePage.page).toHaveURL('/');
    });

    await test.step('Add the same product again and open cart', async () => {
      await pom.homePage.addProductAndViewCart(productDetails);
    });

    await test.step('Verify quantity and total for two items', async () => {
      const { quantity, total } = await pom.cartPage.getProductDataFromRow('Stylish Dress');

      expect.soft(Number(quantity)).toBe(2);
      const unitPrice = Number(productDetails.price.replace('Rs. ', ''));
      const expectedTotal = unitPrice * 2;
      expect.soft(Number(total.replace('Rs. ', ''))).toBe(expectedTotal);
    });
  });

});
