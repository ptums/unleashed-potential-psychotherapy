// Copies the CMS JSON schemas into schemas/. The CMS repo (unleashed-cms) is the source of truth.
// Usage: pnpm sync:schemas [path-to-unleashed-cms]  (default: ../unleashed-cms)
import { cpSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const cmsRoot = resolve(process.argv[2] ?? "../unleashed-cms");
const from = join(cmsRoot, "json");
const files = readdirSync(from).filter((f) => f.endsWith(".json"));
for (const f of files) {
  cpSync(join(from, f), join("schemas", f));
}
console.log(`Copied ${files.length} schemas from ${from}`);
