// Generates TypeScript types from schemas/*.json into lib/content/generated/.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { compile } from "json-schema-to-typescript";

const files = readdirSync("schemas").filter((f) => f.endsWith(".json"));
for (const f of files) {
  const schema = JSON.parse(readFileSync(join("schemas", f), "utf8"));
  const name = basename(f, ".json");
  const ts = await compile(schema, name, {
    bannerComment: `/* Generated from schemas/${f} by scripts/gen-types.mjs. Do not edit. */`,
    additionalProperties: false,
    style: { singleQuote: false },
  });
  writeFileSync(join("lib/content/generated", `${name}.ts`), ts);
}
console.log(`Generated ${files.length} type files`);
