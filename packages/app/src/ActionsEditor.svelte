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
  import { ActionI, ActionInterface, ActionTriggerI, TriggerCoreTypes, isActionCoreHotkey, isActionService, isTriggerCore, isTriggerCoreSound, isTriggerCoreToggleModule, isTriggerCoreWait } from './interfaces/Action'
  import AssetViewer from './components/AssetViewer.svelte'
  import AssetsCard from './AssetsCard.svelte'
  import type { AssetResults } from './interfaces/Asset'
  import { getAsset } from './assets'
  import { collections } from './stores/collections';
  import { overlays } from './stores/overlays';
  import ActionHotkey from './ActionHotkey.svelte';
  import SplitPane from './components/SplitPane.svelte';
  import Card from './components/Card.svelte';
	import Menu from './components/Menu.svelte'
	import MenuOption from './components/MenuOption.svelte'
  import ActionTitle from './ActionTitle.svelte';
	
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
					triggers: [],
					type: 'core',
					id: 'hotkey',
					keys: '',
				})
			}
		}
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
								{#each $actions as action}
									<li class='actions__entry' class:selected={selectedActionUUID===action.uuid} on:click={()=>{selectedActionUUID=action.uuid}}>
										<span>
											{#if isActionService(action)}
												<ActionTitle service={$services.find(v=>v.uuid===action.service)} action={action}>{action.id}</ActionTitle>
											{:else if action.type === 'core'}
												{action.id}
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
			<section>
				<DropList secondary>
					<svelte:fragment slot='heading'>{$_('actions.condition')}</svelte:fragment>
					<svelte:fragment slot='content'>
						{#if isActionService(selectedAction)}
							{#if $services.find(v=>v.uuid===selectedAction.service)}
								<ActionCondition service={$services.find(v=>v.uuid===selectedAction.service)} action={selectedAction}></ActionCondition>
							{/if}
						{:else if isActionCoreHotkey(selectedAction)}
							<ActionHotkey bind:value={selectedAction.keys}></ActionHotkey>
						{/if}
					</svelte:fragment>
				</DropList>
				<ItemGroup label tertiary>
					<select bind:value={triggerType}>
						{#each TriggerCoreTypes as coreType}
							<option value={'core:'+coreType}>{$_(coreType)}</option>
						{/each}
					</select>
					<Button tertiary on:click={()=>addNewTrigger()}>
						<Icon icon="add"></Icon>
					</Button>
				</ItemGroup>
				<DropList tertiary>
					<svelte:fragment slot='heading'>{$_('actions.triggers')}</svelte:fragment>
					<svelte:fragment slot='content'>
						{#if selectedAction.triggers}
							{#each selectedAction.triggers as trigger, index}
								<section class='trigger'>
									<ItemGroup label>
										{#if isTriggerCore(trigger)}
											{$_(trigger.data.type)}
										{/if}
									</ItemGroup>
									<Section rounded>
										{#if isTriggerCore(trigger)}
											{#if isTriggerCoreSound(trigger.data)}
												<AssetViewer volume={trigger.data.volume} asset={getAsset(trigger.data.collection, trigger.data.asset)} minimal></AssetViewer>
												<input type='number' bind:value={trigger.data.volume}/>
												<Button title={$_('selectSound')} tertiary on:click={()=>{showAssetsWindow(selectedAction, index)}}>
													<Icon icon='open'></Icon>
												</Button>
												<ItemGroup label>
													<input type='checkbox' bind:checked={trigger.data.wait}/>
													<svelte:fragment slot='label'>{$_('wait')}</svelte:fragment>
												</ItemGroup>
											{:else if isTriggerCoreWait(trigger.data)}
												<input type='number' bind:value={trigger.data.seconds}/> seconds
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
										{/if}
									</Section>
									<Button tertiary dangerous on:click={()=>removeActionTrigger(index)}>
										<Icon icon="delete"></Icon>
									</Button>
								</section>
							{/each}
						{/if}
					</svelte:fragment>
				</DropList>
			</section>
		{/if}
		{#if showMenu}
			<Menu tertiary {...menuPos} on:click={closeActionMenu} on:clickoutside={closeActionMenu}>
				<MenuOption secondary on:click={()=>duplicateAction(menuUUID)}>
					<span>{$_('actions.duplicateAction')}</span>
					<Icon icon='duplicate'></Icon>
				</MenuOption>
				<MenuOption dangerous on:click={()=>removeAction(menuUUID)}>
					<span>{$_('actions.removeAction')}</span>
					<Icon icon='delete'></Icon>
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
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: start;
	}
	.action > * {
		min-width: 0;
	}
	.trigger {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: start;
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
	/* */
	nav {
		display: grid;
	}
</style>