import { describe, expect, it } from 'vitest';
import { EventBuilder } from '../../src/events/event-builder.js';

const evidence = {
  recordedAt: '2026-01-01T00:00:00.000Z',
  contentHash: 'd'.repeat(64),
};

describe('EventBuilder', () => {
  it('returns frozen events', () => {
    const event = EventBuilder.consentGranted({
      controllerId: '00000000-0000-4000-8000-000000000070',
      subjectId: '00000000-0000-4000-8000-000000000071',
      purposeId: '00000000-0000-4000-8000-000000000072',
      purposeVersion: 1,
      policyVersionId: '00000000-0000-4000-8000-000000000073',
      mechanism: 'web_checkbox',
      evidence,
      prevEventHash: null,
      sequenceNumber: 1,
    });
    expect(Object.isFrozen(event)).toBe(true);
    expect(event.eventType).toBe('consent_granted');
  });
});
