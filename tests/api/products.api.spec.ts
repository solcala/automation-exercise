import { test, expect } from '../../src/fixtures/base-fixture';
import { Product } from '../../src/interfaces/interfaces';
import { productSchema } from '../../src/utils/api-schemas';

test.describe('Products API Tests @api', () => {

  test('verify get all product list', async ({ productsApi }) => {
    const response = await productsApi.getProductList();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.responseCode).toBe(200);
    const products: Product[] = body.products;
    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);

    await test.step('Validate search results content and schema', async () => {
      products.forEach((product: Product) => {
        expect.soft(product).toMatchObject(productSchema);
      });

      const blueTop = products.find(p => p.id === 1);
      expect.soft(blueTop, 'Product with ID 1 should be in the list').toBeDefined();
      expect.soft(blueTop).toMatchObject({
        name: 'Blue Top',
        brand: 'Polo',
      });
    });

  });

  test('verify invalid method - Post', async ({ productsApi }) => {

    const response = await productsApi.invalidMethodPostAllProducts();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect.soft(body.responseCode).toBe(405);
    expect.soft(body.message).toBe('This request method is not supported.');

  });

  test('verify search product', async ({ productsApi }) => {

    const searchTerm = 'top';
    const response = await productsApi.searchProduct(searchTerm);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect.soft(body.responseCode).toBe(200);
    const products: Product[] = body.products;

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);

    await test.step('Validate search results content and schema', async () => {
      products.forEach((product: Product) => {
        expect.soft(product).toMatchObject(productSchema);

        const searchMatch =
          product.name.toLowerCase().includes(searchTerm) ||
          product.category.category.toLowerCase().includes(searchTerm) ||
          product.brand.toLowerCase().includes(searchTerm);

        expect.soft(searchMatch,
          `Product ID ${product.id} (${product.name}) should match the search term '${searchTerm}' in name, category, or brand`
        ).toBe(true);

      });
    });
  });

  test('verify search without search parameter', async ({ productsApi }) => {

    const response = await productsApi.searchProduct();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect.soft(body.responseCode).toBe(400);
    expect.soft(body.message).toBe('Bad request, search_product parameter is missing in POST request.');

  });

  test('search with empty string', async ({ productsApi }) => {
    const response = await productsApi.searchProduct('');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect.soft(body.responseCode).toBe(200);
    console.log(body);
    expect(Array.isArray(body.products)).toBe(true);
  });

  test('search with no-match term returns empty array', async ({ productsApi }) => {
    const response = await productsApi.searchProduct('xyznonexistent123');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.responseCode).toBe(200);
    expect(body.products).toBeDefined();
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products).toHaveLength(0);
  });

  test('invalid method PUT on productsList returns 405', async ({ productsApi }) => {
    const response = await productsApi.invalidMethodPutAllProducts();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.responseCode).toBe(405);
    expect(body.message).toBe('This request method is not supported.');
  });

  test('invalid method DELETE on productsList returns 405', async ({ productsApi }) => {
    const response = await productsApi.invalidMethodDeleteAllProducts();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.responseCode).toBe(405);
    expect(body.message).toBe('This request method is not supported.');
  });

  test('invalid method PATCH on productsList returns 405', async ({ productsApi }) => {
    const response = await productsApi.invalidMethodPatchAllProducts();
    expect(response.status()).toBe(405);
    const body = await response.json();
    expect(body.detail).toBe('Method "PATCH" not allowed.');
  });

  test('invalid method GET on searchProduct returns 405', async ({ productsApi }) => {
    const response = await productsApi.invalidMethodGetSearchProduct();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.responseCode).toBe(405);
    expect(body.message).toBe('This request method is not supported.');
  });

  for (const searchTerm of ['top', 'tshirt', 'jean', 'polo']) {
    test(`search product with term "${searchTerm}" returns matching results`, async ({ productsApi }) => {
      const response = await productsApi.searchProduct(searchTerm);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.responseCode).toBe(200);
      expect(body.products).toBeDefined();
      expect(Array.isArray(body.products)).toBe(true);
      expect(body.products.length).toBeGreaterThan(0);
      body.products.forEach((product: Product) => {
        const searchMatch =
          product.name.toLowerCase().includes(searchTerm) ||
          product.category.category.toLowerCase().includes(searchTerm) ||
          product.brand.toLowerCase().includes(searchTerm);
        expect(searchMatch, `Product ${product.id} should match '${searchTerm}'`).toBe(true);
      });
    });
  }

  test('search results are subset of full product list', async ({ productsApi }) => {
    const [listResponse, searchResponse] = await Promise.all([
      productsApi.getProductList(),
      productsApi.searchProduct('top')
    ]);
    const listBody = await listResponse.json();
    const searchBody = await searchResponse.json();
    expect(listBody.responseCode).toBe(200);
    expect(searchBody.responseCode).toBe(200);

    const allProductIds = new Set(listBody.products.map((p: Product) => p.id));
    searchBody.products.forEach((product: Product) => {
      expect(allProductIds.has(product.id), `Product ${product.id} from search should exist in full list`).toBe(true);
    });
  });

});
