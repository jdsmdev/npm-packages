import type { PlaywrightTestConfig } from "@playwright/test";

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
    baseURL: "http://localhost:3000",
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
