import { Page, Locator } from '@playwright/test';
import { getHealedLocatorOrThrow, logHealing } from '../ai-engine/ai-bridge';
import { appConfig } from '../config';

export abstract class BasePage {
  protected readonly path: string = '/';

  readonly page: Page;

  // --- Navbar ---
  readonly header: Locator;
  readonly homeLink: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly signupLoginLink: Locator;
  readonly loggedAsLink: Locator;
  readonly logoutLink: Locator;
  readonly deleteAccountLink: Locator;
  readonly contactUsLink: Locator;
  // --- Footer ---
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;

    // ---Navbar ---
    this.header = page.locator('#header');
    this.homeLink = this.header.getByRole('link', { name: 'Home' });
    this.productsLink = this.header.getByRole('link', { name: 'Products' });
    this.cartLink = this.header.getByRole('link', { name: 'Cart' });
    this.signupLoginLink = page.getByRole('link', { name: ' Signup / Login' });
    this.loggedAsLink = page.getByText(/Logged in as .*/);
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
    this.deleteAccountLink = page.getByRole('link', { name: 'Delete Account' });
    this.contactUsLink = this.page.getByRole('link', { name: ' Contact us' });

    // --- Footer ---
    this.footer = page.locator('#footer');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.path);
    await this.page.waitForURL(`**${this.path}`);
    await this.homeLink.waitFor({ state: 'visible' });

  }

  async clickContactUs(brokenLink?: string, meta?: { testName?: string }): Promise<void> {
    const selector = brokenLink || this.contactUsLink;
    await this.smartClick(selector, 'The Contact Us link in the top menu', meta);
  }

  // async logout(): Promise<void> {
  //   await this.smartClick(this.logoutLink, 'The Logout link in the top menu');
  // }

  async logout(): Promise<void> {
    await this.smartClick(this.logoutLink, 'The Logout link in the top menu');
  }

  /**
   * Smart Click: Tries a normal click. If it fails, uses AI to heal and logs the attempt.
   */
  async smartClick(
    selectorOrLocator: string | Locator,
    goal: string,
    meta?: { testName?: string }
  ): Promise<void> {
    const originalRef = typeof selectorOrLocator === 'string'
      ? selectorOrLocator
      : selectorOrLocator.toString();

    try {
      if (typeof selectorOrLocator === 'string') {
        await this.page.locator(selectorOrLocator).click({ timeout: 3000 });
      } else {
        await selectorOrLocator.click({ timeout: 3000 });
      }
    } catch (err) {
      const error = err as Error;
      console.log(`Locator "${originalRef}" failed with error: ${error.message}`);
      console.warn(`⚠️ SmartClick failed for [${originalRef}]. Engaging AI Healing for: ${goal}`);

      const domSnippet = await this.page.locator('body').innerHTML();
      const healedSelector = await getHealedLocatorOrThrow(domSnippet, goal);

      console.log(`✨ AI found fix: ${healedSelector}`);
      await this.page.locator(healedSelector).click();

      logHealing(originalRef, healedSelector, goal, {
        testName: meta?.testName,
        decision: 'success',
        model: appConfig.ai.model
      });
    }
  }
}
