# @personaldata/sdk — consumer reference

## Event types

| `eventType` | Builder | Legal role |
|-------------|---------|------------|
| `policy_published` | `EventBuilder.policyPublished` | Records which policy snapshot was in force |
| `information_presented` | `EventBuilder.informationPresented` | Records that Art. 14 ter information was shown |
| `consent_granted` | `EventBuilder.consentGranted` | Records grant per purpose (Art. 12) |
| `consent_revoked` | `EventBuilder.consentRevoked` | Records revocation with equivalent mechanism |
| `consent_superseded` | `EventBuilder.consentSuperseded` | Records renewal when purpose version changes |

## Mechanism enum

`'web_checkbox' | 'web_button' | 'written_signature' | 'electronic_signature' | 'verbal_recorded' | 'api_explicit'`

Pick the most accurate for the actual UX. The mechanism for revocation must be at least as easy to use as the grant mechanism (Art. 12).

## Chain verification reasons

`verifyChain(events)` returns `{ valid, verifiedCount, brokenAt? }` where `brokenAt.reason` is:

| Reason | Meaning |
|--------|---------|
| `SEQUENCE_GAP` | `sequenceNumber` not contiguous from 1 |
| `PREV_HASH_MISMATCH` | `prevEventHash` ≠ previous `currentHash` |
| `PAYLOAD_HASH_MISMATCH` | Recomputed payload hash differs (payload tampered) |
| `HASH_MISMATCH` | Recomputed `currentHash` differs (header tampered) |

## Error code catalog

| Code | Class |
|------|-------|
| `SCHEMA_VALIDATION_FAILED` | `SchemaValidationError` |
| `BUSINESS_RULE_VIOLATED` | `BusinessRuleViolatedError` |
| `GRANTED_EVENT_NOT_FOUND` | `GrantedEventNotFoundError` |
| `ALREADY_REVOKED` | `AlreadyRevokedError` |
| `PURPOSE_DEPRECATED` | `PurposeDeprecatedError` |
| `SEQUENCE_GAP` | `SequenceGapError` |
| `CHAIN_HASH_MISMATCH` | `ChainHashMismatchError` |
| `INVALID_SUPERSEDES_REFERENCE` | `InvalidSupersedesReferenceError` |
| `MISSING_SUPERSEDES` | `MissingSupersedesError` |
| `DUPLICATE_PURPOSE_IN_POLICY` | `DuplicatePurposeInPolicyError` |

## Adapter sketch — PostgreSQL (`pg`)

```sql
CREATE TABLE consent_events (
  controller_id   UUID    NOT NULL,
  sequence_number INTEGER NOT NULL,
  event           JSONB   NOT NULL,
  current_hash    CHAR(64) NOT NULL,
  PRIMARY KEY (controller_id, sequence_number)
);
CREATE INDEX consent_events_subject_idx
  ON consent_events ((event->'payload'->>'subjectId'));
```

Implement `getLastHash` / `getLastSequenceNumber` with `ORDER BY sequence_number DESC LIMIT 1`. Use `SELECT ... FOR UPDATE` or an advisory lock keyed by `controller_id` during append.

## Adapter sketch — MongoDB

Collection `consent_events` with unique index `{ controllerId: 1, sequenceNumber: 1 }`. Insert events as-is. Sort with `.sort({ sequenceNumber: 1 })` before passing to `verifyChain` / `reduceEvents`.

## Common `Purpose.retention`

```typescript
{ kind: 'fixed', duration: 'P1Y' }       // 1 year
{ kind: 'fixed', duration: 'PT6H' }      // 6 hours
{ kind: 'conditional', description: 'Until contract ends.' }
```

Durations are ISO 8601.

## Periodic verification

```typescript
const events = await adapter.getEventsByController(controllerId);
const result = verifyChain(events);
if (!result.valid) {
  log.error('chain broken', {
    controllerId,
    reason: result.brokenAt?.reason,
    at: result.brokenAt?.eventId,
  });
}
```

Run nightly per `controllerId`. Failures are auditable evidence — capture and store the report.

## Proof export shape

`Proof.export(...)` returns:

- `exportedAt: ISO timestamp`
- `subject: { controllerId, subjectId, purposeId? }`
- `events: PersistedEvent[]` (filtered by subject)
- `purposes: Purpose[]`
- `policyVersions: PolicyVersion[]`
- `chainVerification: ChainVerificationResult`
- `legalReferences: { artifact, article }[]`

Serialize as-is and hand to the data subject or regulator. Do not transform.
