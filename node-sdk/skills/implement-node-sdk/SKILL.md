---
name: implement-node-sdk
description: Implements and extends the @personaldata/sdk Node.js package in node-sdk/ using spec schemas, hash-chain rules, and project module layout. Use when adding SDK features, fixing consent traceability logic, wiring Ajv validation, codegen from @personaldata/spec, or when the user mentions node-sdk, personaldata SDK Node, EventBuilder, or Law 21.719 consent events.
---

# Implement Node SDK

## Scope

Work inside `node-sdk/` only unless the task requires `../spec/` schema changes. Do not add CI/CD unless explicitly requested.

**Source of truth:** `../spec/schema/**/*.schema.json` via `@personaldata/spec` (`file:../spec`).

**Normative docs:** `../spec/docs/en/canonical-serialization.md` (hash algorithm), `../node-sdk.md` at repo root (full implementation guide).

## Non-negotiables

| Rule | Detail |
|------|--------|
| Identifiers | English only: `controllerId`, `subjectId` — never `responsableId` / `titularId` |
| Spec alignment | Schema `$id` URLs use `https://personaldata.dev/schemas/v0/...` — see `src/schema-ids.ts` |
| Hash chain | `prevEventHash === null` → header `prevHash = "GENESIS"`; `sequenceNumber` starts at **1** |
| Purity | `EventBuilder` does not read DB state; caller passes `prevEventHash` and `sequenceNumber` |
| Dependencies | Runtime: `ajv`, `ajv-formats`, `@personaldata/spec` only — no extra hash/UUID libs |
| Immutability | Factories and builders return `Object.freeze(...)` |
| Generated code | Commit `src/generated/types.ts`, `schemas.ts`; consumers do not run codegen |

## Module map

```
src/
  entities/       PurposeFactory, PolicyVersionFactory
  events/         EventBuilder, buildConsentBatch
  validators/     validateAgainstSchema (Ajv), business-rules
  hash-chain/     canonical-json, hash-computer, chain-verifier
  state/          reduceEvents, ConsentStateQueries
  proof/          Proof.export
  errors/         PersonaldataError + domain errors + ErrorCodes
  generated/      types.ts, schemas.ts, aliases.ts
  testing/        runPersistenceConformance (subpath export only)
  schema-ids.ts   canonical schema URL constants
```

Public API surface: `src/index.ts`. Testing harness: `src/testing/index.ts` → `@personaldata/sdk/testing`.

## Implementation workflow

Copy and track:

```
- [ ] 1. Confirm spec/schema change (if any) in ../spec
- [ ] 2. npm run generate (types + embedded schemas)
- [ ] 3. Update src/generated/aliases.ts if new top-level types appear
- [ ] 4. Implement module + export from index.ts
- [ ] 5. Unit tests in tests/unit/
- [ ] 6. npm run build && npm test && npm run lint
```

### Adding a new event type

1. Add or update schema under `../spec/schema/events/`.
2. Run `npm run generate`.
3. Add `SchemaIds` entry in `src/schema-ids.ts`.
4. Add builder method on `EventBuilder` using internal `buildEvent()` pattern in `event-builder.ts`.
5. Extend `reduceEvents` if the event affects consent state.
6. Export type from `aliases.ts` and `src/index.ts`.
7. Test: builder produces frozen event, `verifyChain` passes, schema validation passes.

### Adding a business rule

1. Add code to `src/errors/codes.ts` and a class in `domain-errors.ts` (with `legalReference` when applicable).
2. Implement assert function in `validators/business-rules.ts`.
3. Call from factory/builder/reducer as appropriate.
4. Test in `tests/unit/business-rules.test.ts`.

### Hash chain changes

**Do not change lightly.** Cross-language conformance depends on bit-identical `canonicalJson` + header field order:

```typescript
// header object for currentHash (payload NOT included)
{ eventId, eventType, sequenceNumber, controllerId, timestamp, prevHash, payloadHash }
```

Verify with `tests/unit/hash-chain.test.ts` and `verifyChain()`.

## Codegen

| Script | Output |
|--------|--------|
| `scripts/generate-types.ts` | `src/generated/types.ts` (dedupes duplicate exports from allOf) |
| `scripts/generate-schemas.ts` | `src/generated/schemas.ts` (Ajv runtime) |

Import **public types** from `src/generated/aliases.ts`, not raw `types.ts` names.

After spec bump: regenerate, refresh aliases, confirm `package.json` `personaldata.specVersion` range.

## Build and test

```bash
cd node-sdk
npm install
npm run generate
npm run build
npm test
npm run lint
```

- **Build:** `tsup` dual ESM/CJS, entries `src/index.ts` + `src/testing/index.ts`
- **Tests:** Vitest, `tests/unit/*.test.ts`
- **Lint:** Biome on `src`, `tests`, `scripts`

## Patterns to follow

**Entity factory** (`purpose.ts`):

```typescript
const entity = { /* fields */ };
validateAgainstSchema(SchemaIds.purpose, entity);
assertHasSupersedesIfRequired(entity); // if applicable
return Object.freeze(entity);
```

**Event builder** (`event-builder.ts`):

```typescript
const payload = { /* payload only */ };
const payloadHash = computePayloadHash(payload);
const currentHash = computeCurrentHash({ eventId, eventType, sequenceNumber, controllerId, timestamp, prevEventHash, payload });
validateAgainstSchema(SchemaIds.consentGranted, { ...event fields });
return Object.freeze(event);
```

**Batch consents:** use `buildConsentBatch` — chains `prevEventHash` / `sequenceNumber` across accepted selections.

## Out of scope (unless asked)

- Database adapters (document under `examples/` as README snippets only)
- CI workflows (`.github/workflows`)
- Publishing to npm
- Legal advice copy beyond existing disclaimers in README

## Additional resources

- Module checklist and error catalog: [reference.md](reference.md)
- Repo-level Node guide: `../../node-sdk.md`
