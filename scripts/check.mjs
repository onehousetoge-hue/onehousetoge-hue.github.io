import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const commands = [
  ["scripts/lint.mjs"],
  ["scripts/typecheck.mjs"],
  ["scripts/build.mjs"],
  ["--test", "tests/site.test.mjs", "tests/inquiries.test.mjs", "tests/living-lab.test.mjs", "tests/editorial-guides.test.mjs", "tests/field-stories.test.mjs"],
  ["scripts/audit.mjs", "dist"],
];

for (const args of commands) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("All production checks passed.");
