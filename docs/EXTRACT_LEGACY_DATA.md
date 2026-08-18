# Extract legacy extension data from Chrome profiles

This guide explains how to recover legacy extension settings from a local Chrome profile without committing sensitive values to version control. The examples below show common profile paths; the actual bucket or extension ID must be replaced with the user’s own value. The example extension ID `aajodjghehmlpahhboidcpfjcncmcklf` is only an example and should never be treated as a real identifier.

## Overview
Chrome stores extension metadata in profile directories under the browser user profile. Most settings live in one of these places:

- `Local Extension Settings/`
- `IndexedDB/`
- `LevelDB/` or `Database/` directories under the profile
- extension state folders that follow a generated extension ID

These files may be sensitive because they may contain extension IDs, configuration, user-local group labels, or imported settings. They should be copied only to ephemeral local scratch directories and redacted before any review or commit.

## 1) Find the extension ID in Chrome
1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Look for the extension in the list and copy the ID from the URL or extension detail panel.
4. In a Chrome URL, the pattern looks like:
   - `chrome://extensions/?id=aajodjghehmlpahhboidcpfjcncmcklf`
5. Replace the example ID with the actual browser extension ID for the profile you are inspecting.

Important: do not store, screenshot, or commit a full list of real user extension IDs. Use placeholders such as `EXT_1` in any reviewed notes or exported JSON.

## 2) macOS paths
Common Chrome profile locations:

```bash
ls ~/Library/Application\ Support/Google/Chrome/Default/
ls ~/Library/Application\ Support/Google/Chrome/Default/Local\ Extension\ Settings/
find ~/Library/Application\ Support/Google/Chrome/Default -maxdepth 3 \( -path '*IndexedDB*' -o -path '*Local Extension Settings*' -o -path '*LevelDB*' \) | head -200
```

If the user has multiple profiles:

```bash
ls ~/Library/Application\ Support/Google/Chrome/Profile\ 1/
ls ~/Library/Application\ Support/Google/Chrome/Profile\ 2/
```

## 3) Windows paths
Common Chrome profile locations:

```powershell
dir "%LOCALAPPDATA%\Google\Chrome\User Data\Default"
dir "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Extension Settings"
Get-ChildItem "%LOCALAPPDATA%\Google\Chrome\User Data\Default" -Recurse -Directory | Select-String "IndexedDB|Local Extension Settings|LevelDB"
```

For a named profile:

```powershell
dir "%LOCALAPPDATA%\Google\Chrome\User Data\Profile 1"
```

## 4) Linux paths
Common Chrome profile locations:

```bash
ls ~/.config/google-chrome/Default/
ls ~/.config/google-chrome/Default/Local\ Extension\ Settings/
find ~/.config/google-chrome -maxdepth 4 \( -path '*IndexedDB*' -o -path '*Local Extension Settings*' -o -path '*LevelDB*' \) | head -200
```

For Chromium-based browsers such as Brave or Chromium, use the equivalent profile directory under the browser-specific folder, for example:

```bash
ls ~/.config/chromium/Default/
```

## 5) Extract safely
1. Copy only the needed browser profile or extension folder into a disposable scratch directory.
2. Keep the files outside the repository root whenever possible.
3. Redact extension IDs and any user/group labels before writing notes or JSON.
4. If you create a migration export, save only the anonymized version (for example, `migrated-nooboss-import-anon.json`).
5. Delete scratch copies once the review is complete.

## 6) Important caveats
- Chrome versions change profile layout and storage details between major releases.
- Some state may be ephemeral or cleared when a profile is reset, extension data is purged, or the browser is updated.
- Recovered data may be stale, incomplete, or truncated if the profile was not cleanly shut down.
- If a browser extension was uninstalled, some local directories may already have been purged.

## 7) Safe redaction rules
- Replace real extension IDs with `EXT_<n>` placeholders.
- Replace personal group names with `GROUP_<n>` or a neutral label such as `Ad-related tools`.
- Remove names, emails, and profile account identifiers from any notes or exported JSON.
- Never commit raw migration JSONs to the repository.

## 8) Example safe JSON fragment

```json
{
  "meta": {
    "sanitized": true,
    "note": "Example only; replace example IDs with the user’s actual extension IDs in a throwaway local profile."
  },
  "groups": [
    {
      "name": "GROUP_1",
      "label": "Ad-related tools",
      "extensions": ["EXT_1", "EXT_2"]
    }
  ]
}
```
