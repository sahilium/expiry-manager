export interface Asset {
	name: string
	icon?: string
	category: string
	provider?: string
	start: string
	expiry: string
	cost?: number
	currency?: string
	autoRenew?: boolean
	renewalPeriod?: number
	reminders: number[]
	tags: string[]
	notes?: string
	archived?: boolean
	parentId?: string
	createdAt: string
	updatedAt: string
}

export interface AssetFile {
	path: string
	asset: Asset
}

export type SortField = 'expiry' | 'created' | 'name' | 'category' | 'cost'
export type SortOrder = 'asc' | 'desc'

export interface FilterState {
	category?: string
	expired?: boolean
	autoRenew?: boolean
	tag?: string
	provider?: string
	search?: string
}

export interface DashboardStats {
	total: number
	expiringThisWeek: number
	expired: number
	autoRenewing: number
	monthlySpend: number
	yearlySpend: number
	averageRemaining: number
}

export interface Template {
	id: string
	name: string
	icon: string
	fields: Partial<Asset>
}

export interface PluginSettings {
	folder: string
	defaultReminders: number[]
	defaultCurrency: string
	showTimelineView: boolean
	showCalendarView: boolean
	showStats: boolean
	enabledNotifications: boolean
	notificationOffsets: number[]
}

export type ViewType = 'dashboard' | 'timeline' | 'calendar'

export type CardSize = 'compact' | 'full'

export type ProgressColor = 'green' | 'yellow' | 'orange' | 'red' | 'grey'
