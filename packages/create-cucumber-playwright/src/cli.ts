import { resolve } from "path";
import { ArgumentConfig, ParseOptions, parse } from "ts-command-line-args";

import { Generator } from "./generator";

export type Options = {
  help?: boolean;
  browser?: string[];
  noBrowsers?: boolean;
  installDeps?: boolean;
  quiet?: boolean;
};

const config: ArgumentConfig<Options> = {
  help: {
    type: Boolean,
    optional: true,
    alias: "h",
    description: "print this message",
  },
  browser: {
    type: String,
    multiple: true,
    optional: true,
    alias: "b",
    description:
      "browsers to use in default config (default: 'chromium,firefox,webkit')",
  },
  noBrowsers: {
    type: Boolean,
    optional: true,
    description:
      "do not download browsers (can be done manually via 'npx playwright install')",
  },
  installDeps: {
    type: Boolean,
    defaultValue: false,
    optional: true,
    description: "install dependencies (default: false)",
  },
  quiet: {
    type: Boolean,
    defaultValue: false,
    optional: true,
    description: "do not ask for interactive input prompts",
  },
};

const parseOptions: ParseOptions<Options> = {
  helpArg: "help",
  headerContentSections: [
    {
      header:
        "Usage: npx create-cucumber-playwright@latest [options] [rootDir]",
      content: "Thanks for using create-cucumber-playwright",
    },
  ],
};

export const run = async () => {
  await new Generator(
    resolve(
      process.cwd(),
      process.argv.slice(2).filter((a) => !a.startsWith("--"))[0] || ""
    ),
    parse<Options>(config, parseOptions)
  ).run();
};
