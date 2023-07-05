import { Browser, chromium, firefox, webkit } from "@playwright/test";
import { getConfig } from "./config";

export const startSuite = async (
  setDefaultTimeout: (timeout: number) => void
): Promise<Browser> => {
  const config = await getConfig();

  setDefaultTimeout(process.env.DEBUG ? -1 : config.timeout || -1);

  if (!config.projects) {
    throw new Error("No browser is configured!");
  }

  switch (config.projects[0].name) {
    case "firefox":
      return await firefox.launch();
    case "webkit":
      return await webkit.launch();
    default:
      return await chromium.launch();
  }
};

export const endSuite = async (browser: Browser) => {
  browser.close();
};
