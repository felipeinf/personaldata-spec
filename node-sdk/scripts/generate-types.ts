import { compileFromFile } from 'json-schema-to-typescript';
import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const specPackagePath = require.resolve('@personaldata/spec/package.json');
const specRoot = join(dirname(specPackagePath), 'schema');
const outputRoot = join(process.cwd(), 'src', 'generated');

mkdirSync(outputRoot, { recursive: true });

const findSchemas = (dir: string): string[] => {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...findSchemas(full));
    } else if (entry.endsWith('.schema.json')) {
      files.push(full);
    }
  }
  return files;
};

const schemas = findSchemas(specRoot);

function dedupeExports(combined: string): string {
  const chunks = combined.split(/(?=^export (?:interface|type) )/m);
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^export (?:interface|type) (\w+)/);
    if (!match) {
      kept.push(trimmed);
      continue;
    }
    const name = match[1];
    if (seen.has(name)) continue;
    seen.add(name);
    kept.push(trimmed);
  }
  return `${kept.join('\n\n')}\n`;
}

const declarations: string[] = [];

for (const schemaPath of schemas) {
  const compiled = await compileFromFile(schemaPath, {
    bannerComment: '',
    style: { singleQuote: true, trailingComma: 'all' },
    additionalProperties: false,
  });
  declarations.push(compiled);
}

const combined = dedupeExports(declarations.join('\n\n'));
writeFileSync(join(outputRoot, 'types.ts'), combined);
console.log(`Generated ${schemas.length} type definitions in src/generated/types.ts`);
