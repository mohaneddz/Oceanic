let counter = 0;

/**
 * Monotonic, collision-free id. `Date.now()` alone repeats when two items are
 * created within the same millisecond (e.g. a preset and its first cycle).
 */
export function createId(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}
