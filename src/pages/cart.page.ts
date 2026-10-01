import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { CartItem } from '../interfaces/interfaces';

export class CartPage extends BasePage {

  protected readonly path: string = '/view_cart';

  readonly tableHeaders: Locator;
  readonly cartItems: Locator;
  readonly emptyCartMessage: Locator;
  readonly emptyCartLink: Locator;
  readonly checkoutBreadcrum: Locator;
  readonly homeBreadcrum: Locator;

  readonly proceedToCheckoutButton: Locator;

  // --- Guest user checkout Modal---
  readonly checkoutModal: Locator;
  readonly checkoutModalTitle: Locator;
  readonly checkoutModalText: Locator;
  readonly checkoutModalSignupLoginLink: Locator;
  readonly checkoutModalContinueOnCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.tableHeaders = page.locator('thead tr td');
    this.cartItems = page.locator('#cart_info tbody tr');
    this.emptyCartMessage = page.locator('#empty_cart').getByText('Cart is empty! Click here to buy products.');
    this.emptyCartLink = this.emptyCartMessage.getByRole('link', {
      name:
        'here'
    });
    this.proceedToCheckoutButton = page.locator('.check_out').getByText('Proceed To Checkout');
    this.homeBreadcrum = page.locator('.breadcrumb').getByRole('link', { name: 'Home' });
    this.checkoutBreadcrum = page.locator('.breadcrumb .active').filter({ hasText: 'Checkout' });

    // --- Guest user checkout  Modal ---
    this.checkoutModal = page.locator('#checkoutModal .modal-confirm');
    this.checkoutModalTitle = this.checkoutModal.getByRole('heading', { name: 'Checkout' });
    this.checkoutModalText = this.checkoutModal.getByText('Register / Login account to proceed on checkout.');
    this.checkoutModalSignupLoginLink = this.checkoutModal.getByRole('link', { name: 'Register / Login' });
    this.checkoutModalContinueOnCartButton = this.checkoutModal.getByRole('button', { name: 'Continue on Cart' });
  }

  /**
   * Logged-in: click Proceed To Checkout and reach /checkout (with goto fallback if the click is swallowed).
   */
  async proceedToCheckout(): Promise<void> {
    await this.navigateToCheckoutAfterCart();
  }

  /**
   * Guest: opens the register/login modal on the cart page (must not use force: — Bootstrap needs the real click).
   * Retries once if the modal does not open (overlay / timing flake on automationexercise.com).
   */
  async proceedToCheckoutAsGuest(): Promise<void> {
    await this.proceedToCheckoutButton.scrollIntoViewIfNeeded();
    for (let attempt = 0; attempt < 2; attempt++) {
      await this.proceedToCheckoutButton.click();
      try {
        await this.page.locator('#checkoutModal').waitFor({ state: 'visible', timeout: 12000 });

        return;
      } catch {
        if (attempt === 1) {
          throw new Error('Guest checkout modal (#checkoutModal) did not become visible after two clicks');
        }
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  private async navigateToCheckoutAfterCart(): Promise<void> {
    await this.proceedToCheckoutButton.scrollIntoViewIfNeeded();
    await this.proceedToCheckoutButton.click();
    try {
      await this.page.waitForURL(/\/checkout/, { timeout: 8000 });
    } catch {
      await this.page.goto('/checkout');
    }
    await this.page.waitForURL(/\/checkout/, { timeout: 15000 });
  }

  async getTableHeaders(): Promise<String[]> {

    return await this.tableHeaders.allTextContents();
  }

  async getRowByProductName(name: string): Promise<Locator> {
    return this.cartItems.filter({ hasText: name });
  }

  async removeItemFromCart(itemName: string): Promise<void> {
    const itemRow = this.cartItems.filter({ hasText: itemName });
    const deleteButton = itemRow.locator('.cart_delete .cart_quantity_delete');

    await itemRow.first().waitFor({ state: 'visible', timeout: 10000 });

    for (let attempt = 0; attempt < 2; attempt++) {
      await deleteButton.first().click();
      try {
        await itemRow.first().waitFor({ state: 'hidden', timeout: 10000 });
        break;
      } catch {
        if (attempt === 1) {
          throw new Error(`Cart item "${itemName}" was still visible after two delete clicks`);
        }
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    // Last item removed: #empty_cart stays in the DOM but becomes visible
    if ((await this.cartItems.count()) === 0) {
      await this.page.locator('#empty_cart').waitFor({ state: 'visible', timeout: 15000 });
    }
  }

  async getProductDataFromRow(name: string): Promise<CartItem> {
    const row = await this.getRowByProductName(name);

    return {
      description: await row.locator('.cart_description').innerText(),
      price: await row.locator('.cart_price').innerText(),
      quantity: await row.locator('.cart_quantity').innerText(),
      total: await row.locator('.cart_total').innerText(),
    };
  }

  async goToHomePageViaEmptyCartLink(): Promise<void> {
    await this.emptyCartLink.click();
  }

  async navigaToHomeViaBreadcrum(): Promise<void> {
    await this.homeBreadcrum.click();
  }

  async getItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async clearEntireCart(): Promise<void> {
    const itemCount = await this.getItemCount();
    for (let i = 0; i < itemCount; i++) {
      const firstItemRow = this.cartItems.first();
      const deleteButton = firstItemRow.locator('.cart_delete .cart_quantity_delete');
      await deleteButton.click();
    }
  }
}
