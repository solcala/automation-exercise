import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductDetailPage extends BasePage {

  protected readonly path: string = '/product_details';

  readonly productName: Locator;
  readonly productCategory: Locator;
  readonly productPrice: Locator;
  readonly productAvailability: Locator;
  readonly productCondition: Locator;
  readonly productBrand: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly addedModal: Locator;
  readonly addedModalViewCartLink: Locator;
  readonly addedModalContinueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = page.locator('.product-information h2');
    this.productCategory = page.locator('.product-information p').filter({ hasText: /category/i });
    this.productPrice = page.locator('.product-information span span');
    this.productAvailability = page.locator('.product-information p').filter({ hasText: /availability/i });
    this.productCondition = page.locator('.product-information p').filter({ hasText: /condition/i });
    this.productBrand = page.locator('.product-information p').filter({ hasText: /brand/i });
    this.quantityInput = page.locator('#quantity');
    this.addToCartButton = page.locator('.product-information').getByRole('button', { name: /add to cart/i });
    this.addedModal = page.locator('#cartModal .modal-confirm');
    this.addedModalViewCartLink = this.addedModal.getByRole('link', { name: 'View Cart' });
    this.addedModalContinueShoppingButton = this.addedModal.getByRole('button', { name: 'Continue Shopping' });
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.clear();
    await this.quantityInput.fill(quantity.toString());
  }

  async addToCart(): Promise<void> {
    for (let attempt = 0; attempt < 2; attempt++) {
      await this.addToCartButton.click();
      try {
        await this.page.locator('#cartModal').waitFor({ state: 'visible', timeout: 12000 });

        return;
      } catch {
        if (attempt === 1) {
          throw new Error('Added cart modal (#cartModal) did not become visible after two add-to-cart clicks');
        }
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  async addToCartWithQuantity(quantity: number): Promise<void> {
    await this.setQuantity(quantity);
    await this.addToCart();
  }

  async viewCartFromModal(): Promise<void> {
    await this.page.locator('#cartModal').waitFor({ state: 'visible', timeout: 12000 });
    await this.addedModalViewCartLink.click();
  }
}
