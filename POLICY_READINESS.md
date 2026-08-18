# Policy readiness

## Scope

This project is a local, unpacked Chrome extension for extension management. It does not publish to the Chrome Web Store or run any remote code.

## Security and privacy posture

- No telemetry, analytics, or authentication flow
- No cloud backend or remote API dependency
- No remote executable code; all logic is bundled locally
- Local state is kept in `chrome.storage.local` and managed by the extension itself
- History and rules are bounded to prevent uncontrolled growth

## Permission footprint

The manifest requests only:

- `management` — required to list, enable, disable, and uninstall installed extensions
- `storage` — required for groups, rules, settings, and history persistence
- `tabs` — required for AutoState URL matching against active tab URLs
- `notifications` — used for local user notifications

These are the minimum permissions needed for the extension's core purpose.

## Chrome MV3 considerations

- Background logic runs in a service worker rather than a persistent background page.
- The extension avoids obsolete Chrome App patterns and legacy MV2-only APIs.
- AutoState uses current extension APIs and writes results back to local storage so the state survives service worker restarts.

## AutoState reality check

A real Chrome environment is required to validate whether automatic extension toggling is allowed without user interaction. The current project includes an AutoState test routine and a compliant assisted fallback path when automatic switching is unavailable or blocked by Chrome policy.

In restricted or sandboxed environments, Chrome may refuse to load unpacked extensions for automation tests. In those cases, the E2E harness reports the limitation as a skip rather than as a code regression.

## Compatibility notes

- Minimum Chrome version is set to 116 in the manifest.
- The extension avoids private or deprecated APIs.
- It never attempts to disable or uninstall itself.
- It respects the `mayDisable` and `mayEnable` states exposed by Chrome's management API.

## Handover

This repository snapshot is aligned with the expected security and privacy controls for browser-extension migration work. The intent is to keep local data extraction limited to disposable, user-controlled profiles and to avoid committing any personal identifiers to git history.

- Security review: recovered extension settings, profile metadata, and Chrome database dumps must be treated as sensitive local data.
- Sensitive-data handling: no names, emails, account IDs, extension IDs, or personal group names should be committed to the repository.
- Confirmation: raw migration JSONs must be removed from commits or ignored in `.gitignore` before they can be shared. Only anonymized exports are acceptable in version control.
- Safe practice: replace real extension IDs with `EXT_<n>` placeholders and group names with `GROUP_<n>` or neutral labels before review or import.

## Conclusion

The project is structurally aligned with MV3 and Chrome's modern extension policy model. Live automation testing is environment-dependent, but the extension is designed to be policy-aware, local-only, and compliant with the project requirements.
