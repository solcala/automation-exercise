import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ContactPage extends BasePage {

  protected readonly path: string = '/contact_us';

  readonly getInTouchHeading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageTextarea: Locator;
  readonly fileInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.getInTouchHeading = page.getByRole('heading', { name: /get in touch/i });
    this.nameInput = page.getByPlaceholder('Name').first();
    this.emailInput = page.getByTestId('email');
    this.subjectInput = page.getByPlaceholder('Subject');
    this.messageTextarea = page.getByPlaceholder('Your Message Here');
    this.fileInput = page.locator('input[name="upload_file"]');
    this.submitButton = page.getByTestId('submit-button');
    this.successMessage = page.getByText(/success.*your details have been submitted successfully/i);
  }

  async fillContactForm(options: {
    name: string;
    email: string;
    subject: string;
    message: string;
    filePath?: string;
  }): Promise<void> {
    await this.nameInput.fill(options.name);
    await this.emailInput.fill(options.email);
    await this.subjectInput.fill(options.subject);
    await this.messageTextarea.fill(options.message);
    if (options.filePath) {
      await this.fileInput.waitFor({ state: 'attached' });
      await this.fileInput.scrollIntoViewIfNeeded();
      await this.fileInput.setInputFiles(options.filePath);
    }
  }

  async submitAndAcceptDialog(): Promise<string> {
    const [dialog] = await Promise.all([
      this.page.waitForEvent('dialog', { timeout: 5000 }),
      this.submitButton.click(),
    ]);

    const message = dialog.message();
    await dialog.accept();
    await this.assertNotOverloaded('contact form submit');
    console.log(`Dialog message IN: ${message}`);
    console.log(`Dialog message ACCEPTED`);

    return message;
  }

  async submitContactForm(options: {
    name: string;
    email: string;
    subject: string;
    message: string;
    filePath?: string;
  }): Promise<string> {
    await this.fillContactForm(options);

    return this.submitAndAcceptDialog();
  }
}
