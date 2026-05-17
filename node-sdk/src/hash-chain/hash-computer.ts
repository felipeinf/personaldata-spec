import { createHash } from 'node:crypto';
import { canonicalize, type JsonValue } from './canonical-json.js';

export const GENESIS_HASH = 'GENESIS';

export interface EventForHashing {
  readonly eventId: string;
  readonly eventType: string;
  readonly sequenceNumber: number;
  readonly controllerId: string;
  readonly timestamp: string;
  readonly prevEventHash: string | null;
  readonly payload: object;
}

export function resolvePrevHash(prevEventHash: string | null): string {
  return prevEventHash === null ? GENESIS_HASH : prevEventHash;
}

export function computePayloadHash(payload: object): string {
  return sha256(canonicalize(payload as JsonValue));
}

export function computeCurrentHash(event: EventForHashing): string {
  const payloadHash = computePayloadHash(event.payload);
  const header = {
    eventId: event.eventId,
    eventType: event.eventType,
    sequenceNumber: event.sequenceNumber,
    controllerId: event.controllerId,
    timestamp: event.timestamp,
    prevHash: resolvePrevHash(event.prevEventHash),
    payloadHash,
  };
  return sha256(canonicalize(header as JsonValue));
}

function sha256(data: string): string {
  return createHash('sha256').update(data, 'utf8').digest('hex');
}
