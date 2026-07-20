import { ItemView, WorkspaceLeaf } from 'obsidian'
import type { AssetFile, FilterState, SortField, SortOrder, DashboardStats } from './types'
import type { Store } from './store'
import type { PluginSettings } from './types'
import { VIEW_TYPE_EXPIRY, getCurrencySymbol } from './constants'
import {
	createElement,
	daysRemaining,
	formatRemaining,
	getProgressColorCSS,
	progressPercent,
	fuzzySearch,
	sortAssets,
} from './utils'

export interface DashboardCallbacks {
	onNewEntry: () => void
	onEditEntry: (path: string) => void
	onRenewEntry: (path: string) => void
}

export class DashboardView extends ItemView {
	private store: Store
	private settings: PluginSettings
	private callbacks: DashboardCallbacks
	private container!: HTMLElement
	private filterState: FilterState = {}
	private sortField: SortField = 'expiry'
	private sortOrder: SortOrder = 'asc'
	private viewMode: 'dashboard' | 'timeline' | 'calendar' = 'dashboard'
	private unsub: (() => void) | null = null

	constructor(leaf: WorkspaceLeaf, store: Store, settings: PluginSettings, callbacks: DashboardCallbacks) {
		super(leaf)
		this.store = store
		this.settings = settings
		this.callbacks = callbacks
	}

	getViewType(): string {
		return VIEW_TYPE_EXPIRY
	}

	getDisplayText(): string {
		return 'Expiry manager'
	}

	getIcon(): string {
		return 'calendar-clock'
	}

	async onOpen() {
		this.container = this.contentEl
		this.container.addClass('expiry-dashboard')

		this.unsub = this.store.onChange(() => this.render())
		this.render()
	}

	async onClose() {
		if (this.unsub) {
			this.unsub()
			this.unsub = null
		}
		this.container.empty()
	}

	private render() {
		this.container.empty()

		const header = this.renderHeader()
		this.container.appendChild(header)

		if (this.viewMode === 'dashboard') {
			this.renderDashboard()
		} else if (this.viewMode === 'timeline') {
			this.renderTimeline()
		} else if (this.viewMode === 'calendar') {
			this.renderCalendar()
		}
	}

	private renderHeader(): HTMLElement {
		const header = createElement('div', { className: 'expiry-header' })

		const titleRow = createElement('div', { className: 'expiry-header-top' })
		const title = createElement('h1', {
			className: 'expiry-title',
			textContent: 'Expiry manager',
		})
		titleRow.appendChild(title)

		const actionRow = createElement('div', { className: 'expiry-header-actions' })
		const viewTabs = createElement('div', { className: 'expiry-view-tabs' })
		const views: { id: string; label: string }[] = [
			{ id: 'dashboard', label: 'Dashboard' },
			{ id: 'timeline', label: 'Timeline' },
		]
		if (this.settings.showCalendarView) {
			views.push({ id: 'calendar', label: 'Calendar' })
		}

		for (const v of views) {
			const tab = createElement('button', {
				className: `expiry-view-tab${this.viewMode === v.id ? ' active' : ''}`,
				textContent: v.label,
			})
			tab.addEventListener('click', () => {
				if (v.id === 'dashboard' || v.id === 'timeline' || v.id === 'calendar') {
					this.viewMode = v.id
				}
				this.render()
			})
			viewTabs.appendChild(tab)
		}
		const addBtn = createElement('button', {
			className: 'expiry-btn expiry-btn-primary expiry-add-btn',
			textContent: '+ New Entry',
		})
		addBtn.addEventListener('click', () => {
			this.callbacks.onNewEntry()
		})

		actionRow.appendChild(viewTabs)
		actionRow.appendChild(addBtn)
		titleRow.appendChild(actionRow)

		header.appendChild(titleRow)

		if (this.viewMode === 'dashboard') {
			const controls = createElement('div', { className: 'expiry-controls' })

			const searchInput = createElement('input', {
				className: 'expiry-search',
				placeholder: 'Search by name, provider, category, tags...',
			})
			searchInput.addEventListener('input', () => {
				this.filterState.search = searchInput.value
				this.renderDashboard()
			})
			controls.appendChild(searchInput)

			const filterRow = createElement('div', { className: 'expiry-filter-row' })

			const categoryFilter = createElement('select', { className: 'expiry-filter' })
			const allOpt = createElement('option', { textContent: 'All Categories' })
			allOpt.value = ''
			categoryFilter.appendChild(allOpt)

			const cats = new Set(this.store.getAll().map(({ asset }) => asset.category))
			for (const c of [...cats].sort()) {
				const opt = createElement('option', { textContent: c })
				opt.value = c
				categoryFilter.appendChild(opt)
			}
			categoryFilter.addEventListener('change', () => {
				this.filterState.category = categoryFilter.value || undefined
				this.renderDashboard()
			})
			filterRow.appendChild(categoryFilter)

			const expiredFilter = createElement('select', { className: 'expiry-filter' })
			const expiredOpts = [
				{ label: 'All Status', value: '' },
				{ label: 'Active', value: 'active' },
				{ label: 'Expired', value: 'expired' },
			]
			for (const o of expiredOpts) {
				const opt = createElement('option', { textContent: o.label })
				opt.value = o.value
				expiredFilter.appendChild(opt)
			}
			expiredFilter.addEventListener('change', () => {
				const val = expiredFilter.value
				if (val === 'expired') this.filterState.expired = true
				else this.filterState.expired = undefined
				this.renderDashboard()
			})
			filterRow.appendChild(expiredFilter)

			const autoRenewFilter = createElement('select', { className: 'expiry-filter' })
			const autoOpts = [
				{ label: 'All Renewal', value: '' },
				{ label: 'Auto-Renew', value: 'auto' },
				{ label: 'Manual', value: 'manual' },
			]
			for (const o of autoOpts) {
				const opt = createElement('option', { textContent: o.label })
				opt.value = o.value
				autoRenewFilter.appendChild(opt)
			}
			autoRenewFilter.addEventListener('change', () => {
				const val = autoRenewFilter.value
				if (val === 'auto') this.filterState.autoRenew = true
				else this.filterState.autoRenew = undefined
				this.renderDashboard()
			})
			filterRow.appendChild(autoRenewFilter)

			const sortSelect = createElement('select', { className: 'expiry-filter' })
			const sortOpts: { label: string; value: string }[] = [
				{ label: 'Sort: Expiry', value: 'expiry' },
				{ label: 'Sort: Name', value: 'name' },
				{ label: 'Sort: Category', value: 'category' },
				{ label: 'Sort: Cost', value: 'cost' },
				{ label: 'Sort: Newest', value: 'created' },
			]
			for (const o of sortOpts) {
				const opt = createElement('option', { textContent: o.label })
				opt.value = o.value
				sortSelect.appendChild(opt)
			}
			sortSelect.value = this.sortField
			sortSelect.addEventListener('change', () => {
				this.sortField = sortSelect.value as SortField
				this.renderDashboard()
			})
			filterRow.appendChild(sortSelect)

			const orderBtn = createElement('button', {
				className: 'expiry-btn expiry-btn-icon',
				textContent: this.sortOrder === 'asc' ? '↑' : '↓',
			})
			orderBtn.addEventListener('click', () => {
				this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
				orderBtn.textContent = this.sortOrder === 'asc' ? '↑' : '↓'
				this.renderDashboard()
			})
			filterRow.appendChild(orderBtn)

			controls.appendChild(filterRow)
			header.appendChild(controls)
		}

		return header
	}

	private getFilteredAssets(): AssetFile[] {
		let all = this.store.getAll()

		if (!this.filterState.expired) {
			all = all.filter(({ asset }) => !asset.archived)
		}

		if (this.filterState.search) {
			const q = this.filterState.search.toLowerCase()
			all = all.filter(({ asset }) => {
				const searchable = [
					asset.name,
					asset.provider,
					asset.category,
					...asset.tags,
					asset.notes,
				].filter(Boolean).join(' ').toLowerCase()
				return fuzzySearch(searchable, q)
			})
		}

		if (this.filterState.category) {
			all = all.filter(({ asset }) => asset.category === this.filterState.category)
		}

		if (this.filterState.expired) {
			all = all.filter(({ asset }) => daysRemaining(asset.expiry) < 0)
		} else if (this.filterState.expired === undefined) {
			all = all.filter(({ asset }) => daysRemaining(asset.expiry) >= 0 || asset.autoRenew)
		}

		if (this.filterState.autoRenew) {
			all = all.filter(({ asset }) => asset.autoRenew)
		}

		return sortAssets(all, this.sortField, this.sortOrder)
	}

	private renderDashboard() {
		const content = this.container.querySelector('.expiry-content')
		if (content) content.remove()

		const main = createElement('div', { className: 'expiry-content' })

		if (this.settings.showStats) {
			const stats = this.store.getStats()
			this.renderStats(main, stats)
		}

		const sections = this.container.querySelector('.expiry-sections')
		if (sections) sections.remove()

		const sectionsContainer = createElement('div', { className: 'expiry-sections' })

		const filtered = this.getFilteredAssets()

		const sections_data: { title: string; items: AssetFile[] }[] = [
			{
				title: 'Expiring Today',
				items: filtered.filter(({ asset }) => daysRemaining(asset.expiry) === 0),
			},
			{
				title: 'This Week',
				items: filtered.filter(
					({ asset }) =>
						daysRemaining(asset.expiry) > 0 &&
						daysRemaining(asset.expiry) <= 7,
				),
			},
			{
				title: 'This Month',
				items: filtered.filter(
					({ asset }) =>
						daysRemaining(asset.expiry) > 7 &&
						daysRemaining(asset.expiry) <= 30,
				),
			},
			{
				title: 'Upcoming',
				items: filtered.filter(
					({ asset }) => daysRemaining(asset.expiry) > 30,
				),
			},
			{
				title: 'Auto-Renewing',
				items: filtered.filter(({ asset }) => asset.autoRenew),
			},
			{
				title: 'Expired',
				items: this.store.getExpired(),
			},
		]

		for (const section of sections_data) {
			if (section.items.length === 0) continue
			const sectionEl = this.renderSection(section.title, section.items)
			sectionsContainer.appendChild(sectionEl)
		}

		main.appendChild(sectionsContainer)
		this.container.appendChild(main)
	}

	private renderStats(container: HTMLElement, stats: DashboardStats) {
		const el = createElement('div', { className: 'expiry-stats' })

		const items: { label: string; value: string | number }[] = [
			{ label: 'Total', value: stats.total },
			{ label: 'Expiring This Week', value: stats.expiringThisWeek },
			{ label: 'Expired', value: stats.expired },
			{ label: 'Auto-Renewing', value: stats.autoRenewing },
			{ label: 'Monthly Spend', value: `${getCurrencySymbol(this.settings.defaultCurrency)}${stats.monthlySpend.toFixed(2)}` },
			{ label: 'Annual Spend', value: `${getCurrencySymbol(this.settings.defaultCurrency)}${stats.yearlySpend.toFixed(2)}` },
			{ label: 'Avg Remaining', value: `${stats.averageRemaining}d` },
		]

		for (const item of items) {
			const stat = createElement('div', { className: 'expiry-stat' })
			const val = createElement('div', { className: 'expiry-stat-value', textContent: String(item.value) })
			const lbl = createElement('div', { className: 'expiry-stat-label', textContent: item.label })
			stat.appendChild(val)
			stat.appendChild(lbl)
			el.appendChild(stat)
		}

		container.appendChild(el)
	}

	private renderSection(title: string, items: AssetFile[]): HTMLElement {
		const section = createElement('div', { className: 'expiry-section' })
		const heading = createElement('h2', {
			className: 'expiry-section-title',
			textContent: `${title} (${items.length})`,
		})
		section.appendChild(heading)

		const grid = createElement('div', { className: 'expiry-grid' })
		for (const item of items) {
			const card = this.renderCard(item)
			grid.appendChild(card)
		}
		section.appendChild(grid)

		return section
	}

	private renderCard(item: AssetFile): HTMLElement {
		const { asset, path } = item
		const remaining = daysRemaining(asset.expiry)
		const pct = progressPercent(asset.start, asset.expiry)
		const color = getProgressColorCSS(asset.expiry)

		const card = createElement('div', { className: 'expiry-card' })

		const topRow = createElement('div', { className: 'expiry-card-top' })
		const iconEl = createElement('span', {
			className: 'expiry-card-icon',
			textContent: asset.icon || '📌',
		})
		const info = createElement('div', { className: 'expiry-card-info' })
		const nameEl = createElement('div', {
			className: 'expiry-card-name',
			textContent: asset.name,
		})
		const metaEl = createElement('div', { className: 'expiry-card-meta' })
		const catTag = createElement('span', {
			className: 'expiry-tag',
			textContent: asset.category,
		})
		metaEl.appendChild(catTag)
		if (asset.provider) {
			const provTag = createElement('span', {
				className: 'expiry-tag expiry-tag-provider',
				textContent: asset.provider,
			})
			metaEl.appendChild(provTag)
		}
		info.appendChild(nameEl)
		info.appendChild(metaEl)
		topRow.appendChild(iconEl)
		topRow.appendChild(info)
		card.appendChild(topRow)

		const barContainer = createElement('div', { className: 'expiry-progress-container' })
		const barBg = createElement('div', { className: 'expiry-progress-bg' })
		const barFill = createElement('div', {
			className: 'expiry-progress-fill',
		})
		barFill.style.width = `${Math.min(100, Math.max(0, pct))}%`
		barFill.style.backgroundColor = color
		barBg.appendChild(barFill)
		barContainer.appendChild(barBg)
		const barLabel = createElement('div', {
			className: 'expiry-progress-label',
			textContent: `${pct}% · ${remaining >= 0 ? `${remaining} days remaining` : 'Expired'}`,
		})
		barContainer.appendChild(barLabel)
		card.appendChild(barContainer)

		const details = createElement('div', { className: 'expiry-card-details' })
		details.appendChild(
			createElement('span', {
				className: 'expiry-card-expiry',
				textContent: formatRemaining(asset.expiry),
			}),
		)
		if (asset.cost !== undefined) {
			details.appendChild(
				createElement('span', {
					className: 'expiry-card-cost',
					textContent: `${getCurrencySymbol(asset.currency)}${asset.cost}${asset.autoRenew ? '/mo' : ''}`,
				}),
			)
		}
		if (asset.autoRenew) {
			details.appendChild(
				createElement('span', {
					className: 'expiry-badge expiry-badge-auto',
					textContent: 'Auto',
				}),
			)
		}
		card.appendChild(details)

		const actions = createElement('div', { className: 'expiry-card-actions' })
		const editBtn = createElement('button', {
			className: 'expiry-btn expiry-btn-sm',
			textContent: 'Edit',
		})
		editBtn.addEventListener('click', (e) => {
			e.stopPropagation()
			this.callbacks.onEditEntry(path)
		})
		actions.appendChild(editBtn)

		if (remaining >= 0) {
			const renewBtn = createElement('button', {
				className: 'expiry-btn expiry-btn-sm expiry-btn-primary',
				textContent: 'Renew',
			})
			renewBtn.addEventListener('click', (e) => {
				e.stopPropagation()
				this.callbacks.onRenewEntry(path)
			})
			actions.appendChild(renewBtn)
		}
		card.appendChild(actions)

		return card
	}

	private renderTimeline() {
		const main = createElement('div', { className: 'expiry-content' })
		const timeline = createElement('div', { className: 'expiry-timeline' })
		const all = this.getFilteredAssets().filter(
			({ asset }) => !asset.archived,
		)

		const grouped = new Map<string, AssetFile[]>()
		for (const item of all) {
			const remaining = daysRemaining(item.asset.expiry)
			let label: string
			if (remaining < 0) label = 'Expired'
			else if (remaining === 0) label = 'Today'
			else if (remaining <= 7) label = 'This Week'
			else if (remaining <= 30) label = 'This Month'
			else label = 'Upcoming'

			if (!grouped.has(label)) grouped.set(label, [])
			grouped.get(label)!.push(item)
		}

		const order = ['Today', 'This Week', 'This Month', 'Upcoming', 'Expired']
		for (const key of order) {
			const items = grouped.get(key)
			if (!items || items.length === 0) continue

			const group = createElement('div', { className: 'expiry-timeline-group' })
			const header = createElement('div', {
				className: 'expiry-timeline-date',
				textContent: key,
			})
			group.appendChild(header)

			for (const { asset } of items) {
				const row = createElement('div', { className: 'expiry-timeline-item' })
				const iconEl = createElement('span', {
					className: 'expiry-timeline-icon',
					textContent: asset.icon || '📌',
				})
				const nameEl = createElement('span', {
					className: 'expiry-timeline-name',
					textContent: asset.name,
				})
				const daysEl = createElement('span', {
					className: 'expiry-timeline-days',
					textContent: `${daysRemaining(asset.expiry)} days`,
				})
				row.appendChild(iconEl)
				row.appendChild(nameEl)
				row.appendChild(daysEl)
				group.appendChild(row)
			}

			timeline.appendChild(group)
		}

		main.appendChild(timeline)
		this.container.appendChild(main)
	}

	private renderCalendar() {
		const main = createElement('div', { className: 'expiry-content' })
		const cal = createElement('div', { className: 'expiry-calendar' })

		const now = new Date()
		const year = now.getFullYear()
		const month = now.getMonth()

		const monthNames = [
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December',
		]
		const monthLabel = createElement('h3', {
			className: 'expiry-calendar-month',
			textContent: `${monthNames[month]} ${year}`,
		})
		cal.appendChild(monthLabel)

		const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
		const headerRow = createElement('div', { className: 'expiry-calendar-header' })
		for (const d of daysOfWeek) {
			headerRow.appendChild(createElement('div', {
				className: 'expiry-calendar-day-header',
				textContent: d,
			}))
		}
		cal.appendChild(headerRow)

		const firstDay = new Date(year, month, 1).getDay()
		const daysInMonth = new Date(year, month + 1, 0).getDate()

		const all = this.store.getAll().filter(({ asset }) => !asset.archived)
		const expiryByDate = new Map<string, AssetFile[]>()
		for (const item of all) {
			if (!expiryByDate.has(item.asset.expiry)) {
				expiryByDate.set(item.asset.expiry, [])
			}
			expiryByDate.get(item.asset.expiry)!.push(item)
		}

		const grid = createElement('div', { className: 'expiry-calendar-grid' })

		for (let i = 0; i < firstDay; i++) {
			grid.appendChild(createElement('div', { className: 'expiry-calendar-day empty' }))
		}

		for (let day = 1; day <= daysInMonth; day++) {
			const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
			const dayEl = createElement('div', { className: 'expiry-calendar-day' })
			const dayNum = createElement('div', {
				className: 'expiry-calendar-day-num',
				textContent: String(day),
			})
			dayEl.appendChild(dayNum)

			const items = expiryByDate.get(dateStr)
			if (items) {
				dayEl.addClass('has-expiry')
				for (const item of items) {
					const dot = createElement('div', {
						className: 'expiry-calendar-event',
						textContent: `${item.asset.icon || '📌'} ${item.asset.name}`,
					})
					dayEl.appendChild(dot)
				}
			}

			if (dateStr === `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`) {
				dayEl.addClass('today')
			}

			grid.appendChild(dayEl)
		}

		cal.appendChild(grid)
		main.appendChild(cal)
		this.container.appendChild(main)
	}
}
