export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export function canonicalize(value: JsonValue): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return canonicalizeNumber(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(',')}]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value)
      .filter((k) => value[k] !== undefined)
      .sort();
    const parts = keys.map(
      (k) => `${JSON.stringify(k)}:${canonicalize(value[k] as JsonValue)}`,
    );
    return `{${parts.join(',')}}`;
  }
  throw new Error('Unsupported value type for canonicalization');
}

function canonicalizeNumber(n: number): string {
  if (!Number.isFinite(n)) {
    throw new Error('Non-finite numbers are not canonicalizable');
  }
  if (Number.isInteger(n)) return n.toString();
  const str = n.toString();
  if (!str.includes('e') && !str.includes('E')) return str;
  return n.toFixed(20).replace(/0+$/, '').replace(/\.$/, '');
}
