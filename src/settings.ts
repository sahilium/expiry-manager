import { App, PluginSettingTab, Setting } from 'obsidian'
import type ExpiryManagerPlugin from './main'
import { CURRENCIES, DEFAULT_REMINDERS } from './constants'

export class ExpirySettingTab extends PluginSettingTab {
	private plugin: ExpiryManagerPlugin

	constructor(app: App, plugin: ExpiryManagerPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this
		containerEl.empty()

		containerEl.createEl('h2', { text: 'Expiry Manager Settings' })

		new Setting(containerEl)
			.setName('Storage folder')
			.setDesc('Folder where expiry entries are stored as Markdown notes')
			.addText(text =>
				text
					.setPlaceholder('Expiry Manager')
					.setValue(this.plugin.settings.folder)
					.onChange(async val => {
						this.plugin.settings.folder = val || 'Expiry Manager'
						await this.plugin.savePluginSettings()
					}),
			)

		new Setting(containerEl)
			.setName('Default currency')
			.setDesc('Default currency for cost fields')
			.addDropdown(dropdown => {
				for (const c of CURRENCIES) {
					dropdown.addOption(c, c)
				}
				dropdown.setValue(this.plugin.settings.defaultCurrency)
				dropdown.onChange(async val => {
					this.plugin.settings.defaultCurrency = val
					await this.plugin.savePluginSettings()
				})
			})

		new Setting(containerEl)
			.setName('Default reminders')
			.setDesc('Comma-separated list of days before expiry to show reminders')
			.addText(text =>
				text
					.setPlaceholder(DEFAULT_REMINDERS.join(', '))
					.setValue(this.plugin.settings.defaultReminders.join(', '))
					.onChange(async val => {
						this.plugin.settings.defaultReminders = val
							.split(',')
							.map(s => Number(s.trim()))
							.filter(n => !isNaN(n))
						await this.plugin.savePluginSettings()
					}),
			)

		new Setting(containerEl)
			.setName('Show timeline view')
			.setDesc('Enable the timeline tab in the dashboard')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.showTimelineView)
					.onChange(async val => {
						this.plugin.settings.showTimelineView = val
						await this.plugin.savePluginSettings()
					}),
			)

		new Setting(containerEl)
			.setName('Show calendar view')
			.setDesc('Enable the calendar tab in the dashboard')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.showCalendarView)
					.onChange(async val => {
						this.plugin.settings.showCalendarView = val
						await this.plugin.savePluginSettings()
					}),
			)

		new Setting(containerEl)
			.setName('Show statistics')
			.setDesc('Display statistics bar at the top of the dashboard')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.showStats)
					.onChange(async val => {
						this.plugin.settings.showStats = val
						await this.plugin.savePluginSettings()
					}),
			)

		new Setting(containerEl)
			.setName('Enable notifications')
			.setDesc('Show Obsidian notifications for upcoming expiry')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.enabledNotifications)
					.onChange(async val => {
						this.plugin.settings.enabledNotifications = val
						await this.plugin.savePluginSettings()
					}),
			)

		new Setting(containerEl)
			.setName('Notification offsets')
			.setDesc('Comma-separated list of days before expiry to trigger notifications')
			.addText(text =>
				text
					.setPlaceholder(DEFAULT_REMINDERS.join(', '))
					.setValue(this.plugin.settings.notificationOffsets.join(', '))
					.onChange(async val => {
						this.plugin.settings.notificationOffsets = val
							.split(',')
							.map(s => Number(s.trim()))
							.filter(n => !isNaN(n))
						await this.plugin.savePluginSettings()
					}),
			)
	}
}
