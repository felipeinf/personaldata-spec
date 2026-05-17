# @personaldata/sdk

Node.js SDK for consent traceability under Chile **Law 21.719**. Builds immutable, verifiable consent event chains from the normative schemas in `@personaldata/spec`.

This package does **not** store personal data or provide legal advice. You choose where events are persisted (PostgreSQL, MongoDB, etc.).

## Requirements

- Node.js 20+
- `@personaldata/spec` (declared as a dependency)

## Install

```bash
npm install @personaldata/sdk
```

In this monorepo workspace:

```bash
cd node-sdk && npm install && npm run generate && npm run build
```

## Quickstart

```typescript
import {
  PurposeFactory,
  PolicyVersionFactory,
  EventBuilder,
  reduceEvents,
  Proof,
} from '@personaldata/sdk';

const controllerId = '00000000-0000-4000-8000-000000000001';
const subjectId = '00000000-0000-4000-8000-000000000002';

const purpose = PurposeFactory.create({
  controllerId,
  name: 'marketing',
  displayName: 'Marketing',
  description: 'Send product updates by email',
  dataCategories: ['email'],
  retention: { kind: 'fixed', duration: 'P1Y' },
});

const policy = PolicyVersionFactory.fromPurposes(controllerId, [purpose], {
  locale: 'en',
  body: 'We use your email for marketing.',
});

const evidence = {
  recordedAt: new Date().toISOString(),
  contentHash: '<sha256-hex-of-ui-snapshot>',
};

const granted = EventBuilder.consentGranted({
  controllerId,
  subjectId,
  purposeId: purpose.id,
  purposeVersion: purpose.version,
  policyVersionId: policy.id,
  mechanism: 'web_checkbox',
  evidence,
  prevEventHash: null,
  sequenceNumber: 1,
});

const state = reduceEvents(subjectId, [granted]);
const artifact = Proof.export({
  controllerId,
  subjectId,
  events: [granted],
  purposes: [purpose],
  policyVersions: [policy],
});
```

## Public API

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

## Persistence

The SDK does not include a database adapter. See `examples/` for integration patterns (Prisma, Drizzle, raw SQL, Mongoose).

## Testing your adapter

```typescript
import { runPersistenceConformance } from '@personaldata/sdk/testing';

const report = await runPersistenceConformance(yourAdapter);
```

## Legal disclaimer

This library helps implement technical traceability artifacts. It is not legal counsel. Consult qualified counsel for compliance with Law 21.719 and your processing activities.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
