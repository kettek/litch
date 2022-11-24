<script type="ts">
	import { flip } from 'svelte/animate'
	import { fly } from 'svelte/transition'
	import { _ } from 'svelte-i18n'
	import { quintInOut } from 'svelte/easing'
	import type { OverlayInterface } from './interfaces/Overlay'
	import { tick } from 'svelte'
	import ModuleItem from './ModuleItem.svelte'

	import type { ModuleInterface } from './interfaces/Module'
	import ModuleList from './ModuleList.svelte'
	import { v4 } from 'uuid'
	export let modules: Record<string, ModuleInterface> = {}

	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'

	import { createModuleChannel, createModuleChannels, publisher } from './modules'

	export let overlay: OverlayInterface
	export let uuid: string
	let title: string = overlay.title
	let width: number = overlay.canvas.width
	let height: number = overlay.canvas.height
	let focusedModuleUUID: string
	$: focusedModule = overlay.modules.find(v=>v.uuid===focusedModuleUUID)
	$: overlay.activeModuleUUID = focusedModuleUUID

	function hasChanges(width: number, height: number, title: string): boolean {
		return width !== overlay.canvas.width || height !== overlay.canvas.height || title !== overlay.title
	}
	$: changed = hasChanges(width, height, title)

	function handleApply() {
		overlay.canvas.width = width
		overlay.canvas.height = height
		overlay.title = title
		width = width
		refreshOverlays()
	}

	function handleAddModule(evt: CustomEvent<string>) {
		let module = modules[evt.detail]
		if (!module) return // TODO: show error
		let uuid = v4()
		overlay.modules.push({
			title: module.defaults.title,
			uuid: uuid,
			box: {...module.defaults.box},
			moduleUUID: evt.detail,
			settings: {...module.defaults.settings},
			channels: createModuleChannels(overlay.uuid, uuid),
			liveChannel: createModuleChannel(overlay.uuid, uuid),
			previewChannel: createModuleChannel(overlay.uuid, uuid),
			instanceChannel: createModuleChannel(overlay.uuid, uuid),
			settingsChannel: createModuleChannel(overlay.uuid, uuid),
			openDimensions: false,
			openSettings: true,
			active: true,
			live: {...module.defaults.live},
		})
		publisher.publish(`overlay.${overlay.uuid}.module.${uuid}.create`, {})
		refreshOverlays()
	}
	async function deleteModule(uuid: string) {
		let module = overlay.modules.find(v=>v.uuid===uuid)
		if (!module) return
		overlay.modules = overlay.modules.filter(v=>v.uuid!==uuid)
		await tick()
		publisher.publish(`overlay.${overlay.uuid}.module.${uuid}.delete`, {})
		refreshOverlays()
	}
	async function duplicateModule(uuid: string) {
		let module = overlay.modules.find(v=>v.uuid===uuid)
		if (!module) return
		let newUUID = v4()
		let newModule = {
			...JSON.parse(JSON.stringify(module)),
			uuid: newUUID,
			channel: createModuleChannel(overlay.uuid, newUUID),
		}
		overlay.modules.push(newModule)
		publisher.publish(`overlay.${overlay.uuid}.module.${newUUID}.create`, {})
		refreshOverlays()
	}
	async function reloadModule(uuid: string) {
		let module = overlay.modules.find(v=>v.uuid===uuid)
		if (!module) return
		module.channels.publish('reload', module.settings)
	}

	let hoveringModuleUUID: string
	let fromModuleUUID: string
	function handleModuleDragStart(e: DragEvent, uuid: string) {
		if (!e.dataTransfer) return
		e.dataTransfer.effectAllowed = 'move'
		e.dataTransfer.dropEffect = 'move'
		fromModuleUUID = uuid
	}
	function handleModuleDrop(e: DragEvent, targetUUID: string) {
		if (!e.dataTransfer) return
		e.dataTransfer.dropEffect = 'move'

		const fromIndex = overlay.modules.findIndex(v=>v.uuid===fromModuleUUID)
		const toIndex = overlay.modules.findIndex(v=>v.uuid===targetUUID)

		const modules = overlay.modules
		if (fromIndex < toIndex) {
			overlay.modules.splice(toIndex+1, 0, modules[fromIndex])
			overlay.modules.splice(fromIndex, 1)
		} else {
			overlay.modules.splice(toIndex, 0, modules[fromIndex])
			overlay.modules.splice(fromIndex+1, 1)
		}
		fromModuleUUID = ''
		hoveringModuleUUID = ''
		refreshOverlays()
	}
	function handleModuleToggle(targetUUID: string) {
		let module = overlay.modules.find(v=>v.uuid === targetUUID)
		if (!module) return
		module.active = !module.active
		refreshOverlays()
	}

	import Menu from './components/Menu.svelte'
	import MenuOption from './components/MenuOption.svelte'
	import MenuDivider from './components/MenuDivider.svelte'
	import DropList from './components/DropList.svelte'
	import { refreshOverlays } from './stores/overlays'
	import Card from './components/Card.svelte'
	let menuPos = {x: 0, y: 0}
	let menuUUID: string
	let showMenu = false
	async function showModuleMenu(e: MouseEvent, uuid: string) {
		menuUUID = uuid
		e.preventDefault()
		e.stopPropagation()
		if (showMenu) {
			showMenu = false
			await new Promise(res => setTimeout(res, 100));
		}
		menuPos = { x: e.clientX, y: e.clientY }
		showMenu = true
	}
	function closeModuleMenu() {
		showMenu = false
	}
</script>

<Card secondary on:close={()=>uuid=''}>
	<svelte:fragment slot='title'>
		{overlay.title}
	</svelte:fragment>
	<section slot='content'>
		<article class:secondary={true}>
			<label>
				<input type='text' placeholder='title' bind:value={title}>
				<span>{$_('overlays.title')}</span>
			</label>
			<label>
				<input type='number' placeholder='1920' bind:value={width}>
				<span>{$_('overlays.width')}</span>
			</label>
			<label>
				<input type='number' placeholder='1080' bind:value={height}>
				<span>{$_('overlays.height')}</span>
			</label>
		</article>
		<DropList bind:open={overlay.openAvailableModules} tertiary>
			<svelte:fragment slot="heading">
				{$_('overlays.availableModules')}
			</svelte:fragment>
			<svelte:fragment slot="content">
				<ModuleList modules={modules} on:add={handleAddModule}/>
			</svelte:fragment>
		</DropList>
		<DropList style="padding: 0 1em 1em 1em" bind:open={overlay.openActiveModules} tertiary>
			<svelte:fragment slot="heading">
				{$_('overlays.activeModules')}
			</svelte:fragment>
			<svelte:fragment slot="content">
				<ul>
					{#each [...overlay.modules].reverse() as module (module.uuid)}
						<li
							animate:flip="{{duration: 200}}"
							draggable={true}
							on:dragstart={e => handleModuleDragStart(e, module.uuid)}
							on:drop|preventDefault={e => handleModuleDrop(e, module.uuid)}
							ondragover="return false"
							on:dragenter={() => hoveringModuleUUID = module.uuid}
							class:active={hoveringModuleUUID === module.uuid}
						>
							<Button tertiary invert on:click={()=>handleModuleToggle(module.uuid)} title={module.active?$_('module.inactivate'):$_('module.activate')}>
								<Icon icon={module.active?'active':'inactive'}></Icon>
							</Button>
							<button on:click={()=>focusedModuleUUID=module.uuid}>{module.title}</button>
							<Button tertiary invert on:click={(e)=>showModuleMenu(e, module.uuid)}><Icon icon='burger'></Icon></Button>
						</li>
					{/each}
				</ul>
			</svelte:fragment>
		</DropList>
	</section>
	<svelte:fragment slot="footer">
		<Button secondary disabled={!changed} on:click={handleApply}>
			<Icon icon='checkmark'></Icon>
		</Button>
	</svelte:fragment>
</Card>
{#if focusedModule}
	<ModuleItem bind:module={focusedModule} modules={modules} bind:focusedUUID={focusedModuleUUID}/>
{/if}
{#if showMenu}
	<Menu tertiary {...menuPos} on:click={closeModuleMenu} on:clickoutside={closeModuleMenu}>
		<MenuOption tertiary on:click={()=>reloadModule(menuUUID)}>
			<span>{$_('modules.reload')}</span>
			<Icon icon='reload'></Icon>
		</MenuOption>
		<MenuOption tertiary on:click={()=>duplicateModule(menuUUID)}>
			<span>{$_('modules.duplicate')}</span>
			<Icon icon='duplicate'></Icon>
		</MenuOption>
		<MenuOption dangerous on:click={()=>deleteModule(menuUUID)}>
			<span>{$_('modules.delete')}</span>
			<Icon icon='delete'></Icon>
		</MenuOption>
	</Menu>
{/if}

<style>
	article {
		overflow-y: auto;
		color: var(--tertiary);
		padding: 1em;
	}
	article.secondary {
		color: var(--secondary);
	}
	article.secondary footer {
		float: right;
	}
	ul {
		margin: 0;
		padding: 0;
	}
	li {
		list-style: none;
		min-height: 2em;
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		grid-template-columns: auto minmax(0, 1fr) auto;
		justify-content: stretch;
		align-items: stretch;
		border: 1px solid transparent;
		color: var(--tertiary);
	}
	li.active {
		border: 1px solid var(--tertiary);
	}
	li button {
		cursor: pointer;
		background: none;
		border: 0;
		color: var(--tertiary);
		text-align: left;
	}
	label {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
	}
	label > span {
		min-width: 5ch;
		margin-left: 0.5em;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	section {
		height: 100%;
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr);
	}
</style>