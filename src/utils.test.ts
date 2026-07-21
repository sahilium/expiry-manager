import { describe, it, expect } from 'vitest'
import {
	parseDate,
	todayStr,
	daysBetween,
	totalDays,
	progress,
	progressPercent,
	isExpired,
	getProgressColor,
	formatRemaining,
	slugify,
	fuzzySearch,
	sortAssets,
} from './utils'
import type { AssetFile } from './types'

const mockAssets: AssetFile[] = [
	{ path: 'a.md', asset: { name: 'Alpha', category: 'Sub', start: '2026-01-01', expiry: '2026-07-01', reminders: [], tags: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' } },
	{ path: 'b.md', asset: { name: 'Beta', category: 'Host', start: '2026-03-01', expiry: '2026-09-01', reminders: [], tags: [], createdAt: '2026-03-01', updatedAt: '2026-03-01' } },
	{ path: 'c.md', asset: { name: 'Gamma', category: 'Sub', start: '2026-05-01', expiry: '2026-11-01', reminders: [], tags: [], createdAt: '2026-05-01', updatedAt: '2026-05-01' } },
]

describe('parseDate', () => {
	it('parses YYYY-MM-DD correctly', () => {
		const d = parseDate('2026-07-21')
		expect(d.getFullYear()).toBe(2026)
		expect(d.getMonth()).toBe(6)
		expect(d.getDate()).toBe(21)
	})
})

describe('todayStr', () => {
	it('returns a string in YYYY-MM-DD format', () => {
		expect(todayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
	})
})

describe('daysBetween', () => {
	it('calculates days between two dates', () => {
		expect(daysBetween('2026-01-01', '2026-01-10')).toBe(9)
	})

	it('returns negative for past dates', () => {
		expect(daysBetween('2026-01-10', '2026-01-01')).toBe(-9)
	})

	it('returns 0 for same day', () => {
		expect(daysBetween('2026-07-21', '2026-07-21')).toBe(0)
	})
})

describe('totalDays', () => {
	it('returns at least 1', () => {
		expect(totalDays('2026-07-21', '2026-07-21')).toBe(1)
	})

	it('calculates total duration', () => {
		expect(totalDays('2026-01-01', '2026-07-01')).toBe(181)
	})
})

describe('progress', () => {
	it('returns 0 at start date', () => {
		expect(progress('2099-01-01', '2099-02-01')).toBe(0)
	})

	it('returns value between 0 and 1', () => {
		const p = progress('2025-01-01', '2027-01-01')
		expect(p).toBeGreaterThanOrEqual(0)
		expect(p).toBeLessThanOrEqual(1)
	})
})

describe('progressPercent', () => {
	it('returns a percentage', () => {
		const p = progressPercent('2025-01-01', '2027-01-01')
		expect(p).toBeGreaterThanOrEqual(0)
		expect(p).toBeLessThanOrEqual(100)
	})
})

describe('isExpired', () => {
	it('returns true for past dates', () => {
		expect(isExpired('2020-01-01')).toBe(true)
	})

	it('returns false for future dates', () => {
		expect(isExpired('2099-01-01')).toBe(false)
	})
})

describe('getProgressColor', () => {
	it('returns grey for expired', () => {
		expect(getProgressColor('2020-01-01')).toBe('grey')
	})

	it('returns red for <= 3 days', () => {
		const future = new Date()
		future.setDate(future.getDate() + 2)
		const str = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`
		expect(getProgressColor(str)).toBe('red')
	})

	it('returns orange for <= 7 days', () => {
		const future = new Date()
		future.setDate(future.getDate() + 5)
		const str = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`
		expect(getProgressColor(str)).toBe('orange')
	})

	it('returns yellow for <= 30 days', () => {
		const future = new Date()
		future.setDate(future.getDate() + 14)
		const str = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`
		expect(getProgressColor(str)).toBe('yellow')
	})

	it('returns green for > 30 days', () => {
		expect(getProgressColor('2099-01-01')).toBe('green')
	})
})

describe('formatRemaining', () => {
	it('returns Expired for past dates', () => {
		expect(formatRemaining('2020-01-01')).toBe('Expired')
	})

	it('returns expires today for 0 days', () => {
		const today = todayStr()
		expect(formatRemaining(today)).toBe('Expires today')
	})

	it('returns expires tomorrow for 1 day', () => {
		const future = new Date()
		future.setDate(future.getDate() + 1)
		const str = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`
		expect(formatRemaining(str)).toBe('Expires tomorrow')
	})

	it('returns Expires in X days', () => {
		expect(formatRemaining('2099-01-01')).toMatch(/^Expires in \d+ days$/)
	})
})

describe('slugify', () => {
	it('converts to lowercase kebab-case', () => {
		expect(slugify('ChatGPT Plus')).toBe('chatgpt-plus')
	})

	it('removes special characters', () => {
		expect(slugify('Hello World! @#$')).toBe('hello-world')
	})

	it('trims leading/trailing dashes', () => {
		expect(slugify('--test--')).toBe('test')
	})
})

describe('fuzzySearch', () => {
	it('returns true for empty query', () => {
		expect(fuzzySearch('anything', '')).toBe(true)
	})

	it('matches case-insensitively', () => {
		expect(fuzzySearch('ChatGPT Plus', 'chatgpt')).toBe(true)
	})

	it('matches partial words', () => {
		expect(fuzzySearch('Netflix Subscription', 'net')).toBe(true)
	})

	it('returns false for non-matching', () => {
		expect(fuzzySearch('Netflix', 'gym')).toBe(false)
	})

	it('matches multiple words', () => {
		expect(fuzzySearch('GitHub Pro Account', 'github pro')).toBe(true)
	})
})

describe('sortAssets', () => {
	it('sorts by expiry ascending', () => {
		const sorted = sortAssets(mockAssets, 'expiry', 'asc')
		expect(sorted[0]!.asset.name).toBe('Alpha')
		expect(sorted[2]!.asset.name).toBe('Gamma')
	})

	it('sorts by expiry descending', () => {
		const sorted = sortAssets(mockAssets, 'expiry', 'desc')
		expect(sorted[0]!.asset.name).toBe('Gamma')
		expect(sorted[2]!.asset.name).toBe('Alpha')
	})

	it('sorts by name', () => {
		const sorted = sortAssets(mockAssets, 'name', 'asc')
		expect(sorted[0]!.asset.name).toBe('Alpha')
		expect(sorted[2]!.asset.name).toBe('Gamma')
	})

	it('sorts by category', () => {
		const sorted = sortAssets(mockAssets, 'category', 'asc')
		expect(sorted[0]!.asset.category).toBe('Host')
		expect(sorted[1]!.asset.category).toBe('Sub')
	})
})
