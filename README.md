# Expiry Manager

Track anything that expires, renews, or needs periodic attention — subscriptions, documents, licenses, domains, certificates, warranties, and more.

All data is stored as plain Markdown notes with YAML frontmatter in a configurable folder. No proprietary database, no lock-in.

## Features

- **Dashboard** — compact cards with progress bars, days remaining, cost, and quick actions
- **Sections** — Expiring Today, This Week, This Month, Upcoming, Expired, Auto-Renewing
- **Timeline view** — chronological list of upcoming expiry
- **Calendar view** — monthly calendar showing expiry dates
- **Smart Renewal** — archive the current period and create the next cycle automatically
- **Notifications** — Obsidian-native notifications at configurable offsets
- **Templates** — pre-filled forms for common items (subscriptions, domains, passports, etc.)
- **Search & filters** — fuzzy search by name/provider/category/tags, filter by status and category
- **Statistics** — totals, weekly expiry, spend, and more
- **Theming** — respects dark/light mode and native Obsidian themes

## Usage

Open the dashboard from the ribbon icon (calendar-clock) or the command palette.

| Command | ID |
|---|---|
| Open Expiry Manager dashboard | `open-expiry-dashboard` |
| New expiry entry | `new-entry` |
| Renew expiry entry | `renew-entry` |
| Edit expiry entry | `edit-entry` |

## Storage

Entries are stored as `.md` files in `Expiry Manager/` (configurable in settings). Each file contains YAML frontmatter:

```yaml
---
name: ChatGPT Plus
category: Subscription
provider: OpenAI
start: 2026-07-01
expiry: 2026-08-01
cost: 20
currency: USD
autoRenew: true
reminders: [30, 7, 1]
tags: [ai, productivity]
---
```

## Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/sahilium/expiry-manager/releases)
2. Copy them to `<vault>/.obsidian/plugins/expiry-manager/`
3. Enable the plugin in **Settings → Community plugins**

### Building from source

```bash
git clone https://github.com/sahilium/expiry-manager.git
cd expiry-manager
npm install
npm run build
```

## Development

```bash
npm run dev    # watch mode
npm run build  # production build
npm run lint   # lint source
```

## Release

1. Bump `version` in `manifest.json`
2. Update `versions.json` if needed
3. `git tag <version> && git push origin <version>`
4. GitHub Actions creates a draft release — publish it

## License

MIT
