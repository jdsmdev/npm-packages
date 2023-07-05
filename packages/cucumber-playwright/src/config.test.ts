import { getConfig, DEFAULT_CONFIG } from "./config";
import { playwrightConfig } from "./resources/playwright.config";

describe("Configuration loader", () => {
  test("should have a default configuration", async () => {
    expect(await getConfig()).toBe(DEFAULT_CONFIG);
  });

  test("should load a configuration file", async () => {
    process.env.CONFIG_PATH = "./resources/playwright.config";
    expect(await getConfig()).toBe(playwrightConfig);
  });

  test("should load default config if config file does not exist", async () => {
    process.env.CONFIG_PATH = "./this/path/does/not/exist";
    expect(await getConfig()).toBe(DEFAULT_CONFIG);
  });
});
