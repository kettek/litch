<script lang='ts'>
	import Section from '@kettek/litch-app/src/components/Section.svelte'
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	import DropList from '@kettek/litch-app/src/components/DropList.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'

	import { _ } from 'svelte-i18n'
	import { v4 } from 'uuid'

	import { actions, addAction, refreshActions, removeAction } from './stores/actions'
	import { services } from './stores/services'
	import ActionCondition from './ActionCondition.svelte'
  import { ActionInterface, ActionTriggerI, TriggerCoreTypes, isTriggerCore, isTriggerCoreSound, isTriggerCoreToggleModule, isTriggerCoreWait } from './interfaces/Action'
  import AssetViewer from './components/AssetViewer.svelte'
  import AssetsCard from './AssetsCard.svelte'
  import type { AssetResults } from './interfaces/Asset'
  import { getAsset } from './assets'
  import { collections } from './stores/collections';
  import { overlays } from './stores/overlays';
	
	let actionSelect: HTMLSelectElement
	let triggerSelects: HTMLSelectElement[] = []

	function addNewAction() {
		let types = actionSelect.value.split(':', 2)
		let parts = types[1].split('.', 2)
		let uuid = v4()
		addAction({
			type: types[0],
			uuid: uuid,
			service: parts[0],
			id: parts[1],
			condition: {},
			triggers: [],
		})
	}

	function addNewTrigger(action: ActionInterface, actionIndex: number) {
		let types = triggerSelects[actionIndex].value.split(':', 2)
		let type = types[0]
		let trigger: ActionTriggerI|undefined = undefined
		if (type === 'core') {
			let id = types[1]
			if (id === 'playSound') {
				trigger = {
					type: 'core',
					fulltype: triggerSelects[actionIndex].value,
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
					fulltype: triggerSelects[actionIndex].value,
					data: {
						type: 'wait',
						seconds: 10,
					}
				}
			} else if (id === 'toggleModule') {
				trigger = {
					type: 'core',
					fulltype: triggerSelects[actionIndex].value,
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
			action.triggers.push(trigger)
		}
		refreshActions()
	}
	function removeActionTrigger(action: ActionInterface, index: number) {
		action.triggers.splice(index, 1)
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

<main>
	<ItemGroup label>
		<select bind:this={actionSelect}>
			{#each $services as service}
				{#if service.actionEvents?.conditions}
					{#each service.actionEvents.conditions as condition}
						<option value={'service:'+service.uuid+'.'+condition.id}>{condition.title}</option>
					{/each}
				{/if}
			{/each}
		</select>
		<Button secondary on:click={addNewAction}>
			<Icon icon="add"></Icon>
		</Button>
	</ItemGroup>
	<section class='actions'>
		{#each $actions as action, actionIndex}
			<DropList secondary>
				<svelte:fragment slot='heading'>{$_('action')}</svelte:fragment>
				<section class='action' slot='content'>
					<Section rounded>
						{#if action.type === 'service'}
							{#if $services.find(v=>v.uuid===action.service)}
								<ActionCondition service={$services.find(v=>v.uuid===action.service)} action={action}></ActionCondition>
							{/if}
						{/if}
					</Section>
					<Section alt>
						<ItemGroup label>
							<select bind:this={triggerSelects[actionIndex]}>
								{#each TriggerCoreTypes as coreType}
									<option value={'core:'+coreType}>{$_(coreType)}</option>
								{/each}
							</select>
							<Button tertiary on:click={()=>addNewTrigger(action, actionIndex)}>
								<Icon icon="add"></Icon>
							</Button>
						</ItemGroup>
						<DropList tertiary>
							<svelte:fragment slot='heading'>{$_('triggers')}</svelte:fragment>
							<svelte:fragment slot='content'>
								{#if action.triggers}
									{#each action.triggers as trigger, index}
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
														<Button title={$_('selectSound')} tertiary on:click={()=>{showAssetsWindow(action, index)}}>
															<Icon icon='open'></Icon>
														</Button>
														<ItemGroup label inline>
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
											<Button tertiary dangerous on:click={()=>removeActionTrigger(action, index)}>
												<Icon icon="delete"></Icon>
											</Button>
										</section>
									{/each}
								{/if}
							</svelte:fragment>
						</DropList>
					</Section>
					<Button secondary dangerous on:click={()=>removeAction(action.uuid)}>
						<Icon icon="delete"></Icon>
					</Button>
				</section>
			</DropList>
		{/each}
	</section>
</main>
{#if showAssets}
	<AssetsCard on:close={closeAssets}/>
{/if}

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
</style>