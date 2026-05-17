# personaldata-spec

Single source of truth for consent traceability under Chile Law 21.719 (v0 scope). This repository defines JSON Schemas for entities and events, plus normative documentation for hash chains and legal mapping.

SDK implementations (Node, Python, Go, etc.) consume these schemas to generate language types and to validate inputs. Business rules that JSON Schema cannot express are enforced in each SDK.

## Layout

```
schema/
  entities/     Purpose, PolicyVersion
  events/       Event base + five event types
  shared/       Primitives, enums, hash formats, evidence
docs/
  en/           English documentation (canonical)
  es/           Documentación en español
scripts/
  validate-schemas.mjs   AJV-based schema compilation check
```

## Entities


| Schema                                | Description                                              |
| ------------------------------------- | -------------------------------------------------------- |
| `entities/purpose.schema.json`        | Versioned, immutable processing purpose                  |
| `entities/policy-version.schema.json` | Published snapshot of purposes shown to the data subject |


## Events

All events extend `events/event-base.schema.json` (nine top-level fields + typed `payload`).


| Schema                                     | `eventType`             |
| ------------------------------------------ | ----------------------- |
| `events/policy-published.schema.json`      | `policy_published`      |
| `events/information-presented.schema.json` | `information_presented` |
| `events/consent-granted.schema.json`       | `consent_granted`       |
| `events/consent-revoked.schema.json`       | `consent_revoked`       |
| `events/consent-superseded.schema.json`    | `consent_superseded`    |


## Business rules (not in JSON Schema)

Implement in SDK code, not in these files:

- If `Purpose.version > 1`, `supersedes` is required and must reference the immediately previous version.
- A `PolicyVersion` must not list the same `purposeId` twice.
- `consent_revoked` must reference an existing, still-active `consent_granted`.
- `sequenceNumber` must be contiguous per `controllerId`.
- Cannot grant consent on a `deprecated` purpose.

See the SDK library narrative (workspace root, `docs/library/en.md` §5.2) for the full catalog and stable error codes.

## Documentation in this repository


| Document                             | English                                                                      | Español                                                                      |
| ------------------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Legal mapping (Law 21.719 ↔ schema)  | `[docs/en/legal-mapping.md](./docs/en/legal-mapping.md)`                     | `[docs/es/legal-mapping.md](./docs/es/legal-mapping.md)`                     |
| Canonical serialization & hash chain | `[docs/en/canonical-serialization.md](./docs/en/canonical-serialization.md)` | `[docs/es/canonical-serialization.md](./docs/es/canonical-serialization.md)` |


English is the canonical version when content diverges.

