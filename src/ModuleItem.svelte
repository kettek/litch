<script type="ts">
	import type { ModuleInstanceInterface } from "./interfaces/ModuleInstance";
	import type { ModuleInterface } from './interfaces/Module'

	export let modules: Record<string, ModuleInterface> = {}
	export let module: ModuleInstanceInterface

	$: realModule = modules[module.moduleUUID]
</script>

<main>
	<header>{module.title}({realModule.title})</header>
	<svelte:component this={realModule.settingsComponent} bind:settings={module.settings}/>
</main>

<style>
</style>