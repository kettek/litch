export type UUID = string

export interface Box {
	x: number
	y: number
	width: number
	height: number
}

export interface Hello {
	event: 'hello'
	uuid: UUID
}
export function isHello(object: any): object is Hello {
	return object.event === 'hello'
}

export interface OverlayAdd {
	event: 'overlay-add'
	uuid: UUID
}
export function isOverlayAdd(object: any): object is OverlayAdd {
	return object.event === 'overlay-add'
}

export interface OverlayRemove {
	event: 'overlay-remove'
	uuid: UUID
}
export function isOverlayRemove(object: any): object is OverlayRemove {
	return object.event === 'overlay-remove'
}

export interface OverlayShow {
	event: 'overlay-show'
	uuid: UUID
}
export function isOverlayShow(object: any): object is OverlayShow {
	return object.event === 'overlay-show'
}

export interface OverlayHide {
	event: 'overlay-hide'
	uuid: UUID
}
export function isOverlayHide(object: any): object is OverlayHide {
	return object.event === 'overlay-hide'
}

export interface OverlayBox {
	event: 'overlay-box'
	box: Box
}
export function isOverlayBox(object: any): object is OverlayBox {
	return object.event === 'overlay-box'
}

export interface OverlaySettings {
	event: 'overlay-settings'
	uuid: UUID
	settings: any
}
export function isOverlaySettings(object: any): object is OverlaySettings {
	return object.event === 'overlay-settings'
}

export interface OverlayModules {
	event: 'overlay-modules'
	uuid: UUID
	modules: UUID[]
}
export function isOverlayModules(object: any): object is OverlayModules {
	return object.event === 'overlay-modules'
}

/**
 * add -> settings/box -> request (show after response) ?
 */
//
export interface ModuleAdd {
	event: 'module-add'
	uuid: UUID
}
export function isModuleAdd(object: any): object is ModuleAdd {
	return object.event === 'module-add'
}
export interface ModuleRemove {
	event: 'module-remove'
	uuid: UUID
}
export function isModuleRemove(object: any): object is ModuleRemove {
	return object.event === 'module-remove'
}

// Module Req => Res
export interface ModuleTypeRequest {
	event: 'module-request'
	uuid: UUID
}
export function isModuleTypeRequest(object: any): object is ModuleTypeRequest {
	return object.event === 'module-request'
}
export interface ModuleTypeResponse {
	event: 'module-response'
	uuid: UUID
	file: string
}
export function isModuleTypeResponse(object: any): object is ModuleTypeResponse {
	return object.event === 'module-response'
}

// Module settings
export interface ModuleSettings {
	event: 'module-settings'
	uuid: UUID
	settings: any
}
export function isModuleSettings(object: any): object is ModuleSettings {
	return object.event === 'module-settings'
}

export interface ModuleBox {
	event: 'module-box'
	uuid: UUID
	box: Box
}
export function isModuleBox(object: any): object is ModuleBox {
	return object.event === 'module-box'
}

export interface ModuleShow {
	event: 'module-show'
	uuid: UUID
}
export function isModuleShow(object: any): object is ModuleShow {
	return object.event === 'module-show'
}

export interface ModuleHide {
	event: 'module-hide'
	uuid: UUID
}
export function isModuleHide(object: any): object is ModuleHide {
	return object.event === 'module-hide'
}

export interface Stop {
	event: 'stop'
}
export function isStop(object: any): object is Stop {
	return object.event === 'stop'
}

export interface LazyUpdate {
	event: 'lazy-update'
	overlayUUID: string
	box: Box
	modules: {
		title: string
		uuid: string
		box: Box
		moduleUUID: string
		settings: any
	}[]
}
export function isLazyUpdate(object: any): object is LazyUpdate {
	return object.event === 'lazy-update'
}

export type LitchMessage = Stop |
		OverlayAdd | OverlayRemove |
		OverlayHide | OverlayShow |
		OverlayModules | OverlaySettings | OverlayBox |
		ModuleAdd | ModuleRemove |
		ModuleHide | ModuleShow |
		ModuleBox | ModuleSettings |
		ModuleTypeRequest | ModuleTypeResponse
