import { Page, Locator } from '@playwright/test';
import { ProductGridPage } from './product-grid.page';
import { Product } from '../interfaces/interfaces';

export class HomePage extends ProductGridPage {
  readonly mainCarouselSlider: Locator;
  readonly recommendedItemCarousel: Locator;
  readonly firstProductAddToCartButton: Locator;
  readonly firstProductCard: Locator;
  readonly addedModalTitle: Locator;
  readonly addedModalText: Locator;

  constructor(page: Page) {
    super(page);
    this.mainCarouselSlider = page.locator('#slider-carousel');
    this.recommendedItemCarousel = page.locator('#recommended-item-carousel');
    this.firstProductCard = this.productCardList.first();
    this.firstProductAddToCartButton = page.locator('.overlay-content .add-to-cart').first();
    this.addedModalTitle = this.addedModal.getByText('Added!');
    this.addedModalText = this.addedModal.getByText('Your product has been added to cart.');
  }

  async addFirstProductToCart(): Promise<void> {
    await this.addProductToCartFromContainer(this.firstProductCard);
  }

  async addProductAndViewCart(productInfo: Product): Promise<void> {
    const container = this.getProductContainer(productInfo.name);

    await this.addProductToCartFromContainer(container);
    await this.viewCartFromAddedModal();
  }
}
