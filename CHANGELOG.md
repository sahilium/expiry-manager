# Changelog

## Unreleased

- Fix renewal system: old file now renamed before creating new cycle entry
- Fix YAML multiline notes formatting

## 1.2.0 — 2026-07-21

- Add unit tests (vitest) for utils, parser, constants, templates (70 tests)
- Add currency symbols for INR, EUR, GBP, JPY, and 10+ more currencies
- Fix plugin icon rendering as tiny dot (removed explicit SVG dimensions)
- Round annual/monthly spend to 2 decimals in dashboard stats
- Mobile responsive layout: tabs and "New Entry" button stay paired on same row
- Add test CI workflow with `npm test`

## 1.1.2 — 2026-07-21

- Fix app.commands type safety with callback-based architecture
- Pass `app` to Store and NotificationService for proper Obsidian API usage
- Use `app.fileManager.trashFile()` instead of `vault.delete()`
- Use `app.loadLocalStorage` / `app.saveLocalStorage` instead of raw localStorage
- Add `getSettingDefinitions()` for Obsidian 1.13+ settings search
- Fix all ESLint errors (101→0)

## 1.1.1 — 2026-07-21

- Dashboard: fix view tab switching (dashboard/timeline/calendar)
- Editor modal: fix toggleEl access, remove unnecessary type assertions
- Bump `minAppVersion` to 1.8.7 for `revealLeaf` API usage
- Remove `detachLeavesOfType` from `onunload`
- Fix floating promises with `void` operator

## 1.1.0 — 2026-07-19

- Initial dashboard with card grid, progress bars, colour-coded expiry states
- Create/edit modal with template picker (10 templates)
- Timeline and calendar views
- Smart renewal with archival
- Notifications at configurable offsets
- Search, filter, sort
- Statistics bar
- Status bar summary
- Settings tab
- Full dark/light mode support with Obsidian themes

## 1.0.0 — 2026-07-19

- Initial release from sample plugin template
- Basic project structure with esbuild, TypeScript, ESLint
