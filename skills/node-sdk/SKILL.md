---
name: node-sdk
description: Consume the @personaldata/sdk npm package to build, persist, verify, and prove consent traceability events under Chile Law 21.719. Use when installing @personaldata/sdk, wiring EventBuilder, PurposeFactory, PolicyVersionFactory, persisting consent events in any database, exporting proof artifacts, verifying hash chains, or running the @personaldata/sdk/testing conformance harness.
---

# Use @personaldata/sdk (Node.js consumer)

## What this package is

`@personaldata/sdk` builds **immutable, hash-chained consent events** for Chile Law 21.719. It is a pure SDK: does **not** store data, does **not** call any API, does **not** ship UI.

The consumer brings:

- A database for `PersistedEvent` rows (PostgreSQL, MongoDB, etc.).
- A way to render information and capture user intent (web form, mobile UI, API).
- A `controllerId` (organization UUID) and `subjectId` (data subject UUID).

The SDK provides typed builders, JSON Schema validation, the canonical hash chain, a consent state reducer, and a proof exporter.

## Install

```bash
npm install @personaldata/sdk
```

Requires Node.js 20+. Spec schemas are embedded in `dist/`; no separate install.

## Non-negotiables for consumers

| Rule | Why |
|------|-----|
| Identifiers in English: `controllerId`, `subjectId` | SDK rejects Spanish field names |
| `sequenceNumber` starts at **1** and is contiguous per `controllerId` | Chain verification requires it |
| First event uses `prevEventHash: null` | Maps to `GENESIS` in the header hash |
| Read last `currentHash` and `sequenceNumber` under a DB lock before building | Two concurrent writers would diverge the chain |
| Treat persisted events as append-only | Revocations are new events, never updates |
| Do not put PII inside `payload` | Hash UI snapshots/contents externally, store only hashes |

## Public API surface

| Area | Exports |
|------|---------|
| Entities | `PurposeFactory`, `PolicyVersionFactory` |
| Events | `EventBuilder`, `buildConsentBatch` |
| Validation | `validateAgainstSchema`, `BusinessRules` |
| Hash chain | `computePayloadHash`, `computeCurrentHash`, `verifyChain`, `GENESIS_HASH` |
| State | `reduceEvents`, `ConsentStateQueries` |
| Proof | `Proof.export` |
| Errors | `PersonaldataError`, domain errors, `ErrorCodes` |
| Types | `Purpose`, `PolicyVersion`, event types |
| Testing harness | `import { runPersistenceConformance } from '@personaldata/sdk/testing'` |

## End-to-end flow

```typescript
import {
  PurposeFactory,
  PolicyVersionFactory,
  EventBuilder,
  verifyChain,
  reduceEvents,
  Proof,
} from '@personaldata/sdk';

const controllerId = '<your-org-uuid>';
const subjectId = '<data-subject-uuid>';

const marketing = PurposeFactory.create({
  controllerId,
  name: 'marketing',
  displayName: 'Marketing emails',
  description: 'Send product updates by email',
  dataCategories: ['email'],
  retention: { kind: 'fixed', duration: 'P1Y' },
});

const policy = PolicyVersionFactory.fromPurposes(
  controllerId,
  [marketing],
  { locale: 'en', body: 'We use your email for marketing.' },
);

const presented = EventBuilder.informationPresented({
  controllerId,
  subjectId,
  policyVersionId: policy.id,
  presentedAt: new Date().toISOString(),
  contentHash: '<sha256 of rendered html/json>',
  prevEventHash: null,
  sequenceNumber: 1,
});

const granted = EventBuilder.consentGranted({
  controllerId,
  subjectId,
  purposeId: marketing.id,
  purposeVersion: marketing.version,
  policyVersionId: policy.id,
  mechanism: 'web_checkbox',
  evidence: {
    recordedAt: new Date().toISOString(),
    contentHash: '<sha256 of ui snapshot>',
  },
  prevEventHash: presented.currentHash,
  sequenceNumber: 2,
});

await adapter.saveEvent(presented);
await adapter.saveEvent(granted);

const events = await adapter.getEventsByController(controllerId);
const state = reduceEvents(subjectId, events);
const artifact = Proof.export({
  controllerId,
  subjectId,
  events,
  purposes: [marketing],
  policyVersions: [policy],
});
```

## Appending events safely (read-modify-write)

```typescript
async function appendEvent(controllerId, buildFn) {
  return db.transaction(async (tx) => {
    const lastSeq = await tx.getLastSequenceNumber(controllerId); // 0 if empty
    const lastHash = await tx.getLastHash(controllerId);          // null if empty
    const event = buildFn({
      prevEventHash: lastHash,
      sequenceNumber: lastSeq + 1,
    });
    await tx.saveEvent(event);
    return event;
  });
}
```

For multi-purpose acceptance in one UI action, use `buildConsentBatch` — it chains `prevEventHash` and `sequenceNumber` across accepted selections automatically.

## Storage invariants

1. **Append-only.** Never `UPDATE` or `DELETE` an event row.
2. **One row per event.** Unique index on `(controllerId, sequenceNumber)`.
3. **Ordered reads.** Always `ORDER BY sequenceNumber ASC` before `verifyChain` or `reduceEvents`.
4. **Serialized writes per `controllerId`.** Transaction, row lock, or advisory lock — pick one.

## Adapter contract

```typescript
import type { PersistedEvent } from '@personaldata/sdk';

interface PersistenceAdapter {
  saveEvent(event: PersistedEvent): Promise<void>;
  getEventsByController(controllerId: string): Promise<readonly PersistedEvent[]>;
  getLastHash(controllerId: string): Promise<string | null>;
  getLastSequenceNumber(controllerId: string): Promise<number>; // 0 when empty
}
```

Validate the adapter in CI:

```typescript
import { runPersistenceConformance } from '@personaldata/sdk/testing';

const report = await runPersistenceConformance(myAdapter);
if (report.failed > 0) throw new Error(JSON.stringify(report.failures));
```

## Revocation

```typescript
const revoked = EventBuilder.consentRevoked({
  controllerId,
  subjectId,
  grantedEventId: granted.eventId,
  mechanism: 'web_button',
  evidence: { recordedAt: new Date().toISOString(), contentHash: '<...>' },
  prevEventHash: <last currentHash>,
  sequenceNumber: <last + 1>,
});
```

Revocation is **not retroactive** — it ends the active state from this event onward. Past lawful processing remains lawful.

## Purpose versioning

```typescript
const v2 = PurposeFactory.newVersion(marketing, {
  description: 'Updated marketing description.',
});
```

When a purpose bumps version, existing grants become stale. Detect with:

```typescript
ConsentStateQueries.findStale(state, currentPolicy);
```

Re-collect consent or emit `consent_superseded` once you have the new grant.

## Verifying integrity

```typescript
const result = verifyChain(events);
if (!result.valid) {
  // result.brokenAt.reason ∈
  //   'SEQUENCE_GAP' | 'PREV_HASH_MISMATCH'
  // | 'PAYLOAD_HASH_MISMATCH' | 'HASH_MISMATCH'
}
```

Run periodically (cron) over each `controllerId` chain to detect tampering.

## Error handling

All errors extend `PersonaldataError`. Inspect `err.code` (from `ErrorCodes`) and `err.legalReference` for audit logs.

| Error | Trigger | Action |
|-------|---------|--------|
| `SchemaValidationError` | Bad shape passed to a factory/builder | Fix input; do not swallow |
| `PurposeDeprecatedError` | Granting on a deprecated `Purpose` | Bump version, re-collect consent |
| `MissingSupersedesError` | `version > 1` without `supersedes` | Use `PurposeFactory.newVersion` |
| `DuplicatePurposeInPolicyError` | Same `purposeId` listed twice | Deduplicate before `PolicyVersionFactory.create` |
| `AlreadyRevokedError` / `GrantedEventNotFoundError` | Pre-check against current state | Use `ConsentStateQueries` before building |

## Out of scope of the SDK

- Database adapter (you implement)
- UI components / cookie banners
- HTTP API server
- Sensitive data (Art. 16) and other legal bases (v0 only supports `legalBasis: 'consent'`)
- International transfers
- Legal advice

## Additional resources

- Adapter catalog and chain reasons: [reference.md](reference.md)
- Repository: https://github.com/felipeinf/personaldata-sdk
- npm: https://www.npmjs.com/package/@personaldata/sdk
