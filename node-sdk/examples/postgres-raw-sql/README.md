# PostgreSQL (pg driver)

```sql
CREATE TABLE consent_events (
  controller_id UUID NOT NULL,
  sequence_number INTEGER NOT NULL,
  event JSONB NOT NULL,
  current_hash CHAR(64) NOT NULL,
  PRIMARY KEY (controller_id, sequence_number)
);
```

Insert with `EventBuilder` output as-is. Verify with `verifyChain` on `SELECT event FROM consent_events WHERE controller_id = $1 ORDER BY sequence_number`.
