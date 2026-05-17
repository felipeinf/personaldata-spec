import type { PersistedEvent } from '../hash-chain/index.js';
import type {
  ConsentGrantedEvent,
  ConsentRevokedEvent,
  ConsentSupersededEvent,
} from '../generated/aliases.js';

export interface ActiveConsent {
  readonly grantedEventId: string;
  readonly purposeId: string;
  readonly purposeVersion: number;
  readonly policyVersionId: string;
  readonly grantedAt: string;
}

export interface ConsentState {
  readonly subjectId: string;
  readonly active: ReadonlyMap<string, ActiveConsent>;
  readonly history: ReadonlyArray<PersistedEvent>;
}

function hasSubjectId(
  payload: unknown,
): payload is { subjectId: string } {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'subjectId' in payload &&
    typeof (payload as { subjectId: unknown }).subjectId === 'string'
  );
}

export function reduceEvents(
  subjectId: string,
  events: ReadonlyArray<PersistedEvent>,
): ConsentState {
  const active = new Map<string, ActiveConsent>();
  const filtered = events.filter(
    (e) => hasSubjectId(e.payload) && e.payload.subjectId === subjectId,
  );

  for (const event of filtered) {
    switch (event.eventType) {
      case 'consent_granted': {
        const payload = event.payload as ConsentGrantedEvent['payload'];
        active.set(payload.purposeId, {
          grantedEventId: event.eventId,
          purposeId: payload.purposeId,
          purposeVersion: payload.purposeVersion,
          policyVersionId: payload.policyVersionId,
          grantedAt: event.timestamp,
        });
        break;
      }
      case 'consent_revoked': {
        const payload = event.payload as ConsentRevokedEvent['payload'];
        for (const [purposeId, consent] of active) {
          if (consent.grantedEventId === payload.grantedEventId) {
            active.delete(purposeId);
            break;
          }
        }
        break;
      }
      case 'consent_superseded': {
        const payload = event.payload as ConsentSupersededEvent['payload'];
        for (const [purposeId, consent] of active) {
          if (consent.grantedEventId === payload.previousGrantedEventId) {
            active.set(purposeId, {
              ...consent,
              grantedEventId: payload.newGrantedEventId,
            });
            break;
          }
        }
        break;
      }
    }
  }

  return { subjectId, active, history: filtered };
}
