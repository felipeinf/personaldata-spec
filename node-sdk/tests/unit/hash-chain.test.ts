import { describe, expect, it } from 'vitest';
import {
  computeCurrentHash,
  computePayloadHash,
  GENESIS_HASH,
} from '../../src/hash-chain/hash-computer.js';
import { verifyChain } from '../../src/hash-chain/chain-verifier.js';
import { EventBuilder } from '../../src/events/event-builder.js';

const evidence = {
  recordedAt: '2026-01-01T00:00:00.000Z',
  contentHash: 'b'.repeat(64),
};

describe('hash chain', () => {
  it('computes stable payload hash', () => {
    const payload = { subjectId: '00000000-0000-4000-8000-000000000001' };
    const a = computePayloadHash(payload);
    const b = computePayloadHash(payload);
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it('uses GENESIS for null prevEventHash in header', () => {
    const event = EventBuilder.consentGranted({
      controllerId: '00000000-0000-4000-8000-000000000010',
      subjectId: '00000000-0000-4000-8000-000000000011',
      purposeId: '00000000-0000-4000-8000-000000000012',
      purposeVersion: 1,
      policyVersionId: '00000000-0000-4000-8000-000000000013',
      mechanism: 'web_checkbox',
      evidence,
      prevEventHash: null,
      sequenceNumber: 1,
    });
    expect(event.prevEventHash).toBeNull();
    expect(computeCurrentHash(event)).toBe(event.currentHash);
    expect(GENESIS_HASH).toBe('GENESIS');
  });

  it('verifies a valid two-event chain', () => {
    const controllerId = '00000000-0000-4000-8000-000000000020';
    const subjectId = '00000000-0000-4000-8000-000000000021';
    const purposeId = '00000000-0000-4000-8000-000000000022';
    const policyVersionId = '00000000-0000-4000-8000-000000000023';
    const first = EventBuilder.consentGranted({
      controllerId,
      subjectId,
      purposeId,
      purposeVersion: 1,
      policyVersionId,
      mechanism: 'web_checkbox',
      evidence,
      prevEventHash: null,
      sequenceNumber: 1,
    });
    const second = EventBuilder.consentGranted({
      controllerId,
      subjectId,
      purposeId: '00000000-0000-4000-8000-000000000024',
      purposeVersion: 1,
      policyVersionId,
      mechanism: 'web_checkbox',
      evidence,
      prevEventHash: first.currentHash,
      sequenceNumber: 2,
    });
    const result = verifyChain([first, second]);
    expect(result.valid).toBe(true);
    expect(result.verifiedCount).toBe(2);
  });

  it('detects payload tampering', () => {
    const event = EventBuilder.consentGranted({
      controllerId: '00000000-0000-4000-8000-000000000030',
      subjectId: '00000000-0000-4000-8000-000000000031',
      purposeId: '00000000-0000-4000-8000-000000000032',
      purposeVersion: 1,
      policyVersionId: '00000000-0000-4000-8000-000000000033',
      mechanism: 'web_checkbox',
      evidence,
      prevEventHash: null,
      sequenceNumber: 1,
    });
    const tampered = {
      ...event,
      payload: { ...event.payload, purposeVersion: 99 },
    };
    const result = verifyChain([tampered]);
    expect(result.valid).toBe(false);
    expect(result.brokenAt?.reason).toBe('PAYLOAD_HASH_MISMATCH');
  });
});
