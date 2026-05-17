# PostgreSQL + Prisma

Append-only `consent_events` table keyed by `controller_id`, ordered by `sequence_number`.

1. Persist each `PersistedEvent` as JSONB after `EventBuilder` returns it.
2. On insert, enforce `sequence_number = last + 1` and `prev_event_hash = last.current_hash` (or `null` for genesis).
3. Load events with `ORDER BY sequence_number ASC` for `verifyChain` and `reduceEvents`.

Do not update or delete rows; revocations are new events.
