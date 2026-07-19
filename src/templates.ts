import type { Asset, Template } from './types'
import { TEMPLATES } from './constants'
import { todayStr } from './utils'

export function getTemplates(): Template[] {
	return TEMPLATES
}

export function getTemplate(id: string): Template | undefined {
	return TEMPLATES.find(t => t.id === id)
}

export function applyTemplate(template: Template): Asset {
	const now = todayStr()
	return {
		name: '',
		icon: template.icon,
		category: template.fields.category ?? 'Custom',
		provider: template.fields.provider,
		start: now,
		expiry: '',
		cost: template.fields.cost,
		currency: template.fields.currency,
		autoRenew: template.fields.autoRenew,
		renewalPeriod: template.fields.renewalPeriod,
		reminders: template.fields.reminders ?? [30, 7, 1],
		tags: template.fields.tags ?? [],
		notes: template.fields.notes,
		createdAt: now,
		updatedAt: now,
	}
}
