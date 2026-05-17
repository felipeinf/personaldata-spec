import { randomUUID } from 'node:crypto';
import { validateAgainstSchema } from '../validators/schema-validator.js';
import {
  assertHasSupersedesIfRequired,
  assertPurposeIsActive,
} from '../validators/business-rules.js';
import { SchemaIds } from '../schema-ids.js';
import type { Purpose } from '../generated/aliases.js';


function toNonEmptyStringTuple(
  values: ReadonlyArray<string>,
): [string, ...string[]] {
  return [...values] as [string, ...string[]];
}

export interface CreatePurposeInput {
  readonly controllerId: string;
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly dataCategories: ReadonlyArray<string>;
  readonly retention: Purpose['retention'];
  readonly legalBasis?: 'consent';
}

export const PurposeFactory = {
  create(input: CreatePurposeInput): Purpose {
    const purpose: Purpose = {
      id: randomUUID(),
      version: 1,
      controllerId: input.controllerId,
      name: input.name,
      displayName: input.displayName,
      description: input.description,
      dataCategories: toNonEmptyStringTuple(input.dataCategories),
      retention: input.retention,
      legalBasis: input.legalBasis ?? 'consent',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    validateAgainstSchema(SchemaIds.purpose, purpose);
    return Object.freeze(purpose);
  },

  newVersion(
    existing: Purpose,
    changes: Partial<Omit<CreatePurposeInput, 'controllerId'>>,
  ): Purpose {
    const { dataCategories, ...rest } = changes;
    const next: Purpose = {
      ...existing,
      ...rest,
      ...(dataCategories !== undefined
        ? { dataCategories: toNonEmptyStringTuple(dataCategories) }
        : {}),
      version: existing.version + 1,
      supersedes: { id: existing.id, version: existing.version },
      createdAt: new Date().toISOString(),
    };
    validateAgainstSchema(SchemaIds.purpose, next);
    assertHasSupersedesIfRequired(next);
    return Object.freeze(next);
  },

  deprecate(existing: Purpose): Purpose {
    const deprecated: Purpose = {
      ...existing,
      status: 'deprecated',
    };
    validateAgainstSchema(SchemaIds.purpose, deprecated);
    return Object.freeze(deprecated);
  },

  assertActive(purpose: Purpose): void {
    assertPurposeIsActive(purpose);
  },
};
