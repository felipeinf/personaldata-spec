export { PurposeFactory, type CreatePurposeInput } from './entities/purpose.js';
export {
  PolicyVersionFactory,
  type CreatePolicyVersionInput,
} from './entities/policy-version.js';
export {
  EventBuilder,
  buildConsentBatch,
  type BuildConsentGrantedInput,
  type BuildConsentRevokedInput,
  type BuildConsentSupersededInput,
  type BuildPolicyPublishedInput,
  type BuildInformationPresentedInput,
  type ConsentSelection,
  type BuildConsentBatchInput,
} from './events/event-builder.js';
export { validateAgainstSchema } from './validators/schema-validator.js';
export * as BusinessRules from './validators/business-rules.js';
export {
  canonicalize,
  computePayloadHash,
  computeCurrentHash,
  resolvePrevHash,
  verifyChain,
  GENESIS_HASH,
  type JsonValue,
  type EventForHashing,
  type PersistedEvent,
  type ChainVerificationResult,
} from './hash-chain/index.js';
export {
  reduceEvents,
  ConsentStateQueries,
  type ConsentState,
  type ActiveConsent,
} from './state/index.js';
export {
  Proof,
  type ProofExportInput,
  type ProofArtifact,
  type LegalReference,
} from './proof/index.js';
export {
  PersonaldataError,
  SchemaValidationError,
  BusinessRuleViolatedError,
  GrantedEventNotFoundError,
  AlreadyRevokedError,
  PurposeDeprecatedError,
  SequenceGapError,
  ChainHashMismatchError,
  InvalidSupersedesReferenceError,
  MissingSupersedesError,
  DuplicatePurposeInPolicyError,
  ErrorCodes,
  type ErrorCode,
  type PersonaldataErrorContext,
} from './errors/index.js';
export type {
  Purpose,
  PolicyVersion,
  ConsentGrantedEvent,
  ConsentRevokedEvent,
  ConsentSupersededEvent,
  PolicyPublishedEvent,
  InformationPresentedEvent,
} from './generated/aliases.js';
