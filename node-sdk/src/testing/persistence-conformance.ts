import { randomUUID } from 'node:crypto';
import { EventBuilder } from '../events/event-builder.js';
import { verifyChain, type PersistedEvent } from '../hash-chain/index.js';

export interface PersistenceAdapter {
  readonly saveEvent: (event: PersistedEvent) => Promise<void>;
  readonly getEventsByController: (
    controllerId: string,
  ) => Promise<ReadonlyArray<PersistedEvent>>;
  readonly getLastHash: (controllerId: string) => Promise<string | null>;
  readonly getLastSequenceNumber: (controllerId: string) => Promise<number>;
}

export interface ConformanceReport {
  readonly passed: number;
  readonly failed: number;
  readonly failures: ReadonlyArray<{ scenario: string; reason: string }>;
}

type Scenario = (adapter: PersistenceAdapter) => Promise<void>;

const evidence = {
  recordedAt: '2026-01-01T00:00:00.000Z',
  contentHash:
    'a'.repeat(64) as `${string}`,
};

async function appendOnlyScenario(adapter: PersistenceAdapter): Promise<void> {
  const controllerId = randomUUID();
  const subjectId = randomUUID();
  const event = EventBuilder.consentGranted({
    controllerId,
    subjectId,
    purposeId: randomUUID(),
    purposeVersion: 1,
    policyVersionId: randomUUID(),
    mechanism: 'web_checkbox',
    evidence,
    prevEventHash: null,
    sequenceNumber: 1,
  });
  await adapter.saveEvent(event);
  const loaded = await adapter.getEventsByController(controllerId);
  if (loaded.length !== 1) {
    throw new Error('expected exactly one persisted event');
  }
}

async function sequenceMonotonicityScenario(
  adapter: PersistenceAdapter,
): Promise<void> {
  const controllerId = randomUUID();
  const subjectId = randomUUID();
  const purposeId = randomUUID();
  const policyVersionId = randomUUID();
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
  await adapter.saveEvent(first);
  const lastSeq = await adapter.getLastSequenceNumber(controllerId);
  if (lastSeq !== 1) {
    throw new Error(`expected last sequence 1, got ${lastSeq}`);
  }
}

async function chainContinuityScenario(
  adapter: PersistenceAdapter,
): Promise<void> {
  const controllerId = randomUUID();
  const subjectId = randomUUID();
  const purposeId = randomUUID();
  const policyVersionId = randomUUID();
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
  await adapter.saveEvent(first);
  const second = EventBuilder.consentGranted({
    controllerId,
    subjectId,
    purposeId: randomUUID(),
    purposeVersion: 1,
    policyVersionId,
    mechanism: 'web_checkbox',
    evidence,
    prevEventHash: first.currentHash,
    sequenceNumber: 2,
  });
  await adapter.saveEvent(second);
  const events = await adapter.getEventsByController(controllerId);
  const result = verifyChain(events);
  if (!result.valid) {
    throw new Error(`chain invalid: ${result.brokenAt?.reason}`);
  }
}

const scenarios: Scenario[] = [
  appendOnlyScenario,
  sequenceMonotonicityScenario,
  chainContinuityScenario,
];

export async function runPersistenceConformance(
  adapter: PersistenceAdapter,
): Promise<ConformanceReport> {
  const failures: Array<{ scenario: string; reason: string }> = [];
  let passed = 0;
  for (const scenario of scenarios) {
    try {
      await scenario(adapter);
      passed += 1;
    } catch (err) {
      failures.push({ scenario: scenario.name, reason: String(err) });
    }
  }
  return { passed, failed: failures.length, failures };
}
