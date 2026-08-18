import { describe, it, expect } from 'vitest';
import { wildcardToRegExp, matchUrl, validateRegex, validateWildcard, validatePattern } from '../../src/shared/matching';

describe('wildcardToRegExp', () => {
  it('converts simple wildcard with *', () => {
    const re = wildcardToRegExp('*example.com*');
    expect(re.test('https://example.com/page')).toBe(true);
    expect(re.test('http://www.example.com')).toBe(true);
    expect(re.test('https://other.com')).toBe(false);
  });

  it('converts wildcard with ? for single char match', () => {
    const re = wildcardToRegExp('test?.com');
    expect(re.test('test1.com')).toBe(true);
    expect(re.test('testA.com')).toBe(true);
    expect(re.test('test.com')).toBe(false);
    expect(re.test('test12.com')).toBe(false);
  });

  it('escapes regex special characters', () => {
    const re = wildcardToRegExp('test.com');
    expect(re.test('test.com')).toBe(true);
    expect(re.test('testXcom')).toBe(false); // dot is escaped, not wildcard
  });

  it('handles empty string', () => {
    const re = wildcardToRegExp('');
    expect(re.test('')).toBe(true);
    expect(re.test('anything')).toBe(false);
  });

  it('handles * at start and end', () => {
    const re = wildcardToRegExp('*github*');
    expect(re.test('https://github.com/repo')).toBe(true);
    expect(re.test('github')).toBe(true);
    expect(re.test('mygithub')).toBe(true);
  });

  it('is case insensitive', () => {
    const re = wildcardToRegExp('*Example*');
    expect(re.test('EXAMPLE')).toBe(true);
    expect(re.test('example')).toBe(true);
  });

  it('escapes brackets and pipes', () => {
    const re = wildcardToRegExp('test[1]|2');
    expect(re.test('test[1]|2')).toBe(true);
    expect(re.test('test1')).toBe(false); // brackets are escaped
  });

  it('escapes backslashes', () => {
    const re = wildcardToRegExp('path\\to\\file');
    expect(re.test('path\\to\\file')).toBe(true);
  });
});

describe('matchUrl', () => {
  it('matches with wildcard pattern', () => {
    expect(matchUrl('https://github.com/repo', '*github.com*', true)).toBe(true);
    expect(matchUrl('https://example.com', '*github.com*', true)).toBe(false);
  });

  it('matches with regex pattern', () => {
    expect(matchUrl('https://github.com/repo', '.*github\\.com.*', false)).toBe(true);
    expect(matchUrl('https://example.com', '.*github\\.com.*', false)).toBe(false);
  });

  it('handles invalid regex gracefully', () => {
    expect(matchUrl('https://example.com', '[invalid', false)).toBe(false);
  });

  it('regex matching is case insensitive', () => {
    expect(matchUrl('https://GITHUB.COM', 'github\\.com', false)).toBe(true);
  });

  it('matches complex wildcard URLs', () => {
    expect(matchUrl('https://docs.google.com/document/d/abc123', '*docs.google.com*', true)).toBe(true);
  });
});

describe('validateRegex', () => {
  it('returns null for valid regex', () => {
    expect(validateRegex('.*\\.com')).toBeNull();
    expect(validateRegex('^https?://.*')).toBeNull();
  });

  it('returns error for invalid regex', () => {
    expect(validateRegex('[invalid')).not.toBeNull();
    expect(validateRegex('(?P<name>test)')).not.toBeNull();
  });
});

describe('validateWildcard', () => {
  it('returns null for valid wildcard', () => {
    expect(validateWildcard('*example*')).toBeNull();
    expect(validateWildcard('test')).toBeNull();
  });

  it('returns error for empty wildcard', () => {
    expect(validateWildcard('')).not.toBeNull();
    expect(validateWildcard('   ')).not.toBeNull();
  });
});

describe('validatePattern', () => {
  it('validates wildcard patterns', () => {
    expect(validatePattern('*example*', true)).toBeNull();
    expect(validatePattern('', true)).not.toBeNull();
  });

  it('validates regex patterns', () => {
    expect(validatePattern('.*\\.com', false)).toBeNull();
    expect(validatePattern('[bad', false)).not.toBeNull();
    expect(validatePattern('', false)).not.toBeNull();
  });
});
