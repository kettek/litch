import type { BoxInterface } from './Box'

/**
 * ModuleInstanceInterface is an instance of a module.
 */
export interface ModuleInstanceInterface {
    title: string // user-defined friendly title
    uuid: string // used to identify this module
    box: BoxInterface // used to size module instance component
    moduleUUID: string // UUID Reference to the associated module
    settings: {[key: string]: any} // Passed to module
}