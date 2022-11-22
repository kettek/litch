import type { EntryInterface } from './Settings.ts'

export function createEntry(): EntryInterface {
		return {
			name: '',
			left: 0,
			top: 0,
			imageRendering: 'auto',
			sourceType: 'url',
			source: '',
			style: '',
		}
	}

