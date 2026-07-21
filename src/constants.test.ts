import { describe, it, expect } from 'vitest'
import {
	CURRENCY_SYMBOLS,
	getCurrencySymbol,
	DEFAULT_CATEGORIES,
	TEMPLATES,
	DEFAULT_SETTINGS,
	DEFAULT_REMINDERS,
} from './constants'

describe('CURRENCY_SYMBOLS', () => {
	it('includes major currencies', () => {
		expect(CURRENCY_SYMBOLS.USD).toBe('$')
		expect(CURRENCY_SYMBOLS.EUR).toBe('€')
		expect(CURRENCY_SYMBOLS.GBP).toBe('£')
		expect(CURRENCY_SYMBOLS.INR).toBe('₹')
		expect(CURRENCY_SYMBOLS.JPY).toBe('¥')
	})
})

describe('getCurrencySymbol', () => {
	it('returns $ for USD', () => {
		expect(getCurrencySymbol('USD')).toBe('$')
	})

	it('returns € for EUR', () => {
		expect(getCurrencySymbol('EUR')).toBe('€')
	})

	it('returns ₹ for INR', () => {
		expect(getCurrencySymbol('INR')).toBe('₹')
	})

	it('returns the code itself for unknown currency', () => {
		expect(getCurrencySymbol('XYZ')).toBe('XYZ')
	})

	it('returns $ as default for undefined input', () => {
		expect(getCurrencySymbol(undefined)).toBe('$')
	})
})

describe('DEFAULT_CATEGORIES', () => {
	it('includes common categories', () => {
		expect(DEFAULT_CATEGORIES).toContain('Subscription')
		expect(DEFAULT_CATEGORIES).toContain('Domain')
		expect(DEFAULT_CATEGORIES).toContain('Vehicle')
		expect(DEFAULT_CATEGORIES).toContain('Custom')
	})

	it('has at least 10 categories', () => {
		expect(DEFAULT_CATEGORIES.length).toBeGreaterThanOrEqual(10)
	})
})

describe('TEMPLATES', () => {
	it('includes a blank template', () => {
		const blank = TEMPLATES.find(t => t.id === 'blank')
		expect(blank).toBeDefined()
		expect(blank!.name).toBe('Blank')
	})

	it('all templates have required fields', () => {
		for (const t of TEMPLATES) {
			expect(t.id).toBeTruthy()
			expect(t.name).toBeTruthy()
			expect(t.icon).toBeTruthy()
			expect(t.fields.reminders).toBeDefined()
			expect(t.fields.tags).toBeDefined()
		}
	})

	it('ssl template has security tags', () => {
		const ssl = TEMPLATES.find(t => t.id === 'ssl')
		expect(ssl!.fields.tags).toContain('ssl')
		expect(ssl!.fields.tags).toContain('security')
	})
})

describe('DEFAULT_SETTINGS', () => {
	it('has a default folder', () => {
		expect(DEFAULT_SETTINGS.folder).toBe('Expiry Manager')
	})

	it('has default reminders', () => {
		expect(DEFAULT_SETTINGS.defaultReminders).toEqual(DEFAULT_REMINDERS)
	})

	it('notifications are enabled by default', () => {
		expect(DEFAULT_SETTINGS.enabledNotifications).toBe(true)
	})
})

describe('DEFAULT_REMINDERS', () => {
	it('includes standard reminder offsets', () => {
		expect(DEFAULT_REMINDERS).toContain(30)
		expect(DEFAULT_REMINDERS).toContain(7)
		expect(DEFAULT_REMINDERS).toContain(1)
	})
})
