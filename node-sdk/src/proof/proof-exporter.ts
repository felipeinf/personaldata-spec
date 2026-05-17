import type { ChainVerificationResult, PersistedEvent } from '../hash-chain/index.js';
import { verifyChain } from '../hash-chain/index.js';
import type { PolicyVersion, Purpose } from '../generated/aliases.js';

export interface ProofExportInput {
  readonly controllerId: string;
  readonly subjectId: string;
  readonly purposeId?: string;
  readonly events: ReadonlyArray<PersistedEvent>;
  readonly purposes: ReadonlyArray<Purpose>;
  readonly policyVersions: ReadonlyArray<PolicyVersion>;
}

export interface LegalReference {
  readonly artifact: string;
  readonly article: string;
}

export interface ProofArtifact {
  readonly exportedAt: string;
  readonly subject: {
    readonly controllerId: string;
    readonly subjectId: string;
    readonly purposeId?: string;
  };
  readonly events: ReadonlyArray<PersistedEvent>;
  readonly purposes: ReadonlyArray<Purpose>;
  readonly policyVersions: ReadonlyArray<PolicyVersion>;
  readonly chainVerification: ChainVerificationResult;
  readonly legalReferences: ReadonlyArray<LegalReference>;
}

function hasSubjectId(payload: unknown): payload is { subjectId: string } {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'subjectId' in payload &&
    typeof (payload as { subjectId: unknown }).subjectId === 'string'
  );
}

function filterBySubject(
  events: ReadonlyArray<PersistedEvent>,
  subjectId: string,
  purposeId?: string,
): PersistedEvent[] {
  return events.filter((e) => {
    if (!hasSubjectId(e.payload) || e.payload.subjectId !== subjectId) {
      return false;
    }
    if (purposeId === undefined) return true;
    const payload = e.payload as { purposeId?: string };
    return payload.purposeId === undefined || payload.purposeId === purposeId;
  });
}

function buildLegalReferences(
  events: ReadonlyArray<PersistedEvent>,
): LegalReference[] {
  const refs: LegalReference[] = [];
  for (const event of events) {
    switch (event.eventType) {
      case 'consent_granted':
        refs.push({ artifact: event.eventId, article: 'Art. 12 (Ley 21.719)' });
        break;
      case 'consent_revoked':
        refs.push({
          artifact: event.eventId,
          article: 'Art. 12 inc. tercero (Ley 21.719)',
        });
        break;
      case 'information_presented':
        refs.push({ artifact: event.eventId, article: 'Art. 14 ter (Ley 21.719)' });
        break;
      default:
        break;
    }
  }
  return refs;
}

export const Proof = {
  export(input: ProofExportInput): ProofArtifact {
    const filtered = filterBySubject(
      input.events,
      input.subjectId,
      input.purposeId,
    );
    const verification = verifyChain(filtered);
    const subject: ProofArtifact['subject'] = {
      controllerId: input.controllerId,
      subjectId: input.subjectId,
      ...(input.purposeId !== undefined ? { purposeId: input.purposeId } : {}),
    };
    return {
      exportedAt: new Date().toISOString(),
      subject,
      events: filtered,
      purposes: input.purposes,
      policyVersions: input.policyVersions,
      chainVerification: verification,
      legalReferences: buildLegalReferences(filtered),
    };
  },
};
