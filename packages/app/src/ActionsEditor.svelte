<script lang='ts'>
	import Section from '@kettek/litch-app/src/components/Section.svelte'
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	import DropList from '@kettek/litch-app/src/components/DropList.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'

	import { _ } from 'svelte-i18n'
	import { v4 } from 'uuid'

	import { actions, addAction, refreshActions, removeAction, duplicateAction } from './stores/actions'
	import { services } from './stores/services'
	import ActionCondition from './ActionCondition.svelte'
  import { ActionI, ActionInterface, ActionTriggerI, TriggerCoreTypes, isActionCoreHotkey, isActionService, isTriggerCore, isTriggerCoreSound, isTriggerCoreToggleModule, isTriggerCoreWait, isTriggerModule } from './interfaces/Action'
  import AssetViewer from './components/AssetViewer.svelte'
  import AssetsCard from './AssetsCard.svelte'
  import { getAsset } from './assets'
  import { overlays } from './stores/overlays';
	import { modules } from './stores/modules'
  import ActionHotkey from './ActionHotkey.svelte';
  import SplitPane from './components/SplitPane.svelte';
  import Card from './components/Card.svelte';
	import Menu from './components/Menu.svelte'
	import MenuOption from './components/MenuOption.svelte'
  import ActionTitle from './ActionTitle.svelte';
  import { flip } from 'svelte/animate';
  import ActionModuleTrigger from './ActionModuleTrigger.svelte';
  import ActionPayload from './ActionPayload.svelte';
  import { publisher } from './modules'
	
	let actionSelect: HTMLSelectElement
	let triggerSelects: HTMLSelectElement[] = []
	let triggerType: string = ''
	let selectedActionUUID: string = ''
	let selectedAction: ActionI|undefined
	$: selectedAction = $actions.find(v=>v.uuid===selectedActionUUID)

	function addNewAction() {
		let types = actionSelect.value.split(':', 2)
		let uuid = v4()
		
		if (types[0] === 'service') {
			let parts = types[1].split('.', 2)
			addAction({
				type: 'service',
				title: '',
				uuid: uuid,
				service: parts[0],
				id: parts[1],
				condition: {},
				triggers: [],
			})
		} else if (types[0] === 'core') {
			if (types[1] === 'hotkey') {
				addAction({
					uuid: uuid,
					title: '',
					triggers: [],
					type: 'core',
					id: 'hotkey',
					keys: '',
				})
			}
		}
	}
	
	function triggerAction(uuid: string) {
		publisher.publish(`actions.${uuid}.trigger`, {})
	}
	
	/* Menu */
	let menuPos = {x: 0, y: 0}
	let menuUUID: string
	let showMenu = false
	async function showActionMenu(e: MouseEvent, uuid: string) {
		e.preventDefault()
		e.stopPropagation()
		menuUUID = uuid
		if (showMenu) {
			showMenu = false
			await new Promise(res => setTimeout(res, 100));
		}
		menuPos = { x: e.clientX, y: e.clientY }
		showMenu = true
	}
	function closeActionMenu() {
		showMenu = false
	}

	function addNewTrigger() {
		if (!selectedAction) return
		let types = triggerType.split(':', 2)
		let type = types[0]
		let trigger: ActionTriggerI|undefined = undefined
		if (type === 'core') {
			let id = types[1]
			if (id === 'playSound') {
				trigger = {
					type: 'core',
					fulltype: triggerType,
					data: {
						type: 'playSound',
						collection: '',
						asset: '',
						volume: 0.5,
						wait: false,
					}
				}
			} else if (id === 'wait') {
				trigger = {
					type: 'core',
					fulltype: triggerType,
					data: {
						type: 'wait',
						seconds: 10,
					}
				}
			} else if (id === 'toggleModule') {
				trigger = {
					type: 'core',
					fulltype: triggerType,
					data: {
						type: 'toggleModule',
						act: 'enable',
						overlay: '',
						module: '',
					}
				}
			}
		} else if (type.startsWith('module')) {
			let parts = type.split('.')
			let uuid = parts[1]
			let id = types[1]
			trigger = {
				type: 'module',
				moduleUUID: uuid,
				triggerID: id,
				fulltype: triggerType,
				overlayUUID: '',
				moduleInstanceUUID: '',
				data: {},
			}
		}
		if (trigger !== undefined) {
			selectedAction.triggers.push(trigger)
		}
		refreshActions()
	}
	function removeActionTrigger(index: number) {
		if (!selectedAction) return
		selectedAction.triggers.splice(index, 1)
		refreshActions()
	}
	function duplicateActionTrigger(index: number) {
		if (!selectedAction) return
		selectedAction.triggers.splice(index, 0, JSON.parse(JSON.stringify(selectedAction.triggers[index])))
		refreshActions()
	}
	
	let hoveringActionUUID: string
	let fromActionUUID: string
	function handleActionDragStart(e: DragEvent, uuid: string) {
		if (!e.dataTransfer) return
		e.dataTransfer.effectAllowed = 'move'
		e.dataTransfer.dropEffect = 'move'
		fromActionUUID = uuid
	}
	function handleActionDrop(e: DragEvent, targetUUID: string) {
		if (!e.dataTransfer) return
		e.dataTransfer.dropEffect = 'move'

		const fromIndex = $actions.findIndex(v=>v.uuid===fromActionUUID)
		const toIndex = $actions.findIndex(v=>v.uuid===targetUUID)

		const acts = $actions
		if (fromIndex < toIndex) {
			$actions.splice(toIndex+1, 0, acts[fromIndex])
			$actions.splice(fromIndex, 1)
		} else {
			$actions.splice(toIndex, 0, acts[fromIndex])
			$actions.splice(fromIndex+1, 1)
		}
		fromActionUUID = ''
		hoveringActionUUID = ''
		refreshActions()
	}

	let hoveringTriggerIndex: number
	let fromTriggerIndex: number
	let selectedTriggerIndex: number
	function handleTriggerDragStart(e: DragEvent, index: number) {
		if (!e.dataTransfer) return
		e.dataTransfer.effectAllowed = 'move'
		e.dataTransfer.dropEffect = 'move'
		fromTriggerIndex = index
	}
	function handleTriggerDrop(e: DragEvent, targetIndex: number) {
		if (!e.dataTransfer || !selectedAction) return
		e.dataTransfer.dropEffect = 'move'

		const fromIndex = fromTriggerIndex
		const toIndex = targetIndex

		const triggers = selectedAction.triggers
		if (fromIndex < toIndex) {
			selectedAction.triggers.splice(toIndex+1, 0, triggers[fromIndex])
			selectedAction.triggers.splice(fromIndex, 1)
		} else {
			selectedAction.triggers.splice(toIndex, 0, triggers[fromIndex])
			selectedAction.triggers.splice(fromIndex+1, 1)
		}
		fromTriggerIndex = -1
		hoveringTriggerIndex = -1
		refreshActions()
	}

	// trigger menu
	let menuTriggerPos = {x: 0, y: 0}
	let triggerMenuIndex: number
	let showTriggerMenu = false
	async function enableTriggerMenu(e: MouseEvent, index: number) {
		e.preventDefault()
		e.stopPropagation()
		triggerMenuIndex = index
		if (showTriggerMenu) {
			showTriggerMenu = false
			await new Promise(res => setTimeout(res, 100));
		}
		menuPos = { x: e.clientX, y: e.clientY }
		showTriggerMenu = true
	}
	function closeTriggerMenu() {
		showTriggerMenu = false
	}


	let showAssets = false
	let targetAction: ActionInterface
	let targetTrigger: number
	let showOptions: any = {}

	function showAssetsWindow(action: ActionInterface, trigger: number) {
		showAssets = true
		targetAction = action
		targetTrigger = trigger
	}

	function closeAssets(e: any) {
		showAssets = false
		const target = targetAction.triggers[targetTrigger]
		if (isTriggerCore(target)) {
			if (isTriggerCoreSound(target.data)) {
				target.data.collection = e.detail[0].collection
				target.data.asset = e.detail[0].asset
			}
		}
		refreshActions()
	}
</script>

<SplitPane type='horizontal' pos={25}>
	<section slot='a'>
		<Card secondary noBack flyX={-500}>
			<svelte:fragment slot='title'>
				{$_('actions.title')}
			</svelte:fragment>
			<section class='actions__container' slot='content'>
				<nav class='actions__add'>
					<ItemGroup label>
						<select bind:this={actionSelect}>
							<option value={'core:hotkey'}>Hotkey</option>
							{#each $services as service}
								{#if service.actionEvents?.conditions}
									{#each service.actionEvents.conditions as condition}
										<option value={'service:'+service.uuid+'.'+condition.id}>{condition.title}</option>
									{/each}
								{/if}
							{/each}
						</select>
						<Button secondary on:click={addNewAction} title={$_('actions.addAction')}>
							<Icon icon="add"></Icon>
						</Button>
					</ItemGroup>
				</nav>
				<article>
					<DropList secondary>
						<svelte:fragment slot="heading">
							{$_('actions.title')}
						</svelte:fragment>
						<svelte:fragment slot="content">
							<ul>
								{#each $actions as action (action.uuid)}
									<li
										animate:flip="{{duration: 200}}"
										draggable={true}
										on:dragstart={e => handleActionDragStart(e, action.uuid)}
										on:drop|preventDefault={e => handleActionDrop(e, action.uuid)}
										ondragover="return false"
										on:dragenter={() => hoveringActionUUID = action.uuid}
										class:active={hoveringActionUUID === action.uuid}
									 	class='actions__entry' class:selected={selectedActionUUID===action.uuid} on:click={()=>{selectedActionUUID=action.uuid}}
									>
										<span>
											{#if action.title}
												{action.title} 
											{:else}
												{#if isActionService(action)}
													<ActionTitle service={$services.find(v=>v.uuid===action.service)} action={action}>{action.id}</ActionTitle>
												{:else if action.type === 'core'}
													{action.id}
												{/if}
											{/if}
										</span>
										<Button nomargin secondary invert={selectedActionUUID!==action.uuid} on:click={(e)=>showActionMenu(e, action.uuid)}>
											<Icon icon='burger'></Icon>
										</Button>
									</li>
								{/each}
							</ul>
						</svelte:fragment>
					</DropList>
				</article>
			</section>
		</Card>
	</section>
	<section slot='b'>
		{#if !selectedAction}
			Select an action
		{:else}
			<section class='action'>
				<DropList secondary>
					<svelte:fragment slot='heading'>{$_('actions.settings')}</svelte:fragment>
					<svelte:fragment slot='content'>
						<ItemGroup label secondary>
							<input bind:value={selectedAction.title}/>
							<svelte:fragment slot='label'>{$_('actions.actionTitle')}</svelte:fragment>
						</ItemGroup>
						{#if isActionService(selectedAction)}
							{#if $services.find(v=>v.uuid===selectedAction.service)}
								{#key selectedActionUUID}
									<ItemGroup label secondary>
										<ActionCondition service={$services.find(v=>v.uuid===selectedAction.service)} action={selectedAction}></ActionCondition>
										<svelte:fragment slot='label'>{$_('actions.condition')}</svelte:fragment>
									</ItemGroup>
								{/key}
							{/if}
						{:else if isActionCoreHotkey(selectedAction)}
							<ActionHotkey bind:value={selectedAction.keys}></ActionHotkey>
						{/if}
					</svelte:fragment>
				</DropList>
				<DropList tertiary>
					<svelte:fragment slot='heading'>{$_('actions.triggers')}</svelte:fragment>
					<svelte:fragment slot='content'>
						<ItemGroup label tertiary>
							<select bind:value={triggerType}>
								{#each TriggerCoreTypes as coreType}
									<option value={'core:'+coreType}>{$_('actions.'+coreType)}</option>
								{/each}
								{#each Object.entries($modules) as [uuid, module]}
									{#if module.triggerEvents?.actions}
										{#each module.triggerEvents.actions as triggerAction}
											<option value={`module.${module.uuid}:${triggerAction.id}`}>{module.title}: {triggerAction.title}</option>
										{/each}
									{/if}
								{/each}
							</select>
							<Button tertiary on:click={()=>addNewTrigger()}>
								<Icon icon="add"></Icon>
							</Button>
						</ItemGroup>
						{#if selectedAction.triggers}
							{#each selectedAction.triggers as trigger, index (index)}
								<li
									animate:flip="{{duration: 200}}"
									draggable={true}
									on:dragstart={e => handleTriggerDragStart(e, index)}
									on:drop|preventDefault={e => handleTriggerDrop(e, index)}
									ondragover="return false"
									on:dragenter={() => hoveringTriggerIndex = index}
									class:active={hoveringTriggerIndex === index}
								 	class='triggers__entry' class:selected={selectedTriggerIndex===index} on:click={()=>{selectedTriggerIndex=index}}
								>
									<ItemGroup label>
										{#if isTriggerCore(trigger)}
											{$_('actions.'+trigger.data.type)}
										{:else if isTriggerModule(trigger)}
											{$modules[trigger.moduleUUID]?.title}: {$modules[trigger.moduleUUID]?.triggerEvents?.actions.find(v=>v.id===trigger.triggerID)?.title}
										{/if}
									</ItemGroup>
									<Section rounded>
										{#if isTriggerCore(trigger)}
											<div draggable="true" on:dragstart|preventDefault|stopPropagation>
												{#if isTriggerCoreSound(trigger.data)}
													<AssetViewer volume={trigger.data.volume} asset={getAsset(trigger.data.collection, trigger.data.asset)} minimal></AssetViewer>
													<ItemGroup noAlt>
														<input type='number' bind:value={trigger.data.volume}/>
													</ItemGroup>
													<Button title={$_('selectSound')} tertiary on:click={()=>{showAssetsWindow(selectedAction, index)}}>
														<Icon icon='open'></Icon>
													</Button>
													<ItemGroup label noAlt>
														<input type='checkbox' bind:checked={trigger.data.wait}/>
														<svelte:fragment slot='label'>{$_('wait')}</svelte:fragment>
													</ItemGroup>
												{:else if isTriggerCoreWait(trigger.data)}
													<ItemGroup noAlt>
														<input type='number' bind:value={trigger.data.seconds}/> seconds
													</ItemGroup>
												{:else if isTriggerCoreToggleModule(trigger.data)}
													<select on:change={e=>trigger.data.act=e.currentTarget.value}>
														<option>{$_('enable')}</option>
														<option>{$_('disable')}</option>
													</select>
													<select bind:value={trigger.data.overlay} on:change={refreshActions}>
														{#each Object.entries($overlays) as [name, overlay]}
															<option value={overlay.uuid}>{overlay.title}</option>
														{/each}
													</select>
													<select bind:value={trigger.data.module}>
														{#if $overlays[trigger.data.overlay]}
															{#each $overlays[trigger.data.overlay].modules as module}
																<option value={module.uuid}>{module.title}</option>
															{/each}
														{/if}
													</select>
												{/if}
											</div>
										{:else if isTriggerModule(trigger)}
											<ItemGroup label count={3} noAlt>
												<select bind:value={trigger.overlayUUID} on:change={refreshActions}>
													{#each Object.entries($overlays) as [name, overlay]}
														<option value={overlay.uuid}>{overlay.title}</option>
													{/each}
												</select>
												{#if $overlays[trigger.overlayUUID]}
													<select bind:value={trigger.moduleInstanceUUID} on:change={refreshActions}>
														{#each $overlays[trigger.overlayUUID].modules as module}
															{#if module.moduleUUID === trigger.moduleUUID}
																<option value={module.uuid}>{module.title}</option>
															{/if}
														{/each}
													</select>
												{/if}
												<svelte:fragment slot='label'>{$_('actions.triggerTarget')}</svelte:fragment>
											</ItemGroup>
											{#if $overlays[trigger.overlayUUID]?.modules.find(v=>v.uuid===trigger.moduleInstanceUUID)}
												<ActionModuleTrigger trigger={trigger}></ActionModuleTrigger>
											{/if}
										{/if}
									</Section>
									<Button tertiary invert on:click={(e)=>enableTriggerMenu(e, index)}>
										<Icon icon='burger'></Icon>
									</Button>
								</li>
							{/each}
						{/if}
					</svelte:fragment>
				</DropList>
				<ActionPayload service={$services.find(v=>v.uuid===selectedAction.service)} action={selectedAction}></ActionPayload>
			</section>
		{/if}
		{#if showMenu}
			<Menu tertiary {...menuPos} on:click={closeActionMenu} on:clickoutside={closeActionMenu}>
				<MenuOption secondary on:click={()=>duplicateAction(menuUUID)}>
					<span>{$_('actions.duplicateAction')}</span>
					<Icon icon='duplicate'></Icon>
				</MenuOption>
				<MenuOption on:click={()=>triggerAction(menuUUID)}>
					<span>{$_('actions.triggerAction')}</span>
					<Icon icon='action'></Icon>
				</MenuOption>
				<MenuOption dangerous on:click={()=>removeAction(menuUUID)}>
					<span>{$_('actions.removeAction')}</span>
					<Icon icon='delete'></Icon>
				</MenuOption>
			</Menu>
		{/if}
		{#if showTriggerMenu}
			<Menu tertiary {...menuPos} on:click={closeTriggerMenu} on:clickoutside={closeTriggerMenu}>
				<MenuOption dangerous on:click={()=>removeActionTrigger(triggerMenuIndex)}>
					<span>{$_('actions.removeAction')}</span>
					<Icon icon='delete'></Icon>
				</MenuOption>
				<MenuOption on:click={()=>duplicateActionTrigger(triggerMenuIndex)}>
					<span>{$_('actions.duplicateAction')}</span>
					<Icon icon='duplicate'></Icon>
				</MenuOption>
			</Menu>
		{/if}
		{#if showAssets}
			<AssetsCard on:close={closeAssets}/>
		{/if}
	</section>
</SplitPane>

<style>
	main {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		height: 100%;
	}
	.actions {
		overflow: auto;
	}
	.action {
		height: 100%;
		overflow: auto;
	}
	/* */
	ul {
		margin: 0;
		padding: 0;
	}
	li.actions__entry.selected {
		background: var(--secondary);
		color: var(--text);
	}
	li.actions__entry {
		list-style: none;
		min-height: 2em;
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		grid-template-columns: minmax(0, 1fr) auto auto;
		justify-content: stretch;
		align-items: center;
		color: var(--secondary);
		margin: 0.5em;
		padding: 0.5em;
		border-radius: .25em;
	}
	li.actions__entry.active {
		border: 1px solid var(--secondary);
	}
	li.triggers__entry.selected {
		/*background: var(--tertiary);
		color: var(--text);*/
		/*border: 1px solid var(--tertiary);*/
	}
	li.triggers__entry {
		list-style: none;
		min-height: 2em;
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		grid-template-columns: auto minmax(0, 1fr) auto;
		justify-content: stretch;
		align-items: center;
		color: var(--tertiary);
		margin: 0.5em;
		padding: 0.5em;
		border-radius: .25em;
		border: 1px solid transparent;
	}
	li.triggers__entry.active {
		border: 1px solid var(--tertiary);
	}

	/* */
	nav {
		display: grid;
	}
</style>