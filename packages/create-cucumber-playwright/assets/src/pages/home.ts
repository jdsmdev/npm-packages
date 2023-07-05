import { Locator, Page } from "../../../packages/cucumber-playwright/lib";

export default class HomePage {
  readonly page: Page;
  readonly body: Locator;

  constructor(page: Page) {
    this.page = page;
    this.body = page.locator("body");
  }

  goto() {
    this.page.goto("/");
    this.page.waitForLoadState();
  }
}
