import type { Asset, ProgressColor } from './types'
import { PROGRESS_COLORS } from './constants'

export function parseDate(dateStr: string): Date {
	const parts = dateStr.split('-').map(Number)
	return new Date(parts[0] ?? 0, (parts[1] ?? 1) - 1, parts[2] ?? 1)
}

export function todayStr(): string {
	const d = new Date()
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}

export function daysBetween(a: string, b: string): number {
	const da = parseDate(a)
	const db = parseDate(b)
	return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24))
}

export function daysRemaining(expiry: string): number {
	return daysBetween(todayStr(), expiry)
}

export function daysElapsed(start: string): number {
	return daysBetween(start, todayStr())
}

export function totalDays(start: string, expiry: string): number {
	return Math.max(1, daysBetween(start, expiry))
}

export function progress(start: string, expiry: string): number {
	const elapsed = daysElapsed(start)
	const total = totalDays(start, expiry)
	return Math.min(1, Math.max(0, elapsed / total))
}

export function progressPercent(start: string, expiry: string): number {
	return Math.round(progress(start, expiry) * 100)
}

export function isExpired(expiry: string): boolean {
	return daysRemaining(expiry) < 0
}

export function getProgressColor(expiry: string): ProgressColor {
	const remaining = daysRemaining(expiry)
	if (remaining < 0) return 'grey'
	if (remaining <= 3) return 'red'
	if (remaining <= 7) return 'orange'
	if (remaining <= 30) return 'yellow'
	return 'green'
}

export function getProgressColorCSS(expiry: string): string {
	const color = getProgressColor(expiry)
	const c = PROGRESS_COLORS[color]
	return `rgb(${c.r}, ${c.g}, ${c.b})`
}

export function formatRemaining(expiry: string): string {
	const d = daysRemaining(expiry)
	if (d < 0) return 'Expired'
	if (d === 0) return 'Expires today'
	if (d === 1) return 'Expires tomorrow'
	return `Expires in ${d} days`
}

export function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
}

export function fuzzySearch(text: string, query: string): boolean {
	const q = query.toLowerCase().trim()
	if (!q) return true
	const words = q.split(/\s+/)
	const lower = text.toLowerCase()
	return words.every(w => lower.includes(w))
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value))
}

export function getWeekId(dateStr: string): string {
	const d = parseDate(dateStr)
	const day = d.getDay()
	const diff = d.getDate() - day + (day === 0 ? -6 : 1)
	const monday = new Date(d.setDate(diff))
	return `${monday.getFullYear()}-W${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
}

export function sortAssets(assets: { path: string; asset: Asset }[], field: string, order: 'asc' | 'desc'): { path: string; asset: Asset }[] {
	return [...assets].sort((a, b) => {
		let cmp = 0
		switch (field) {
			case 'expiry':
				cmp = a.asset.expiry.localeCompare(b.asset.expiry)
				break
			case 'name':
				cmp = a.asset.name.localeCompare(b.asset.name)
				break
			case 'category':
				cmp = a.asset.category.localeCompare(b.asset.category)
				break
			case 'cost':
				cmp = (a.asset.cost ?? 0) - (b.asset.cost ?? 0)
				break
			case 'created':
				cmp = a.asset.createdAt.localeCompare(b.asset.createdAt)
				break
			default:
				cmp = a.asset.expiry.localeCompare(b.asset.expiry)
		}
		return order === 'asc' ? cmp : -cmp
	})
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	attrs?: Partial<HTMLElementTagNameMap[K]>,
	children?: (string | HTMLElement | null | undefined)[],
): HTMLElementTagNameMap[K] {
	const el = createEl(tag)
	if (attrs) {
		for (const [key, val] of Object.entries(attrs)) {
			if (val !== undefined && val !== null) {
				if (key === 'className') {
					el.className = val as string
				} else if (key === 'textContent') {
					el.textContent = val as string
				} else {
					(el as Record<string, unknown>)[key] = val
				}
			}
		}
	}
	if (children) {
		for (const child of children) {
			if (typeof child === 'string') {
				el.appendChild(document.createTextNode(child))
			} else if (child instanceof HTMLElement) {
				el.appendChild(child)
			}
		}
	}
	return el
}
