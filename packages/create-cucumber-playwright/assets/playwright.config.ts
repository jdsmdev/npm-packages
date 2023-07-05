import type { PlaywrightTestConfig } from "../packages/cucumber-playwright/lib";

export const playwrightConfig: PlaywrightTestConfig = {
  timeout: 2000,

  expect: {
    timeout: 1000,
  },

  use: {
    headless: true,
    viewport: {
      width: 1920,
      height: 1080,
    },
    ignoreHTTPSErrors: true,
    actionTimeout: 1000,
    locale: "en-US",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
    },
  ],
};
