import { describe, expect, it } from 'vitest';
import { EventBuilder } from '../../src/events/event-builder.js';
import { reduceEvents } from '../../src/state/reducer.js';
import { ConsentStateQueries } from '../../src/state/queries.js';

const evidence = {
  recordedAt: '2026-01-01T00:00:00.000Z',
  contentHash: 'c'.repeat(64),
};

describe('reduceEvents', () => {
  it('tracks active consent per purpose', () => {
    const controllerId = '00000000-0000-4000-8000-000000000040';
    const subjectId = '00000000-0000-4000-8000-000000000041';
    const purposeId = '00000000-0000-4000-8000-000000000042';
    const policyVersionId = '00000000-0000-4000-8000-000000000043';
    const granted = EventBuilder.consentGranted({
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
    const state = reduceEvents(subjectId, [granted]);
    expect(ConsentStateQueries.isActive(state, purposeId)).toBe(true);
  });

  it('ignores events for other subjects', () => {
    const controllerId = '00000000-0000-4000-8000-000000000050';
    const subjectA = '00000000-0000-4000-8000-000000000051';
    const subjectB = '00000000-0000-4000-8000-000000000052';
    const purposeId = '00000000-0000-4000-8000-000000000053';
    const policyVersionId = '00000000-0000-4000-8000-000000000054';
    const granted = EventBuilder.consentGranted({
      controllerId,
      subjectId: subjectA,
      purposeId,
      purposeVersion: 1,
      policyVersionId,
      mechanism: 'web_checkbox',
      evidence,
      prevEventHash: null,
      sequenceNumber: 1,
    });
    const state = reduceEvents(subjectB, [granted]);
    expect(state.active.size).toBe(0);
  });
});
