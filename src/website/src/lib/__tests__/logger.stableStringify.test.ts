import { stableStringify } from '@/lib/utils/logger';

/**
 * Unit coverage for the Slack dedupe key serializer. It must be circular-safe
 * and deterministic: distinct contexts must never collapse to the same output
 * (that would suppress a real alert for the whole dedupe window), and it must
 * never return an empty string.
 */
describe('stableStringify', () => {
  it('serializes a circular object without throwing and marks the cycle', () => {
    const context: Record<string, unknown> = { scope: 'home' };
    context.self = context;

    let result = '';
    expect(() => {
      result = stableStringify(context);
    }).not.toThrow();

    expect(result).toContain('[Circular]');
    expect(result).toContain('scope');
  });

  it('keeps distinct outputs for contexts that differ only inside circular structures', () => {
    const makeContext = (detail: string) => {
      const context: Record<string, unknown> = { detail };
      context.self = context; // circular reference
      return context;
    };

    const alpha = stableStringify(makeContext('alpha'));
    const beta = stableStringify(makeContext('beta'));

    expect(alpha).not.toBe(beta);
    expect(alpha).toContain('alpha');
    expect(beta).toContain('beta');
  });

  it('sorts object keys at every nesting level', () => {
    const first = stableStringify({
      beta: 2,
      nested: { zulu: 3, alpha: 1 },
      alpha: 1,
    });
    const second = stableStringify({
      alpha: 1,
      nested: { alpha: 1, zulu: 3 },
      beta: 2,
    });

    expect(first).toBe(second);
  });

  it('preserves an own __proto__ property while sorting keys', () => {
    const context = JSON.parse(
      '{"__proto__":{"polluted":true},"safe":1}',
    ) as Record<string, unknown>;

    const serialized = stableStringify(context);
    const parsed = JSON.parse(serialized) as Record<string, unknown>;

    expect(Object.prototype.hasOwnProperty.call(parsed, '__proto__')).toBe(
      true,
    );
    expect(parsed.__proto__).toEqual({ polluted: true });
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
  });

  it('handles bigint and function values without throwing', () => {
    // Note: BigInt('...') from a string instead of an `n` literal — ts-jest
    // compiles with target es2017, where bigint literals are a syntax error,
    // and BigInt(number) would lose precision above 2^53.
    const context = {
      count: BigInt('9007199254740993'),
      handler: () => 'noop',
    };

    let result = '';
    expect(() => {
      result = stableStringify(context);
    }).not.toThrow();

    expect(result).toContain('9007199254740993');
    // Functions are replaced by a fixed marker instead of being omitted,
    // so keys that differ only in function fields stay distinct.
    expect(result).toContain('[Function]');
  });

  it('never returns an empty string, even for hostile inputs', () => {
    // Top-level undefined has no JSON representation
    expect(stableStringify(undefined)).toBe('[unserializable:undefined]');

    // A getter that throws mid-serialization forces the last-resort fallback
    const hostile: Record<string, unknown> = {};
    Object.defineProperty(hostile, 'boom', {
      enumerable: true,
      get() {
        throw new Error('getter exploded');
      },
    });
    expect(stableStringify(hostile)).toBe('[unserializable:object]');

    // Top-level values plain JSON.stringify cannot serialize directly
    expect(stableStringify(BigInt(42))).not.toBe('');
    expect(stableStringify(Symbol('tag'))).not.toBe('');
    expect(stableStringify(() => 'x')).not.toBe('');
  });
});
