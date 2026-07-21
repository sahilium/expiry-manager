# Expiry Manager

Never forget another renewal.

**Expiry Manager** helps you track anything that expires, renews, or needs periodic attention directly inside your Obsidian vault.

Whether it's a domain, passport, subscription, SSL certificate, phone recharge, warranty, or API key, Expiry Manager keeps everything in one place with reminders, progress tracking, and renewal history.

> All data is stored as plain Markdown notes with YAML frontmatter. Your data remains yours forever.

---

## Screenshots

* Dashboard
* Timeline View
* Calendar View
* New Entry Dialog
* Renewal Workflow

---

# Why use Expiry Manager?

Most reminder apps are built around **events**.

Expiry Manager is built around **things that have a lifecycle**.

Instead of creating recurring reminders, you create an item once and keep its entire renewal history.

Perfect for tracking:

* 🌍 Domains
* 🔒 SSL certificates
* 🔑 API keys
* 💳 Subscriptions
* 📱 Mobile recharges
* 🌐 Internet plans
* 📄 Passports & documents
* 🚗 Vehicle insurance
* 📦 Product warranties
* 🏋️ Memberships
* 💼 Licences
* ...or anything else that expires.

---

# Features

## Dashboard

A clean overview of everything that matters.

Each item shows:

* Progress bar
* Days remaining
* Expiry date
* Cost
* Category
* Auto-renew status
* Quick actions

---

## Timeline

View upcoming expiries in chronological order.

Perfect for answering:

> "What's expiring next?"

---

## Calendar

Visual monthly calendar showing all expiry dates.

Great for spotting busy renewal periods.

---

## Smart Renewal

Renew an item with one click.

Instead of overwriting dates, Expiry Manager:

* Archives the previous cycle
* Creates the next renewal automatically
* Preserves renewal history

---

## Notifications

Receive Obsidian notifications before an item expires.

Reminder offsets are fully configurable.

Examples:

* 30 days
* 14 days
* 7 days
* 1 day
* Expiry day

---

## Templates

Quickly create common entries.

Included templates include:

* Subscription
* Domain
* SSL Certificate
* Passport
* Mobile Recharge
* Internet Plan
* Warranty
* API Key
* Custom

---

## Search & Filters

Quickly find entries by:

* Name
* Provider
* Category
* Tags
* Status

---

## Statistics

Track:

* Total active items
* Expiring this week
* Expired items
* Monthly subscription spend
* Annual subscription spend

---

## Native Obsidian Experience

* Markdown-based storage
* Dark & light mode
* Theme friendly
* Fast search
* Keyboard shortcuts
* Command palette integration

---

# Getting Started

## 1. Open the dashboard

Click the ribbon icon or run:

```
Expiry Manager: Open Dashboard
```

---

## 2. Create your first item

Click **New Entry** and choose a template.

Fill in:

* Name
* Category
* Start date
* Expiry date

Optionally add:

* Provider
* Cost
* Tags
* Reminder offsets
* Notes

---

## 3. That's it

Expiry Manager automatically:

* Calculates remaining time
* Displays progress
* Organizes upcoming expiries
* Sends reminders
* Lets you renew items with one click

---

# Example

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

reminders:
  - 30
  - 7
  - 1

tags:
  - ai
  - productivity
---
```

---

# Commands

| Command        | Description                        |
| -------------- | ---------------------------------- |
| Open Dashboard | Opens the Expiry Manager dashboard |
| New Entry      | Creates a new expiry item          |
| Edit Entry     | Edits the selected item            |
| Renew Entry    | Creates the next renewal period    |

---

# Data Storage

All entries are stored as Markdown files inside:

```
Expiry Manager/
```

The storage folder can be changed in plugin settings.

No databases.

No cloud dependency.

No vendor lock-in.

---

# Installation

### Community Plugins

1. Open **Settings → Community Plugins**
2. Search for **Expiry Manager**
3. Click **Install**
4. Enable the plugin

---

### Manual Installation

Download:

* `main.js`
* `manifest.json`
* `styles.css`

Copy them into:

```
<vault>/.obsidian/plugins/expiry-manager/
```

Enable the plugin from Community Plugins.

---

# Development

```bash
git clone https://github.com/sahilium/expiry-manager.git

cd expiry-manager

npm install

npm run dev
```

Production build:

```bash
npm run build
```

---

# Contributing

Bug reports, feature requests, and pull requests are always welcome.

If you find Expiry Manager useful, consider starring the repository.

---

# License

MIT
