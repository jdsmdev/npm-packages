import { run } from "./cli";

(async () => {
  await run();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
