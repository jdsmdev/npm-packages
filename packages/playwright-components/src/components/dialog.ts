import { Locator, Page } from "playwright";

export class DialogComponent {
  readonly page: Page;
  readonly root: Page | Locator;
  readonly headingTitle: Locator;
  readonly closeButton: Locator;
  readonly actionButton: Locator;
  readonly cancelButton: Locator;

  constructor(root: Page | Locator) {
    this.page = "page" in root ? root.page() : root;
    this.root = root;
    this.headingTitle = root.getByRole("heading").nth(0);
    this.closeButton = root.getByRole("button", { name: "close" });
    this.actionButton = root.locator("button[type='submit']");
    this.cancelButton = root.getByRole("button", { name: "cancel" });
  }

  async click(name: string) {
    await this.root.getByRole("button", { name }).click();
  }
}
