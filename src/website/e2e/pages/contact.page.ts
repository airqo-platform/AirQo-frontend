import { WebDriver } from 'selenium-webdriver';
import { BasePage } from './base.page';

export class ContactPage extends BasePage {
  constructor(driver: WebDriver) {
    super(driver);
  }

  async open(): Promise<void> {
    await this.navigateTo('/contact');
  }

  async isPageLoaded(): Promise<boolean> {
    const url = await this.driver.getCurrentUrl();
    return url.includes('/contact');
  }

  async isFormDisplayed(): Promise<boolean> {
    return (
      (await this.isDisplayed('button')) || (await this.isDisplayed('form'))
    );
  }

  async fillForm(data: {
    name?: string;
    email?: string;
    message?: string;
  }): Promise<void> {
    if (data.name) {
      await this.typeText(
        'input[name="name"], input[placeholder*="name" i]',
        data.name,
      );
    }
    if (data.email) {
      await this.typeText(
        'input[name="email"], input[type="email"]',
        data.email,
      );
    }
    if (data.message) {
      await this.typeText('textarea, input[name="message"]', data.message);
    }
  }

  async submitForm(): Promise<void> {
    await this.click('button[type="submit"], form button');
  }
}
