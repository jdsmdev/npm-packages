import { bold, cyan, gray, green, yellow } from "ansi-colors";
import { execSync } from "child_process";
import { prompt } from "enquirer";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, isAbsolute, join, relative, sep } from "path";
import { PackageJson } from "type-fest";

import { PackageManager, determinePackageManager } from "./packageManager";
import { Options } from "./cli";

const ASSETS_DIR = join(__dirname, "..", "assets");
const PACKAGE_MANAGER: PackageManager = determinePackageManager();

const DEPS = [
  "@cucumber/cucumber",
  "@cucumber/html-formatter",
  "cucumber-console-formatter",
  "ts-node",
  "typescript",
];
const DEPS_DEV = ["@types/node", "npm-run-all", "rimraf"];

const SCRIPTS: PackageJson["scripts"] = {
  build: "rimraf build && npm run lint && npm run check",
  check:
    "cucumber-js features --dry-run --format progress --format progress-bar",
  lint: "npm-run-all lint:*",
  "lint:eslint": "exit 0",
  "lint:prettier": "exit 0",
  "lint:types": "tsc",
  report: "open reports/report.html",
  snippets: "cucumber-js features --dry-run --format snippets",
  "steps-usage": "cucumber-js features --dry-run --format usage",
  test: "cucumber-js",
  "test:all": "npm run test features",
  "test:debug": "PWDEBUG=1 DEBUG=pw:api cucumber-js",
  "test:parallel": "npm run test -- --parallel",
  trace: "npx playwright show-trace",
};

type Answers = {
  installPlaywrightBrowsers: boolean;
  installPlaywrightDependencies: boolean;
};

export class Generator {
  readonly rootDir: string;
  readonly options: Options;

  constructor(rootDir: string, options: Options) {
    this.rootDir = rootDir;
    this.options = options;

    if (!existsSync(rootDir)) mkdirSync(rootDir);
  }

  async run() {
    this.printPrologue();

    const answers = await this.askQuestions();
    const { files, commands } = await this.identifyChanges(answers);

    executeCommands(this.rootDir, commands);
    await this.createFiles(files);

    this.patchGitIgnore();
    await this.patchPackageJSON();

    this.printEpilogue();
  }

  printPrologue() {
    console.log(
      yellow(
        `Getting started with writing ${bold("end-to-end")} tests with ${bold(
          "Cucumber"
        )} and ${bold("Playwright")}:`
      )
    );

    console.log(
      `Initializing project in '${
        relative(process.cwd(), this.rootDir) || "."
      }'`
    );
  }

  async askQuestions(): Promise<Answers> {
    if (process.env.TEST_OPTIONS) return JSON.parse(process.env.TEST_OPTIONS);

    if (this.options.quiet) {
      return {
        installPlaywrightDependencies: !!this.options.installDeps,
        installPlaywrightBrowsers: !this.options.noBrowsers,
      };
    }

    const questions = [
      {
        type: "confirm",
        name: "installPlaywrightBrowsers",
        message: `Install Playwright browsers (can be done manually via '${PACKAGE_MANAGER.npx(
          "playwright",
          "install"
        )}')?`,
        initial: true,
      },
      process.platform === "linux" && {
        type: "confirm",
        name: "installPlaywrightDependencies",
        message: `Install Playwright operating system dependencies (requires sudo / root - can be done manually via 'sudo ${PACKAGE_MANAGER.npx(
          "playwright",
          "install-deps"
        )}')?`,
        initial: false,
      },
    ];

    const result = await prompt<Answers>(questions.filter(Boolean));

    return result;
  }

  async identifyChanges(answers: Answers) {
    const commands = [];

    if (!existsSync(join(this.rootDir, "package.json"))) {
      commands.push({
        name: `Initializing ${PACKAGE_MANAGER.name} project`,
        command: PACKAGE_MANAGER.init(),
      });
    }

    commands.push({
      name: "Installing Dependencies",
      command: PACKAGE_MANAGER.install(DEPS.join(" ")),
    });

    commands.push({
      name: "Installing Dev Dependencies",
      command: PACKAGE_MANAGER.installDev(DEPS_DEV.join(" ")),
    });

    const browsersSuffix = this.options.browser
      ? " " + this.options.browser.join(" ")
      : "";

    if (answers.installPlaywrightBrowsers) {
      commands.push({
        name: "Downloading browsers",
        command:
          PACKAGE_MANAGER.npx("playwright", "install") +
          (answers.installPlaywrightDependencies ? " --with-deps" : "") +
          browsersSuffix,
      });
    }

    return {
      files: [
        "cucumber.mjs",
        "playwright.config.ts",
        "tsconfig.json",
        join("features", "home.feature"),
        join("reports", "README.md"),
        join("src", "hooks", "common.ts"),
        join("src", "pages", "home.ts"),
        join("src", "steps", "home.ts"),
      ],
      commands,
    };
  }

  async createFiles(files: string[], force = false) {
    files.forEach((path) => this.createFile(path, readAsset(path), force));
  }

  async createFile(path: string, data: string, force: boolean) {
    const absolutePath = join(this.rootDir, path);

    if (existsSync(absolutePath) && !force) {
      const { override } = await prompt<{ override: boolean }>({
        type: "confirm",
        name: "override",
        message: `${absolutePath} already exists. Override it?`,
        initial: false,
      });

      if (!override) return;
    }

    console.log(gray(`Writing ${relative(process.cwd(), absolutePath)}.`));

    mkdirSync(dirname(absolutePath), {
      recursive: true,
    });

    writeFileSync(absolutePath, data, "utf-8");
  }

  patchGitIgnore() {
    const gitIgnorePath = join(this.rootDir, ".gitignore");
    let gitIgnore = "";

    if (existsSync(gitIgnorePath))
      gitIgnore = readFileSync(gitIgnorePath, "utf-8").trimEnd() + "\n";

    if (!gitIgnore.includes("node_modules")) gitIgnore += "node_modules/\n";

    gitIgnore += "reports/\n!reports/README.md\n";
    writeFileSync(gitIgnorePath, gitIgnore);
  }

  async patchPackageJSON() {
    const packageJSON = JSON.parse(
      readFileSync(join(this.rootDir, "package.json"), "utf-8")
    ) as PackageJson;

    packageJSON.scripts = SCRIPTS;

    await this.createFile(
      "package.json",
      JSON.stringify(packageJSON, null, 2) + "\n",
      true
    );
  }

  printEpilogue() {
    console.log(
      green("\u2714 Success!") +
        " " +
        bold(`Created a Cucumber Playwright Test project at ${this.rootDir}`)
    );

    const pathToNavigate = relative(process.cwd(), this.rootDir);

    const prefix =
      pathToNavigate !== ""
        ? `  cd ${pathToNavigate}
`
        : "";

    console.log(`
Inside that directory, you can run several commands:

  ${cyan(PACKAGE_MANAGER.runTest())}
    Runs the end-to-end tests.

  ${cyan(PACKAGE_MANAGER.runTest("--ui"))}
    Starts the interactive UI mode.

  ${cyan(PACKAGE_MANAGER.runTest("--project=chromium"))}
    Runs the tests only on Desktop Chrome.

  ${cyan(PACKAGE_MANAGER.runTest("example"))}
    Runs the tests in a specific file.

  ${cyan(PACKAGE_MANAGER.runTest("--debug"))}
    Runs the tests in debug mode.

  ${cyan(PACKAGE_MANAGER.npx("playwright", "codegen"))}
    Auto generate tests with Codegen.

We suggest that you begin by typing:

  ${cyan(prefix + "  " + PACKAGE_MANAGER.runTest())}

And check out the following files:
  - .${sep}${
      pathToNavigate
        ? join(pathToNavigate, "playwright.config.ts")
        : "playwright.config.ts"
    } - Playwright Test configuration

Visit https://playwright.dev/docs/intro for more information. \u2728

Happy hacking! \u{1F3AD}`);
  }
}

const executeCommands = (
  cwd: string,
  commands: { name: string; command: string }[]
) =>
  commands.forEach(({ command, name }) => executeCommand(name, command, cwd));

const executeCommand = (name: string, command: string, cwd: string) => {
  console.log(`${name} (${command})\u2026`);
  execSync(command, {
    stdio: "inherit",
    cwd,
  });
};

const readAsset = (asset: string) => {
  return readFileSync(
    isAbsolute(asset) ? asset : join(ASSETS_DIR, asset),
    "utf-8"
  );
};
