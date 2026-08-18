import { describe, expect, it } from 'vitest';
import { computeDesiredStates } from '../../src/shared/autostate';
import type { AutoStateRule, ExtensionGroup } from '../../src/shared/types';

const groups: ExtensionGroup[] = [
  { id: 'group_1', name: 'Work', extensionIds: ['ext_b', 'ext_c'], color: '#000', createdAt: 1 },
];

function makeRule(overrides: Partial<AutoStateRule>): AutoStateRule {
  return {
    id: overrides.id ?? 'rule_1',
    enabled: overrides.enabled ?? true,
    name: overrides.name ?? 'Rule',
    pattern: overrides.pattern ?? 'https://example.com/*',
    isWildcard: overrides.isWildcard ?? true,
    targets: overrides.targets ?? ['ext_a'],
    action: overrides.action ?? 'enableWhenMatched',
    priority: overrides.priority ?? 0,
    createdAt: overrides.createdAt ?? 1,
  };
}

describe('computeDesiredStates', () => {
  it('applies the higher-priority rule when rule overlap conflicts', () => {
    const rules: AutoStateRule[] = [
      makeRule({ id: 'higher', action: 'disableWhenMatched', priority: 0, targets: ['ext_a'] }),
      makeRule({ id: 'lower', action: 'enableWhenMatched', priority: 10, targets: ['ext_a'] }),
    ];

    const result = computeDesiredStates(rules, groups, ['https://example.com/work']);

    expect(result).toEqual({ ext_a: false });
  });

  it('treats enableOnlyWhileMatched as strict enable/disable based on match', () => {
    const rules: AutoStateRule[] = [
      makeRule({ id: 'only', action: 'enableOnlyWhileMatched', targets: ['ext_a'] }),
    ];

    expect(computeDesiredStates(rules, groups, ['https://example.com/work'])).toEqual({ ext_a: true });
    expect(computeDesiredStates(rules, groups, ['https://other.example.com'])).toEqual({ ext_a: false });
  });

  it('resolves group targets deterministically', () => {
    const rules: AutoStateRule[] = [
      makeRule({ id: 'group-rule', action: 'disableWhenMatched', targets: ['group_1'] }),
    ];

    expect(computeDesiredStates(rules, groups, ['https://example.com/work'])).toEqual({
      ext_b: false,
      ext_c: false,
    });
  });
});
