import { type App } from 'obsidian'
import { type Asset, type AssetFile, type PluginSettings } from './types'
import { parseAsset, assetToMarkdown } from './parser'
import { slugify, todayStr, daysRemaining } from './utils'

type Listener = () => void

export class Store {
	private assets: Map<string, Asset> = new Map()
	private listeners: Set<Listener> = new Set()
	private settings: PluginSettings
	private app: App
	private ready = false

	constructor(app: App, settings: PluginSettings) {
		this.app = app
		this.settings = settings
	}

	private get vault() { return this.app.vault }
	private get metadataCache() { return this.app.metadataCache }

	onChange(cb: Listener): () => void {
		this.listeners.add(cb)
		return () => this.listeners.delete(cb)
	}

	private notify() {
		for (const cb of this.listeners) cb()
	}

	async initialize(): Promise<void> {
		await this.ensureFolder()
		await this.indexAll()
		this.ready = true
		this.notify()

		this.metadataCache.on('changed', async () => {
			await this.indexAll()
			this.notify()
		})

		this.metadataCache.on('resolved', async () => {
			await this.indexAll()
			this.notify()
		})
	}

	isReady(): boolean {
		return this.ready
	}

	private async ensureFolder(): Promise<void> {
		const folder = this.settings.folder
		const exists = await this.vault.adapter.exists(folder)
		if (!exists) {
			await this.vault.createFolder(folder)
		}
	}

	private getAssetFiles(): string[] {
		const folder = this.settings.folder
		const files: string[] = []
		const abstractFiles = this.vault.getMarkdownFiles()
		for (const f of abstractFiles) {
			if (f.path.startsWith(folder + '/') || f.path === folder) {
				files.push(f.path)
			}
		}
		return files
	}

	private async indexAll(): Promise<void> {
		const paths = this.getAssetFiles()
		const newMap = new Map<string, Asset>()

		for (const filePath of paths) {
			try {
				const file = this.vault.getFileByPath(filePath)
				if (!file) continue
				const content = await this.vault.read(file)
				const asset = parseAsset(content)
				if (asset) {
					newMap.set(filePath, asset)
				}
			} catch {
				// skip invalid files
			}
		}

		this.assets = newMap
	}

	getAll(): AssetFile[] {
		const result: AssetFile[] = []
		for (const [path, asset] of this.assets) {
			result.push({ path, asset })
		}
		return result
	}

	getActive(): AssetFile[] {
		return this.getAll().filter(({ asset }) => !asset.archived && daysRemaining(asset.expiry) >= -365)
	}

	getExpired(): AssetFile[] {
		return this.getAll().filter(({ asset }) => !asset.archived && daysRemaining(asset.expiry) < 0)
	}

	getAutoRenewing(): AssetFile[] {
		return this.getAll().filter(({ asset }) => asset.autoRenew && !asset.archived)
	}

	async create(asset: Asset): Promise<string> {
		await this.ensureFolder()
		const filename = `${slugify(asset.name)}.md`
		const filePath = `${this.settings.folder}/${filename}`

		const now = todayStr()
		asset.createdAt = now
		asset.updatedAt = now

		const content = assetToMarkdown(asset)
		await this.vault.create(filePath, content)
		this.assets.set(filePath, asset)
		this.notify()
		return filePath
	}

	async update(filePath: string, asset: Asset): Promise<void> {
		asset.updatedAt = todayStr()
		const content = assetToMarkdown(asset)
		const file = this.vault.getFileByPath(filePath)
		if (file) {
			await this.vault.modify(file, content)
			this.assets.set(filePath, asset)
			this.notify()
		}
	}

	async renew(filePath: string): Promise<string | null> {
		const existing = this.assets.get(filePath)
		if (!existing) return null

		const newExpiry = this.calculateRenewalDate(existing)
		if (!newExpiry) return null

		const now = todayStr()

		const archived: Asset = {
			...existing,
			archived: true,
			notes: `Renewed on ${now}\n\n${existing.notes || ''}`,
			updatedAt: now,
		}

		await this.update(filePath, archived)

		const renewed: Asset = {
			...existing,
			start: existing.expiry,
			expiry: newExpiry,
			archived: false,
			parentId: existing.parentId || filePath,
			notes: '',
			createdAt: now,
			updatedAt: now,
		}

		return this.create(renewed)
	}

	private calculateRenewalDate(asset: Asset): string | null {
		if (asset.renewalPeriod) {
			const start = new Date(asset.expiry)
			start.setDate(start.getDate() + asset.renewalPeriod)
			const y = start.getFullYear()
			const m = String(start.getMonth() + 1).padStart(2, '0')
			const d = String(start.getDate()).padStart(2, '0')
			return `${y}-${m}-${d}`
		}

		const start = new Date(asset.start)
		const expiry = new Date(asset.expiry)
		const diff = expiry.getTime() - start.getTime()
		const newStart = new Date(expiry)
		const newExpiry = new Date(newStart.getTime() + diff)
		const y = newExpiry.getFullYear()
		const m = String(newExpiry.getMonth() + 1).padStart(2, '0')
		const d = String(newExpiry.getDate()).padStart(2, '0')
		return `${y}-${m}-${d}`
	}

	async delete(filePath: string): Promise<void> {
		const file = this.vault.getFileByPath(filePath)
		if (file) {
			await this.app.fileManager.trashFile(file)
			this.assets.delete(filePath)
			this.notify()
		}
	}

	getByPath(path: string): Asset | undefined {
		return this.assets.get(path)
	}

	getStats() {
		const all = this.getActive()
		const expired = this.getExpired()
		const autoRenewing = this.getAutoRenewing()

		const now = new Date()
		const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
		const weekLaterStr = `${weekLater.getFullYear()}-${String(weekLater.getMonth() + 1).padStart(2, '0')}-${String(weekLater.getDate()).padStart(2, '0')}`

		let expiringThisWeek = 0
		let monthlySpend = 0
		let yearlySpend = 0
		let totalRemaining = 0

		for (const { asset } of all) {
			if (asset.expiry <= weekLaterStr && asset.expiry >= todayStr()) {
				expiringThisWeek++
			}

			if (asset.cost && asset.currency) {
				if (asset.autoRenew) {
					monthlySpend += asset.cost
					yearlySpend += asset.cost * 12
				} else {
					const remaining = daysRemaining(asset.expiry)
					if (remaining > 0 && remaining <= 365) {
						yearlySpend += asset.cost
					}
				}
			}

			const rem = daysRemaining(asset.expiry)
			if (rem > 0) totalRemaining += rem
		}

		return {
			total: all.length,
			expiringThisWeek,
			expired: expired.length,
			autoRenewing: autoRenewing.length,
			monthlySpend,
			yearlySpend,
			averageRemaining: all.length > 0 ? Math.round(totalRemaining / all.length) : 0,
		}
	}
}
