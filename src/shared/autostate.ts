import { matchUrl } from './matching';
import type { AutoStateRule, ExtensionGroup } from './types';

export function resolveTargets(targets: string[], groups: ExtensionGroup[]): string[] {
  const ids = new Set<string>();
  for (const target of targets) {
    if (target.startsWith('group_')) {
      const group = groups.find((g) => g.id === target);
      if (group) {
        group.extensionIds.forEach((id) => ids.add(id));
      }
    } else {
      ids.add(target);
    }
  }
  return Array.from(ids);
}

export function computeDesiredStates(
  rules: AutoStateRule[],
  groups: ExtensionGroup[],
  activeUrls: string[]
): Record<string, boolean> {
  const desired: Record<string, boolean> = {};
  const seen = new Set<string>();

  const ordered = [...rules]
    .filter((rule) => rule.enabled)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of ordered) {
    const matched = activeUrls.some((url) => matchUrl(url, rule.pattern, rule.isWildcard));
    const targets = resolveTargets(rule.targets, groups);

    for (const extId of targets) {
      if (seen.has(extId)) continue;

      switch (rule.action) {
        case 'enableWhenMatched':
          if (matched) {
            desired[extId] = true;
            seen.add(extId);
          }
          break;

        case 'disableWhenMatched':
          if (matched) {
            desired[extId] = false;
            seen.add(extId);
          }
          break;

        case 'enableOnlyWhileMatched':
          desired[extId] = matched;
          seen.add(extId);
          break;

        case 'disableOnlyWhileMatched':
          desired[extId] = !matched;
          seen.add(extId);
          break;

        default:
          break;
      }
    }
  }

  return desired;
}
