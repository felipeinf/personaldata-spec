import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schemaRoot = join(root, "schema");

function collectSchemas(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      collectSchemas(path, acc);
    } else if (name.endsWith(".schema.json")) {
      acc.push(path);
    }
  }
  return acc;
}

const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv);

const paths = collectSchemas(schemaRoot).sort();
const schemas = paths.map((path) => ({
  path,
  doc: JSON.parse(readFileSync(path, "utf8")),
}));

for (const { doc } of schemas) {
  ajv.addSchema(doc);
}

let failed = false;

for (const { path, doc } of schemas) {
  try {
    ajv.compile(doc);
    console.log(`OK ${path.replace(root + "/", "")}`);
  } catch (err) {
    failed = true;
    console.error(`FAIL ${path.replace(root + "/", "")}: ${err.message}`);
  }
}

process.exit(failed ? 1 : 0);
