import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const specPackagePath = require.resolve('@personaldata/spec/package.json');
const specRoot = join(dirname(specPackagePath), 'schema');
const outputFile = join(process.cwd(), 'src', 'generated', 'schemas.ts');

mkdirSync(dirname(outputFile), { recursive: true });

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
const entries: string[] = [];

for (const schemaPath of schemas) {
  const content = JSON.parse(readFileSync(schemaPath, 'utf8')) as { $id?: string };
  const id = content.$id ?? relative(specRoot, schemaPath);
  entries.push(`  ${JSON.stringify(id)}: ${JSON.stringify(content)}`);
}

const output = `// Auto-generated. Do not edit.
export const schemas = {
${entries.join(',\n')}
} as const;
`;

writeFileSync(outputFile, output);
console.log(`Embedded ${schemas.length} schemas in src/generated/schemas.ts`);
