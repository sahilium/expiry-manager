import { App, Modal, Setting } from 'obsidian'
import type { Asset } from './types'
import { CURRENCIES, DEFAULT_CATEGORIES } from './constants'
import { getTemplates, applyTemplate } from './templates'
import { createElement } from './utils'

export class EditorModal extends Modal {
	private asset: Asset
	private onSave: (asset: Asset) => void
	private onDelete?: () => void
	private isEdit: boolean

	constructor(
		app: App,
		asset: Asset,
		onSave: (asset: Asset) => void,
		onDelete?: () => void,
	) {
		super(app)
		this.asset = { ...asset }
		this.onSave = onSave
		this.onDelete = onDelete
		this.isEdit = !!asset.name
		this.titleEl.setText(this.isEdit ? `Edit ${asset.name}` : 'New Entry')
	}

	onOpen() {
		const { contentEl } = this
		contentEl.addClass('expiry-editor')
		contentEl.empty()

		if (!this.isEdit) {
			this.renderTemplatePicker(contentEl)
		}

		this.renderForm(contentEl)
	}

	private renderTemplatePicker(container: HTMLElement) {
		const templates = getTemplates()
		const picker = createElement('div', { className: 'expiry-template-picker' })

		for (const t of templates) {
			const btn = createElement('button', {
				className: 'expiry-template-btn',
				textContent: `${t.icon} ${t.name}`,
			})
			btn.addEventListener('click', () => {
				this.asset = applyTemplate(t)
				picker.querySelectorAll('.expiry-template-btn').forEach(b => b.removeClass('selected'))
				btn.addClass('selected')
			})
			if (t.id === 'blank') btn.addClass('selected')
			picker.appendChild(btn)
		}

		container.appendChild(picker)
	}

	private renderForm(container: HTMLElement) {
		const form = createElement('div', { className: 'expiry-editor-form' })

		const fields: {
			id: keyof Asset
			label: string
			type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'tags'
			options?: string[]
			placeholder?: string
		}[] = [
			{ id: 'name', label: 'Name', type: 'text', placeholder: 'e.g. ChatGPT Plus' },
			{ id: 'icon', label: 'Icon / Emoji', type: 'text', placeholder: 'e.g. 💳' },
			{ id: 'category', label: 'Category', type: 'select', options: [...DEFAULT_CATEGORIES] },
			{ id: 'provider', label: 'Provider', type: 'text', placeholder: 'e.g. OpenAI' },
			{ id: 'start', label: 'Start Date', type: 'date' },
			{ id: 'expiry', label: 'Expiry Date', type: 'date' },
			{ id: 'cost', label: 'Cost', type: 'number', placeholder: 'e.g. 20' },
			{ id: 'currency', label: 'Currency', type: 'select', options: CURRENCIES },
			{ id: 'autoRenew', label: 'Auto-Renew', type: 'checkbox' },
			{ id: 'renewalPeriod', label: 'Renewal Period (days)', type: 'number', placeholder: 'e.g. 30' },
			{ id: 'tags', label: 'Tags (comma separated)', type: 'tags' },
			{ id: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes...' },
		]

		for (const field of fields) {
			this.renderField(form, field)
		}

		const btnRow = createElement('div', { className: 'expiry-editor-buttons' })

		const saveBtn = createElement('button', {
			className: 'expiry-btn expiry-btn-primary',
			textContent: this.isEdit ? 'Save Changes' : 'Create Entry',
		})
		saveBtn.addEventListener('click', () => {
			this.collectForm(form)
			this.onSave(this.asset)
			this.close()
		})

		const cancelBtn = createElement('button', {
			className: 'expiry-btn',
			textContent: 'Cancel',
		})
		cancelBtn.addEventListener('click', () => this.close())

		btnRow.appendChild(saveBtn)
		btnRow.appendChild(cancelBtn)

		if (this.isEdit && this.onDelete) {
			const deleteBtn = createElement('button', {
				className: 'expiry-btn expiry-btn-danger',
				textContent: 'Delete',
			})
			deleteBtn.addEventListener('click', () => {
				this.onDelete!()
				this.close()
			})
			btnRow.appendChild(deleteBtn)
		}

		form.appendChild(btnRow)
		container.appendChild(form)
		this.populateForm(form)
	}

	private renderField(
		container: HTMLElement,
		field: { id: keyof Asset; label: string; type: string; options?: string[]; placeholder?: string },
	) {
		const setting = new Setting(container)
			.setName(field.label)
			.setClass('expiry-field')

		switch (field.type) {
			case 'text':
				setting.addText(tc => {
					tc.setPlaceholder(field.placeholder || '')
					tc.inputEl.dataset.field = field.id
				})
				break
			case 'number':
				setting.addText(tc => {
					tc.setPlaceholder(field.placeholder || '')
					tc.inputEl.type = 'number'
					tc.inputEl.dataset.field = field.id
				})
				break
			case 'date':
				setting.addText(tc => {
					tc.inputEl.type = 'date'
					tc.inputEl.dataset.field = field.id
				})
				break
			case 'select':
				setting.addDropdown(dd => {
					for (const opt of field.options || []) {
						dd.addOption(opt, opt)
					}
					dd.selectEl.dataset.field = field.id
				})
				break
			case 'checkbox':
				setting.addToggle(tg => {
					tg.setTooltip(field.label)
					tg.toggleEl.dataset.field = field.id
				})
				break
			case 'textarea':
				setting.addTextArea(ta => {
					ta.setPlaceholder(field.placeholder || '')
					ta.inputEl.dataset.field = field.id
				})
				break
			case 'tags':
				setting.addText(tc => {
					tc.setPlaceholder('E.g. AI, productivity')
					tc.inputEl.dataset.field = 'tags-input'
				})
				break
		}
	}

	private populateForm(container: HTMLElement) {
		const find = (field: string): HTMLElement | null =>
			container.querySelector(`[data-field="${field}"]`)

		const nameInput = find('name') as HTMLInputElement
		if (nameInput) nameInput.value = this.asset.name

		const iconInput = find('icon') as HTMLInputElement
		if (iconInput) iconInput.value = this.asset.icon || ''

		const categorySelect = find('category') as HTMLSelectElement
		if (categorySelect) categorySelect.value = this.asset.category

		const providerInput = find('provider') as HTMLInputElement
		if (providerInput) providerInput.value = this.asset.provider || ''

		const startInput = find('start') as HTMLInputElement
		if (startInput) startInput.value = this.asset.start

		const expiryInput = find('expiry') as HTMLInputElement
		if (expiryInput) expiryInput.value = this.asset.expiry

		const costInput = find('cost') as HTMLInputElement
		if (costInput && this.asset.cost !== undefined) costInput.value = String(this.asset.cost)

		const currencySelect = find('currency') as HTMLSelectElement
		if (currencySelect) currencySelect.value = this.asset.currency || 'USD'

		const autoRenew = find('autoRenew') as HTMLInputElement
		if (autoRenew) autoRenew.checked = this.asset.autoRenew || false

		const renewalInput = find('renewalPeriod') as HTMLInputElement
		if (renewalInput && this.asset.renewalPeriod !== undefined) renewalInput.value = String(this.asset.renewalPeriod)

		const tagsInput = find('tags-input') as HTMLInputElement
		if (tagsInput) tagsInput.value = (this.asset.tags || []).join(', ')

		const notesInput = find('notes') as HTMLTextAreaElement
		if (notesInput) notesInput.value = this.asset.notes || ''

		const remindersSetting = container.querySelectorAll('.expiry-field')
		const lastSetting = remindersSetting[remindersSetting.length - 1]
		if (lastSetting && lastSetting.nextElementSibling) {
			// reminder offsets are displayed inline
		}
	}

	private collectForm(container: HTMLElement) {
		const find = (field: string): HTMLElement | null =>
			container.querySelector(`[data-field="${field}"]`)

		const nameInput = find('name') as HTMLInputElement
		if (nameInput) this.asset.name = nameInput.value

		const iconInput = find('icon') as HTMLInputElement
		if (iconInput) this.asset.icon = iconInput.value || undefined

		const categorySelect = find('category') as HTMLSelectElement
		if (categorySelect) this.asset.category = categorySelect.value

		const providerInput = find('provider') as HTMLInputElement
		if (providerInput) this.asset.provider = providerInput.value || undefined

		const startInput = find('start') as HTMLInputElement
		if (startInput) this.asset.start = startInput.value

		const expiryInput = find('expiry') as HTMLInputElement
		if (expiryInput) this.asset.expiry = expiryInput.value

		const costInput = find('cost') as HTMLInputElement
		if (costInput) this.asset.cost = costInput.value ? Number(costInput.value) : undefined

		const currencySelect = find('currency') as HTMLSelectElement
		if (currencySelect) this.asset.currency = currencySelect.value

		const autoRenew = find('autoRenew') as HTMLInputElement
		if (autoRenew) this.asset.autoRenew = autoRenew.checked

		const renewalInput = find('renewalPeriod') as HTMLInputElement
		if (renewalInput) this.asset.renewalPeriod = renewalInput.value ? Number(renewalInput.value) : undefined

		const tagsInput = find('tags-input') as HTMLInputElement
		if (tagsInput) {
			this.asset.tags = tagsInput.value
				.split(',')
				.map(t => t.trim())
				.filter(Boolean)
		}

		const notesInput = find('notes') as HTMLTextAreaElement
		if (notesInput) this.asset.notes = notesInput.value || undefined
	}

	onClose() {
		this.contentEl.empty()
	}
}
