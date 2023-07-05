import { World, IWorldOptions, Status } from "@cucumber/cucumber";
import {
  Pickle,
  TestStepResult,
  TestStepResultStatus,
} from "@cucumber/messages";
import {
  Browser,
  BrowserContext,
  ConsoleMessage,
  Page,
  PlaywrightTestConfig,
} from "@playwright/test";
import { ensureDir } from "fs-extra";

const TRACES_DIR = "traces";

export class PlaywrightWorld extends World {
  constructor(options: IWorldOptions) {
    super(options);
  }

  config?: PlaywrightTestConfig;
  context?: BrowserContext;
  pageObj?: Page;
  testName?: string;
  scenario?: Pickle;
  startTime?: Date;

  async startScenario(browser: Browser, scenario: Pickle) {
    this.startTime = new Date();
    this.scenario = scenario;
    this.testName = scenario.name.replace(/\W/g, "-");

    this.context = await browser.newContext(this.config?.use);

    await this.startTracing(scenario);
    await this.initPage();
  }

  async endScenario(result?: TestStepResult) {
    if (!result) {
      return;
    }

    await this.saveScreenshot(result.status);
    await this.endTracing(result.status);

    await this.pageObj?.close();
    await this.context?.close();
  }

  async startTracing(scenario: Pickle) {
    if (this.config?.use?.trace === "off") {
      return;
    }

    await this.context?.tracing.start({
      title: scenario.name,
      screenshots: true,
      snapshots: true,
    });
  }

  async endTracing(status: TestStepResultStatus) {
    if (
      this.config?.use?.trace === "off" ||
      (this.config?.use?.trace === "retain-on-failure" &&
        status === Status.PASSED)
    ) {
      return;
    }

    await ensureDir(TRACES_DIR);

    await this.context?.tracing.stop({
      path: `${TRACES_DIR}/${this.testName}-${
        this.startTime?.toISOString().split(".")[0]
      }trace.zip`,
    });
  }

  async saveScreenshot(status: TestStepResultStatus) {
    if (
      this.config?.use?.screenshot === "off" ||
      (this.config?.use?.screenshot === "only-on-failure" &&
        status === Status.PASSED)
    ) {
      return;
    }

    const image = await this.anyPage().screenshot();
    this.attach(image, "image/png");
  }

  async initPage() {
    if (!this.context) {
      throw new Error("No context is defined!");
    }

    this.pageObj = await this.context.newPage();
    this.pageObj.on(
      "console",
      (msg: ConsoleMessage) => msg.type() === "log" && this.attach(msg.text())
    );
    console.log("page: " + this.anyPage());
  }

  anyPage(): Page {
    if (!this.pageObj) {
      throw new Error("No page is defined!");
    }

    return this.pageObj;
  }

  page<T>(pageConstructor: new (page: Page) => T): T {
    return new pageConstructor(this.anyPage());
  }
}
