import { describe, it, expect } from 'vitest';
import { generateId, isGroupId, DEFAULT_SETTINGS } from '../../src/shared/types';
import type { AutoStateRule, ExtensionGroup } from '../../src/shared/types';

describe('generateId', () => {
  it('generates unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });

  it('generates non-empty strings', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});

describe('isGroupId', () => {
  it('identifies group IDs', () => {
    expect(isGroupId('group_abc123')).toBe(true);
    expect(isGroupId('group_')).toBe(true);
  });

  it('rejects non-group IDs', () => {
    expect(isGroupId('abcdefghijklmnop')).toBe(false);
    expect(isGroupId('')).toBe(false);
    expect(isGroupId('groups_abc')).toBe(false);
  });
});

describe('DEFAULT_SETTINGS', () => {
  it('has all required fields', () => {
    expect(DEFAULT_SETTINGS.autoStateEnabled).toBeDefined();
    expect(DEFAULT_SETTINGS.autoStateMode).toBeDefined();
    expect(DEFAULT_SETTINGS.historyMaxRecords).toBeGreaterThan(0);
    expect(DEFAULT_SETTINGS.theme).toBe('system');
  });
});

describe('AutoState conflict/priority resolution', () => {
  // These test the conceptual priority model
  it('later rules override earlier ones for the same extension', () => {
    const rules: AutoStateRule[] = [
      {
        id: 'rule1',
        enabled: true,
        name: 'Enable on GitHub',
        pattern: '*github.com*',
        isWildcard: true,
        targets: ['ext1'],
        action: 'enableWhenMatched',
        priority: 0,
        createdAt: 1000,
      },
      {
        id: 'rule2',
        enabled: true,
        name: 'Disable on all',
        pattern: '*',
        isWildcard: true,
        targets: ['ext1'],
        action: 'disableWhenMatched',
        priority: 1,
        createdAt: 1001,
      },
    ];

    // Simulate: both match, rule2 (lower priority = later evaluation) should win
    // Priority model: rules sorted by priority ascending, later ones overwrite
    const desiredState: Record<string, boolean> = {};
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);
    
    for (const rule of sortedRules) {
      // Both match '*github.com*' for URL 'https://github.com'
      if (rule.action === 'enableWhenMatched') {
        desiredState['ext1'] = true;
      } else if (rule.action === 'disableWhenMatched') {
        desiredState['ext1'] = false;
      }
    }
    
    // Rule 2 should win (disable)
    expect(desiredState['ext1']).toBe(false);
  });

  it('enableOnly restores state when no tab matches', () => {
    // When using enableOnlyWhileMatched, extensions should be disabled
    // when no tab matches the pattern
    const enableOnlys: Record<string, boolean> = {};
    const desiredState: Record<string, boolean> = {};

    // Simulate: pattern does NOT match any tab
    const matched = false;
    const action = 'enableOnlyWhileMatched';
    const extId = 'ext1';

    if (action === 'enableOnlyWhileMatched') {
      if (matched) {
        desiredState[extId] = true;
        enableOnlys[extId] = true;
      } else {
        desiredState[extId] = enableOnlys[extId] || false;
      }
    }

    expect(desiredState[extId]).toBe(false);
  });

  it('disableOnly restores state when no tab matches', () => {
    const disableOnlys: Record<string, boolean> = {};
    const desiredState: Record<string, boolean> = {};

    const matched = false;
    const action = 'disableOnlyWhileMatched';
    const extId = 'ext1';

    if (action === 'disableOnlyWhileMatched') {
      if (matched) {
        desiredState[extId] = false;
        disableOnlys[extId] = true;
      } else {
        desiredState[extId] = !disableOnlys[extId];
      }
    }

    expect(desiredState[extId]).toBe(true);
  });
});

describe('Group membership', () => {
  it('allows extension in multiple groups', () => {
    const groups: ExtensionGroup[] = [
      { id: 'group_1', name: 'Dev Tools', extensionIds: ['ext1', 'ext2'], color: '#000', createdAt: 1000 },
      { id: 'group_2', name: 'Security', extensionIds: ['ext1', 'ext3'], color: '#111', createdAt: 1001 },
    ];

    // ext1 appears in both groups
    const groupsContainingExt1 = groups.filter(g => g.extensionIds.includes('ext1'));
    expect(groupsContainingExt1).toHaveLength(2);
  });

  it('resolves group targets to unique extension IDs', () => {
    const groups: ExtensionGroup[] = [
      { id: 'group_1', name: 'A', extensionIds: ['ext1', 'ext2'], color: '#000', createdAt: 1000 },
      { id: 'group_2', name: 'B', extensionIds: ['ext2', 'ext3'], color: '#111', createdAt: 1001 },
    ];

    const targets = ['group_1', 'group_2', 'ext4'];
    const ids = new Set<string>();
    for (const target of targets) {
      if (isGroupId(target)) {
        const group = groups.find(g => g.id === target);
        if (group) group.extensionIds.forEach(id => ids.add(id));
      } else {
        ids.add(target);
      }
    }

    expect(ids.size).toBe(4); // ext1, ext2, ext3, ext4
    expect(ids.has('ext1')).toBe(true);
    expect(ids.has('ext2')).toBe(true);
    expect(ids.has('ext3')).toBe(true);
    expect(ids.has('ext4')).toBe(true);
  });
});
