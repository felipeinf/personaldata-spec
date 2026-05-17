# Canonical serialization and hash chain

Normative definition for computing `payloadHash` and `currentHash` on consent events. Every SDK implementation **must** produce identical hashes for identical logical events.

## Algorithm overview

For each new event `E` appended to controller `R`'s chain:

```
prevHash       = previous event's currentHash, or "GENESIS" if first event
payloadJson    = canonicalJson(E.payload)
payloadHash    = SHA-256(payloadJson) as lowercase hex (64 chars)
headerJson     = canonicalJson({
                   eventId, eventType, sequenceNumber, controllerId,
                   timestamp, prevHash, payloadHash
                 })
currentHash    = SHA-256(headerJson) as lowercase hex (64 chars)
```

Stored on the event:

- `prevEventHash`: `null` on the first event of a chain; otherwise the previous event's `currentHash` (hex).
- `payloadHash`, `currentHash`: as computed above.

When computing `headerJson`, map `prevEventHash === null` to `prevHash = "GENESIS"`. When `prevEventHash` is a hex string, use it as `prevHash`.

Verification (per controller, ascending `sequenceNumber`):

1. Recompute `payloadHash` and `currentHash` for each event.
2. Assert event `i+1`'s `prevEventHash` equals event `i`'s `currentHash` (or `null` on genesis).
3. Assert `sequenceNumber` is strictly increasing with no gaps (starts at 1).

## Canonical JSON (`canonicalJson`)

Deterministic serialization used for hashing only (not necessarily for storage or APIs).

### Rules

1. **Object keys**: sorted lexicographically by UTF-8 code point at each nesting level.
2. **Whitespace**: no insignificant whitespace (compact output).
3. **Strings**: UTF-8, no BOM; JSON-escape per RFC 8259.
4. **Numbers**: JSON number syntax; no leading `+`; no scientific notation unless required to represent the value exactly as stored (prefer integer or fixed decimal forms from the source value).
5. **Booleans**: `true` / `false` (lowercase).
6. **Null**: `null`.
7. **Arrays**: element order preserved (not sorted).

### Example

Input object:

```json
{ "z": 1, "a": { "nested": true, "beta": null } }
```

Canonical string:

```json
{"a":{"beta":null,"nested":true},"z":1}
```

## Header object fields

| Field in header | Source on event |
|-----------------|-----------------|
| `eventId` | `eventId` |
| `eventType` | `eventType` |
| `sequenceNumber` | `sequenceNumber` |
| `controllerId` | `controllerId` |
| `timestamp` | `timestamp` |
| `prevHash` | see genesis mapping above |
| `payloadHash` | computed from payload |

`prevEventHash`, `currentHash`, and `payload` are **not** included in the header object used for `currentHash`.

## Genesis

The first event for a `controllerId` has:

- `sequenceNumber`: `1`
- `prevEventHash`: `null`
- `prevHash` in header computation: `"GENESIS"` (literal string, not a hash)

Each controller maintains an independent chain.

## SHA-256 output

- Algorithm: SHA-256
- Encoding: lowercase hexadecimal, exactly 64 characters `[a-f0-9]{64}`
- Matches `shared/hash.schema.json` → `Sha256Hex`

## Pseudocode

```
function computePayloadHash(payload):
  return sha256Hex(canonicalJson(payload))

function resolvePrevHash(event, previousEvent):
  if event.sequenceNumber == 1:
    return "GENESIS"
  if event.prevEventHash != null:
    return event.prevEventHash
  if previousEvent != null:
    return previousEvent.currentHash
  raise Error("invalid chain")

function computeCurrentHash(event, previousEvent):
  prevHash = resolvePrevHash(event, previousEvent)
  payloadHash = computePayloadHash(event.payload)
  header = {
    eventId: event.eventId,
    eventType: event.eventType,
    sequenceNumber: event.sequenceNumber,
    controllerId: event.controllerId,
    timestamp: event.timestamp,
    prevHash: prevHash,
    payloadHash: payloadHash
  }
  return sha256Hex(canonicalJson(header))
```

## Conformance

Future `conformance/hash-chain/` cases in this repository will hold golden vectors (input event → expected hashes). SDKs must pass 100% of cases for their declared spec version.
