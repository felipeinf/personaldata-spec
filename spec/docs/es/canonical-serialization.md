# Serialización canónica y cadena de hashes

Definición normativa para calcular `payloadHash` y `currentHash` en los eventos de consentimiento. Toda implementación de SDK **debe** producir hashes idénticos para eventos lógicamente idénticos.

## Resumen del algoritmo

Para cada nuevo evento `E` agregado a la cadena del responsable `R`:

```
prevHash       = currentHash del evento anterior, o "GENESIS" si es el primer evento
payloadJson    = canonicalJson(E.payload)
payloadHash    = SHA-256(payloadJson) en hex minúsculas (64 caracteres)
headerJson     = canonicalJson({
                   eventId, eventType, sequenceNumber, controllerId,
                   timestamp, prevHash, payloadHash
                 })
currentHash    = SHA-256(headerJson) en hex minúsculas (64 caracteres)
```

Almacenado en el evento:

- `prevEventHash`: `null` en el primer evento de la cadena; en caso contrario, el `currentHash` (hex) del evento anterior.
- `payloadHash`, `currentHash`: calculados como se indica arriba.

Al calcular `headerJson`, si `prevEventHash === null` se mapea a `prevHash = "GENESIS"`. Si `prevEventHash` es una cadena hex, se usa tal cual como `prevHash`.

Verificación (por responsable, en orden ascendente de `sequenceNumber`):

1. Recalcular `payloadHash` y `currentHash` para cada evento.
2. Verificar que el `prevEventHash` del evento `i+1` sea igual al `currentHash` del evento `i` (o `null` en el génesis).
3. Verificar que `sequenceNumber` sea estrictamente creciente, sin saltos (parte en 1).

## JSON canónico (`canonicalJson`)

Serialización determinista usada solo para hashing (no necesariamente para almacenamiento o APIs).

### Reglas

1. **Claves de objeto**: ordenadas lexicográficamente por punto de código UTF-8 en cada nivel de anidamiento.
2. **Espacios en blanco**: sin espacios no significativos (salida compacta).
3. **Cadenas**: UTF-8 sin BOM; escape JSON conforme a RFC 8259.
4. **Números**: sintaxis numérica JSON; sin `+` inicial; sin notación científica salvo que sea necesaria para representar el valor exactamente como fue almacenado (preferir formas enteras o decimales fijas del valor original).
5. **Booleanos**: `true` / `false` (minúsculas).
6. **Null**: `null`.
7. **Arreglos**: se preserva el orden de los elementos (no se ordenan).

### Ejemplo

Objeto de entrada:

```json
{ "z": 1, "a": { "nested": true, "beta": null } }
```

Cadena canónica:

```json
{"a":{"beta":null,"nested":true},"z":1}
```

## Campos del objeto header

| Campo en header | Origen en el evento |
|-----------------|---------------------|
| `eventId` | `eventId` |
| `eventType` | `eventType` |
| `sequenceNumber` | `sequenceNumber` |
| `controllerId` | `controllerId` |
| `timestamp` | `timestamp` |
| `prevHash` | ver mapeo de génesis arriba |
| `payloadHash` | calculado a partir del payload |

`prevEventHash`, `currentHash` y `payload` **no** se incluyen en el objeto header usado para `currentHash`.

## Génesis

El primer evento para un `controllerId` tiene:

- `sequenceNumber`: `1`
- `prevEventHash`: `null`
- `prevHash` en el cálculo del header: `"GENESIS"` (cadena literal, no un hash)

Cada responsable mantiene una cadena independiente.

## Salida SHA-256

- Algoritmo: SHA-256
- Codificación: hexadecimal en minúsculas, exactamente 64 caracteres `[a-f0-9]{64}`
- Coincide con `shared/hash.schema.json` → `Sha256Hex`

## Pseudocódigo

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

## Conformidad

Los futuros casos `conformance/hash-chain/` de este repositorio contendrán vectores dorados (evento de entrada → hashes esperados). Los SDK deben aprobar el 100% de los casos correspondientes a la versión declarada del spec.
