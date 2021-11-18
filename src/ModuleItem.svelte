<script type="ts">
	import type { ModuleInstanceInterface } from "./interfaces/ModuleInstance";
	import type { ModuleInterface } from './interfaces/Module'
	import ModuleWrapper from "./ModuleWrapper.svelte"

	export let modules: Record<string, ModuleInterface> = {}
	export let module: ModuleInstanceInterface

	$: realModule = modules[module.moduleUUID]
</script>

<main>
	<header>{module.title}({realModule.title})</header>
	<section>
		<label>
			<input type="number" bind:value={module.box.x}>
			X
		</label>
		<label>
			<input type="number" bind:value={module.box.y}>
			Y
		</label>
		<label>
			<input type="number" bind:value={module.box.width}>
			Width
		</label>
		<label>
			<input type="number" bind:value={module.box.height}>
			Height
		</label>
	</section>
	<section>
		<ModuleWrapper this={realModule.settingsComponent} bind:settings={module.settings} bind:box={module.box}/>
	</section>
</main>

<style>
	main {
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr);
	}

</style>