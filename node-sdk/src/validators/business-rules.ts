import {
  AlreadyRevokedError,
  DuplicatePurposeInPolicyError,
  GrantedEventNotFoundError,
  MissingSupersedesError,
  PurposeDeprecatedError,
} from '../errors/index.js';
import type { Purpose, PolicyVersion } from '../generated/aliases.js';

export function assertPurposeIsActive(purpose: Purpose): void {
  if (purpose.status === 'deprecated') {
    throw new PurposeDeprecatedError(
      `Cannot use deprecated purpose: ${purpose.id} v${purpose.version}`,
      { purposeId: purpose.id, version: purpose.version },
    );
  }
}

export function assertHasSupersedesIfRequired(purpose: Purpose): void {
  if (purpose.version > 1 && !purpose.supersedes) {
    throw new MissingSupersedesError(
      'Purpose with version > 1 must reference its previous version',
      { purposeId: purpose.id, version: purpose.version },
    );
  }
}

export function assertGrantedNotRevoked(
  grantedEventId: string,
  alreadyRevoked: ReadonlySet<string>,
): void {
  if (alreadyRevoked.has(grantedEventId)) {
    throw new AlreadyRevokedError(
      `Granted event already revoked: ${grantedEventId}`,
      { grantedEventId },
    );
  }
}

export function assertGrantedExists(
  grantedEventId: string,
  knownGranted: ReadonlySet<string>,
): void {
  if (!knownGranted.has(grantedEventId)) {
    throw new GrantedEventNotFoundError(
      `Granted event not found: ${grantedEventId}`,
      { grantedEventId },
    );
  }
}

export function assertNoDuplicatePurposesInPolicy(policy: PolicyVersion): void {
  const seen = new Set<string>();
  for (const ref of policy.purposes) {
    if (seen.has(ref.purposeId)) {
      throw new DuplicatePurposeInPolicyError(
        `Duplicate purposeId in policy: ${ref.purposeId}`,
        { purposeId: ref.purposeId, policyVersionId: policy.id },
      );
    }
    seen.add(ref.purposeId);
  }
}
