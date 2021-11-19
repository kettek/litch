import type { SvelteComponent } from "svelte"
import type { BoxInterface } from "./Box"

export interface ModuleDefaultsInterface {
    title: string
    box: BoxInterface
    settings: any
}

export interface ModuleInterface {
    uuid: string
    title: string
    settingsComponent?: SvelteComponent
    previewComponent?: SvelteComponent
    liveComponent?: SvelteComponent
    defaults: ModuleDefaultsInterface
}