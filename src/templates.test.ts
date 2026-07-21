import { describe, it, expect } from 'vitest'
import { getTemplates, getTemplate, applyTemplate } from './templates'

describe('getTemplates', () => {
	it('returns all templates', () => {
		const templates = getTemplates()
		expect(templates.length).toBeGreaterThanOrEqual(10)
	})

	it('includes blank as first', () => {
		expect(getTemplates()[0]!.id).toBe('blank')
	})
})

describe('getTemplate', () => {
	it('finds by id', () => {
		const t = getTemplate('domain')
		expect(t).toBeDefined()
		expect(t!.name).toBe('Domain')
	})

	it('returns undefined for missing', () => {
		expect(getTemplate('nonexistent')).toBeUndefined()
	})
})

describe('applyTemplate', () => {
	it('sets fields from template', () => {
		const asset = applyTemplate(getTemplate('domain')!)
		expect(asset.category).toBe('Domain')
		expect(asset.tags).toContain('domain')
		expect(asset.autoRenew).toBe(true)
		expect(asset.currency).toBe('USD')
	})

	it('sets start date to today', () => {
		const asset = applyTemplate(getTemplate('blank')!)
		expect(asset.start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
	})

	it('leaves name empty for user input', () => {
		const asset = applyTemplate(getTemplate('mobile')!)
		expect(asset.name).toBe('')
	})

	it('reminders are set from template', () => {
		const asset = applyTemplate(getTemplate('passport')!)
		expect(asset.reminders).toContain(90)
		expect(asset.reminders).toContain(30)
	})
})
