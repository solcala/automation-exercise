import { Page, Locator } from '@playwright/test';
import { ProductGridPage } from './product-grid.page';

export class ProductPage extends ProductGridPage {
  protected readonly path: string = '/products';

  readonly allProductsHeading: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchedProductsHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.allProductsHeading = page.getByRole('heading', { name: /all products/i });
    this.searchInput = page.getByPlaceholder('Search Product');
    this.searchButton = page.locator('#submit_search');
    this.searchedProductsHeading = page.getByText(/searched products/i);
  }

  async addProductToCartByIndex(index: number): Promise<void> {
    const container = this.getProductContainer(index);
    await this.addProductToCartFromContainer(container);
  }

  async addProductToCartByName(name: string): Promise<void> {
    const container = this.getProductContainer(name);
    await this.addProductToCartFromContainer(container);
  }

  async search(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm);
    await this.searchButton.click();
    try {
      await this.searchedProductsHeading.waitFor({ state: 'visible', timeout: 15000 });
    } catch (err) {
      await this.assertNotOverloaded('product search');
      throw err;
    }
    await this.assertNotOverloaded('product search');
  }

  async clickViewProduct(index: number): Promise<void> {
    const viewProductLinks = this.page.locator('a[href*="product_details"]');
    await viewProductLinks.nth(index).scrollIntoViewIfNeeded();
    await viewProductLinks.nth(index).click();
  }

  async clickCategory(categoryName: string, subCategoryName?: string): Promise<void> {
    if (subCategoryName) {
      await this.page.getByRole('link', { name: subCategoryName }).first().click();
    } else {
      await this.page.getByRole('link', { name: categoryName }).first().click();
    }
  }

  async clickBrand(brandName: string): Promise<void> {
    await this.page.getByRole('link', { name: new RegExp(brandName, 'i') }).first().click();
  }

  async getProductCount(): Promise<number> {
    return this.productCardList.count();
  }
}
