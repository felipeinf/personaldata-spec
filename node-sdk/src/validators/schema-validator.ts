import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { schemas } from '../generated/schemas.js';
import { SchemaValidationError } from '../errors/index.js';

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

for (const [id, schema] of Object.entries(schemas)) {
  ajv.addSchema(schema, id);
}

export function validateAgainstSchema(schemaId: string, value: unknown): void {
  const validate = ajv.getSchema(schemaId);
  if (!validate) {
    throw new Error(`Schema not registered: ${schemaId}`);
  }
  if (!validate(value)) {
    throw new SchemaValidationError(
      `Validation failed against schema ${schemaId}`,
      { errors: validate.errors },
    );
  }
}
