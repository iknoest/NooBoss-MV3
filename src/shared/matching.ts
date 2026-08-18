/**
 * URL matching utilities for AutoState rules.
 * Supports wildcard patterns and regex patterns.
 */

/**
 * Convert a wildcard pattern to a RegExp.
 * Wildcard rules:
 *   * matches any sequence of characters (including empty)
 *   ? matches exactly one character
 *   All other regex special chars are escaped
 */
export function wildcardToRegExp(pattern: string): RegExp {
  let result = '^';
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    switch (c) {
      case '*':
        result += '.*';
        break;
      case '?':
        result += '.';
        break;
      case '.':
      case '^':
      case '$':
      case '+':
      case '{':
      case '}':
      case '[':
      case ']':
      case '|':
      case '(':
      case ')':
      case '\\':
        result += '\\' + c;
        break;
      default:
        result += c;
    }
  }
  result += '$';
  return new RegExp(result, 'i');
}

/**
 * Test whether a URL matches a pattern (wildcard or regex).
 */
export function matchUrl(
  url: string,
  pattern: string,
  isWildcard: boolean
): boolean {
  try {
    const re = isWildcard
      ? wildcardToRegExp(pattern)
      : new RegExp(pattern, 'i');
    return re.test(url);
  } catch {
    // Invalid regex - treat as no match
    return false;
  }
}

/**
 * Validate a regex pattern string.
 * Returns null if valid, or an error message if invalid.
 */
export function validateRegex(pattern: string): string | null {
  try {
    new RegExp(pattern, 'i');
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : 'Invalid regular expression';
  }
}

/**
 * Validate a wildcard pattern string.
 * Wildcards are always valid, but we check for empty.
 */
export function validateWildcard(pattern: string): string | null {
  if (!pattern.trim()) {
    return 'Pattern cannot be empty';
  }
  return null;
}

/**
 * Validate a pattern based on type.
 */
export function validatePattern(
  pattern: string,
  isWildcard: boolean
): string | null {
  if (!pattern.trim()) {
    return 'Pattern cannot be empty';
  }
  return isWildcard ? validateWildcard(pattern) : validateRegex(pattern);
}
