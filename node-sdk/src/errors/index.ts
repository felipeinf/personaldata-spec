export { ErrorCodes, type ErrorCode } from './codes.js';
export {
  PersonaldataError,
  type PersonaldataErrorContext,
} from './base-error.js';
export {
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
} from './domain-errors.js';
