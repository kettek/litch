<script lang="ts">
  import Button from "./components/Button.svelte"
	
	export let value: string
	export let local: boolean
	let valueKeys: string[]
	$: valueKeys = value.split('+')
	
	const mods = ['control', 'command', 'option', 'shift', 'alt', 'altgr', 'super', 'meta']

	let keyup: (e: KeyboardEvent) => void
	let keydown: (e: KeyboardEvent) => void
	let recording = false
	function record() {
		pressedKeys = []

		keyup = (e: KeyboardEvent) => {
			e.stopPropagation()
			e.preventDefault()
			// Bypassing an ancient bug in Chrome where alt+shift generates meta. See https://bugs.chromium.org/p/chromium/issues/detail?id=1020141
			let key = e.key
			if (e.key === 'Meta' && e.code.startsWith('Alt')) {
				key = 'Alt'
			}
			keys = keys.filter(v=>v!==key.toLocaleLowerCase())
			
			if (keys.length === 0) {
				done(pressedKeys)
			}
		}
		window.addEventListener('keyup', keyup)
		
		keydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				done([])
				return
			}
			e.stopPropagation()
			e.preventDefault()

			// Bypassing an ancient bug in Chrome where alt+shift generates meta. See https://bugs.chromium.org/p/chromium/issues/detail?id=1020141
			let key = e.key
			if (e.key === 'Meta' && e.code.startsWith('Alt')) {
				key = 'Alt'
			}

			if (pressedKeys.find(v=>v===key||v===key.toLocaleLowerCase()||v===key.toLocaleUpperCase())) return
			keys = [...keys, key.toLocaleLowerCase()]
			pressedKeys = [...pressedKeys, key.toLocaleLowerCase()].sort((a,b) => {
				let isModA = mods.includes(a)
				let isModB = mods.includes(b)
				if (isModA && !isModB) {
					return -1
				} else if (!isModA && isModB) {
					return 1
				} else if (isModA && isModB) {
					return mods.indexOf(a) - mods.indexOf(b)
				}
				return 0
			})
		}

		window.addEventListener('keydown', keydown)

		recording = true
	}
	function done(pressedKeys: string[]) {
		window.removeEventListener('keyup', keyup)
		window.removeEventListener('keydown', keydown)

		recording = false
		if (pressedKeys.length > 0) {
			value = pressedKeys.map(v=>mods.includes(v)?v:v.toLocaleLowerCase()).join('+')
		}
	}
	function clear() {
		recording = false
		value = ''
	}
	
	let keys: string[] = []
	let pressedKeys: string[] = []

</script>

<main>
	<label>
		<input type='checkbox' bind:checked={local}/>
		Local
	</label>
	<input disabled value={recording?pressedKeys.join('+'):valueKeys.join('+')}/>
	<Button on:click={record}>Record</Button>
	<Button on:click={clear}>Clear</Button>
</main>
{#if recording}
	<aside>
		{pressedKeys.join('+')}
	</aside>
{/if}

<style>
	aside {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.7);
		font-size: 200%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}
</style>