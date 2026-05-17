import { describe, expect, it } from 'vitest';
import { PurposeDeprecatedError } from '../../src/errors/index.js';
import { PurposeFactory } from '../../src/entities/purpose.js';
import { assertPurposeIsActive } from '../../src/validators/business-rules.js';

describe('business rules', () => {
  it('throws when purpose is deprecated', () => {
    const purpose = PurposeFactory.create({
      controllerId: '00000000-0000-4000-8000-000000000060',
      name: 'marketing',
      displayName: 'Marketing',
      description: 'Marketing communications',
      dataCategories: ['email'],
      retention: { kind: 'fixed', duration: 'P1Y' },
    });
    const deprecated = PurposeFactory.deprecate(purpose);
    expect(() => assertPurposeIsActive(deprecated)).toThrow(PurposeDeprecatedError);
  });
});
