import { describe, it, expect } from 'vitest'
import { assetToMarkdown, parseAsset } from './parser'
import type { Asset } from './types'

const sample: Asset = {
	name: 'ChatGPT Plus',
	icon: '💳',
	category: 'Subscription',
	provider: 'OpenAI',
	start: '2026-07-01',
	expiry: '2026-08-01',
	cost: 20,
	currency: 'USD',
	autoRenew: true,
	reminders: [30, 7, 1],
	tags: ['ai', 'productivity'],
	notes: 'Monthly subscription',
	createdAt: '2026-07-01',
	updatedAt: '2026-07-01',
}

describe('assetToMarkdown', () => {
	it('generates valid YAML frontmatter', () => {
		const md = assetToMarkdown(sample)
		expect(md.startsWith('---\n')).toBe(true)
		expect(md.includes('---')).toBe(true)
	})

	it('includes all fields', () => {
		const md = assetToMarkdown(sample)
		expect(md).toContain('name: ChatGPT Plus')
		expect(md).toContain('icon: 💳')
		expect(md).toContain('category: Subscription')
		expect(md).toContain('provider: OpenAI')
		expect(md).toContain('start: 2026-07-01')
		expect(md).toContain('expiry: 2026-08-01')
		expect(md).toContain('cost: 20')
		expect(md).toContain('currency: USD')
		expect(md).toContain('autoRenew: true')
		expect(md).toContain('notes: Monthly subscription')
	})

	it('includes reminders as list', () => {
		const md = assetToMarkdown(sample)
		expect(md).toContain('  - 30')
		expect(md).toContain('  - 7')
		expect(md).toContain('  - 1')
	})

	it('includes tags as list', () => {
		const md = assetToMarkdown(sample)
		expect(md).toContain('  - ai')
		expect(md).toContain('  - productivity')
	})

	it('handles optional fields omitted', () => {
		const minimal: Asset = {
			name: 'Test',
			category: 'Custom',
			start: '2026-01-01',
			expiry: '2026-02-01',
			reminders: [],
			tags: [],
			createdAt: '2026-01-01',
			updatedAt: '2026-01-01',
		}
		const md = assetToMarkdown(minimal)
		expect(md).toContain('name: Test')
		expect(md).not.toContain('icon:')
		expect(md).not.toContain('provider:')
		expect(md).not.toContain('cost:')
	})

	it('handles multiline notes with block scalar', () => {
		const withMultiline: Asset = {
			...sample,
			notes: 'Line 1\nLine 2\nLine 3',
		}
		const md = assetToMarkdown(withMultiline)
		expect(md).toContain('notes: |')
		expect(md).toContain('  Line 1')
		expect(md).toContain('  Line 2')
	})
})

describe('parseAsset', () => {
	it('parses valid frontmatter', () => {
		const md = assetToMarkdown(sample)
		const result = parseAsset(md)
		expect(result).not.toBeNull()
		expect(result!.name).toBe('ChatGPT Plus')
		expect(result!.category).toBe('Subscription')
		expect(result!.provider).toBe('OpenAI')
		expect(result!.start).toBe('2026-07-01')
		expect(result!.expiry).toBe('2026-08-01')
		expect(result!.cost).toBe(20)
		expect(result!.currency).toBe('USD')
		expect(result!.autoRenew).toBe(true)
	})

	it('parses reminders', () => {
		const md = assetToMarkdown(sample)
		const result = parseAsset(md)
		expect(result!.reminders).toEqual([30, 7, 1])
	})

	it('parses tags', () => {
		const md = assetToMarkdown(sample)
		const result = parseAsset(md)
		expect(result!.tags).toEqual(['ai', 'productivity'])
	})

	it('returns null for content without frontmatter', () => {
		expect(parseAsset('no frontmatter here')).toBeNull()
	})

	it('returns null when required fields missing', () => {
		expect(parseAsset('---\nname: Only\n---')).toBeNull()
	})

	it('handles boolean values', () => {
		const md = '---\nname: Test\nstart: 2026-01-01\nexpiry: 2026-02-01\nautoRenew: true\nreminders:\n  - 7\ntags: []\ncreatedAt: 2026-01-01\nupdatedAt: 2026-01-01\n---'
		const result = parseAsset(md)
		expect(result!.autoRenew).toBe(true)
	})

	it('handles archived flag', () => {
		const md = '---\nname: Test\nstart: 2026-01-01\nexpiry: 2026-02-01\narchived: true\nreminders:\n  - 7\ntags: []\ncreatedAt: 2026-01-01\nupdatedAt: 2026-01-01\n---'
		const result = parseAsset(md)
		expect(result!.archived).toBe(true)
	})

	it('round-trips losslessly', () => {
		const md1 = assetToMarkdown(sample)
		const parsed = parseAsset(md1)
		const md2 = assetToMarkdown(parsed!)
		expect(md2).toBe(md1)
	})
})
