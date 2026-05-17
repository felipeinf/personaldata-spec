import {
  computeCurrentHash,
  computePayloadHash,
  type EventForHashing,
} from './hash-computer.js';

export interface PersistedEvent extends EventForHashing {
  readonly payloadHash: string;
  readonly currentHash: string;
}

export interface ChainVerificationResult {
  readonly valid: boolean;
  readonly verifiedCount: number;
  readonly brokenAt?: {
    readonly eventId: string;
    readonly reason:
      | 'HASH_MISMATCH'
      | 'SEQUENCE_GAP'
      | 'PREV_HASH_MISMATCH'
      | 'PAYLOAD_HASH_MISMATCH';
  };
}

export function verifyChain(
  orderedEvents: ReadonlyArray<PersistedEvent>,
): ChainVerificationResult {
  let prevHash: string | null = null;
  let expectedSeq = 1;

  for (const event of orderedEvents) {
    if (event.sequenceNumber !== expectedSeq) {
      return {
        valid: false,
        verifiedCount: expectedSeq - 1,
        brokenAt: { eventId: event.eventId, reason: 'SEQUENCE_GAP' },
      };
    }
    if (event.prevEventHash !== prevHash) {
      return {
        valid: false,
        verifiedCount: expectedSeq - 1,
        brokenAt: { eventId: event.eventId, reason: 'PREV_HASH_MISMATCH' },
      };
    }
    const recomputedPayloadHash = computePayloadHash(event.payload);
    if (recomputedPayloadHash !== event.payloadHash) {
      return {
        valid: false,
        verifiedCount: expectedSeq - 1,
        brokenAt: { eventId: event.eventId, reason: 'PAYLOAD_HASH_MISMATCH' },
      };
    }
    const recomputedCurrentHash = computeCurrentHash(event);
    if (recomputedCurrentHash !== event.currentHash) {
      return {
        valid: false,
        verifiedCount: expectedSeq - 1,
        brokenAt: { eventId: event.eventId, reason: 'HASH_MISMATCH' },
      };
    }
    prevHash = event.currentHash;
    expectedSeq += 1;
  }

  return { valid: true, verifiedCount: orderedEvents.length };
}
