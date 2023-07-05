export type PackageManager = NPM | Yarn | PNPM;

export const determinePackageManager = (): PackageManager => {
  if (process.env.npm_config_user_agent) {
    if (process.env.npm_config_user_agent.includes("yarn")) return new Yarn();
    if (process.env.npm_config_user_agent.includes("pnpm")) return new PNPM();

    return new NPM();
  }

  return new NPM();
};

class NPM {
  readonly name: string;
  readonly cli: string;

  constructor() {
    this.name = "NPM";
    this.cli = "npm";
  }

  init() {
    return "npm init -y";
  }

  npx(command: string, args: string) {
    return `npx ${command} ${args}`;
  }

  ci() {
    return "npm ci";
  }

  install(name: string) {
    return `npm install ${name}`;
  }

  installDev(name: string) {
    return `npm install --save-dev ${name}`;
  }

  run(script: string) {
    return `npm run ${script}`;
  }

  runTest(args?: string) {
    return this.npx("playwright", `test${args ? " " + args : ""}`);
  }
}

class Yarn {
  readonly name: string;
  readonly cli: string;

  constructor() {
    this.name = "Yarn";
    this.cli = "yarn";
  }

  init() {
    return "yarn init -y";
  }

  npx(command: string, args: string) {
    return `yarn ${command} ${args}`;
  }

  ci() {
    return "yarn";
  }

  install(name: string) {
    return `yarn add ${name}`;
  }

  installDev(name: string) {
    return `yarn add --dev ${name}`;
  }

  run(script: string) {
    return `yarn ${script}`;
  }

  runTest(args?: string) {
    return this.npx("playwright", `test${args ? " " + args : ""}`);
  }
}

class PNPM {
  readonly name: string;
  readonly cli: string;

  constructor() {
    this.name = "pnpm";
    this.cli = "pnpm";
  }

  init() {
    return "pnpm init";
  }

  npx(command: string, args: string) {
    return `pnpm exec ${command} ${args}`;
  }

  ci() {
    return "pnpm install";
  }

  install(name: string) {
    return `pnpm add ${name}`;
  }

  installDev(name: string) {
    return `pnpm add --save-dev ${name}`;
  }

  run(script: string) {
    return `pnpm run ${script}`;
  }

  runTest(args?: string) {
    return this.npx("playwright", `test${args ? " " + args : ""}`);
  }
}
