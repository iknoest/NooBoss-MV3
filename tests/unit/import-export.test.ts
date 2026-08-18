import { describe, it, expect } from 'vitest';
import { validateImportData, createExportData } from '../../src/shared/import-export';
import { DEFAULT_SETTINGS } from '../../src/shared/types';
import type { ExtensionGroup, AutoStateRule } from '../../src/shared/types';

describe('createExportData', () => {
  it('creates valid export data', () => {
    const groups: ExtensionGroup[] = [
      { id: 'group_1', name: 'Test', extensionIds: ['ext1'], color: '#000', createdAt: 1000 },
    ];
    const rules: AutoStateRule[] = [
      {
        id: 'rule_1',
        enabled: true,
        name: 'Test Rule',
        pattern: '*test*',
        isWildcard: true,
        targets: ['ext1'],
        action: 'enableWhenMatched',
        priority: 0,
        createdAt: 1000,
      },
    ];
    const data = createExportData(groups, rules, DEFAULT_SETTINGS);

    expect(data.version).toBe(1);
    expect(data.generator).toBe('NooBoss-MV3');
    expect(data.groups).toEqual(groups);
    expect(data.autoStateRules).toEqual(rules);
    expect(data.settings).toEqual(DEFAULT_SETTINGS);
    expect(typeof data.exportedAt).toBe('number');
  });
});

describe('validateImportData', () => {
  const validExport = {
    version: 1,
    exportedAt: Date.now(),
    generator: 'NooBoss-MV3',
    groups: [
      { id: 'group_1', name: 'Test', extensionIds: ['ext1'], color: '#000', createdAt: 1000 },
    ],
    autoStateRules: [
      {
        id: 'rule_1',
        enabled: true,
        name: 'Test Rule',
        pattern: '*test*',
        isWildcard: true,
        targets: ['ext1'],
        action: 'enableWhenMatched',
        priority: 0,
        createdAt: 1000,
      },
    ],
    settings: DEFAULT_SETTINGS,
  };

  it('accepts valid export data', () => {
    const result = validateImportData(validExport);
    expect(result.version).toBe(1);
    expect(result.groups).toHaveLength(1);
    expect(result.autoStateRules).toHaveLength(1);
  });

  it('rejects null input', () => {
    expect(() => validateImportData(null)).toThrow();
  });

  it('rejects non-object input', () => {
    expect(() => validateImportData('string')).toThrow();
  });

  it('rejects missing version', () => {
    const data = { ...validExport, version: undefined };
    expect(() => validateImportData(data)).toThrow();
  });

  it('rejects future version', () => {
    const data = { ...validExport, version: 999 };
    expect(() => validateImportData(data)).toThrow(/newer/);
  });

  it('rejects missing groups', () => {
    const data = { ...validExport, groups: 'not an array' };
    expect(() => validateImportData(data)).toThrow();
  });

  it('rejects invalid group shape', () => {
    const data = { ...validExport, groups: [{ id: 123 }] };
    expect(() => validateImportData(data)).toThrow();
  });

  it('rejects invalid rule action', () => {
    const data = {
      ...validExport,
      autoStateRules: [{ ...validExport.autoStateRules[0], action: 'invalid' }],
    };
    expect(() => validateImportData(data)).toThrow(/action/);
  });

  it('rejects rule with executable code in pattern', () => {
    const data = {
      ...validExport,
      autoStateRules: [
        { ...validExport.autoStateRules[0], pattern: 'javascript:alert(1)' },
      ],
    };
    expect(() => validateImportData(data)).toThrow(/unsafe/);
  });

  it('rejects rule with script tag in name', () => {
    const data = {
      ...validExport,
      autoStateRules: [
        { ...validExport.autoStateRules[0], name: '<script>alert(1)</script>' },
      ],
    };
    expect(() => validateImportData(data)).toThrow(/unsafe/);
  });

  it('fills settings defaults for missing keys', () => {
    const data = { ...validExport, settings: { autoStateEnabled: false } };
    const result = validateImportData(data);
    expect(result.settings.autoStateEnabled).toBe(false);
    expect(result.settings.historyMaxRecords).toBe(DEFAULT_SETTINGS.historyMaxRecords);
  });

  it('caps historyMaxRecords at 50000', () => {
    const data = {
      ...validExport,
      settings: { ...DEFAULT_SETTINGS, historyMaxRecords: 100000 },
    };
    const result = validateImportData(data);
    expect(result.settings.historyMaxRecords).toBeLessThanOrEqual(50000);
  });

  it('ignores invalid settings values', () => {
    const data = {
      ...validExport,
      settings: { ...DEFAULT_SETTINGS, theme: 'rainbow' },
    };
    const result = validateImportData(data);
    expect(result.settings.theme).toBe(DEFAULT_SETTINGS.theme);
  });
});
