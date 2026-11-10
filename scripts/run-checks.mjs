import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const libDir = join(root, "src", "lib");
const outDir = join(root, ".checks");
const checkFiles = readdirSync(libDir).filter((file) => file.endsWith(".check.ts"));

if (checkFiles.length === 0) {
  console.log("No check files found.");
  process.exit(0);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

execFileSync(
  process.execPath,
  [
    join(root, "node_modules", "typescript", "bin", "tsc"),
    ...checkFiles.map((file) => join("src", "lib", file)),
    "--outDir",
    outDir,
    "--rootDir",
    join("src", "lib"),
    "--module",
    "nodenext",
    "--target",
    "es2022",
    "--lib",
    "es2022,dom",
    "--moduleResolution",
    "nodenext",
    "--skipLibCheck",
  ],
  { stdio: "inherit", cwd: root }
);

for (const file of checkFiles) {
  const js = join(outDir, file.replace(/\.ts$/, ".js"));
  execFileSync(process.execPath, [js], { stdio: "inherit" });
}
