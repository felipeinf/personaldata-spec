import type { ErrorCode } from './codes.js';

export interface PersonaldataErrorContext {
  readonly [key: string]: unknown;
}

export abstract class PersonaldataError extends Error {
  public abstract readonly code: ErrorCode;
  public readonly legalReference?: string;
  public readonly context: PersonaldataErrorContext;

  constructor(message: string, context: PersonaldataErrorContext = {}) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
  }

  public toJSON() {
    return {
      code: this.code,
      message: this.message,
      legalReference: this.legalReference,
      context: this.context,
    };
  }
}
