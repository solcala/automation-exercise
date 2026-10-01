import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Shared base for pages that display a product grid (Home and Products).
 * Contains product cards, add-to-cart modal, and common add-to-cart flow.
 */
export abstract class ProductGridPage extends BasePage {
  readonly productCardList: Locator;
  readonly addedModal: Locator;
  readonly addedModalViewCartLink: Locator;
  readonly addedModalContinueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productCardList = page.locator('.features_items .single-products');
    this.addedModal = page.locator('#cartModal .modal-confirm');
    this.addedModalViewCartLink = this.addedModal.getByRole('link', { name: 'View Cart' });
    this.addedModalContinueShoppingButton = this.addedModal.getByRole('button', { name: 'Continue Shopping' });
  }

  protected getProductContainer(nameOrIndex: string | number): Locator {
    if (typeof nameOrIndex === 'number') {
      return this.productCardList.nth(nameOrIndex);
    }

    return this.productCardList.filter({
      has: this.page.locator('.productinfo p').filter({ hasText: nameOrIndex })
    });
  }

  protected async addProductToCartFromContainer(container: Locator): Promise<void> {
    await container.scrollIntoViewIfNeeded();
    await container.hover();
    const addBtn = container.locator('.overlay-content .add-to-cart');
    for (let attempt = 0; attempt < 2; attempt++) {
      await addBtn.click();
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

  async viewCartFromAddedModal(): Promise<void> {
    await this.page.locator('#cartModal').waitFor({ state: 'visible', timeout: 12000 });
    await this.addedModalViewCartLink.click();
  }

  async continueShoppingFromAddedModal(): Promise<void> {
    await this.page.locator('#cartModal').waitFor({ state: 'visible', timeout: 12000 });
    await this.addedModalContinueShoppingButton.click();
  }
}
