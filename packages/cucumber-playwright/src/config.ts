import type { PlaywrightTestConfig } from "@playwright/test";

export const DEFAULT_CONFIG: PlaywrightTestConfig = {
  timeout: 8000,

  expect: {
    timeout: 5000,
  },

  use: {
    headless: true,
    viewport: {
      width: 1920,
      height: 1080,
    },
    ignoreHTTPSErrors: true,
    actionTimeout: 5000,
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

type ConfigFormat = {
  playwrightConfig: PlaywrightTestConfig;
};

let config: PlaywrightTestConfig;

const loadConfig: () => Promise<PlaywrightTestConfig> = async () => {
  if (config) return config;

  const configPath = process.env.CONFIG_PATH || "../playwright.config";

  try {
    const fullConfig = (await import(configPath)) as ConfigFormat;
    config = fullConfig?.playwrightConfig || DEFAULT_CONFIG;
    return config;
  } catch (ex) {
    return DEFAULT_CONFIG;
  }
};

export const getConfig: () => Promise<PlaywrightTestConfig> = async () => {
  return config || loadConfig();
};
