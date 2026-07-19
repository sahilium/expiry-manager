import type { Asset } from './types'
import { todayStr } from './utils'

function toStr(v: unknown): string {
	if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v)
	return ''
}

function escapeYAML(val: string): string {
	if (/[:#{}[\],&*?|<>!%@`"'-]/.test(val) || /^\s/.test(val) || /\s$/.test(val)) {
		return `"${val.replace(/"/g, '\\"')}"`
	}
	return val
}

export function assetToMarkdown(asset: Asset): string {
	const lines: string[] = ['---']

	lines.push(`name: ${escapeYAML(asset.name)}`)

	if (asset.icon) lines.push(`icon: ${asset.icon}`)
	lines.push(`category: ${escapeYAML(asset.category)}`)
	if (asset.provider) lines.push(`provider: ${escapeYAML(asset.provider)}`)

	lines.push(`start: ${asset.start}`)
	lines.push(`expiry: ${asset.expiry}`)

	if (asset.cost !== undefined) lines.push(`cost: ${asset.cost}`)
	if (asset.currency) lines.push(`currency: ${asset.currency}`)
	if (asset.autoRenew !== undefined) lines.push(`autoRenew: ${asset.autoRenew}`)
	if (asset.renewalPeriod !== undefined) lines.push(`renewalPeriod: ${asset.renewalPeriod}`)

	if (asset.reminders.length > 0) {
		lines.push('reminders:')
		for (const r of asset.reminders) {
			lines.push(`  - ${r}`)
		}
	}

	if (asset.tags.length > 0) {
		lines.push('tags:')
		for (const t of asset.tags) {
			lines.push(`  - ${escapeYAML(t)}`)
		}
	}

	if (asset.notes) lines.push(`notes: ${escapeYAML(asset.notes)}`)
	if (asset.archived) lines.push('archived: true')
	if (asset.parentId) lines.push(`parentId: ${asset.parentId}`)

	lines.push(`createdAt: ${asset.createdAt}`)
	lines.push(`updatedAt: ${asset.updatedAt}`)

	lines.push('---')
	lines.push('')
	if (asset.notes) {
		lines.push(asset.notes)
	}

	return lines.join('\n')
}

export function parseAsset(content: string): Asset | null {
	const match = content.match(/^---\n([\s\S]*?)\n---/)
	if (!match) return null

	const frontmatter = match[1]!
	const data: Record<string, unknown> = {}
	const currentKey: string[] = []

	for (const line of frontmatter.split('\n')) {
		if (/^\s+-\s/.test(line) && currentKey.length > 0) {
			const val = line.replace(/^\s+-\s+/, '').trim()
			const key = currentKey[currentKey.length - 1]!
			if (!Array.isArray(data[key])) {
				data[key] = []
			}
			const parsed = parseScalar(val)
			if (parsed !== null && Array.isArray(data[key])) (data[key] as unknown[]).push(parsed)
			continue
		}

		const topMatch = line.match(/^(\w+):\s*(.*)$/)
		if (topMatch) {
			const key = topMatch[1]!
			const raw = topMatch[2]!.trim()
			currentKey.length = 0
			currentKey.push(key)

			if (raw === '' || raw === '|' || raw === '>') {
				data[key] = []
				continue
			}

			const parsed = parseScalar(raw)
			if (parsed !== null) {
				data[key] = parsed
			}
		}
	}

	if (!data.name || !data.start || !data.expiry) return null

	const notesContent = content.slice(match[0].length).trim()

	return {
		name: toStr(data.name),
		icon: data.icon ? toStr(data.icon) : undefined,
		category: toStr(data.category) || 'Custom',
		provider: data.provider ? toStr(data.provider) : undefined,
		start: toStr(data.start),
		expiry: toStr(data.expiry),
		cost: data.cost !== undefined ? Number(toStr(data.cost)) : undefined,
		currency: data.currency ? toStr(data.currency) : undefined,
		autoRenew: data.autoRenew === true || data.autoRenew === 'true',
		renewalPeriod: data.renewalPeriod !== undefined ? Number(toStr(data.renewalPeriod)) : undefined,
		reminders: Array.isArray(data.reminders) ? data.reminders.map(Number) : [],
		tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
		notes: data.notes ? toStr(data.notes) : notesContent || undefined,
		archived: data.archived === true || data.archived === 'true',
		parentId: data.parentId ? toStr(data.parentId) : undefined,
		createdAt: toStr(data.createdAt) || todayStr(),
		updatedAt: toStr(data.updatedAt) || todayStr(),
	}
}

function parseScalar(raw: string): string | number | boolean | null {
	if (raw === 'true') return true
	if (raw === 'false') return false
	if (/^".*"$/.test(raw)) return raw.slice(1, -1).replace(/\\"/g, '"')
	if (/^\d+$/.test(raw)) return Number(raw)
	if (/^\d+\.\d+$/.test(raw)) return Number(raw)
	if (raw === '' || raw === 'null' || raw === '~') return null
	return raw
}
