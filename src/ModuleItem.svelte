<script type="ts">
	import type { ModuleInstanceInterface } from "./interfaces/ModuleInstance";
	import type { ModuleInterface } from './interfaces/Module'
	import ModuleWrapper from "./ModuleWrapper.svelte"

	export let modules: Record<string, ModuleInterface> = {}
	export let module: ModuleInstanceInterface

	let update: (value: any) => void = (value: any) => {
		module.settings = value
	}

	$: realModule = modules[module.moduleUUID]
</script>

<main>
	<header>{module.title}({realModule.title})</header>
	<details bind:open={module.openDimensions}>
		<summary>Dimensions</summary>
		<article>
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
		</article>
	</details>
	<details bind:open={module.openSettings}>
		<summary>Settings</summary>
		<ModuleWrapper this={realModule.settingsComponent} settings={module.settings} bind:box={module.box} bind:update={update} />
	</details>
</main>

<style>
	main {
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr);
	}

</style>