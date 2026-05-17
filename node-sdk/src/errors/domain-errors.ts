import { PersonaldataError } from './base-error.js';
import { ErrorCodes, type ErrorCode } from './codes.js';

export class SchemaValidationError extends PersonaldataError {
  public readonly code: ErrorCode = ErrorCodes.SCHEMA_VALIDATION_FAILED;
}

export class BusinessRuleViolatedError extends PersonaldataError {
  public readonly code: ErrorCode = ErrorCodes.BUSINESS_RULE_VIOLATED;
}

export class GrantedEventNotFoundError extends PersonaldataError {
  public readonly code: ErrorCode = ErrorCodes.GRANTED_EVENT_NOT_FOUND;
  public override readonly legalReference = 'Art. 12 (Ley 21.719)';
}

export class AlreadyRevokedError extends PersonaldataError {
  public readonly code: ErrorCode = ErrorCodes.ALREADY_REVOKED;
  public override readonly legalReference = 'Art. 12 inc. tercero (Ley 21.719)';
}

export class PurposeDeprecatedError extends PersonaldataError {
  public readonly code: ErrorCode = ErrorCodes.PURPOSE_DEPRECATED;
  public override readonly legalReference = 'Art. 3 letra b (Ley 21.719)';
}

export class SequenceGapError extends PersonaldataError {
  public readonly code: ErrorCode = ErrorCodes.SEQUENCE_GAP;
  public override readonly legalReference = 'Art. 14 quinquies (Ley 21.719)';
}

export class ChainHashMismatchError extends PersonaldataError {
  public readonly code: ErrorCode = ErrorCodes.CHAIN_HASH_MISMATCH;
  public override readonly legalReference = 'Art. 12 inc. final (Ley 21.719)';
}

export class InvalidSupersedesReferenceError extends PersonaldataError {
  public readonly code: ErrorCode = ErrorCodes.INVALID_SUPERSEDES_REFERENCE;
  public override readonly legalReference = 'Art. 3 letra b (Ley 21.719)';
}

export class MissingSupersedesError extends PersonaldataError {
  public readonly code: ErrorCode = ErrorCodes.MISSING_SUPERSEDES;
  public override readonly legalReference = 'Art. 3 letra b (Ley 21.719)';
}

export class DuplicatePurposeInPolicyError extends PersonaldataError {
  public readonly code: ErrorCode = ErrorCodes.DUPLICATE_PURPOSE_IN_POLICY;
  public override readonly legalReference = 'Art. 14 ter (Ley 21.719)';
}
