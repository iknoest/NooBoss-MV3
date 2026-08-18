# NooBoss MV3

## Handover summary
Snapshot: 2026-08-18T23:19:37+02:00

### What I did
- Added a concise handover summary for the repository state and migration risk review.
- Documented the required privacy controls for local Chrome profile recovery and extension-setting exports.
- Added a sanitized migration template and extraction guide for safe legacy-data review.
- Updated the repo to ignore raw JSON dumps and keep all recovered work in disposable local scratch copies.

### What is still going
- The extension remains a local-only Chrome extension manager with AutoState workflow controls.
- Legacy migration work is still best done in a disposable browser profile and validated against the current MV3 APIs.
- No broad automation for raw browser-state recovery is checked into the repo.

### Open items
- Confirm the final import schema for any recovered settings before shipping a migration utility.
- Validate imports in a disposable Chrome profile before production use.
- Review any recovered browser data against current extension APIs and policy constraints.

### Parked items
- Bulk migration automation for recovered browser data
- Recovery from unsupported Chrome builds or archived profiles
- Long-term retention of raw extension-setting dumps outside the repo

### Suggested next steps
1. Read `docs/EXTRACT_LEGACY_DATA.md` before handling any local profile exports.
2. Use `migrated-nooboss-import-anon.json` for repo-safe validation and review.
3. Keep `/migrated-nooboss-import.json` completely out of git history and versioned files.
4. Revisit migration automation after validating the current extension schema on a disposable profile.

### Import guide
- Keep `/migrated-nooboss-import.json` out of git history and ignore it in the repository.
- Use `/migrated-nooboss-import-anon.json` for code review and safe import tests.
- Replace any example extension IDs with the user's actual IDs only in a throwaway local profile outside version control.

A modern Manifest V3 Chrome extension for efficiently managing installed extensions, grouping them by workflow, and applying AutoState URL rules without a cloud dependency.

## What it does

- Lists installed Chrome extensions with name, version, enabled state, install type, and optional actions
- Lets users enable/disable extensions, open their options page, inspect details, and uninstall through Chrome's native confirmation flow
- Supports persistent user-created extension groups with add/remove, rename, delete, and bulk enable/disable
- Tracks a bounded local history of install, uninstall, enable, and disable events
- Offers AutoState URL matching with wildcard or regex rules, optional group targets, priority ordering, and automatic or assisted mode
- Exports and imports JSON configuration for groups, rules, and settings

## Project status

This is a fresh MV3 rebuild of the NooBoss concept, using current Chrome Extension APIs and a lightweight Vite + TypeScript build. It is designed to run as an unpacked extension and to avoid obsolete Manifest V2 patterns.

## Local development

```bash
npm install
npm run build
npm test
npm run test:e2e
```

## Scripts

- `npm run build` — production bundle for unpacked extension loading
- `npm test` — unit tests for matching, import/export, and shared types
- `npm run test:e2e` — Puppeteer-based browser smoke suite against a temporary Chrome profile
- `npm run lint` — TypeScript linting with ESLint flat config
- `npm run typecheck` — strict TypeScript validation

## Notes

- The extension intentionally avoids telemetry, accounts, cloud storage, or remote code execution.
- All configuration and history are kept locally via `chrome.storage.local` unless Chrome's own APIs require otherwise.
- A real Chrome environment is required for live extension automation checks. In restricted sandboxes, Chrome may refuse to load unpacked extensions, and the E2E runner will skip browser-level tests instead of failing the build.

## How to test (quick guide)

Manual (recommended for UI & AutoState validation):

1. npm install && npm run build
2. Open chrome://extensions/ in your Chrome (Developer mode on)
3. Click "Load unpacked" and select the project's `dist/` directory
4. Open the popup (toolbar action) and the full Manager (Options) page to exercise groups, history, and AutoState rules
5. For AutoState, create rules that target the included test extension or a disposable extension, then open matching and non-matching tabs to observe behavior and pending confirmations

Automated unit & E2E:

- Unit tests: npm test (fast, CI-friendly)
- E2E smoke: npm run test:e2e — this launches Chrome with a temporary profile and attempts to load the extension. Note: some sandboxed environments (or restricted Chrome builds) block loading unpacked extensions; the runner will skip browser tests in that case. To run E2E locally, ensure a regular Chrome is installed and the path in tests/e2e/runner.mjs is correct.

## Lessons learned

- Chrome’s management API can be subject to platform policies and user-gesture requirements; never assume programmatic enable/disable always succeeds.
- Manifest V3 service workers require careful persistence of ephemeral state (pending changes, managed map) into chrome.storage.local.
- E2E automation for extensions is environment-sensitive; tests must detect and gracefully skip when the runtime forbids unpacked installs.

## Suggested next steps

1. Live validation on a developer machine: load unpacked, exercise AutoState, and confirm whether chrome.management.setEnabled requires user gestures on your target Chrome.
2. CI: Add GitHub Actions using "Chrome for Testing" or Playwright/Chromium matrix to run browser E2E when possible.
3. Acceptance report: Draft a short report documenting AutoState behavior observed on real Chrome versions and the chosen assisted fallback UX.
4. UX polish: Improve AutoState notifications and add clear messaging when actions require user confirmation.
5. Security audit & policy checklist before any public publishing.

If you'd like, prepare the acceptance report next (I can run it locally and draft the findings).
