export const CURRENCY_SYMBOLS: Record<string, string> = {
	USD: '$',
	EUR: '€',
	GBP: '£',
	INR: '₹',
	JPY: '¥',
	CAD: 'CA$',
	AUD: 'A$',
	BRL: 'R$',
	SGD: 'S$',
	MYR: 'RM',
	CNY: '¥',
	KRW: '₩',
	CHF: 'CHF',
	SEK: 'kr',
	NOK: 'kr',
	DKK: 'kr',
	MXN: 'MX$',
	TRY: '₺',
	PLN: 'zł',
}

export function getCurrencySymbol(currency?: string): string {
	if (currency && CURRENCY_SYMBOLS[currency]) return CURRENCY_SYMBOLS[currency]
	return currency || '$'
}

import type { PluginSettings, Template } from './types'

export const VIEW_TYPE_EXPIRY = 'expiry-manager-view'
export const VIEW_TYPE_TIMELINE = 'expiry-manager-timeline'
export const VIEW_TYPE_CALENDAR = 'expiry-manager-calendar'

export const DEFAULT_FOLDER = 'Expiry Manager'

export const DEFAULT_REMINDERS = [30, 14, 7, 3, 1]

export const DEFAULT_CATEGORIES = [
	'Subscription',
	'Telecom',
	'Hosting',
	'Domain',
	'Certificate',
	'API Key',
	'Security',
	'Personal Document',
	'Vehicle',
	'Warranty',
	'Finance',
	'Software',
	'Membership',
	'Custom',
] as const

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'BRL', 'SGD', 'MYR']

export const PROGRESS_COLORS = {
	green: { r: 34, g: 197, b: 94 },
	yellow: { r: 234, g: 179, b: 8 },
	orange: { r: 249, g: 115, b: 22 },
	red: { r: 239, g: 68, b: 68 },
	grey: { r: 148, g: 163, b: 184 },
} as const

export const DEFAULT_SETTINGS: PluginSettings = {
	folder: DEFAULT_FOLDER,
	defaultReminders: [...DEFAULT_REMINDERS],
	defaultCurrency: 'USD',
	showTimelineView: true,
	showCalendarView: false,
	showStats: true,
	enabledNotifications: true,
	notificationOffsets: [...DEFAULT_REMINDERS],
}

export const TEMPLATES: Template[] = [
	{
		id: 'blank',
		name: 'Blank',
		icon: '✨',
		fields: {
			category: 'Custom',
			reminders: [...DEFAULT_REMINDERS],
			tags: [],
			autoRenew: false,
			currency: 'USD',
		},
	},
	{
		id: 'mobile',
		name: 'Mobile Recharge',
		icon: '📱',
		fields: {
			category: 'Telecom',
			reminders: [7, 3, 1],
			tags: ['mobile'],
			autoRenew: false,
			currency: 'INR',
		},
	},
	{
		id: 'internet',
		name: 'Internet',
		icon: '🌐',
		fields: {
			category: 'Telecom',
			reminders: [7, 3, 1],
			tags: ['internet'],
			autoRenew: true,
			currency: 'INR',
		},
	},
	{
		id: 'subscription',
		name: 'Subscription',
		icon: '💳',
		fields: {
			category: 'Subscription',
			reminders: [7, 3, 1],
			tags: ['subscription'],
			autoRenew: true,
			currency: 'USD',
		},
	},
	{
		id: 'domain',
		name: 'Domain',
		icon: '🌍',
		fields: {
			category: 'Domain',
			reminders: [30, 14, 7],
			tags: ['domain'],
			autoRenew: true,
			currency: 'USD',
		},
	},
	{
		id: 'ssl',
		name: 'SSL Certificate',
		icon: '🔒',
		fields: {
			category: 'Certificate',
			reminders: [30, 14, 7],
			tags: ['ssl', 'security'],
			autoRenew: false,
			currency: 'USD',
		},
	},
	{
		id: 'api-key',
		name: 'API Key',
		icon: '🔑',
		fields: {
			category: 'API Key',
			reminders: [14, 7, 3],
			tags: ['api', 'security'],
			autoRenew: false,
			currency: 'USD',
		},
	},
	{
		id: 'insurance',
		name: 'Insurance',
		icon: '🚗',
		fields: {
			category: 'Vehicle',
			reminders: [30, 14, 7],
			tags: ['insurance'],
			autoRenew: false,
			currency: 'INR',
		},
	},
	{
		id: 'passport',
		name: 'Passport',
		icon: '📄',
		fields: {
			category: 'Personal Document',
			reminders: [90, 30, 14],
			tags: ['document', 'government'],
			autoRenew: false,
			currency: 'USD',
		},
	},
	{
		id: 'warranty',
		name: 'Warranty',
		icon: '📦',
		fields: {
			category: 'Warranty',
			reminders: [30, 14, 7],
			tags: ['warranty'],
			autoRenew: false,
			currency: 'USD',
		},
	},
]
