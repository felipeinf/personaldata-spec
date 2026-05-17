# Node SDK — implementation reference

## Schema IDs (`src/schema-ids.ts`)

| Constant | Schema |
|----------|--------|
| `purpose` | `entities/purpose.schema.json` |
| `policyVersion` | `entities/policy-version.schema.json` |
| `consentGranted` | `events/consent-granted.schema.json` |
| `consentRevoked` | `events/consent-revoked.schema.json` |
| `consentSuperseded` | `events/consent-superseded.schema.json` |
| `policyPublished` | `events/policy-published.schema.json` |
| `informationPresented` | `events/information-presented.schema.json` |

## Error codes

| Code | Class | Typical trigger |
|------|-------|-----------------|
| `SCHEMA_VALIDATION_FAILED` | `SchemaValidationError` | Ajv rejects input |
| `BUSINESS_RULE_VIOLATED` | `BusinessRuleViolatedError` | Generic rule failure |
| `GRANTED_EVENT_NOT_FOUND` | `GrantedEventNotFoundError` | Revoke unknown grant |
| `ALREADY_REVOKED` | `AlreadyRevokedError` | Double revoke |
| `PURPOSE_DEPRECATED` | `PurposeDeprecatedError` | Consent on deprecated purpose |
| `SEQUENCE_GAP` | `SequenceGapError` | Chain sequence break |
| `CHAIN_HASH_MISMATCH` | `ChainHashMismatchError` | Tampered event |
| `INVALID_SUPERSEDES_REFERENCE` | `InvalidSupersedesReferenceError` | Bad purpose lineage |
| `MISSING_SUPERSEDES` | `MissingSupersedesError` | `version > 1` without `supersedes` |
| `DUPLICATE_PURPOSE_IN_POLICY` | `DuplicatePurposeInPolicyError` | Policy lists same `purposeId` twice |

## Chain verification reasons

| `brokenAt.reason` | Meaning |
|-------------------|---------|
| `SEQUENCE_GAP` | `sequenceNumber` not contiguous from 1 |
| `PREV_HASH_MISMATCH` | `prevEventHash` ≠ previous `currentHash` |
| `PAYLOAD_HASH_MISMATCH` | Recomputed payload hash differs |
| `HASH_MISMATCH` | Recomputed `currentHash` differs |

## Reducer event handling

| `eventType` | Effect on `ConsentState.active` |
|-------------|-----------------------------------|
| `consent_granted` | Set `purposeId` → `ActiveConsent` |
| `consent_revoked` | Remove entry matching `grantedEventId` |
| `consent_superseded` | Replace `grantedEventId` with `newGrantedEventId` |
| Others | Ignored for active map (still in filtered history if payload has `subjectId`) |

## TypeScript config highlights

From `tsconfig.json`: `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` — do not relax.

## Persistence adapter contract

`@personaldata/sdk/testing` → `PersistenceAdapter`:

- `saveEvent(event)`
- `getEventsByController(controllerId)` — ascending `sequenceNumber`
- `getLastHash(controllerId)` — `null` if empty
- `getLastSequenceNumber(controllerId)` — `0` if empty

Run `runPersistenceConformance(adapter)` before shipping a storage layer.

## File touch list by change type

| Change | Files |
|--------|-------|
| New schema field | `../spec`, `npm run generate`, `aliases.ts`, factory/builder, tests |
| New public export | `src/index.ts`, rebuild `dist/` |
| Hash fix | `canonical-json.ts`, `hash-computer.ts`, `chain-verifier.ts`, hash tests |
| Docs only | `README.md`, `examples/*/README.md`, `CHANGELOG.md` |
