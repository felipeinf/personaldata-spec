# PostgreSQL + Drizzle

Same invariants as the Prisma example: one row per event, monotonic `sequence_number`, hash chain continuity.

Use a transaction when appending: read last hash/sequence, build the next event with `EventBuilder`, insert, commit.

Run `runPersistenceConformance` from `@personaldata/sdk/testing` against your adapter before production.
