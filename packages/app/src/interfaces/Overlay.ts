import type { BoxInterface } from './Box'
import type { ModuleInstanceInterface } from './ModuleInstance'
/**
 * An OverlayInterface is a collection of canvas sizing, active modules, their settings, and their dimensions within a canvas.
 */
export interface OverlayInterface {
	title: string
	uuid: string
	canvas: BoxInterface
	modules: ModuleInstanceInterface[]
	openAvailableModules: boolean
	openActiveModules: boolean
	openSettings: boolean
	activeModuleUUID: string
}