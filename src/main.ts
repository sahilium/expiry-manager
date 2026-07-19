import { Plugin, Notice, addIcon } from 'obsidian'
import { VIEW_TYPE_EXPIRY, DEFAULT_SETTINGS } from './constants'
import type { PluginSettings } from './types'
import { Store } from './store'
import { DashboardView } from './dashboard'
import { EditorModal } from './editor-modal'
import { NotificationService } from './notifications'
import { ExpirySettingTab } from './settings'
import { getTemplate, applyTemplate } from './templates'
import { daysRemaining, todayStr } from './utils'

const CALENDAR_CLOCK_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
  <line x1="16" y1="2" x2="16" y2="6"></line>
  <line x1="8" y1="2" x2="8" y2="6"></line>
  <line x1="3" y1="10" x2="21" y2="10"></line>
  <circle cx="17" cy="16" r="3"></circle>
  <polyline points="17 14 17 16 19 17"></polyline>
</svg>
`

export default class ExpiryManagerPlugin extends Plugin {
	settings!: PluginSettings
	store!: Store
	private notifications!: NotificationService

	async onload() {
		await this.loadPluginSettings()

		this.store = new Store(this.app, this.settings)

		await this.store.initialize()

		this.notifications = new NotificationService(this.app, this.store, this.settings)
		this.notifications.start()

		addIcon('calendar-clock', CALENDAR_CLOCK_ICON)

		this.registerView(
			VIEW_TYPE_EXPIRY,
			(leaf) => new DashboardView(leaf, this.store, this.settings, {
				onNewEntry: () => void this.openNewEntry(),
				onEditEntry: (path) => void this.editEntry(path),
				onRenewEntry: (path) => void this.renewEntry(path),
			}),
		)

		this.addRibbonIcon('calendar-clock', 'Expiry manager', () => {
			void this.openDashboard()
		})

		const statusBarItem = this.addStatusBarItem()
		statusBarItem.addClass('expiry-status')
		this.updateStatusBar(statusBarItem)

		this.store.onChange(() => {
			this.updateStatusBar(statusBarItem)
		})

		this.addCommand({
			id: 'open-expiry-dashboard',
			name: 'Open dashboard',
			callback: () => void this.openDashboard(),
		})

		this.addCommand({
			id: 'new-entry',
			name: 'New expiry entry',
			callback: () => this.openNewEntry(),
		})

		this.addCommand({
			id: 'renew-entry',
			name: 'Renew expiry entry',
			callback: () => {
				const entry = this.store.getActive()[0]
				if (entry) {
					void this.renewEntry(entry.path)
				} else {
					new Notice('No active entries to renew')
				}
			},
		})

		this.addCommand({
			id: 'edit-entry',
			name: 'Edit expiry entry',
			callback: () => {
				const entry = this.store.getActive()[0]
				if (entry) {
					void this.editEntry(entry.path)
				} else {
					new Notice('No entries to edit')
				}
			},
		})

		this.addSettingTab(new ExpirySettingTab(this.app, this))
	}

	onunload() {
		this.notifications?.stop()
	}

	async loadPluginSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<PluginSettings>,
		)
	}

	async savePluginSettings() {
		await this.saveData(this.settings)
	}

	private updateStatusBar(el: HTMLElement) {
		const active = this.store.getActive()
		const expired = this.store.getExpired()
		const today = active.filter(({ asset }) => daysRemaining(asset.expiry) === 0)
		const parts: string[] = [`${active.length} tracked`]
		if (today.length > 0) parts.push(`${today.length} expiring today`)
		if (expired.length > 0) parts.push(`${expired.length} expired`)
		el.setText(`📅 ${parts.join(' · ')}`)
	}

	async openDashboard() {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_EXPIRY)
		if (leaves.length > 0) {
			if (this.app.workspace.revealLeaf) {
				void this.app.workspace.revealLeaf(leaves[0]!)
			}
			return
		}

		const leaf = this.app.workspace.getLeaf('tab')
		if (leaf) {
			await leaf.setViewState({
				type: VIEW_TYPE_EXPIRY,
				active: true,
			})
			if (this.app.workspace.revealLeaf) {
				void this.app.workspace.revealLeaf(leaf)
			}
		}
	}

	async openNewEntry(templateId?: string) {
		const template = templateId
			? getTemplate(templateId)
			: getTemplate('blank')

		const asset = template
			? applyTemplate(template)
			: {
					name: '',
					category: 'Custom',
					start: todayStr(),
					expiry: '',
					reminders: [...this.settings.defaultReminders],
					tags: [],
					currency: this.settings.defaultCurrency,
					createdAt: todayStr(),
					updatedAt: todayStr(),
				}

		const modal = new EditorModal(
			this.app,
			asset,
			(saved) => {
				if (!saved.name || !saved.expiry) {
					new Notice('Name and expiry date are required')
					return
				}
				void this.store.create(saved).then(() => new Notice(`Created "${saved.name}"`))
			},
		)
		modal.open()
	}

	async editEntry(path: string) {
		const asset = this.store.getByPath(path)
		if (!asset) {
			new Notice('Entry not found')
			return
		}

		const modal = new EditorModal(
			this.app,
			asset,
			(saved) => {
				void this.store.update(path, saved).then(() => new Notice(`Updated "${saved.name}"`))
			},
			() => {
				void this.store.delete(path).then(() => new Notice('Entry deleted'))
			},
		)
		modal.open()
	}

	async renewEntry(path: string) {
		const newPath = await this.store.renew(path)
		if (newPath) {
			const asset = this.store.getByPath(newPath)
			new Notice(`Renewed "${asset?.name || 'entry'}"`)
		} else {
			new Notice('Could not renew entry')
		}
	}
}
