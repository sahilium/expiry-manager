import { Notice, type App } from 'obsidian'
import type { Store } from './store'
import type { PluginSettings } from './types'
import { daysRemaining, todayStr } from './utils'

const NOTIFIED_KEY = 'expiry-manager-notified'

export class NotificationService {
	private app: App
	private store: Store
	private settings: PluginSettings
	private interval: number | null = null
	private notified: Set<string> = new Set()

	constructor(app: App, store: Store, settings: PluginSettings) {
		this.app = app
		this.store = store
		this.settings = settings
		this.loadNotified()
	}

	private loadNotified() {
		try {
			const saved = String(this.app.loadLocalStorage(NOTIFIED_KEY) ?? '')
			if (saved) {
				const arr = JSON.parse(saved) as string[]
				this.notified = new Set(arr)
			}
		} catch { /* ignore */ }
	}

	private saveNotified() {
		try {
			this.app.saveLocalStorage(NOTIFIED_KEY, JSON.stringify([...this.notified]))
		} catch { /* ignore */ }
	}

	start() {
		if (!this.settings.enabledNotifications) return
		this.check()
		this.interval = window.setInterval(() => this.check(), 60 * 60 * 1000)
	}

	stop() {
		if (this.interval !== null) {
			window.clearInterval(this.interval)
			this.interval = null
		}
	}

	private check() {
		if (!this.settings.enabledNotifications) return

		const today = todayStr()
		const all = this.store.getActive()
		const offsets = this.settings.notificationOffsets

		for (const { asset, path } of all) {
			const remaining = daysRemaining(asset.expiry)

			for (const offset of offsets) {
				if (remaining === offset || (remaining === 0 && offset === 0)) {
					const key = `${path}-${offset}-${today}`
					if (this.notified.has(key)) continue
					this.notified.add(key)

					if (remaining === 0) {
						new Notice(`${asset.icon || '📅'} ${asset.name} expires today!`)
					} else if (remaining === 1) {
						new Notice(`${asset.icon || '📅'} ${asset.name} expires tomorrow`)
					} else {
						new Notice(`${asset.icon || '📅'} ${asset.name} expires in ${remaining} days`)
					}
				}
			}
		}

		this.saveNotified()
	}
}
