import type { OverlayInterface } from './Overlay'

/**
 * An OverlayInterface is a collection of canvas sizing, active modules, their settings, and their dimensions within a canvas.
 */
export interface ConfigInterface {
    currentOverlay: string
    overlays: OverlayInterface[]
}