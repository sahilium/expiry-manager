import { Notice } from 'obsidian'
import type { Store } from './store'
import type { PluginSettings } from './types'
import { daysRemaining, todayStr } from './utils'

const NOTIFIED_KEY = 'expiry-manager-notified'

export class NotificationService {
	private store: Store
	private settings: PluginSettings
	private interval: number | null = null
	private notified: Set<string> = new Set()

	constructor(store: Store, settings: PluginSettings) {
		this.store = store
		this.settings = settings
		this.loadNotified()
	}

	private loadNotified() {
		try {
			const saved = localStorage.getItem(NOTIFIED_KEY)
			if (saved) {
				const arr = JSON.parse(saved) as string[]
				this.notified = new Set(arr)
			}
		} catch {}
	}

	private saveNotified() {
		try {
			localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...this.notified]))
		} catch {}
	}

	start() {
		if (!this.settings.enabledNotifications) return
		this.check()
		this.interval = window.setInterval(() => this.check(), 60 * 60 * 1000)
	}

	stop() {
		if (this.interval !== null) {
			clearInterval(this.interval)
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
