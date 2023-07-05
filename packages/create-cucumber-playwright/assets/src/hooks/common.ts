import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  setDefaultTimeout,
  setWorldConstructor,
} from "@cucumber/cucumber";
import {
  Browser,
  PlaywrightWorld,
  endSuite,
  startSuite,
} from "../../../packages/cucumber-playwright/lib";

setWorldConstructor(PlaywrightWorld);

let browser: Browser;

BeforeAll(async () => (browser = await startSuite(setDefaultTimeout)));

Before(async function (this: PlaywrightWorld, { pickle }) {
  this.startScenario(browser, pickle);
});

After(async function (this: PlaywrightWorld, { result }) {
  this.endScenario(result);
});

AfterAll(() => endSuite(browser));
