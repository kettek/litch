import type { SvelteComponent } from "svelte"
import type { BoxInterface } from "./Box"

export interface ModuleInterface {
    uuid: string
    title: string
    settingsComponent?: SvelteComponent
    instanceComponent?: SvelteComponent
    itemComponent?: SvelteComponent
    defaults: {
        title: string
        box: BoxInterface
        settings: any
    }
}