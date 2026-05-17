# Mapeo legal — Ley 21.719 (v0)

Mapeo formal entre los **artefactos técnicos** de `personaldata-spec` y los **artículos de la Ley 21.719** de Chile sobre protección de datos personales. El alcance v0 cubre únicamente la trazabilidad del consentimiento.

## Tabla de cobertura

| Elemento del SDK / esquema | Ruta del esquema | Artículo |
|----------------------------|------------------|----------|
| `Purpose.description` | `entities/purpose.schema.json` → `description` | Art. 12 (consentimiento informado), Art. 14 ter |
| Versionado de `Purpose` (`version`, `supersedes`) | `entities/purpose.schema.json` | Art. 3 letra b (principio de finalidad) |
| `consent_granted` + `mechanism` | `events/consent-granted.schema.json` → `payload.mechanism` | Art. 12 (manifestación inequívoca) |
| `consent_revoked` + `mechanism` | `events/consent-revoked.schema.json` → `payload.mechanism` | Art. 12 (revocación equivalente) |
| No retroactividad de la revocación | Reglas de negocio del SDK (reducer) | Art. 12 inciso tercero |
| Cadena de hashes de eventos (`prevEventHash`, `payloadHash`, `currentHash`) | `events/event-base.schema.json` | Art. 12 inciso final (carga probatoria), Art. 14 quinquies (integridad) |
| `PolicyVersion.informationBlock` | `entities/policy-version.schema.json` → `informationBlock` | Art. 14 ter (deber de información) |
| `Purpose.dataCategories` | `entities/purpose.schema.json` → `dataCategories` | Art. 14 ter letra d |
| `Purpose.retention` | `entities/purpose.schema.json` → `retention` | Art. 3 letra c (proporcionalidad), Art. 14 ter letra i |
| `information_presented` + `contentHash` | `events/information-presented.schema.json` | Art. 14 ter (información presentada al titular) |
| `evidence.contentHash` | `shared/evidence.schema.json` | Art. 12 (prueba de lo exhibido al momento de captura) |
| Exportación de prueba (SDK futuro) | fuera de los esquemas v0 | Art. 5 (acceso), Art. 12 inciso final |

## Tipos de evento ↔ ciclo de vida

| `eventType` | Rol legal |
|-------------|-----------|
| `policy_published` | Registra qué snapshot de política estuvo vigente. |
| `information_presented` | Registra que la información del Art. 14 ter fue exhibida. |
| `consent_granted` | Registra el otorgamiento por finalidad (Art. 12). |
| `consent_revoked` | Registra la revocación con la misma facilidad que el otorgamiento. |
| `consent_superseded` | Registra la renovación cuando cambia la versión de la finalidad. |

## Límites explícitos de v0

No modelado en este spec (en roadmap o fuera del alcance del producto):

| Tema | Justificación |
|------|---------------|
| Datos sensibles (Art. 16) | Consentimiento reforzado — v1. |
| Niños, niñas y adolescentes | Regímenes especiales. |
| Otras bases de licitud (Art. 13) | En v0 el enum `legalBasis` solo admite `consent`. |
| Transferencias / flujos internacionales | Título V — modelado por separado. |
| Incidentes de seguridad (Art. 14 sexies) | Fuera de la trazabilidad de consentimiento. |
| Evaluación de impacto (Art. 15 ter) | Es un proceso, no un artefacto de evento. |
| Decisiones automatizadas (Art. 8 bis) | Perfilamiento — modelado por separado. |
| Derechos ARSOPB completos | En v0 solo el componente de prueba de consentimiento. |

## Posicionamiento

La biblioteca solo construye artefactos de trazabilidad. No almacena ni trata datos personales por cuenta del responsable y **no** constituye un encargado tercero en el sentido del Art. 15 bis.
