import { test, expect } from '../../src/fixtures/base-fixture';

test.describe('Products page - guest user', () => {

  test('verify all products page and product detail', async ({ pom }) => {
    await test.step('Open products page and verify product list', async () => {
      await pom.productPage.navigate();
      await expect(pom.productPage.allProductsHeading).toBeVisible();

      const productCount = await pom.productPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
    });

    await test.step('Open first product detail and verify product info', async () => {
      await pom.productPage.clickViewProduct(0);
      await expect(pom.productDetailPage.page).toHaveURL(/product_details/);

      await expect.soft(pom.productDetailPage.productName).toBeVisible();
      await expect.soft(pom.productDetailPage.productCategory).toBeVisible();
      await expect.soft(pom.productDetailPage.productPrice).toBeVisible();
      await expect.soft(pom.productDetailPage.productAvailability).toBeVisible();
      await expect.soft(pom.productDetailPage.productCondition).toBeVisible();
      await expect.soft(pom.productDetailPage.productBrand).toBeVisible();
    });
  });

  test('search product and verify results', async ({ pom }) => {
    await test.step('Navigate to products page', async () => {
      await pom.productPage.navigate();
      await expect(pom.productPage.page).toHaveURL(/products/);
    });

    await test.step('Search for products and verify results', async () => {
      await pom.productPage.search('top');
      await expect(pom.productPage.page).toHaveURL(/search_product|products/);

      const productCount = await pom.productPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
    });
  });

  test('add multiple products to cart via hover', async ({ pom }) => {
    await test.step('Navigate to products page', async () => {
      await pom.productPage.navigate();
      await expect(pom.productPage.page).toHaveURL(/products/);
    });

    await test.step('Add first product and continue shopping', async () => {
      await pom.productPage.addProductToCartByIndex(0);
      await expect(pom.productPage.addedModal).toBeVisible();
      await pom.productPage.continueShoppingFromAddedModal();
    });

    await test.step('Add second product and open cart', async () => {
      await pom.productPage.addProductToCartByIndex(1);
      await expect(pom.productPage.addedModal).toBeVisible();
      await pom.productPage.viewCartFromAddedModal();
    });

    await test.step('Verify cart has at least two items', async () => {
      await expect(pom.cartPage.page).toHaveURL(/view_cart/);
      const itemCount = await pom.cartPage.getItemCount();
      expect(itemCount).toBeGreaterThanOrEqual(2);
    });
  });

  test('add product with quantity from product detail', async ({ pom }) => {
    await test.step('Open first product detail page', async () => {
      await pom.productPage.navigate();
      await expect(pom.productPage.page).toHaveURL(/products/);

      await pom.productPage.clickViewProduct(0);
      await expect(pom.productDetailPage.page).toHaveURL(/product_details/);
    });

    await test.step('Add product with quantity 4 and open cart from modal', async () => {
      await pom.productDetailPage.addToCartWithQuantity(4);
      await expect(pom.productDetailPage.addedModal).toBeVisible();
      await pom.productDetailPage.viewCartFromModal();
    });

    await test.step('Verify cart is not empty and quantity is 4', async () => {
      await expect(pom.cartPage.page).toHaveURL(/view_cart/);
      await expect(pom.cartPage.emptyCartMessage).toBeHidden();
      const firstRow = pom.cartPage.cartItems.first();
      await expect(firstRow).toBeVisible();
      await expect(firstRow.locator('.cart_quantity')).toHaveText('4');
    });
  });
});
