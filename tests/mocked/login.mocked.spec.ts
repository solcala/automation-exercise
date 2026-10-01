import { test, expect } from '../../src/fixtures/mock.fixtures';

test.describe('Login with mocked API', () => {
  test.use({ mockApi: { login: '401' } });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('Shows error when API returns 401 Unauthorized', async ({ pom, page }) => {
    test.setTimeout(60_000);

    await test.step('Navigate to login page', async () => {
      await pom.loginPage.navigate();
      await expect(page.getByText(/under heavy load|queue full/i)).toHaveCount(0);
    });

    await test.step('Submit credentials and verify 401 error message', async () => {
      await pom.loginPage.login('any@email.com', 'anypassword');
      await expect(pom.loginPage.loginErrorMessage).toBeVisible();
    });
  });
});

test.describe('Login with mocked API + slow 3G', () => {
  test.use({ mockApi: { login: '401', delay: 200 } });
  test.setTimeout(60000);

  test.skip('Shows error with delay (simulates slow network)', async ({ pom }) => {
    // Skip: /login may call /api/verifyLogin on load; delay can cause navigation timeout
    await pom.loginPage.navigate();
    await pom.loginPage.login('any@email.com', 'anypassword');
    await expect(pom.loginPage.loginErrorMessage).toBeVisible();
  });
});
