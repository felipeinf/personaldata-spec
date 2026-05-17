# MongoDB + Mongoose

Store each event document immutably. Index `{ controllerId: 1, sequenceNumber: 1 }` unique.

Load with `.sort({ sequenceNumber: 1 })` and pass to `verifyChain`. Use `buildConsentBatch` when the subject accepts multiple purposes in one action.
