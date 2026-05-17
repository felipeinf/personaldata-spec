import { randomUUID } from 'node:crypto';
import { validateAgainstSchema } from '../validators/schema-validator.js';
import { assertNoDuplicatePurposesInPolicy } from '../validators/business-rules.js';
import { SchemaIds } from '../schema-ids.js';
import type {
  PolicyVersion,
  Purpose,
  PurposeReference,
} from '../generated/aliases.js';


function toNonEmptyPurposeReferences(
  purposes: ReadonlyArray<{ readonly purposeId: string; readonly purposeVersion: number }>,
): [PurposeReference, ...PurposeReference[]] {
  return purposes.map((p) => ({ ...p })) as [PurposeReference, ...PurposeReference[]];
}

export interface CreatePolicyVersionInput {
  readonly controllerId: string;
  readonly purposes: ReadonlyArray<{
    readonly purposeId: string;
    readonly purposeVersion: number;
  }>;
  readonly informationBlock: Record<string, unknown>;
}

export const PolicyVersionFactory = {
  create(input: CreatePolicyVersionInput): PolicyVersion {
    const policy: PolicyVersion = {
      id: randomUUID(),
      controllerId: input.controllerId,
      purposes: toNonEmptyPurposeReferences(input.purposes),
      publishedAt: new Date().toISOString(),
      informationBlock: input.informationBlock,
    };
    assertNoDuplicatePurposesInPolicy(policy);
    validateAgainstSchema(SchemaIds.policyVersion, policy);
    return Object.freeze(policy);
  },

  fromPurposes(
    controllerId: string,
    purposes: ReadonlyArray<Purpose>,
    informationBlock: Record<string, unknown>,
  ): PolicyVersion {
    return PolicyVersionFactory.create({
      controllerId,
      purposes: purposes.map((p) => ({
        purposeId: p.id,
        purposeVersion: p.version,
      })),
      informationBlock,
    });
  },
};
