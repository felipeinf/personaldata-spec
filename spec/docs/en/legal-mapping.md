# Legal mapping — Law 21.719 (v0)

Formal mapping between **technical artifacts** in `personaldata-spec` and **articles of Chile Law 21.719** on personal data protection. v0 covers consent traceability only.

## Coverage table

| SDK / schema element | Schema path | Article |
|----------------------|-------------|---------|
| `Purpose.description` | `entities/purpose.schema.json` → `description` | Art. 12 (informed consent), Art. 14 ter |
| `Purpose` versioning (`version`, `supersedes`) | `entities/purpose.schema.json` | Art. 3 letter b (purpose principle) |
| `consent_granted` + `mechanism` | `events/consent-granted.schema.json` → `payload.mechanism` | Art. 12 (unambiguous manifestation) |
| `consent_revoked` + `mechanism` | `events/consent-revoked.schema.json` → `payload.mechanism` | Art. 12 (equivalent revocation) |
| No retroactivity of revocation | SDK business rules (reducer) | Art. 12 third paragraph |
| Event hash chain (`prevEventHash`, `payloadHash`, `currentHash`) | `events/event-base.schema.json` | Art. 12 final paragraph (evidentiary burden), Art. 14 quinquies (integrity) |
| `PolicyVersion.informationBlock` | `entities/policy-version.schema.json` → `informationBlock` | Art. 14 ter (duty of information) |
| `Purpose.dataCategories` | `entities/purpose.schema.json` → `dataCategories` | Art. 14 ter letter d |
| `Purpose.retention` | `entities/purpose.schema.json` → `retention` | Art. 3 letter c (proportionality), Art. 14 ter letter i |
| `information_presented` + `contentHash` | `events/information-presented.schema.json` | Art. 14 ter (information presented to subject) |
| `evidence.contentHash` | `shared/evidence.schema.json` | Art. 12 (proof of what was shown at capture) |
| Proof export (future SDK) | not in spec v0 schemas | Art. 5 (access), Art. 12 final paragraph |

## Event types ↔ lifecycle

| `eventType` | Legal role |
|-------------|------------|
| `policy_published` | Records which policy snapshot was in force |
| `information_presented` | Records that Art. 14 ter information was shown |
| `consent_granted` | Records grant per purpose (Art. 12) |
| `consent_revoked` | Records revocation with same ease as grant |
| `consent_superseded` | Records renewal when purpose version changes |

## Explicit v0 limits

Not modeled in this spec (roadmap or out of product scope):

| Topic | Rationale |
|-------|-----------|
| Sensitive data (Art. 16) | Reinforced consent — v1 |
| Children and adolescents | Special regimes |
| Other lawful bases (Art. 13) | v0: `legalBasis` enum is only `consent` |
| Transfers / international flows | Title V — separate modeling |
| Security incidents (Art. 14 sexies) | Outside consent traceability |
| Impact assessment (Art. 15 ter) | Process, not event artifact |
| Automated decisions (Art. 8 bis) | Profiling — separate modeling |
| Full ARSOPB rights | v0: proof-of-consent component only |

## Positioning

The library builds traceability artifacts only. It does not store or process personal data on behalf of the controller and is **not** a third-party processor under Art. 15 bis.
