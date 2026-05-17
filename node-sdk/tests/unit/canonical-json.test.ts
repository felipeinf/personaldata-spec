import { describe, expect, it } from 'vitest';
import { canonicalize } from '../../src/hash-chain/canonical-json.js';

describe('canonicalize', () => {
  it('sorts object keys lexicographically', () => {
    const input = { z: 1, a: { nested: true, beta: null } };
    expect(canonicalize(input)).toBe(
      '{"a":{"beta":null,"nested":true},"z":1}',
    );
  });

  it('is deterministic', () => {
    const input = { b: 2, a: 1 };
    const first = canonicalize(input);
    const second = canonicalize({ a: 1, b: 2 });
    expect(first).toBe(second);
  });

  it('preserves array order', () => {
    expect(canonicalize([3, 1, 2])).toBe('[3,1,2]');
  });
});
